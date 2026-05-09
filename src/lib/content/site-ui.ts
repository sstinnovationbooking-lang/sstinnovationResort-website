import type { BookingPaymentOption, SiteBookingSettingsDTO, SiteUiSettingsDTO } from "@/lib/types/site";

const DEFAULT_CONTACT_ROUTE = "/contact";
const DEFAULT_PAYMENT_OPTIONS: BookingPaymentOption[] = ["full"];

function asText(value: unknown): string | undefined {
  const normalized = String(value ?? "").trim();
  return normalized || undefined;
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
    booking: sanitizeBookingSettings(raw.booking)
  };
}
