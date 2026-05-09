const STATIC_FALLBACK_KEY_BY_TEXT: Record<string, string> = {
  "เว็บไซต์รีสอร์ตพร้อมระบบจอง ดีไซน์สวย รองรับทุกอุปกรณ์": "staticText.forestHeroTitle",
  "เทมเพลตสำหรับรีสอร์ตที่ต้องการหน้าเว็บมืออาชีพ ปรับแบรนด์ได้ และเชื่อม backend": "staticText.forestHeroSubtitle",
  "เริ่มส่งคำขอจอง": "staticText.forestHeroCta",
  "รีสอร์ตริมทะเลสาบ สไตล์พักผ่อน": "staticText.lakeHeroEyebrow",
  "Lake Serenity Resort\nพักสบาย ชมวิวทุกเช้า": "staticText.lakeHeroTitle",
  "เทมเพลตเดียวกัน ปรับแบรนด์สำหรับแต่ละ tenant ได้ทันที": "staticText.lakeHeroSubtitle",
  "ส่งคำขอเข้าพัก": "staticText.lakeHeroCta",
  "Demo tenant for preview and QA": "staticText.demoHeroEyebrow",
  "Demo Resort\nPreview Environment": "staticText.demoHeroTitle",
  "This tenant is intended for testing, stakeholder demos, and staging previews.": "staticText.demoHeroSubtitle",
  "Send Demo Lead": "staticText.demoHeroCta",
  "เว็บไซต์รีสอร์ทพร้อมระบบจอง รองรับหลายเจ้าของรีสอร์ท และเชื่อมต่อระบบหลังบ้าน": "staticText.footerDescription",
  "ระบบจองห้องพัก": "staticText.systemBooking",
  "เว็บไซต์รีสอร์ท": "staticText.systemWebsite",
  "รองรับ Multi-tenant": "staticText.systemMultitenant",
  "เชื่อมต่อระบบหลังบ้าน": "staticText.systemBackend",
  "ทุกวัน 08:00 - 20:00 น.": "staticText.supportHours",
  "Garden Villa": "staticText.roomGardenVillaName",
  "วิลล่ากลางสวนส่วนตัว เงียบสงบ เหมาะกับคู่รักและครอบครัวขนาดเล็ก": "staticText.roomGardenVillaDescription",
  "สวนส่วนตัว": "staticText.roomGardenVillaBadge",
  "Mountain Cabin": "staticText.roomMountainCabinName",
  "เคบินวิวภูเขา โทนอบอุ่น พร้อมระเบียงชมธรรมชาติ": "staticText.roomMountainCabinDescription",
  "วิวภูเขา": "staticText.roomMountainCabinBadge",
  "River Pool Villa": "staticText.roomRiverPoolVillaName",
  "พูลวิลล่าริมน้ำพร้อมสระส่วนตัว เหมาะกับทริปกลุ่มเพื่อน": "staticText.roomRiverPoolVillaDescription",
  "พูลวิลล่า": "staticText.roomRiverPoolVillaBadge",
  "Lakeside Suite": "staticText.roomLakesideSuiteName",
  "ห้องพักวิวทะเลสาบ ตื่นมาพร้อมหมอกเช้าและอาหารเช้าริมน้ำ": "staticText.roomLakesideSuiteDescription",
  "วิวทะเลสาบ": "staticText.roomLakesideSuiteBadge",
  "Wooden Villa": "staticText.roomWoodenVillaName",
  "บ้านไม้ร่วมสมัย เน้นความอบอุ่นและความเป็นส่วนตัว": "staticText.roomWoodenVillaDescription",
  "บ้านไม้": "staticText.roomWoodenVillaBadge"
};

type TranslateFn = (key: string) => string;

function normalizeFallbackText(value: string): string {
  return value.replace(/\r\n/g, "\n").replace(/\s+/g, " ").trim();
}

const STATIC_FALLBACK_KEY_BY_NORMALIZED_TEXT: Record<string, string> = Object.entries(
  STATIC_FALLBACK_KEY_BY_TEXT
).reduce<Record<string, string>>((acc, [rawText, key]) => {
  const normalizedText = normalizeFallbackText(rawText);
  if (normalizedText) {
    acc[normalizedText] = key;
  }
  return acc;
}, {});

export function translateStaticFallbackText(value: string | null | undefined, t: TranslateFn): string {
  const text = String(value ?? "");
  const key =
    STATIC_FALLBACK_KEY_BY_TEXT[text] ?? STATIC_FALLBACK_KEY_BY_NORMALIZED_TEXT[normalizeFallbackText(text)];
  if (!key) return text;
  try {
    return t(key);
  } catch {
    return text;
  }
}
