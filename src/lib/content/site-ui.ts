import type {
  BookingPaymentOption,
  SiteAlertButtonDTO,
  SiteAlertMode,
  SiteAlertSettingsDTO,
  SiteBookingSettingsDTO,
  SiteUiSettingsDTO
} from "@/lib/types/site";

const DEFAULT_CONTACT_ROUTE = "/contact";
const DEFAULT_PAYMENT_OPTIONS: BookingPaymentOption[] = ["full"];
const DEFAULT_ALERT_MODE: SiteAlertMode = "none";

function asText(value: unknown): string | undefined {
  const normalized = String(value ?? "").trim();
  return normalized || undefined;
}

function asLocalizedText(value: unknown): SiteAlertButtonDTO["label"] | undefined {
  if (typeof value === "string") {
    const normalized = value.trim();
    return normalized || undefined;
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const output: Record<string, string> = {};
  for (const [key, candidate] of Object.entries(value)) {
    const text = String(candidate ?? "").trim();
    if (text) output[key] = text;
  }
  return Object.keys(output).length > 0 ? output : undefined;
}

function normalizeAlertMode(value: unknown): SiteAlertMode {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (!normalized) return DEFAULT_ALERT_MODE;
  if (
    normalized === "lock_maintenance" ||
    normalized === "maintenance_lock" ||
    normalized === "lock_web_maintenance"
  ) {
    return "lock_maintenance";
  }
  if (
    normalized === "lock_payment_overdue" ||
    normalized === "lock_overdue" ||
    normalized === "payment_overdue_lock" ||
    normalized === "overdue_payment"
  ) {
    return "lock_payment_overdue";
  }
  if (
    normalized === "banner_maintenance" ||
    normalized === "maintenance_banner" ||
    normalized === "maintenance_notice"
  ) {
    return "banner_maintenance";
  }
  return DEFAULT_ALERT_MODE;
}

function sanitizeAlertButtons(value: unknown): SiteAlertButtonDTO[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const output = value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const record = item as Record<string, unknown>;
      const label = asLocalizedText(record.label);
      if (!label) return null;
      const href = asText(record.href);
      const styleRaw = String(record.style ?? "").trim().toLowerCase();
      const style = styleRaw === "secondary" ? "secondary" : "primary";
      return {
        label,
        href,
        style
      } as SiteAlertButtonDTO;
    })
    .filter((item): item is SiteAlertButtonDTO => item !== null);
  return output.length > 0 ? output : undefined;
}

export function sanitizeSiteAlertSettings(value: unknown): SiteAlertSettingsDTO | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const raw = value as Record<string, unknown>;

  const mode = normalizeAlertMode(raw.mode ?? raw.type ?? raw.noticeType);
  const enabled = typeof raw.enabled === "boolean" ? raw.enabled : mode !== "none";

  return {
    enabled,
    mode,
    noticeId: asText(raw.noticeId ?? raw.id),
    title: asLocalizedText(raw.title),
    message: asLocalizedText(raw.message),
    description: asLocalizedText(raw.description ?? raw.detail),
    bannerMessage: asLocalizedText(raw.bannerMessage),
    bannerDetail: asLocalizedText(raw.bannerDetail),
    dismissible: typeof raw.dismissible === "boolean" ? raw.dismissible : true,
    buttons: sanitizeAlertButtons(raw.buttons ?? raw.actions)
  };
}

export function isValidSiteAlertSettings(value: unknown): boolean {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const raw = value as Record<string, unknown>;
  if (typeof raw.mode !== "string") return false;
  if (
    raw.mode !== "none" &&
    raw.mode !== "lock_maintenance" &&
    raw.mode !== "lock_payment_overdue" &&
    raw.mode !== "banner_maintenance"
  ) {
    return false;
  }

  if (Object.prototype.hasOwnProperty.call(raw, "enabled") && typeof raw.enabled !== "boolean") return false;
  if (Object.prototype.hasOwnProperty.call(raw, "dismissible") && typeof raw.dismissible !== "boolean") return false;

  const localizedKeys = ["title", "message", "description", "bannerMessage", "bannerDetail"];
  for (const key of localizedKeys) {
    if (!Object.prototype.hasOwnProperty.call(raw, key)) continue;
    const candidate = raw[key];
    if (typeof candidate === "string") continue;
    if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) return false;
  }

  if (Object.prototype.hasOwnProperty.call(raw, "buttons")) {
    if (!Array.isArray(raw.buttons)) return false;
  }

  return true;
}

function normalizePaymentOptions(value: unknown): BookingPaymentOption[] {
  if (!Array.isArray(value)) return [...DEFAULT_PAYMENT_OPTIONS];

  const normalized = value
    .map((item) => String(item ?? "").trim())
    .filter((item): item is BookingPaymentOption => item === "deposit_50" || item === "full");

  if (normalized.length === 0) return [...DEFAULT_PAYMENT_OPTIONS];
  return Array.from(new Set(normalized));
}

function normalizeDefaultPaymentOption(
  value: unknown,
  paymentOptions: BookingPaymentOption[]
): BookingPaymentOption {
  const normalized = String(value ?? "").trim();
  if ((normalized === "deposit_50" || normalized === "full") && paymentOptions.includes(normalized)) {
    return normalized;
  }
  return paymentOptions[0] ?? "full";
}

function normalizeDepositPercent(value: unknown, paymentOptions: BookingPaymentOption[]): number | undefined {
  if (!paymentOptions.includes("deposit_50")) return undefined;

  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 50;

  const rounded = Math.floor(numeric);
  if (rounded <= 0 || rounded >= 100) return 50;
  return rounded;
}

export function sanitizeBookingSettings(value: unknown): SiteBookingSettingsDTO | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;

  const raw = value as Record<string, unknown>;
  const rawMode = String(raw.mode ?? "").trim();
  const mode = rawMode === "booking_enabled" ? "booking_enabled" : "contact_only";
  const paymentOptions = normalizePaymentOptions(raw.paymentOptions);
  const defaultPaymentOption = normalizeDefaultPaymentOption(raw.defaultPaymentOption, paymentOptions);
  const contactRoute = asText(raw.contactRoute);
  const allowBookingForm =
    typeof raw.allowBookingForm === "boolean"
      ? raw.allowBookingForm
      : mode === "booking_enabled";

  return {
    mode,
    allowBookingForm,
    contactRoute: contactRoute?.startsWith("/") ? contactRoute : DEFAULT_CONTACT_ROUTE,
    paymentOptions,
    defaultPaymentOption,
    depositPercent: normalizeDepositPercent(raw.depositPercent, paymentOptions)
  };
}

export function sanitizeSiteUiSettings(value: unknown): SiteUiSettingsDTO | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const raw = value as Record<string, unknown>;

  return {
    navbar: raw.navbar as SiteUiSettingsDTO["navbar"],
    booking: sanitizeBookingSettings(raw.booking),
    alerts: sanitizeSiteAlertSettings(raw.alerts ?? raw.alert)
  };
}
