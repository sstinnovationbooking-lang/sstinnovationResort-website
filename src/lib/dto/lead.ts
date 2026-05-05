import type { LeadRequestDTO } from "@/lib/types/site";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[0-9+\-() ]{7,20}$/;

function normalizeText(value: unknown): string | undefined {
  const normalized = String(value ?? "").trim();
  return normalized || undefined;
}

function compareDateStrings(dateA: string, dateB: string): number {
  return dateA.localeCompare(dateB);
}

export function sanitizeLeadPayload(input: unknown): LeadRequestDTO {
  if (!input || typeof input !== "object") {
    return { customerName: "", phone: "" };
  }

  const body = input as Record<string, unknown>;
  const customerName = String(body.customerName ?? body.name ?? "").trim();
  const phone = normalizeText(body.phone) ?? "";

  return {
    customerName,
    phone,
    email: normalizeText(body.email),
    checkIn: normalizeText(body.checkIn),
    checkOut: normalizeText(body.checkOut),
    roomId: normalizeText(body.roomId),
    message: normalizeText(body.message)
  };
}

export function validateLeadPayload(payload: LeadRequestDTO): string[] {
  const errors: string[] = [];

  if (!payload.customerName?.trim()) {
    errors.push("customerName is required");
  }

  if (!payload.phone?.trim()) {
    errors.push("phone is required");
  }

  if (payload.email && !EMAIL_PATTERN.test(payload.email)) {
    errors.push("email format is invalid");
  }

  if (payload.phone && !PHONE_PATTERN.test(payload.phone)) {
    errors.push("phone format is invalid");
  }

  if (payload.checkIn && !DATE_PATTERN.test(payload.checkIn)) {
    errors.push("checkIn format must be YYYY-MM-DD");
  }

  if (payload.checkOut && !DATE_PATTERN.test(payload.checkOut)) {
    errors.push("checkOut format must be YYYY-MM-DD");
  }

  if (payload.checkIn && payload.checkOut && compareDateStrings(payload.checkIn, payload.checkOut) >= 0) {
    errors.push("checkOut must be after checkIn");
  }

  return errors;
}
