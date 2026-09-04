#!/usr/bin/env node
/**
 * Box routine: hit live /api/desk/tick (or local fallback), then publish
 * desk-state.json to GitHub via Contents API so clients hydrate without Neon.
 *
 * Usage: node scripts/desk-auto-tick.mjs
 * Env: LIVE_URL (optional), CRON_SECRET (optional), GH_TOKEN via `gh` auth
 */
import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmdirSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const REPO = "1nstigat0r/kite-baker-zippy-dune";
const PATH = "desk-state.json";
const LIVE =
  process.env.LIVE_URL ||
  "https://kite-baker-zippy-dune-me-f9f7.vercel.app";

function gh(...args) {
  return execFileSync("gh", args, {
    encoding: "utf8",
    cwd: ROOT,
    maxBuffer: 8 * 1024 * 1024,
  });
}

function ensureGh() {
  try {
    const out = gh("auth", "status");
    if (!/Logged in/i.test(out) && !/✓/.test(out)) {
      gh("api", "user", "--jq", ".login");
    }
    return true;
  } catch (err) {
    console.error(
      "[desk-auto-tick] gh auth missing or broken. Run `gh auth login` on the box.",
    );
    console.error(String(err?.stderr || err?.message || err));
    return false;
  }
}

async function callTick() {
  // Prefer JSON; include text/html so some Start/CDN paths still negotiate.
  const headers = { accept: "text/html, application/json" };
  if (process.env.CRON_SECRET) {
    headers.authorization = `Bearer ${process.env.CRON_SECRET}`;
  }
  // Vercel Deployment Protection / SSO blocks anonymous cron from the box.
  // Set VERCEL_AUTOMATION_BYPASS_SECRET (Project → Settings → Deployment Protection)
  // or disable Vercel Authentication for Production so /api/desk/tick is reachable.
  const bypass =
    process.env.VERCEL_AUTOMATION_BYPASS_SECRET ||
    process.env.VERCEL_PROTECTION_BYPASS ||
    "";
  if (bypass) {
    headers["x-vercel-protection-bypass"] = bypass;
    headers["x-vercel-set-bypass-cookie"] = "true";
  }
  const url = `${LIVE.replace(/\/$/, "")}/api/desk/tick`;
  const res = await fetch(url, { method: "GET", headers, cache: "no-store" });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`tick HTTP ${res.status}: ${body.slice(0, 400)}`);
  }
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) {
    const body = await res.text().catch(() => "");
    throw new Error(`tick non-JSON (${ct}): ${body.slice(0, 200)}`);
  }
  return res.json();
}

function emptyState(extra = {}) {
  return {
    updatedAt: new Date().toISOString(),
    ticker: [],
    lastPackId: null,
    briefing: null,
    hourKey: null,
    header: null,
    ...extra,
  };
}

function toDeskState(tick) {
  if (!tick || typeof tick !== "object") return emptyState({ note: "empty tick" });
  return {
    updatedAt: tick.updatedAt || new Date().toISOString(),
    ticker: Array.isArray(tick.ticker) ? tick.ticker.slice(0, 12) : [],
    lastPackId: tick.lastPackId ?? tick.packId ?? null,
    briefing: tick.briefing ?? null,
    hourKey: tick.hourKey ?? null,
    header: tick.header ?? null,
  };
}

function readLocalState() {
  try {
    return JSON.parse(readFileSync(join(ROOT, PATH), "utf8"));
  } catch {
    return emptyState();
  }
}

function parseLastJson(stdout) {
  const lines = String(stdout)
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i];
    if (!line.startsWith("{") && !line.startsWith("[")) continue;
    try {
      return JSON.parse(line);
    } catch {
      /* try earlier */
    }
  }
  return JSON.parse(String(stdout).trim());
}

function runTsxFile(code) {
  const tmpDir = mkdtempSync(join(tmpdir(), "desk-tick-"));
  const tmpFile = join(tmpDir, "scan.ts");
  writeFileSync(tmpFile, `${code}\n`);
  const localBin = join(ROOT, "node_modules", ".bin", "tsx");
  const useLocal = existsSync(localBin);
  try {
    return execFileSync(
      useLocal ? localBin : "npx",
      useLocal ? [tmpFile] : ["--yes", "tsx", tmpFile],
      {
        encoding: "utf8",
        cwd: ROOT,
        timeout: 90_000,
        maxBuffer: 8 * 1024 * 1024,
        env: { ...process.env },
      },
    );
  } finally {
    try {
      unlinkSync(tmpFile);
    } catch {
      /* ignore */
    }
    try {
      rmdirSync(tmpDir);
    } catch {
      /* ignore */
    }
  }
}

/** Full desk tick via tsx importing runDeskTick. */
function localRunDeskTick() {
  const code = `
import { runDeskTick } from ${JSON.stringify(join(ROOT, "src/lib/news/server.ts"))};
const result = await runDeskTick();
process.stdout.write(JSON.stringify(result) + "\\n");
`.trim();
  return parseLastJson(runTsxFile(code));
}

/** Scan-only fallback: pureHotScan + composeTickerItem + merge into prior. */
function localPureScan(prior) {
  const code = `
import { pureHotScan } from ${JSON.stringify(join(ROOT, "src/lib/news/ingest.ts"))};
import { composeTickerItem } from ${JSON.stringify(join(ROOT, "src/lib/news/compose.ts"))};
import { mergeTicker } from ${JSON.stringify(join(ROOT, "src/lib/news/ticker-loop.ts"))};

const prior = ${JSON.stringify(prior?.ticker ?? [])} as any[];
const stories = await Promise.race([
  pureHotScan(),
  new Promise<any[]>((resolve) => setTimeout(() => resolve([]), 16_000)),
]);
const finds: any[] = [];
for (let i = 0; i < stories.length; i += 4) {
  const chunk = stories.slice(i, i + 4);
  const rows = await Promise.all(chunk.map((s) => composeTickerItem(s)));
  for (const row of rows) if (row) finds.push(row);
}
const ticker = mergeTicker(prior, finds, new Set());
process.stdout.write(JSON.stringify({
  ticker,
  packed: false,
  packId: null,
  updatedAt: new Date().toISOString(),
  briefing: null,
  hourKey: null,
  header: null,
  lastPackId: null,
  error: null,
  count: stories.length,
  _localScan: true,
}) + "\\n");
`.trim();
  return parseLastJson(runTsxFile(code));
}

async function localFallback() {
  console.warn("[desk-auto-tick] live tick failed; attempting local scan");
  const prior = readLocalState();

  try {
    const tick = localRunDeskTick();
    console.log(
      "[desk-auto-tick] local runDeskTick ok",
      "count=",
      tick?.count,
      "ticker=",
      tick?.ticker?.length ?? 0,
    );
    return tick;
  } catch (err) {
    console.warn(
      "[desk-auto-tick] runDeskTick import failed:",
      err instanceof Error ? err.message.slice(0, 300) : String(err).slice(0, 300),
    );
  }

  try {
    const tick = localPureScan(prior);
    console.log(
      "[desk-auto-tick] pureHotScan ok",
      "count=",
      tick?.count,
      "ticker=",
      tick?.ticker?.length ?? 0,
    );
    return tick;
  } catch (err) {
    console.warn(
      "[desk-auto-tick] pureHotScan failed:",
      err instanceof Error ? err.message.slice(0, 300) : String(err).slice(0, 300),
    );
  }

  console.warn("[desk-auto-tick] writing heartbeat from local file");
  return {
    ...prior,
    updatedAt: new Date().toISOString(),
    _fallback: true,
  };
}

function putGithubFile(contentObj) {
  const content = `${JSON.stringify(contentObj, null, 2)}\n`;
  const b64 = Buffer.from(content, "utf8").toString("base64");
  let sha;
  try {
    sha = gh("api", `repos/${REPO}/contents/${PATH}`, "--jq", ".sha").trim();
  } catch {
    sha = "";
  }
  const body = {
    message: "desk: auto tick",
    content: b64,
    ...(sha ? { sha } : {}),
  };
  const out = execFileSync(
    "gh",
    ["api", `repos/${REPO}/contents/${PATH}`, "-X", "PUT", "--input", "-"],
    {
      encoding: "utf8",
      cwd: ROOT,
      input: JSON.stringify(body),
      maxBuffer: 8 * 1024 * 1024,
    },
  );
  writeFileSync(join(ROOT, PATH), content);
  try {
    writeFileSync(join(ROOT, "public", PATH), content);
  } catch {
    /* optional */
  }
  return JSON.parse(out);
}

async function main() {
  if (!ensureGh()) process.exit(2);

  let tick;
  try {
    tick = await callTick();
    console.log(
      "[desk-auto-tick] tick ok",
      "count=",
      tick?.count,
      "ticker=",
      tick?.ticker?.length ?? 0,
      "packed=",
      tick?.packed,
      "error=",
      tick?.error ?? null,
    );
  } catch (err) {
    console.warn(
      "[desk-auto-tick] live tick failed:",
      err instanceof Error ? err.message : err,
    );
    tick = await localFallback();
  }

  const state = toDeskState(tick);
  const put = putGithubFile(state);
  console.log(
    "[desk-auto-tick] published",
    PATH,
    "commit=",
    put?.commit?.sha?.slice(0, 7) || put?.content?.sha?.slice(0, 7) || "?",
    "updatedAt=",
    state.updatedAt,
  );
}

main().catch((err) => {
  console.error("[desk-auto-tick] fatal", err);
  process.exit(1);
});
