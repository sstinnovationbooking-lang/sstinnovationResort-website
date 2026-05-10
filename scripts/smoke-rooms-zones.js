"use strict";

const { spawn } = require("node:child_process");
const path = require("node:path");

const PROJECT_ROOT = path.resolve(__dirname, "..");
const NEXT_BIN = path.join(PROJECT_ROOT, "node_modules", "next", "dist", "bin", "next");
const PORT = Number.parseInt(process.env.SMOKE_PORT || "4120", 10);
const BASE_URL = `http://127.0.0.1:${PORT}`;
const START_TIMEOUT_MS = 30_000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitUntilReady(timeoutMs) {
  const start = Date.now();
  let lastError = "";
  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(`${BASE_URL}/`, { cache: "no-store" });
      if (response.status >= 200 && response.status < 500) {
        return;
      }
      lastError = `unexpected status ${response.status}`;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error ?? "unknown error");
    }
    await sleep(500);
  }
  throw new Error(`Server did not start within ${timeoutMs}ms (${lastError || "unknown error"})`);
}

async function requestText(route) {
  const response = await fetch(`${BASE_URL}${route}`, { cache: "no-store" });
  const text = await response.text();
  return { response, text };
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function runChecks() {
  const checks = [];

  {
    const { response, text } = await requestText("/site/demo-resort/rooms");
    assert(response.status === 200, `GET /site/demo-resort/rooms expected 200, got ${response.status}`);
    assert(/Room zones|โซนห้องพัก/i.test(text), "rooms page should render zone filter");
    assert(/Zone A|โซน A/i.test(text), "rooms page should render Zone A");
    checks.push("tenant rooms page shows zone filter");
  }

  {
    const { response, text } = await requestText("/site/forest-escape/rooms");
    assert(response.status === 200, `GET /site/forest-escape/rooms expected 200, got ${response.status}`);
    assert(/Room zones|โซนห้องพัก/i.test(text), "forest rooms page should render zone filter");
    checks.push("second tenant rooms page renders zones");
  }

  {
    const { response, text } = await requestText("/site/demo-resort/rooms?checkIn=11/052569&nights=1&guests=2");
    assert(response.status === 200, `GET search page expected 200, got ${response.status}`);
    assert(/2026-05-11/.test(text), "search criteria should normalize 11/052569 to 2026-05-11");
    checks.push("date normalization reflected on rooms search UI");
  }

  {
    const response = await fetch(`${BASE_URL}/api/site/demo-resort/rooms?checkIn=11/052569&nights=1&guests=2`, {
      cache: "no-store"
    });
    assert(response.status === 200, `GET /api/site/demo-resort/rooms expected 200, got ${response.status}`);
    const payload = await response.json();
    assert(Array.isArray(payload), "rooms API should return an array");
    const invalidCapacity = payload.find((room) => typeof room?.maxGuests === "number" && room.maxGuests < 2);
    assert(!invalidCapacity, "rooms API should filter out rooms that cannot fit requested guests");
    checks.push("rooms API filters by guests and keeps normalized response");
  }

  {
    const { response } = await requestText("/site/tenant-not-found");
    assert(response.status === 404, `GET /site/tenant-not-found expected 404, got ${response.status}`);
    checks.push("unknown tenant still returns 404");
  }

  return checks;
}

async function main() {
  const nextProcess = spawn(process.execPath, [NEXT_BIN, "start", "-p", String(PORT)], {
    cwd: PROJECT_ROOT,
    env: { ...process.env, PORT: String(PORT) },
    stdio: ["ignore", "pipe", "pipe"]
  });

  nextProcess.stdout.on("data", (chunk) => {
    process.stdout.write(`[next] ${chunk}`);
  });
  nextProcess.stderr.on("data", (chunk) => {
    process.stderr.write(`[next:err] ${chunk}`);
  });

  try {
    await waitUntilReady(START_TIMEOUT_MS);
    const checks = await runChecks();
    checks.forEach((item) => {
      process.stdout.write(`PASS: ${item}\n`);
    });
    process.stdout.write("Smoke test completed successfully.\n");
  } finally {
    if (!nextProcess.killed) {
      nextProcess.kill("SIGTERM");
    }
  }
}

main().catch((error) => {
  process.stderr.write(`Smoke test failed: ${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
