#!/usr/bin/env node
/**
 * Box routine: hit live /api/desk/tick (or local fallback), then publish
 * desk-state.json to GitHub via Contents API so clients hydrate without Neon.
 *
 * Usage: node scripts/desk-auto-tick.mjs
 * Env: LIVE_URL (optional), CRON_SECRET (optional), GH_TOKEN via `gh` auth
 */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
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
      // gh auth status writes to stderr often; try api
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
  const headers = { accept: "application/json" };
  if (process.env.CRON_SECRET) {
    headers.authorization = `Bearer ${process.env.CRON_SECRET}`;
  }
  const url = `${LIVE.replace(/\/$/, "")}/api/desk/tick`;
  const res = await fetch(url, { method: "GET", headers, cache: "no-store" });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`tick HTTP ${res.status}: ${body.slice(0, 400)}`);
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

async function localFallback() {
  // API not ready yet — keep prior GitHub/local ticker, bump updatedAt heartbeat.
  console.warn("[desk-auto-tick] API not ready; writing heartbeat from local file");
  const prior = readLocalState();
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
    sha = gh(
      "api",
      `repos/${REPO}/contents/${PATH}`,
      "--jq",
      ".sha",
    ).trim();
  } catch {
    sha = "";
  }
  const args = [
    "api",
    `repos/${REPO}/contents/${PATH}`,
    "-X",
    "PUT",
    "-f",
    `message=desk: auto tick`,
    "-f",
    `content=${b64}`,
  ];
  // Prefer JSON body for large content / binary-safe
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
    console.warn("[desk-auto-tick] live tick failed:", err instanceof Error ? err.message : err);
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
