"use strict";

const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const SCHEMA_PATH = path.join(ROOT, "docs", "schemas", "ui.booking.schema.json");

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function validateBookingContract(payload) {
  assert(isObject(payload), "ui.booking must be an object");
  const allowedKeys = new Set([
    "mode",
    "allowBookingForm",
    "contactRoute",
    "paymentOptions",
    "defaultPaymentOption",
    "depositPercent"
  ]);

  Object.keys(payload).forEach((key) => {
    assert(allowedKeys.has(key), `ui.booking has unknown key: ${key}`);
  });

  assert(typeof payload.mode === "string", "ui.booking.mode is required");
  assert(payload.mode === "contact_only" || payload.mode === "booking_enabled", "ui.booking.mode is invalid");

  if (Object.prototype.hasOwnProperty.call(payload, "allowBookingForm")) {
    assert(typeof payload.allowBookingForm === "boolean", "allowBookingForm must be boolean");
  }

  if (Object.prototype.hasOwnProperty.call(payload, "contactRoute")) {
    assert(typeof payload.contactRoute === "string", "contactRoute must be string");
    assert(payload.contactRoute.startsWith("/"), "contactRoute must start with /");
  }

  if (Object.prototype.hasOwnProperty.call(payload, "paymentOptions")) {
    assert(Array.isArray(payload.paymentOptions), "paymentOptions must be array");
    assert(payload.paymentOptions.length > 0, "paymentOptions must not be empty");
    const seen = new Set();
    payload.paymentOptions.forEach((option, index) => {
      assert(option === "deposit_50" || option === "full", `paymentOptions[${index}] is invalid`);
      assert(!seen.has(option), `paymentOptions duplicate: ${option}`);
      seen.add(option);
    });
  }

  if (Object.prototype.hasOwnProperty.call(payload, "defaultPaymentOption")) {
    assert(
      payload.defaultPaymentOption === "deposit_50" || payload.defaultPaymentOption === "full",
      "defaultPaymentOption is invalid"
    );
  }

  if (Object.prototype.hasOwnProperty.call(payload, "depositPercent")) {
    assert(Number.isInteger(payload.depositPercent), "depositPercent must be integer");
    assert(payload.depositPercent >= 1 && payload.depositPercent <= 99, "depositPercent must be 1..99");
  }

  if (payload.mode === "contact_only" && Object.prototype.hasOwnProperty.call(payload, "allowBookingForm")) {
    assert(payload.allowBookingForm === false, "allowBookingForm must be false in contact_only");
  }

  if (payload.mode === "booking_enabled" && Object.prototype.hasOwnProperty.call(payload, "allowBookingForm")) {
    assert(payload.allowBookingForm === true, "allowBookingForm must be true in booking_enabled");
  }
}

function validateSchemaShape(schema) {
  assert(isObject(schema), "schema must be object");
  assert(schema.$id === "https://sstinnovationresort.local/schemas/ui.booking.schema.json", "schema $id mismatch");
  assert(schema.type === "object", "schema type must be object");

  const modeEnum = schema?.properties?.mode?.enum;
  assert(Array.isArray(modeEnum), "schema mode enum missing");
  assert(modeEnum.includes("contact_only"), "schema mode missing contact_only");
  assert(modeEnum.includes("booking_enabled"), "schema mode missing booking_enabled");
  assert(schema.additionalProperties === false, "schema additionalProperties must be false");
}

function main() {
  const schemaRaw = fs.readFileSync(SCHEMA_PATH, "utf8").replace(/^\uFEFF/, "");
  const schema = JSON.parse(schemaRaw);
  validateSchemaShape(schema);

  const validFixtures = [
    {
      mode: "booking_enabled",
      allowBookingForm: true,
      contactRoute: "/contact",
      paymentOptions: ["deposit_50", "full"],
      defaultPaymentOption: "deposit_50",
      depositPercent: 50
    },
    {
      mode: "contact_only",
      allowBookingForm: false,
      contactRoute: "/contact",
      paymentOptions: ["full"],
      defaultPaymentOption: "full"
    }
  ];

  validFixtures.forEach((fixture, index) => {
    validateBookingContract(fixture);
    console.log(`PASS valid booking fixture #${index + 1}`);
  });

  const invalidFixtures = [
    { name: "missing mode", payload: { allowBookingForm: true } },
    { name: "invalid mode", payload: { mode: "enabled" } },
    { name: "invalid contact route", payload: { mode: "contact_only", contactRoute: "contact" } },
    { name: "invalid payment option", payload: { mode: "booking_enabled", paymentOptions: ["half"] } },
    { name: "invalid deposit percent", payload: { mode: "booking_enabled", depositPercent: 120 } },
    { name: "unknown key", payload: { mode: "contact_only", hack: true } }
  ];

  invalidFixtures.forEach((fixture) => {
    let failed = false;
    try {
      validateBookingContract(fixture.payload);
    } catch {
      failed = true;
    }
    assert(failed, `invalid booking fixture should fail: ${fixture.name}`);
    console.log(`PASS invalid booking fixture rejected: ${fixture.name}`);
  });

  console.log("ui.booking contract test passed.");
}

main();
