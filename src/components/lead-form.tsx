"use client";

import { FormEvent, useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import { sanitizeLeadPayload, validateLeadPayload } from "@/lib/dto/lead";
import type { ApiErrorDTO } from "@/lib/types/site";

type SubmitState = "idle" | "submitting" | "success" | "error";
type FieldName = "customerName" | "phone" | "email" | "checkIn" | "checkOut" | "roomId";

interface LeadFormProps {
  tenantSlug: string;
}

function hasFieldError(errors: string[], fieldName: FieldName): boolean {
  return errors.some((error) => error.toLowerCase().includes(fieldName.toLowerCase()));
}

export function LeadForm({ tenantSlug }: LeadFormProps) {
  const t = useTranslations("LeadForm");
  const [state, setState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState<string>("");
  const [errors, setErrors] = useState<string[]>([]);

  const submitLabel = useMemo(() => {
    if (state === "submitting") return t("submitLoading");
    return t("submitIdle");
  }, [state, t]);

  function toLocalizedError(error: string): string {
    const normalized = error.toLowerCase();

    if (normalized.includes("customername is required")) return t("errorCustomerNameRequired");
    if (normalized.includes("phone is required")) return t("errorPhoneRequired");
    if (normalized.includes("email format is invalid")) return t("errorEmailInvalid");
    if (normalized.includes("phone format is invalid")) return t("errorPhoneInvalid");
    if (normalized.includes("checkin format must be yyyy-mm-dd")) return t("errorCheckInInvalid");
    if (normalized.includes("checkout format must be yyyy-mm-dd")) return t("errorCheckOutInvalid");
    if (normalized.includes("checkout must be after checkin")) return t("errorDateOrder");
    if (normalized.includes("invalid payload")) return t("errorInvalidPayload");

    return t("unexpectedError");
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    setState("submitting");
    setMessage("");
    setErrors([]);

    const payload = sanitizeLeadPayload({
      customerName: formData.get("customerName"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      checkIn: formData.get("checkIn"),
      checkOut: formData.get("checkOut"),
      roomId: formData.get("roomId"),
      message: formData.get("message")
    });

    const localErrors = validateLeadPayload(payload);
    if (localErrors.length > 0) {
      setState("error");
      setErrors(localErrors);
      setMessage(t("validationSummary"));
      return;
    }

    try {
      const response = await fetch(`/api/site/leads?tenantSlug=${encodeURIComponent(tenantSlug)}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = (await response.json()) as
        | { ok?: boolean; referenceId?: string }
        | (ApiErrorDTO & { ok?: false });

      if (!response.ok || !("ok" in data) || !data.ok) {
        const responseErrors =
          "details" in data && Array.isArray(data.details) ? data.details.filter((item) => !!item) : [];
        setErrors(responseErrors);
        const errorMessage = "error" in data ? toLocalizedError(data.error) : t("submitFailed");
        throw new Error(errorMessage);
      }

      setState("success");
      setMessage(t("submitSuccess", { referenceId: String(data.referenceId ?? "-") }));
      form.reset();
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? toLocalizedError(error.message) : t("unexpectedError"));
    }
  }

  return (
    <form
      aria-describedby="lead-form-status"
      className="lead-form"
      data-submit-state={state}
      noValidate
      onSubmit={onSubmit}
    >
      <div className="lead-grid">
        <label htmlFor="lead-customer-name">
          {t("customerName")}
          <input
            aria-invalid={hasFieldError(errors, "customerName")}
            autoComplete="name"
            id="lead-customer-name"
            name="customerName"
            placeholder={t("placeholderName")}
            required
            type="text"
          />
        </label>
        <label htmlFor="lead-phone">
          {t("phone")}
          <input
            aria-invalid={hasFieldError(errors, "phone")}
            autoComplete="tel"
            id="lead-phone"
            name="phone"
            placeholder={t("placeholderPhone")}
            required
            type="tel"
          />
        </label>
        <label htmlFor="lead-email">
          {t("email")}
          <input
            aria-invalid={hasFieldError(errors, "email")}
            autoComplete="email"
            id="lead-email"
            name="email"
            placeholder={t("placeholderEmail")}
            type="email"
          />
        </label>
        <label htmlFor="lead-room-id">
          {t("roomId")}
          <input
            aria-invalid={hasFieldError(errors, "roomId")}
            id="lead-room-id"
            name="roomId"
            placeholder={t("placeholderRoomId")}
            type="text"
          />
        </label>
        <label htmlFor="lead-checkin">
          {t("checkIn")}
          <input aria-invalid={hasFieldError(errors, "checkIn")} id="lead-checkin" name="checkIn" type="date" />
        </label>
        <label htmlFor="lead-checkout">
          {t("checkOut")}
          <input aria-invalid={hasFieldError(errors, "checkOut")} id="lead-checkout" name="checkOut" type="date" />
        </label>
      </div>
      <label htmlFor="lead-message">
        {t("message")}
        <textarea id="lead-message" name="message" placeholder={t("placeholderMessage")} rows={4} />
      </label>
      <button className="btn btn-primary" disabled={state === "submitting"} type="submit">
        {submitLabel}
      </button>
      {message ? (
        <p
          aria-live={state === "error" ? "assertive" : "polite"}
          className={state === "success" ? "lead-notice lead-notice-success" : "lead-notice lead-notice-error"}
          id="lead-form-status"
          role={state === "error" ? "alert" : "status"}
        >
          {message}
        </p>
      ) : (
        <p className="visually-hidden" id="lead-form-status">
          {t("statusReady")}
        </p>
      )}
      {errors.length > 0 ? (
        <ul aria-live="polite" className="lead-errors">
          {errors.map((error) => (
            <li key={error}>{toLocalizedError(error)}</li>
          ))}
        </ul>
      ) : null}
    </form>
  );
}
