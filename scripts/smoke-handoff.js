"use strict";

const { spawn } = require("node:child_process");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const NEXT_BIN = path.join(ROOT, "node_modules", "next", "dist", "bin", "next");
const PORT = Number.parseInt(process.env.SMOKE_PORT || "4135", 10);
const BASE = `http://127.0.0.1:${PORT}`;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function waitUntilReady(timeoutMs) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(`${BASE}/`, { cache: "no-store" });
      if (response.status >= 200 && response.status < 500) return;
    } catch {}
    await sleep(400);
  }
  throw new Error("server did not start in time");
}

async function checkRoute(route, expected) {
  const response = await fetch(`${BASE}${route}`, { cache: "no-store" });
  assert(response.status === expected, `${route} expected ${expected}, got ${response.status}`);
  process.stdout.write(`PASS ${route} -> ${response.status}\n`);
}

async function main() {
  const nextProcess = spawn(process.execPath, [NEXT_BIN, "start", "-p", String(PORT)], {
    cwd: ROOT,
    env: { ...process.env, PORT: String(PORT) },
    stdio: ["ignore", "pipe", "pipe"]
  });

  nextProcess.stdout.on("data", (chunk) => process.stdout.write(`[next] ${chunk}`));
  nextProcess.stderr.on("data", (chunk) => process.stderr.write(`[next:err] ${chunk}`));

  try {
    await waitUntilReady(30000);
    await checkRoute("/", 200);
    await checkRoute("/site/demo-resort", 200);
    await checkRoute("/site/demo-resort/rooms", 200);
    await checkRoute("/site/forest-escape", 200);
    await checkRoute("/site/forest-escape/rooms", 200);
    await checkRoute("/site/tenant-not-found", 404);
    process.stdout.write("Handoff smoke test completed successfully.\n");
  } finally {
    if (!nextProcess.killed) nextProcess.kill("SIGTERM");
  }
}

main().catch((error) => {
  process.stderr.write(`Handoff smoke test failed: ${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
});
