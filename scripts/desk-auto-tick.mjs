#!/usr/bin/env node
/**
 * Box routine: hit live /api/desk/tick (or local fallback), then publish
 * desk-state.json to GitHub via Contents API so clients hydrate without Neon.
 *
 * Usage: node scripts/desk-auto-tick.mjs
 * Env: LIVE_URL (optional), CRON_SECRET (optional), GH_TOKEN via `gh` auth
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
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

/** Real local scan: npx tsx scripts/desk-local-tick.ts (runDeskTick + wide fallback). */
function localRunDeskTick() {
  const script = join(ROOT, "scripts", "desk-local-tick.ts");
  const localBin = join(ROOT, "node_modules", ".bin", "tsx");
  const useLocal = existsSync(localBin);
  const out = execFileSync(
    useLocal ? localBin : "npx",
    useLocal ? [script] : ["--yes", "tsx", script],
    {
      encoding: "utf8",
      cwd: ROOT,
      timeout: 120_000,
      maxBuffer: 8 * 1024 * 1024,
      env: { ...process.env },
    },
  );
  return parseLastJson(out);
}

async function localFallback() {
  console.warn("[desk-auto-tick] live tick failed; running local desk-local-tick.ts");
  const prior = readLocalState();
  try {
    const tick = localRunDeskTick();
    console.log(
      "[desk-auto-tick] local tick ok",
      "count=",
      tick?.count,
      "ticker=",
      tick?.ticker?.length ?? 0,
      "packed=",
      tick?.packed,
      "error=",
      tick?.error ?? null,
    );
    return tick;
  } catch (err) {
    console.warn(
      "[desk-auto-tick] local tick failed:",
      err instanceof Error ? err.message.slice(0, 400) : String(err).slice(0, 400),
    );
    console.warn("[desk-auto-tick] writing heartbeat from local file");
    return {
      ...prior,
      updatedAt: new Date().toISOString(),
      _fallback: true,
    };
  }
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
    // Live may return 200 with empty ticker (scan starved / translate down).
    // Prefer a real local scan when production produced nothing useful.
    if (!(tick?.ticker?.length) && !tick?.packed && !tick?.briefing) {
      console.warn("[desk-auto-tick] live tick empty; running local scan");
      const local = await localFallback();
      if (local?.ticker?.length || local?.briefing || local?.packed) tick = local;
    }
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
