"use strict";

const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const SCHEMA_PATH = path.join(ROOT, "docs", "schemas", "ui.alerts.schema.json");

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function validateLocalizedText(value, label) {
  if (typeof value === "string") {
    assert(value.trim().length > 0, `${label} string must not be empty`);
    return;
  }

  assert(isPlainObject(value), `${label} must be a string or locale object`);

  const keys = Object.keys(value);
  assert(keys.length >= 1, `${label} locale object must have at least one key`);
  const allowed = new Set(["th-TH", "en-US"]);

  keys.forEach((key) => {
    assert(allowed.has(key), `${label} contains unsupported locale key: ${key}`);
    const text = value[key];
    assert(typeof text === "string", `${label}.${key} must be string`);
    assert(text.trim().length > 0, `${label}.${key} must not be empty`);
  });
}

function validateButton(button, index) {
  assert(isPlainObject(button), `buttons[${index}] must be an object`);
  const allowedKeys = new Set(["label", "href", "style"]);
  Object.keys(button).forEach((key) => {
    assert(allowedKeys.has(key), `buttons[${index}] has unknown key: ${key}`);
  });

  assert(Object.prototype.hasOwnProperty.call(button, "label"), `buttons[${index}].label is required`);
  validateLocalizedText(button.label, `buttons[${index}].label`);

  if (Object.prototype.hasOwnProperty.call(button, "href")) {
    assert(typeof button.href === "string", `buttons[${index}].href must be string`);
    assert(button.href.trim().length > 0, `buttons[${index}].href must not be empty`);
  }

  if (Object.prototype.hasOwnProperty.call(button, "style")) {
    assert(button.style === "primary" || button.style === "secondary", `buttons[${index}].style must be primary|secondary`);
  }
}

function validateUiAlertsContract(payload) {
  assert(isPlainObject(payload), "payload must be an object");

  const allowedKeys = new Set([
    "enabled",
    "mode",
    "noticeId",
    "title",
    "message",
    "description",
    "bannerMessage",
    "bannerDetail",
    "dismissible",
    "buttons"
  ]);

  Object.keys(payload).forEach((key) => {
    assert(allowedKeys.has(key), `ui.alerts has unknown key: ${key}`);
  });

  assert(typeof payload.mode === "string", "ui.alerts.mode is required and must be string");
  const allowedModes = new Set(["none", "lock_maintenance", "lock_payment_overdue", "banner_maintenance"]);
  assert(allowedModes.has(payload.mode), `ui.alerts.mode is invalid: ${String(payload.mode)}`);

  if (Object.prototype.hasOwnProperty.call(payload, "enabled")) {
    assert(typeof payload.enabled === "boolean", "ui.alerts.enabled must be boolean");
  }

  if (Object.prototype.hasOwnProperty.call(payload, "noticeId")) {
    assert(typeof payload.noticeId === "string", "ui.alerts.noticeId must be string");
    assert(payload.noticeId.trim().length > 0, "ui.alerts.noticeId must not be empty");
  }

  ["title", "message", "description", "bannerMessage", "bannerDetail"].forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(payload, key)) {
      validateLocalizedText(payload[key], `ui.alerts.${key}`);
    }
  });

  if (Object.prototype.hasOwnProperty.call(payload, "dismissible")) {
    assert(typeof payload.dismissible === "boolean", "ui.alerts.dismissible must be boolean");
  }

  if (Object.prototype.hasOwnProperty.call(payload, "buttons")) {
    assert(Array.isArray(payload.buttons), "ui.alerts.buttons must be array");
    assert(payload.buttons.length <= 3, "ui.alerts.buttons maxItems is 3");
    payload.buttons.forEach((button, index) => validateButton(button, index));
  }
}

function getValidFixtures() {
  return [
    {
      mode: "lock_maintenance",
      enabled: true,
      noticeId: "maint-2026-05-12-01",
      title: {
        "th-TH": "ขออภัย! เว็บไซต์กำลังปิดปรับปรุง",
        "en-US": "Sorry! This website is under maintenance"
      },
      message: {
        "th-TH": "เพื่อการปรับปรุงระบบและหน้าเว็บไซต์",
        "en-US": "We are improving the system and website."
      },
      description: {
        "th-TH": "กรุณากลับมาอีกครั้งภายหลัง",
        "en-US": "Please come back later."
      },
      buttons: [
        {
          label: {
            "th-TH": "กลับสู่หน้าแรก",
            "en-US": "Back to home"
          },
          href: "/",
          style: "primary"
        }
      ]
    },
    {
      mode: "lock_payment_overdue",
      enabled: true,
      noticeId: "billing-overdue-2026-05",
      title: {
        "th-TH": "ไม่สามารถเข้าใช้งานเว็บไซต์ได้ เนื่องจากระบบมีค้างชำระ",
        "en-US": "Website access is locked due to overdue payment"
      },
      message: {
        "th-TH": "กรุณาชำระค่าบริการที่ค้างชำระ",
        "en-US": "Please settle the outstanding payment."
      },
      description: {
        "th-TH": "หากชำระแล้ว กรุณารอสักครู่หรือติดต่อเจ้าหน้าที่",
        "en-US": "If payment is completed, please wait or contact support."
      },
      buttons: [
        {
          label: {
            "th-TH": "ติดต่อเจ้าหน้าที่",
            "en-US": "Contact support"
          },
          href: "/contact",
          style: "secondary"
        },
        {
          label: {
            "th-TH": "ตรวจสอบการชำระเงิน",
            "en-US": "Review payment status"
          },
          href: "/contact?topic=payment",
          style: "primary"
        }
      ]
    },
    {
      mode: "banner_maintenance",
      enabled: true,
      noticeId: "maint-window-2026-05-25",
      bannerMessage: {
        "th-TH": "แจ้งเพื่อทราบ: จะมีการปรับปรุงระบบและเว็บไซต์ ในช่วงเวลา 01:00 - 04:00 น.",
        "en-US": "Notice: System and website maintenance is scheduled from 01:00 - 04:00."
      },
      bannerDetail: {
        "th-TH": "ในช่วงเวลาดังกล่าว อาจไม่สามารถใช้งานบางฟังก์ชันได้ ขออภัยในความไม่สะดวก",
        "en-US": "During this period, some features may be temporarily unavailable."
      },
      dismissible: true
    }
  ];
}

function getInvalidFixtures() {
  return [
    {
      name: "missing mode",
      payload: { enabled: true }
    },
    {
      name: "invalid mode",
      payload: { mode: "maintenance_lock" }
    },
    {
      name: "unsupported locale",
      payload: {
        mode: "banner_maintenance",
        bannerMessage: {
          "th-TH": "แจ้งเตือน",
          "fr-FR": "Notice"
        }
      }
    },
    {
      name: "too many buttons",
      payload: {
        mode: "lock_payment_overdue",
        buttons: [
          { label: "A" },
          { label: "B" },
          { label: "C" },
          { label: "D" }
        ]
      }
    },
    {
      name: "unknown key",
      payload: {
        mode: "none",
        hacked: true
      }
    }
  ];
}

function validateSchemaShape(schema) {
  assert(isPlainObject(schema), "schema file must be an object");
  assert(schema.$id === "https://sstinnovationresort.local/schemas/ui.alerts.schema.json", "schema $id mismatch");
  assert(schema.type === "object", "schema type must be object");

  const modeEnum = schema?.properties?.mode?.enum;
  assert(Array.isArray(modeEnum), "schema properties.mode.enum must be array");
  ["none", "lock_maintenance", "lock_payment_overdue", "banner_maintenance"].forEach((mode) => {
    assert(modeEnum.includes(mode), `schema mode enum missing: ${mode}`);
  });

  const required = Array.isArray(schema.required) ? schema.required : [];
  assert(required.includes("mode"), "schema required must include mode");

  assert(schema.additionalProperties === false, "schema must disallow additionalProperties");
}

function main() {
  assert(fs.existsSync(SCHEMA_PATH), `schema file not found: ${SCHEMA_PATH}`);
  const schemaRaw = fs.readFileSync(SCHEMA_PATH, "utf8").replace(/^\uFEFF/, "");
  const schema = JSON.parse(schemaRaw);
  validateSchemaShape(schema);

  const validFixtures = getValidFixtures();
  validFixtures.forEach((payload, index) => {
    validateUiAlertsContract(payload);
    console.log(`PASS valid fixture #${index + 1}`);
  });

  const invalidFixtures = getInvalidFixtures();
  invalidFixtures.forEach((fixture) => {
    let failed = false;
    try {
      validateUiAlertsContract(fixture.payload);
    } catch {
      failed = true;
    }
    assert(failed, `invalid fixture should fail: ${fixture.name}`);
    console.log(`PASS invalid fixture rejected: ${fixture.name}`);
  });

  console.log("ui.alerts contract test passed.");
}

main();
