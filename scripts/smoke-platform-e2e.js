"use strict";

function getEnv(name, fallback = "") {
  return String(process.env[name] || fallback).trim();
}

const WEBSITE_BASE_URL = getEnv("WEBSITE_BASE_URL", "https://sstinnovationresort-website.vercel.app").replace(/\/$/, "");
const OWNER_BACKEND_BASE_URL = getEnv("OWNER_BACKEND_BASE_URL", "https://sstinnovation-backend-owner.vercel.app").replace(/\/$/, "");
const CENTRAL_BACKEND_BASE_URL = getEnv("CENTRAL_BACKEND_BASE_URL", "https://sstinnovation-backend-central.vercel.app").replace(/\/$/, "");
const BACKEND_API_SECRET = getEnv("BACKEND_API_SECRET");
const TENANT_A = getEnv("E2E_TENANT_A", "demo-resort");
const TENANT_B = getEnv("E2E_TENANT_B", "forest-escape");
const TENANT_404 = getEnv("E2E_TENANT_404", "tenant-not-found");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, options = {}, attempts = 6, delayMs = 700) {
  let lastError = null;
  for (let i = 0; i < attempts; i += 1) {
    try {
      return await fetch(url, { ...options, cache: "no-store" });
    } catch (error) {
      lastError = error;
      await sleep(delayMs);
    }
  }
  throw lastError || new Error(`request failed: ${url}`);
}

async function expectStatus(url, expected, options) {
  const response = await fetchWithRetry(url, options);
  assert(response.status === expected, `${url} expected ${expected}, got ${response.status}`);
  console.log(`PASS ${url} -> ${response.status}`);
  return response;
}

async function websiteSmoke() {
  console.log("== Website smoke ==");
  await expectStatus(`${WEBSITE_BASE_URL}/`, 200);
  await expectStatus(`${WEBSITE_BASE_URL}/site/${TENANT_A}`, 200);
  await expectStatus(`${WEBSITE_BASE_URL}/site/${TENANT_A}/rooms`, 200);
  await expectStatus(`${WEBSITE_BASE_URL}/site/${TENANT_B}`, 200);
  await expectStatus(`${WEBSITE_BASE_URL}/site/${TENANT_B}/rooms`, 200);
  await expectStatus(`${WEBSITE_BASE_URL}/site/${TENANT_404}`, 404);
}

async function websiteTenantApiChecks() {
  console.log("== Website tenant API checks ==");
  const a = await expectStatus(`${WEBSITE_BASE_URL}/api/site/${TENANT_A}/home`, 200);
  const aPayload = await a.json();
  assert(aPayload?.tenant?.tenantSlug === TENANT_A, `tenant mismatch on ${TENANT_A}`);
  console.log(`PASS ${TENANT_A} tenantSlug=${aPayload.tenant.tenantSlug}`);

  const b = await expectStatus(`${WEBSITE_BASE_URL}/api/site/${TENANT_B}/home`, 200);
  const bPayload = await b.json();
  assert(bPayload?.tenant?.tenantSlug === TENANT_B, `tenant mismatch on ${TENANT_B}`);
  console.log(`PASS ${TENANT_B} tenantSlug=${bPayload.tenant.tenantSlug}`);

  await expectStatus(`${WEBSITE_BASE_URL}/api/site/${TENANT_404}/home`, 404);
}

function backendHeaders(tenantSlug) {
  const headers = { "x-tenant-slug": tenantSlug };
  if (BACKEND_API_SECRET) headers["x-internal-secret"] = BACKEND_API_SECRET;
  return headers;
}

async function backendSmoke() {
  console.log("== Backend smoke ==");
  await expectStatus(`${OWNER_BACKEND_BASE_URL}/health`, 200);
  await expectStatus(`${CENTRAL_BACKEND_BASE_URL}/health`, 200);

  if (!BACKEND_API_SECRET) {
    console.log("SKIP direct /site/* backend checks (BACKEND_API_SECRET not set)");
    return;
  }

  await expectStatus(`${OWNER_BACKEND_BASE_URL}/site/home`, 200, { headers: backendHeaders(TENANT_A) });
  await expectStatus(`${OWNER_BACKEND_BASE_URL}/site/about`, 200, { headers: backendHeaders(TENANT_A) });
  await expectStatus(`${OWNER_BACKEND_BASE_URL}/site/articles`, 200, { headers: backendHeaders(TENANT_A) });
  await expectStatus(`${CENTRAL_BACKEND_BASE_URL}/site/home`, 200, { headers: backendHeaders(TENANT_A) });
}

async function main() {
  console.log("Platform E2E smoke started");
  console.log(`website=${WEBSITE_BASE_URL}`);
  console.log(`owner=${OWNER_BACKEND_BASE_URL}`);
  console.log(`central=${CENTRAL_BACKEND_BASE_URL}`);
  console.log(`tenants=${TENANT_A},${TENANT_B},404=${TENANT_404}`);

  await websiteSmoke();
  await websiteTenantApiChecks();
  await backendSmoke();

  console.log("Platform E2E smoke completed successfully.");
}

main().catch((error) => {
  console.error(`Platform E2E smoke failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});

