"use client";

import { FormEvent, useMemo, useState } from "react";

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
  const [state, setState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState<string>("");
  const [errors, setErrors] = useState<string[]>([]);

  const submitLabel = useMemo(() => {
    if (state === "submitting") return "Submitting...";
    return "Send booking request";
  }, [state]);

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
      setMessage("Please fix the validation errors before submitting.");
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
        const errorMessage = "error" in data ? data.error : "Unable to submit booking request";
        throw new Error(errorMessage);
      }

      setState("success");
      setMessage(`Submitted successfully. Reference ID: ${data.referenceId}`);
      form.reset();
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Unexpected error");
    }
  }

  return (
    <form aria-describedby="lead-form-status" className="lead-form" noValidate onSubmit={onSubmit}>
      <div className="lead-grid">
        <label htmlFor="lead-customer-name">
          Customer name
          <input
            aria-invalid={hasFieldError(errors, "customerName")}
            autoComplete="name"
            id="lead-customer-name"
            name="customerName"
            placeholder="Your full name"
            required
            type="text"
          />
        </label>
        <label htmlFor="lead-phone">
          Phone
          <input
            aria-invalid={hasFieldError(errors, "phone")}
            autoComplete="tel"
            id="lead-phone"
            name="phone"
            placeholder="+66 8x-xxx-xxxx"
            required
            type="tel"
          />
        </label>
        <label htmlFor="lead-email">
          Email
          <input
            aria-invalid={hasFieldError(errors, "email")}
            autoComplete="email"
            id="lead-email"
            name="email"
            placeholder="you@example.com"
            type="email"
          />
        </label>
        <label htmlFor="lead-room-id">
          Room ID
          <input aria-invalid={hasFieldError(errors, "roomId")} id="lead-room-id" name="roomId" placeholder="Optional room ID" type="text" />
        </label>
        <label htmlFor="lead-checkin">
          Check-in
          <input aria-invalid={hasFieldError(errors, "checkIn")} id="lead-checkin" name="checkIn" type="date" />
        </label>
        <label htmlFor="lead-checkout">
          Check-out
          <input aria-invalid={hasFieldError(errors, "checkOut")} id="lead-checkout" name="checkOut" type="date" />
        </label>
      </div>
      <label htmlFor="lead-message">
        Message
        <textarea id="lead-message" name="message" placeholder="Tell us your preferred room and requests..." rows={4} />
      </label>
      <button className="btn btn-primary" disabled={state === "submitting"} type="submit">
        {submitLabel}
      </button>
      {message ? (
        <p className={state === "success" ? "lead-success" : "lead-error"} id="lead-form-status" role="status">
          {message}
        </p>
      ) : (
        <p className="visually-hidden" id="lead-form-status">
          Form status ready.
        </p>
      )}
      {errors.length > 0 ? (
        <ul aria-live="polite" className="lead-errors">
          {errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      ) : null}
    </form>
  );
}
