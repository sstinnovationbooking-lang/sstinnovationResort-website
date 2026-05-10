"use strict";

const http = require("node:http");
const { spawn } = require("node:child_process");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const NEXT_BIN = path.join(ROOT, "node_modules", "next", "dist", "bin", "next");
const APP_PORT = Number.parseInt(process.env.TEST_APP_PORT || "4130", 10);
const BACKEND_PORT = Number.parseInt(process.env.TEST_BACKEND_PORT || "5130", 10);
const CENTRAL_PORT = Number.parseInt(process.env.TEST_CENTRAL_PORT || "5131", 10);
const APP_BASE = `http://127.0.0.1:${APP_PORT}`;
const BACKEND_BASE = `http://127.0.0.1:${BACKEND_PORT}`;
const CENTRAL_BASE = `http://127.0.0.1:${CENTRAL_PORT}`;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function jsonResponse(res, status, payload) {
  res.statusCode = status;
  res.setHeader("content-type", "application/json");
  res.end(JSON.stringify(payload));
}

function makeBaseHome(tenantSlug, locale = "th") {
  return {
    tenant: {
      tenantSlug,
      brand: `${tenantSlug} brand`,
      locale
    },
    hero: {
      eyebrow: "eyebrow",
      title: "title",
      subtitle: "subtitle",
      ctaLabel: "cta",
      heroImageUrl: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80"
    },
    stats: [],
    highlights: [],
    featuredRooms: [],
    featuredPackages: [],
    gallery: [],
    contact: {
      phone: "+66 89 000 1111",
      email: "booking@example.com",
      country: "ไทย",
      openingHours: "ทุกวัน 08:00 - 20:00 น.",
      address: "เชียงใหม่",
      mapUrl: "https://maps.app.goo.gl/o5KacUwbLLT7B5E76"
    },
    ui: {
      booking: {
        mode: "booking_enabled",
        allowBookingForm: true,
        paymentOptions: ["full"],
        defaultPaymentOption: "full",
        contactRoute: "/contact"
      }
    }
  };
}

function createBackendServer() {
  return http.createServer((req, res) => {
    const tenantSlug = String(req.headers["x-tenant-slug"] || "").trim();
    const url = String(req.url || "");

    if (!url.startsWith("/site/home")) {
      return jsonResponse(res, 404, { error: "not found" });
    }

    if (tenantSlug === "lake-serenity") {
      return jsonResponse(res, 503, { error: "backend unavailable" });
    }

    if (tenantSlug === "demo-resort") {
      const home = makeBaseHome("demo-resort");
      home.aboutPage = null;
      home.articlesPage = null;
      home.ui.alerts = {
        mode: "invalid_mode_from_backend",
        message: { "th-TH": "bad" }
      };
      return jsonResponse(res, 200, home);
    }

    if (tenantSlug === "forest-escape") {
      const home = makeBaseHome("forest-escape");
      home.aboutPage = {
        heading: { "th-TH": "เกี่ยวกับเราแบ็กเอนด์", "en-US": "Backend about" },
        description: { "th-TH": "ข้อมูลจาก backend", "en-US": "Backend content" }
      };
      home.articlesPage = {
        heading: { "th-TH": "บทความแบ็กเอนด์", "en-US": "Backend articles" },
        items: [
          {
            id: "backend-a1",
            title: { "th-TH": "หัวข้อจาก backend", "en-US": "Backend topic" },
            excerpt: { "th-TH": "สรุปจาก backend", "en-US": "Backend excerpt" },
            slug: "backend-topic",
            publishedAt: "2026-05-11"
          }
        ]
      };
      return jsonResponse(res, 200, home);
    }

    return jsonResponse(res, 200, makeBaseHome(tenantSlug || "demo-resort"));
  });
}

function createCentralServer() {
  return http.createServer((req, res) => {
    const tenantSlug = String(req.headers["x-tenant-slug"] || "").trim();
    const url = String(req.url || "");

    if (!url.startsWith("/site/home")) {
      return jsonResponse(res, 404, { error: "not found" });
    }

    if (tenantSlug === "lake-serenity") {
      return jsonResponse(res, 503, { error: "central unavailable" });
    }

    if (tenantSlug === "demo-resort") {
      const home = makeBaseHome("demo-resort");
      home.aboutPage = {
        heading: { "th-TH": "เกี่ยวกับเราเซ็นทรัล", "en-US": "Central about" },
        subtitle: { "th-TH": "ส่วนกลาง", "en-US": "Central" },
        description: { "th-TH": "เนื้อหาจากระบบกลาง", "en-US": "Central content" }
      };
      home.articlesPage = {
        heading: { "th-TH": "บทความเซ็นทรัล", "en-US": "Central articles" },
        items: [
          {
            id: "central-a1",
            title: { "th-TH": "บทความกลาง", "en-US": "Central article" },
            excerpt: { "th-TH": "ตัวอย่าง", "en-US": "Sample" },
            slug: "central-article",
            category: { "th-TH": "ข่าว", "en-US": "News" },
            publishedAt: "2026-05-11"
          }
        ]
      };
      home.ui.alerts = {
        enabled: true,
        mode: "banner_maintenance",
        noticeId: "central-maint-window",
        bannerMessage: {
          "th-TH": "แจ้งเพื่อทราบ",
          "en-US": "Notice"
        },
        bannerDetail: {
          "th-TH": "ระบบจะปรับปรุง",
          "en-US": "System maintenance"
        },
        dismissible: true
      };
      return jsonResponse(res, 200, home);
    }

    return jsonResponse(res, 200, makeBaseHome(tenantSlug || "demo-resort"));
  });
}

async function waitReady(baseUrl, timeoutMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(`${baseUrl}/`, { cache: "no-store" });
      if (response.status >= 200 && response.status < 500) return;
    } catch {}
    await sleep(350);
  }
  throw new Error(`server not ready: ${baseUrl}`);
}

async function fetchJsonWithRetry(url, expectedStatus, attempts = 8, delayMs = 700) {
  let lastResponse = null;
  for (let index = 0; index < attempts; index += 1) {
    const response = await fetch(url, { cache: "no-store" });
    lastResponse = response;
    if (response.status === expectedStatus) {
      const payload = await response.json();
      return { response, payload };
    }
    await sleep(delayMs);
  }
  throw new Error(`${url} expected ${expectedStatus}, got ${lastResponse ? lastResponse.status : "no response"}`);
}

function startsWithGoogleMaps(url) {
  return typeof url === "string" && /^https:\/\/www\.google\.[^/]+\/maps/i.test(url);
}

async function runAssertions() {
  {
    const { payload } = await fetchJsonWithRetry(`${APP_BASE}/api/site/demo-resort/home`, 200);
    const aboutHeading = String(payload?.aboutPage?.heading?.["th-TH"] || payload?.aboutPage?.heading || "");
    assert(/เซ็นทรัล|central/i.test(aboutHeading), "aboutPage should fallback from central when backend missing");
    assert(Array.isArray(payload?.articlesPage?.items), "articlesPage.items should exist");
    assert(payload.articlesPage.items.length >= 1, "articlesPage.items should not be empty");
    assert(payload?.ui?.alerts?.mode === "banner_maintenance", "ui.alerts should fallback to central valid schema");
    console.log("PASS api payload mapping: demo-resort central fallback for about/articles/alerts");
  }

  {
    const { payload } = await fetchJsonWithRetry(`${APP_BASE}/api/site/forest-escape/home`, 200);
    const aboutHeading = String(payload?.aboutPage?.heading?.["th-TH"] || payload?.aboutPage?.heading || "");
    assert(/แบ็กเอนด์|backend/i.test(aboutHeading), "aboutPage should use backend payload when valid");
    assert(!payload?.ui?.alerts, "missing ui.alerts should remain safe without crash");
    console.log("PASS missing ui.alerts stays safe");
  }

  {
    const { response, payload } = await fetchJsonWithRetry(`${APP_BASE}/api/site/lake-serenity/home`, 200);
    assert(response.headers.get("x-fallback-source") === "static-home", "should mark static fallback header");
    assert(payload?.tenant?.tenantSlug === "lake-serenity", "static fallback should keep tenant context");
    console.log("PASS static fallback when backend/central unavailable");
  }

  {
    const iframe = encodeURIComponent('<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3871.2687147125707!2d100.55545757528385!3d14.00207449144949!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30e27f006fb3ea1d%3A0xdf5680236b96f6a5!5e0!3m2!1sth!2sth!4v1778430585902!5m2!1sth!2sth"></iframe>');
    const response = await fetch(`${APP_BASE}/api/site/map-embed?url=${iframe}`, { cache: "no-store" });
    assert(response.status === 200, `map resolver expected 200, got ${response.status}`);
    const payload = await response.json();
    assert(startsWithGoogleMaps(payload.embedSrc), "valid iframe should produce google maps embed src");
    console.log("PASS map resolver valid iframe");
  }

  {
    const unsafe = encodeURIComponent("https://evil.example.com/payload-map");
    const response = await fetch(`${APP_BASE}/api/site/map-embed?url=${unsafe}`, { cache: "no-store" });
    assert(response.status === 200, `unsafe map resolver expected 200, got ${response.status}`);
    const payload = await response.json();
    assert(!payload.embedSrc || startsWithGoogleMaps(payload.embedSrc), "unsafe map src must not render non-google embed");
    console.log("PASS map resolver blocks unsafe embed domain");
  }

  {
    const invalid = encodeURIComponent("javascript:alert(1)");
    const response = await fetch(`${APP_BASE}/api/site/map-embed?url=${invalid}`, { cache: "no-store" });
    assert(response.status === 200, `invalid map resolver expected 200, got ${response.status}`);
    const payload = await response.json();
    assert(!payload.embedSrc || startsWithGoogleMaps(payload.embedSrc), "invalid map input must fallback to safe embed or null");
    console.log("PASS map resolver invalid input safe fallback");
  }

  {
    const demoContact = await fetch(`${APP_BASE}/site/demo-resort/contact`, { cache: "no-store" });
    const demoHtml = await demoContact.text();
    assert(demoContact.status === 200, "demo contact should load");
    assert(/contact-map-frame/i.test(demoHtml), "demo contact should render map frame");

    const forestContact = await fetch(`${APP_BASE}/site/forest-escape/contact`, { cache: "no-store" });
    const forestHtml = await forestContact.text();
    assert(forestContact.status === 200, "forest contact should load");
    assert(/contact-map-frame/i.test(forestHtml), "forest contact should render map frame");
    console.log("PASS tenant-specific contact map config renders");
  }
}

async function main() {
  const backendServer = createBackendServer();
  const centralServer = createCentralServer();

  const backendReady = new Promise((resolve) => backendServer.listen(BACKEND_PORT, "127.0.0.1", resolve));
  const centralReady = new Promise((resolve) => centralServer.listen(CENTRAL_PORT, "127.0.0.1", resolve));

  await backendReady;
  await centralReady;

  const nextProcess = spawn(process.execPath, [NEXT_BIN, "dev", "-p", String(APP_PORT), "--hostname", "127.0.0.1"], {
    cwd: ROOT,
    env: {
      ...process.env,
      PORT: String(APP_PORT),
      CONTENT_MODE: "api",
      BACKEND_API_BASE_URL: BACKEND_BASE,
      BACKEND_API_SECRET: "test-backend-secret",
      CENTRAL_API_BASE_URL: CENTRAL_BASE,
      CENTRAL_API_SECRET: "test-central-secret"
    },
    stdio: ["ignore", "pipe", "pipe"]
  });

  nextProcess.stdout.on("data", (chunk) => process.stdout.write(`[next] ${chunk}`));
  nextProcess.stderr.on("data", (chunk) => process.stderr.write(`[next:err] ${chunk}`));

  try {
    await waitReady(APP_BASE);
    await runAssertions();
    console.log("Integration test suite passed.");
  } finally {
    if (!nextProcess.killed) nextProcess.kill("SIGTERM");
    await sleep(400);
    await new Promise((resolve) => backendServer.close(resolve));
    await new Promise((resolve) => centralServer.close(resolve));
  }
}

main().catch((error) => {
  console.error(`Integration suite failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
