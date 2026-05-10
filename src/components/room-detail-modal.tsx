"use client";

import Image from "next/image";
import Link from "next/link";
import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLocale, useTranslations } from "next-intl";

import type { RoomCardViewModel } from "@/components/room-mobile-card";
import { LOCALE_TO_BCP47, type AppLocale, DEFAULT_LOCALE, normalizeLocale } from "@/i18n/config";
import type { RoomSearchCriteria, SiteBookingSettingsDTO } from "@/lib/types/site";

interface RoomDetailModalProps {
  isOpen: boolean;
  room: RoomCardViewModel | null;
  tenantSlug: string;
  bookingSettings?: SiteBookingSettingsDTO;
  searchCriteria?: RoomSearchCriteria;
  onClose: () => void;
}

type BookingPaymentOption = "deposit_50" | "full";
type RoomModalStep = "details" | "booking";
type BookingFeedbackState = "hidden" | "loading" | "success" | "error";
type BookingAvailabilityState = "idle" | "checking" | "available" | "soldout" | "error";

const FALLBACK_ROOM_IMAGE =
  "/placeholders/room-sample.svg";
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const THAI_PHONE_PATTERN = /^0\d{9}$/;
const TEMPLATE_BOOKING_MOCK_ENABLED = process.env.NEXT_PUBLIC_TEMPLATE_BOOKING_MOCK !== "false";

function formatPrice(amount: number, currency: string, locale: AppLocale): string {
  const safeCurrency = String(currency || "THB").toUpperCase();
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  try {
    return new Intl.NumberFormat(LOCALE_TO_BCP47[locale], {
      style: "currency",
      currency: safeCurrency,
      maximumFractionDigits: 0
    }).format(safeAmount);
  } catch {
    return `${safeAmount.toLocaleString(LOCALE_TO_BCP47[locale])} ${safeCurrency}`;
  }
}

function toDateAtUtc(dateText: string): Date | null {
  if (!ISO_DATE_PATTERN.test(dateText)) return null;
  const parsed = new Date(`${dateText}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

function addDays(isoDate: string, days: number): string | null {
  const base = toDateAtUtc(isoDate);
  if (!base) return null;
  const nextDate = new Date(base.getTime() + days * ONE_DAY_MS);
  return nextDate.toISOString().slice(0, 10);
}

function computeNights(checkIn: string, checkOut: string): number | null {
  const inDate = toDateAtUtc(checkIn);
  const outDate = toDateAtUtc(checkOut);
  if (!inDate || !outDate) return null;
  const diff = Math.round((outDate.getTime() - inDate.getTime()) / ONE_DAY_MS);
  if (!Number.isFinite(diff) || diff <= 0) return null;
  return diff;
}

function toPositiveInt(value: number | undefined, fallback: number): number {
  if (!Number.isFinite(value)) return fallback;
  if (!value || value <= 0) return fallback;
  return Math.max(1, Math.floor(value));
}

function getLocalTodayIso(): string {
  const now = new Date();
  const localMs = now.getTime() - now.getTimezoneOffset() * 60 * 1000;
  return new Date(localMs).toISOString().slice(0, 10);
}

function digitsOnly(value: string): string {
  return String(value ?? "").replace(/\D/g, "");
}

function normalizePaymentOptions(settings?: SiteBookingSettingsDTO): BookingPaymentOption[] {
  const raw = Array.isArray(settings?.paymentOptions) ? settings.paymentOptions : [];
  const options = raw.filter((option): option is BookingPaymentOption => option === "deposit_50" || option === "full");
  if (options.length > 0) return options;
  return ["full"];
}

function resolveDefaultPaymentOption(
  paymentOptions: BookingPaymentOption[],
  settings?: SiteBookingSettingsDTO
): BookingPaymentOption {
  if (settings?.defaultPaymentOption && paymentOptions.includes(settings.defaultPaymentOption)) {
    return settings.defaultPaymentOption;
  }
  return paymentOptions[0] ?? "full";
}

function resolveContactHref(
  tenantSlug: string,
  room: RoomCardViewModel,
  searchCriteria?: RoomSearchCriteria,
  settings?: SiteBookingSettingsDTO
): string {
  const params = new URLSearchParams();
  params.set("roomId", room.id);
  if (searchCriteria?.checkIn) params.set("checkIn", searchCriteria.checkIn);
  if (searchCriteria?.nights && searchCriteria.nights >= 1) params.set("nights", String(searchCriteria.nights));
  if (searchCriteria?.guests && searchCriteria.guests >= 1) params.set("guests", String(searchCriteria.guests));

  const fallbackContact = `/site/${tenantSlug}/contact?${params.toString()}`;
  const configuredRoute = String(settings?.contactRoute ?? "").trim();
  if (!configuredRoute) return room.roomSelectHref || fallbackContact;

  if (configuredRoute.startsWith("/site/")) {
    return `${configuredRoute}${configuredRoute.includes("?") ? "&" : "?"}${params.toString()}`;
  }
  if (configuredRoute.startsWith("/")) {
    return `/site/${tenantSlug}${configuredRoute}${configuredRoute.includes("?") ? "&" : "?"}${params.toString()}`;
  }
  return room.roomSelectHref || fallbackContact;
}

function toSafeErrorDetail(error: unknown): string | undefined {
  const text = error instanceof Error ? error.message : String(error ?? "").trim();
  if (!text) return undefined;
  const sensitivePattern = /(x-internal-secret|authorization|bearer|token|stack|trace|cookie|password)/i;
  if (sensitivePattern.test(text)) return undefined;
  return text.slice(0, 220);
}

export function RoomDetailModal({
  isOpen,
  room,
  tenantSlug,
  bookingSettings,
  searchCriteria,
  onClose
}: RoomDetailModalProps) {
  const t = useTranslations("ResortHome");
  const tLead = useTranslations("LeadForm");
  const localeCode = useLocale();
  const resolvedLocale = normalizeLocale(localeCode) ?? DEFAULT_LOCALE;

  const initialCheckIn = (() => {
    const value = String(searchCriteria?.checkIn ?? "").trim();
    return ISO_DATE_PATTERN.test(value) ? value : "";
  })();
  const initialNights = toPositiveInt(searchCriteria?.nights, 1);
  const initialCheckOut = initialCheckIn ? addDays(initialCheckIn, initialNights) ?? "" : "";
  const initialGuests = toPositiveInt(searchCriteria?.guests, 2);
  const paymentOptions = normalizePaymentOptions(bookingSettings);
  const defaultPaymentOption = resolveDefaultPaymentOption(paymentOptions, bookingSettings);
  const depositPercent = (() => {
    const percent = Number(bookingSettings?.depositPercent);
    if (!Number.isFinite(percent) || percent <= 0 || percent >= 100) return 50;
    return Math.floor(percent);
  })();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [modalStep, setModalStep] = useState<RoomModalStep>("details");
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [checkInDate, setCheckInDate] = useState(initialCheckIn);
  const [checkOutDate, setCheckOutDate] = useState(initialCheckOut);
  const [paymentOption, setPaymentOption] = useState<BookingPaymentOption>(defaultPaymentOption);
  const [feedbackState, setFeedbackState] = useState<BookingFeedbackState>("hidden");
  const [feedbackMessage, setFeedbackMessage] = useState<string | undefined>(undefined);
  const [bookingReferenceId, setBookingReferenceId] = useState<string | undefined>(undefined);
  const [availabilityState, setAvailabilityState] = useState<BookingAvailabilityState>("idle");
  const [availabilityErrorText, setAvailabilityErrorText] = useState<string | undefined>(undefined);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const scrollRestoreRef = useRef(0);
  const availabilityAbortRef = useRef<AbortController | null>(null);
  const hasSearchSummary = Boolean(String(searchCriteria?.checkIn ?? "").trim());
  const bookingMode = bookingSettings?.mode ?? "contact_only";
  const isBookingEnabled = bookingMode === "booking_enabled" || bookingSettings?.allowBookingForm === true;
  const todayIso = getLocalTodayIso();

  const galleryImages = useMemo(() => {
    const items = [room?.imageUrl, ...(room?.gallery ?? [])]
      .map((item) => String(item ?? "").trim())
      .filter(Boolean);
    return Array.from(new Set(items));
  }, [room?.gallery, room?.imageUrl]);

  useEffect(() => {
    if (!isOpen) return;
    const body = document.body;
    scrollRestoreRef.current = window.scrollY || 0;
    const previousOverflow = body.style.overflow;
    const previousPosition = body.style.position;
    const previousTop = body.style.top;
    const previousLeft = body.style.left;
    const previousRight = body.style.right;
    const previousWidth = body.style.width;

    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollRestoreRef.current}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";

    return () => {
      body.style.overflow = previousOverflow;
      body.style.position = previousPosition;
      body.style.top = previousTop;
      body.style.left = previousLeft;
      body.style.right = previousRight;
      body.style.width = previousWidth;
      window.scrollTo(0, scrollRestoreRef.current);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setActiveImageIndex(0);
        setModalStep("details");
        setFeedbackState("hidden");
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !room || typeof document === "undefined") {
    return null;
  }
  const activeRoom = room;
  const roomFailurePrefix = activeRoom.id;

  const handleClose = () => {
    availabilityAbortRef.current?.abort();
    setActiveImageIndex(0);
    setModalStep("details");
    setFeedbackState("hidden");
    setFeedbackMessage(undefined);
    setBookingReferenceId(undefined);
    setAvailabilityState("idle");
    setAvailabilityErrorText(undefined);
    onClose();
  };

  const closeFeedback = () => {
    if (feedbackState === "loading") return;
    setFeedbackState("hidden");
    setFeedbackMessage(undefined);
  };

  const currentImageRaw = galleryImages[activeImageIndex] || activeRoom.imageUrl || FALLBACK_ROOM_IMAGE;
  const currentImageFailureKey = `${roomFailurePrefix}::${currentImageRaw}`;
  const currentImage = failedImages[currentImageFailureKey] ? FALLBACK_ROOM_IMAGE : currentImageRaw;
  const statusLabel = activeRoom.statusLabel || (activeRoom.isAvailable ? t("roomStatusAvailable") : t("roomStatusUnavailable"));
  const availableRoomsLabel =
    typeof activeRoom.availableRooms === "number" ? String(Math.max(0, activeRoom.availableRooms)) : t("roomNotSpecified");
  const maxGuestsLabel =
    typeof activeRoom.maxGuests === "number" && Number.isFinite(activeRoom.maxGuests)
      ? String(activeRoom.maxGuests)
      : t("roomNotSpecified");
  const amenities = activeRoom.amenities?.length ? activeRoom.amenities : activeRoom.features?.length ? activeRoom.features : [];
  const canSendBookingRequest = activeRoom.isAvailable && (activeRoom.availableRooms ?? 1) > 0;
  const modalTitleId = `room-detail-title-${activeRoom.id}`;

  const computedNights = computeNights(checkInDate, checkOutDate);
  const totalAmount = computedNights ? activeRoom.pricePerNight * computedNights : 0;
  const payableAmount = paymentOption === "deposit_50" ? totalAmount * (depositPercent / 100) : totalAmount;
  const contactHref = resolveContactHref(tenantSlug, activeRoom, searchCriteria, bookingSettings);
  const lockedGuests =
    typeof activeRoom.maxGuests === "number" && Number.isFinite(activeRoom.maxGuests) && activeRoom.maxGuests > 0
      ? Math.floor(activeRoom.maxGuests)
      : initialGuests;
  const guests = lockedGuests;
  const phoneDigits = digitsOnly(phone);
  const isPhoneValid = THAI_PHONE_PATTERN.test(phoneDigits);
  const isCheckInValid = ISO_DATE_PATTERN.test(checkInDate);
  const isCheckOutValid = ISO_DATE_PATTERN.test(checkOutDate);
  const isCheckInPast = isCheckInValid && checkInDate < todayIso;
  const isCheckOutPast = isCheckOutValid && checkOutDate < todayIso;
  const hasDateOrderError = isCheckInValid && isCheckOutValid && !computedNights;
  const minCheckOut = isCheckInValid ? addDays(checkInDate, 1) ?? todayIso : todayIso;
  const dateErrorText = isCheckInPast || isCheckOutPast ? t("roomBookingDatePastError") : hasDateOrderError ? tLead("errorDateOrder") : "";
  const isAvailabilitySoldOut = availabilityState === "soldout";
  const isPaymentOptionValid = paymentOptions.includes(paymentOption);
  const isBookingFormComplete =
    Boolean(customerName.trim()) &&
    isPhoneValid &&
    isCheckInValid &&
    isCheckOutValid &&
    !isCheckInPast &&
    !isCheckOutPast &&
    Boolean(computedNights) &&
    isPaymentOptionValid;
  const shouldBlockWhileCheckingAvailability = !TEMPLATE_BOOKING_MOCK_ENABLED;
  const isBookingBlockedByValidation =
    !isBookingFormComplete ||
    isAvailabilitySoldOut ||
    (availabilityState === "checking" && shouldBlockWhileCheckingAvailability);

  async function checkAvailabilityForSelection(nextCheckIn: string = checkInDate, nextCheckOut: string = checkOutDate) {
    const nights = computeNights(nextCheckIn, nextCheckOut);
    const isInValid = ISO_DATE_PATTERN.test(nextCheckIn) && nextCheckIn >= todayIso;
    const isOutValid = ISO_DATE_PATTERN.test(nextCheckOut) && nextCheckOut >= todayIso;
    if (!isInValid || !isOutValid || !nights) {
      setAvailabilityState("idle");
      setAvailabilityErrorText(undefined);
      return "idle" as const;
    }

    if (TEMPLATE_BOOKING_MOCK_ENABLED) {
      const availableRooms = typeof activeRoom.availableRooms === "number" ? Math.max(0, activeRoom.availableRooms) : 1;
      const soldOut = availableRooms <= 0 || !activeRoom.isAvailable;
      const nextState = soldOut ? "soldout" : "available";
      setAvailabilityState(nextState);
      setAvailabilityErrorText(undefined);
      return nextState;
    }

    availabilityAbortRef.current?.abort();
    const controller = new AbortController();
    availabilityAbortRef.current = controller;
    setAvailabilityState("checking");
    setAvailabilityErrorText(undefined);

    try {
      const response = await fetch(
        `/api/site/${encodeURIComponent(tenantSlug)}/rooms?checkIn=${encodeURIComponent(nextCheckIn)}&nights=${nights}`,
        {
          method: "GET",
          cache: "no-store",
          signal: controller.signal
        }
      );
      if (!response.ok) {
        throw new Error(`status_${response.status}`);
      }

      const payload: unknown = await response.json().catch(() => []);
      const rows = Array.isArray(payload) ? payload : [];
      const matched = rows.find((item) => {
        if (!item || typeof item !== "object") return false;
        const roomId = "id" in item ? String((item as { id?: unknown }).id ?? "") : "";
        return roomId === activeRoom.id;
      }) as { isAvailable?: unknown; availableRooms?: unknown } | undefined;

      const availableRoomsRaw = Number(matched?.availableRooms);
      const availableRooms = Number.isFinite(availableRoomsRaw) ? Math.max(0, Math.floor(availableRoomsRaw)) : null;
      const isAvailableFlag = Boolean(matched?.isAvailable);
      const soldOut = availableRooms === 0 || (!isAvailableFlag && availableRooms !== null);
      const nextState = soldOut ? "soldout" : "available";
      setAvailabilityState(nextState);
      setAvailabilityErrorText(undefined);
      return nextState;
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return "idle" as const;
      }
      setAvailabilityState("error");
      setAvailabilityErrorText(t("roomBookingAvailabilityCheckFailed"));
      return "error" as const;
    }
  }

  const handleCheckInChange = (nextValue: string) => {
    setCheckInDate(nextValue);
    setAvailabilityState("idle");
    setAvailabilityErrorText(undefined);
    if (!ISO_DATE_PATTERN.test(nextValue)) return;
    if (ISO_DATE_PATTERN.test(checkOutDate) && checkOutDate <= nextValue) {
      setCheckOutDate(addDays(nextValue, 1) ?? "");
    }
  };

  const handleCheckOutChange = (nextValue: string) => {
    setCheckOutDate(nextValue);
    setAvailabilityState("idle");
    setAvailabilityErrorText(undefined);
  };

  async function submitBookingRequest() {
    if (!customerName.trim()) {
      setFeedbackState("error");
      setFeedbackMessage(tLead("errorCustomerNameRequired"));
      return;
    }
    if (!phoneDigits) {
      setFeedbackState("error");
      setFeedbackMessage(tLead("errorPhoneRequired"));
      return;
    }
    if (!isPhoneValid) {
      setFeedbackState("error");
      setFeedbackMessage(tLead("errorPhoneInvalid"));
      return;
    }
    if (!ISO_DATE_PATTERN.test(checkInDate)) {
      setFeedbackState("error");
      setFeedbackMessage(tLead("errorCheckInInvalid"));
      return;
    }
    if (!ISO_DATE_PATTERN.test(checkOutDate)) {
      setFeedbackState("error");
      setFeedbackMessage(tLead("errorCheckOutInvalid"));
      return;
    }
    if (!computedNights || computedNights <= 0) {
      setFeedbackState("error");
      setFeedbackMessage(tLead("errorDateOrder"));
      return;
    }
    if (isCheckInPast || isCheckOutPast) {
      setFeedbackState("error");
      setFeedbackMessage(t("roomBookingDatePastError"));
      return;
    }
    if (!Number.isFinite(guests) || guests < 1) {
      setFeedbackState("error");
      setFeedbackMessage(t("roomsSearchValidationGuestsMin"));
      return;
    }
    if (!isPaymentOptionValid) {
      setFeedbackState("error");
      setFeedbackMessage(t("roomBookingPaymentOption"));
      return;
    }
    const latestAvailability = await checkAvailabilityForSelection();
    if (latestAvailability === "soldout") {
      setFeedbackState("error");
      setFeedbackMessage(t("roomBookingAvailabilitySoldOut"));
      return;
    }
    if (latestAvailability === "error") {
      setFeedbackState("error");
      setFeedbackMessage(availabilityErrorText || t("roomBookingAvailabilityCheckFailed"));
      return;
    }

    const paymentLabel = paymentOption === "deposit_50" ? t("roomBookingDepositOptionLabel") : t("roomBookingFullOptionLabel");
    const bookingMeta = [
      `tenantSlug=${tenantSlug}`,
      `ownerId=${activeRoom.ownerId ?? "na"}`,
      `resortId=${activeRoom.resortId ?? "na"}`,
      `roomId=${activeRoom.id}`,
      `roomName=${activeRoom.title || activeRoom.name}`,
      `checkIn=${checkInDate}`,
      `checkOut=${checkOutDate}`,
      `nights=${computedNights}`,
      `guests=${guests}`,
      `paymentOption=${paymentOption}`,
      `paymentLabel=${paymentLabel}`,
      `totalAmount=${Math.round(totalAmount)}`,
      `payableAmount=${Math.round(payableAmount)}`,
      `currency=${activeRoom.currency}`
    ].join(" | ");

    setFeedbackState("loading");
    setFeedbackMessage(undefined);
    setBookingReferenceId(undefined);

    try {
      const response = await fetch(`/api/site/${encodeURIComponent(tenantSlug)}/leads`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          customerName: customerName.trim(),
          phone: phoneDigits,
          checkIn: checkInDate,
          checkOut: checkOutDate,
          roomId: activeRoom.id,
          message: `[booking_meta] ${bookingMeta}`
        })
      });
      const payload: unknown = await response.json().catch(() => ({}));
      if (!response.ok) {
        const errorMessageRaw =
          payload && typeof payload === "object" && "error" in payload
            ? String((payload as { error?: unknown }).error ?? "")
            : "";
        throw new Error(errorMessageRaw || tLead("submitFailed"));
      }

      const referenceId =
        payload && typeof payload === "object" && "referenceId" in payload
          ? String((payload as { referenceId?: unknown }).referenceId ?? "-")
          : undefined;

      setBookingReferenceId(referenceId);
      setFeedbackState("success");
      setFeedbackMessage(t("roomBookingSuccessDescription"));
    } catch (error) {
      setFeedbackState("error");
      setFeedbackMessage(toSafeErrorDetail(error) ?? t("roomBookingErrorDescription"));
    }
  }

  async function onSubmitBookingRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (feedbackState === "loading") return;
    await submitBookingRequest();
  }

  return createPortal(
    <div className="room-detail-modal-overlay" onClick={handleClose}>
      <section
        aria-labelledby={modalTitleId}
        aria-modal="true"
        className={`room-detail-modal ${modalStep === "booking" ? "room-detail-modal--booking" : ""}`}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <header className="room-detail-modal-header">
          <h3 id={modalTitleId}>
            {modalStep === "booking" ? t("roomBookingFormTitle") : activeRoom.title || activeRoom.name}
          </h3>
          <button
            aria-label={t("roomClose")}
            className="room-detail-close-btn"
            onClick={handleClose}
            type="button"
          >
            <span aria-hidden="true">×</span>
          </button>
        </header>

        {modalStep === "details" ? (
          <>
            <div className="room-detail-modal-body">
              <div className="room-detail-modal-media">
                <div className="room-detail-main-image-wrap">
                  <Image
                    alt={activeRoom.title || activeRoom.name}
                    className="room-detail-main-image"
                    fill
                    onError={() => setFailedImages((prev) => ({ ...prev, [currentImageFailureKey]: true }))}
                    sizes="(max-width: 767px) 100vw, 48vw"
                    src={currentImage}
                    unoptimized
                  />
                </div>
                {galleryImages.length > 1 ? (
                  <div className="room-detail-gallery" aria-label={t("roomImagesLabel")}>
                    {galleryImages.map((imageUrl, index) => {
                      const thumbFailureKey = `${roomFailurePrefix}::${imageUrl}`;
                      const thumbSrc = failedImages[thumbFailureKey] ? FALLBACK_ROOM_IMAGE : imageUrl;
                      return (
                        <button
                          aria-label={`${t("roomImagesLabel")} ${index + 1}`}
                          className={`room-detail-gallery-thumb ${index === activeImageIndex ? "active" : ""}`}
                          key={`${activeRoom.id}-img-${imageUrl}-${index}`}
                          onClick={() => setActiveImageIndex(index)}
                          type="button"
                        >
                          <Image
                            alt={`${activeRoom.title || activeRoom.name} ${index + 1}`}
                            fill
                            onError={() => setFailedImages((prev) => ({ ...prev, [thumbFailureKey]: true }))}
                            sizes="96px"
                            src={thumbSrc}
                            unoptimized
                          />
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>

              <div className="room-detail-modal-content">
                <p className="room-detail-description">{activeRoom.description || t("roomNotSpecified")}</p>

                <dl className="room-detail-meta">
                  <div>
                    <dt>{t("roomTypeLabel")}</dt>
                    <dd>{activeRoom.roomType || activeRoom.category || t("roomNotSpecified")}</dd>
                  </div>
                  <div>
                    <dt>{t("roomMaxGuestsLabel")}</dt>
                    <dd>{maxGuestsLabel}</dd>
                  </div>
                  <div>
                    <dt>{t("roomPricePerNight")}</dt>
                    <dd>{formatPrice(activeRoom.pricePerNight, activeRoom.currency, resolvedLocale)}</dd>
                  </div>
                  <div>
                    <dt>{t("roomStatusLabel")}</dt>
                    <dd>{statusLabel}</dd>
                  </div>
                  <div>
                    <dt>{t("roomAvailableRoomsLabel")}</dt>
                    <dd>{availableRoomsLabel}</dd>
                  </div>
                </dl>

                <div className="room-detail-extra">
                  <p><strong>{t("roomCancellationPolicy")}:</strong> {activeRoom.cancellationPolicy || t("roomNotSpecified")}</p>
                  <p><strong>{t("roomTaxesAndFeesLabel")}:</strong> {activeRoom.taxFeeNote || t("roomNotSpecified")}</p>
                </div>

                <div className="room-detail-amenities">
                  <h4>{t("roomAmenitiesLabel")}</h4>
                  {amenities.length > 0 ? (
                    <ul>
                      {amenities.map((amenity, index) => (
                        <li key={`${activeRoom.id}-amenity-${index}-${amenity}`}>{amenity}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>{t("roomNotSpecified")}</p>
                  )}
                </div>

                {hasSearchSummary ? (
                  <div className="room-detail-stay-summary">
                    <h4>{t("roomSelectedStayDetails")}</h4>
                    <p>{t("roomStayCheckIn")}: {searchCriteria?.checkIn || "-"}</p>
                    <p>{t("roomStayNights")}: {searchCriteria?.nights ?? "-"}</p>
                    <p>{t("roomStayGuests")}: {searchCriteria?.guests ?? "-"}</p>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="room-detail-actions">
              {canSendBookingRequest ? (
                isBookingEnabled ? (
                  <button
                    className="btn btn-dark room-detail-booking-btn"
                    onClick={() => {
                      setFeedbackState("hidden");
                      setFeedbackMessage(undefined);
                      setBookingReferenceId(undefined);
                      setAvailabilityState("idle");
                      setAvailabilityErrorText(undefined);
                      setModalStep("booking");
                    }}
                    type="button"
                  >
                    {t("roomBookNowAction")}
                  </button>
                ) : (
                  <Link className="btn btn-dark room-detail-booking-btn" href={contactHref}>
                    {t("roomBookingContactAction")}
                  </Link>
                )
              ) : (
                <button className="btn btn-disabled room-detail-booking-btn" disabled type="button">
                  {t("roomStatusSoldOut")}
                </button>
              )}
              <button className="btn btn-ghost room-detail-close-action" onClick={handleClose} type="button">
                {t("roomClose")}
              </button>
            </div>
          </>
        ) : (
          <div className="room-detail-booking-shell">
            <form className="room-detail-booking-form room-detail-booking-form--standalone" onSubmit={onSubmitBookingRequest}>
              <h4>{t("roomBookingFormTitle")}</h4>
              <div className="room-detail-booking-grid">
                <label>
                  {tLead("customerName")}
                  <input
                    name="customerName"
                    onChange={(event) => setCustomerName(event.target.value)}
                    placeholder={tLead("placeholderName")}
                    required
                    type="text"
                    value={customerName}
                  />
                </label>
                <label>
                  {tLead("phone")}
                  <input
                    inputMode="numeric"
                    maxLength={10}
                    name="phone"
                    onChange={(event) => setPhone(digitsOnly(event.target.value).slice(0, 10))}
                    placeholder={tLead("placeholderPhone")}
                    pattern="0[0-9]{9}"
                    required
                    type="tel"
                    value={phone}
                  />
                  {!isPhoneValid && phoneDigits.length > 0 ? (
                    <small className="room-detail-booking-field-error">{tLead("errorPhoneInvalid")}</small>
                  ) : null}
                </label>
                <label>
                  {tLead("checkIn")}
                  <input
                    min={todayIso}
                    name="checkIn"
                    onBlur={() => {
                      void checkAvailabilityForSelection();
                    }}
                    onChange={(event) => handleCheckInChange(event.target.value)}
                    required
                    type="date"
                    value={checkInDate}
                  />
                </label>
                <label>
                  {tLead("checkOut")}
                  <input
                    min={minCheckOut}
                    name="checkOut"
                    onBlur={() => {
                      void checkAvailabilityForSelection();
                    }}
                    onChange={(event) => handleCheckOutChange(event.target.value)}
                    required
                    type="date"
                    value={checkOutDate}
                  />
                </label>
                <label>
                  {t("roomsSearchGuestsLabel")}
                  <input
                    min={1}
                    name="guests"
                    disabled
                    readOnly
                    required
                    type="number"
                    value={guests}
                  />
                  <small className="room-detail-booking-field-note">
                    {t("roomMaxGuestsLabel")}: {maxGuestsLabel}
                  </small>
                </label>
                <label>
                  {t("roomBookingPaymentOption")}
                  <select
                    name="paymentOption"
                    onChange={(event) => setPaymentOption(event.target.value as BookingPaymentOption)}
                    value={paymentOption}
                  >
                    {paymentOptions.map((option) => (
                      <option key={option} value={option}>
                        {option === "deposit_50" ? t("roomBookingDepositOptionLabel") : t("roomBookingFullOptionLabel")}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {dateErrorText ? <p className="room-detail-booking-notice is-error">{dateErrorText}</p> : null}
              {availabilityState === "checking" ? (
                <p className="room-detail-booking-notice is-neutral">{t("roomBookingAvailabilityChecking")}</p>
              ) : null}
              {availabilityState === "soldout" ? (
                <p className="room-detail-booking-notice is-error">{t("roomBookingAvailabilitySoldOut")}</p>
              ) : null}
              {availabilityState === "error" ? (
                <p className="room-detail-booking-notice is-error">{availabilityErrorText || t("roomBookingAvailabilityCheckFailed")}</p>
              ) : null}

              <div className="room-detail-booking-summary">
                <h5>{t("roomBookingSummaryTitle")}</h5>
                <p className="room-detail-booking-summary-row">
                  <span>{t("roomStayNights")}</span>
                  <strong>{computedNights ?? "-"}</strong>
                </p>
                <p className="room-detail-booking-summary-row">
                  <span>{t("roomBookingTotalAmount")}</span>
                  <strong>{formatPrice(totalAmount, activeRoom.currency, resolvedLocale)}</strong>
                </p>
                <p className="room-detail-booking-summary-row is-payable">
                  <span>{t("roomBookingPayableAmount")}</span>
                  <strong>{formatPrice(payableAmount, activeRoom.currency, resolvedLocale)}</strong>
                </p>
              </div>

              <div className="room-detail-booking-actions">
                <button
                  className="btn btn-dark room-detail-booking-submit"
                  disabled={feedbackState === "loading" || isBookingBlockedByValidation}
                  type="submit"
                >
                  {feedbackState === "loading"
                    ? t("roomBookingSubmitting")
                    : isAvailabilitySoldOut
                      ? t("roomStatusSoldOut")
                      : t("roomBookNowAction")}
                </button>
                <button
                  className="btn btn-ghost room-detail-booking-back"
                  onClick={() => {
                    availabilityAbortRef.current?.abort();
                    setFeedbackState("hidden");
                    setFeedbackMessage(undefined);
                    setBookingReferenceId(undefined);
                    setAvailabilityState("idle");
                    setAvailabilityErrorText(undefined);
                    setModalStep("details");
                  }}
                  type="button"
                >
                  {t("roomBookingBackToDetails")}
                </button>
              </div>
            </form>
          </div>
        )}

        {feedbackState !== "hidden" ? (
          <div className="room-booking-feedback-overlay" onClick={closeFeedback}>
            <section
              aria-modal="true"
              className="room-booking-feedback-modal"
              onClick={(event) => event.stopPropagation()}
              role={feedbackState === "error" ? "alertdialog" : "dialog"}
            >
              {feedbackState === "loading" ? (
                <>
                  <div className="room-booking-feedback-spinner" />
                  <h4>{t("roomBookingSendingTitle")}</h4>
                  <p>{t("roomBookingSendingDescription")}</p>
                </>
              ) : null}

              {feedbackState === "success" ? (
                <>
                  <h4>{t("roomBookingSuccessTitle")}</h4>
                  <p>{feedbackMessage || t("roomBookingSuccessDescription")}</p>
                  {bookingReferenceId ? (
                    <p className="room-booking-feedback-reference">
                      {t("roomBookingReferenceLabel")}: {bookingReferenceId}
                    </p>
                  ) : null}
                  <button className="btn btn-dark" onClick={closeFeedback} type="button">
                    {t("roomBookingClosePopup")}
                  </button>
                </>
              ) : null}

              {feedbackState === "error" ? (
                <>
                  <h4>{t("roomBookingErrorTitle")}</h4>
                  <p>{feedbackMessage || t("roomBookingErrorDescription")}</p>
                  <div className="room-booking-feedback-actions">
                    <button
                      className="btn btn-dark"
                      onClick={() => {
                        void submitBookingRequest();
                      }}
                      type="button"
                    >
                      {t("roomBookingRetry")}
                    </button>
                    <button className="btn btn-ghost" onClick={closeFeedback} type="button">
                      {t("roomBookingClosePopup")}
                    </button>
                  </div>
                </>
              ) : null}
            </section>
          </div>
        ) : null}
      </section>
    </div>,
    document.body
  );
}

