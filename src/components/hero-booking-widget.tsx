"use client";

import Image from "next/image";
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useSearchParams } from "next/navigation";

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MIN_NIGHTS = 1;
const MAX_NIGHTS = 30;
const MIN_GUESTS = 1;
const MAX_GUESTS = 20;
const SEARCH_TIMEOUT_MS = 20000;

type RoomAvailabilityStatus = "available" | "unavailable" | "full";
type RoomSearchModalStatus = "loading" | "success" | "empty" | "error";

type RoomSearchRateItem = {
  id: string;
  roomId?: string;
  name: string;
  imageUrl?: string;
  detailsUrl?: string;
  status: RoomAvailabilityStatus;
  rateName?: string;
  pricePerNight?: number;
  currency?: string;
  taxesIncludedText?: string;
  description?: string;
};

type RoomSearchResult = {
  checkIn: string;
  nights: number;
  guests: number;
  currency?: string;
  availableRooms: RoomSearchRateItem[];
  unavailableRooms: RoomSearchRateItem[];
  totalAvailable: number;
};

type RoomSearchModalState = {
  isOpen: boolean;
  status: RoomSearchModalStatus;
  data?: RoomSearchResult;
  errorMessage?: string;
};

function resolveTenantSlug(pathname: string): string | null {
  const match = pathname.match(/^\/site\/([^/?#]+)/i);
  return String(match?.[1] ?? "").trim().toLowerCase() || null;
}

function parseNights(raw: string): number | null {
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed)) return null;
  if (parsed < MIN_NIGHTS || parsed > MAX_NIGHTS) return null;
  return parsed;
}

function parseGuests(raw: string): number | null {
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed)) return null;
  if (parsed < MIN_GUESTS || parsed > MAX_GUESTS) return null;
  return parsed;
}

function asNonEmptyText(value: unknown): string | undefined {
  const text = String(value ?? "").trim();
  return text || undefined;
}

function asNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

function normalizeStatus(value: unknown, fallback: RoomAvailabilityStatus): RoomAvailabilityStatus {
  const raw = String(value ?? "").trim().toLowerCase();
  if (raw === "available") return "available";
  if (raw === "unavailable" || raw === "not_available") return "unavailable";
  if (raw === "full") return "full";
  return fallback;
}

function normalizeRoomItem(raw: unknown, index: number, fallbackStatus: RoomAvailabilityStatus): RoomSearchRateItem | null {
  if (!raw || typeof raw !== "object") return null;
  const item = raw as Record<string, unknown>;
  const id = asNonEmptyText(item.id) ?? asNonEmptyText(item.roomId) ?? `room-${index + 1}`;
  const name = asNonEmptyText(item.name);
  if (!name) return null;

  return {
    id,
    roomId: asNonEmptyText(item.roomId),
    name,
    imageUrl: asNonEmptyText(item.imageUrl),
    detailsUrl: asNonEmptyText(item.detailsUrl),
    status: normalizeStatus(item.status, fallbackStatus),
    rateName: asNonEmptyText(item.rateName) ?? asNonEmptyText(item.badge),
    pricePerNight: asNumber(item.pricePerNight) ?? asNumber(item.nightlyPriceTHB),
    currency: asNonEmptyText(item.currency),
    taxesIncludedText: asNonEmptyText(item.taxesIncludedText),
    description: asNonEmptyText(item.description)
  };
}

function normalizeRoomSearchResponse(payload: unknown, checkIn: string, nights: number, guests: number): RoomSearchResult {
  if (Array.isArray(payload)) {
    const availableRooms = payload
      .map((item, index) => normalizeRoomItem(item, index, "available"))
      .filter((item): item is RoomSearchRateItem => item !== null);
    return {
      checkIn,
      nights,
      guests,
      currency: "THB",
      availableRooms,
      unavailableRooms: [],
      totalAvailable: availableRooms.length
    };
  }

  if (!payload || typeof payload !== "object") {
    return {
      checkIn,
      nights,
      guests,
      currency: "THB",
      availableRooms: [],
      unavailableRooms: [],
      totalAvailable: 0
    };
  }

  const data = payload as Record<string, unknown>;
  const availableRaw = Array.isArray(data.availableRooms) ? data.availableRooms : [];
  const unavailableRaw = Array.isArray(data.unavailableRooms) ? data.unavailableRooms : [];
  const availableRooms = availableRaw
    .map((item, index) => normalizeRoomItem(item, index, "available"))
    .filter((item): item is RoomSearchRateItem => item !== null);
  const unavailableRooms = unavailableRaw
    .map((item, index) => normalizeRoomItem(item, index, "unavailable"))
    .filter((item): item is RoomSearchRateItem => item !== null);

  return {
    checkIn,
    nights,
    guests,
    currency: asNonEmptyText(data.currency) ?? availableRooms[0]?.currency ?? unavailableRooms[0]?.currency ?? "THB",
    availableRooms,
    unavailableRooms,
    totalAvailable: asNumber(data.totalAvailable) ?? availableRooms.length
  };
}

function sanitizeErrorMessage(raw: unknown): string | undefined {
  const text = String(raw ?? "").replace(/\s+/g, " ").trim();
  if (!text) return undefined;

  const sensitivePattern = /(x-internal-secret|authorization|bearer|token|stack|trace|cookie|password)/i;
  if (sensitivePattern.test(text)) return undefined;

  const noisyPattern = /(abort|aborted|timed out|timeout|network|fetch failed|failed to fetch|unexpected end)/i;
  if (noisyPattern.test(text)) return undefined;

  return text.slice(0, 180);
}

function isAbortLikeError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const name = String((error as { name?: unknown }).name ?? "").toLowerCase();
  if (name === "aborterror") return true;
  const message = String((error as { message?: unknown }).message ?? "").toLowerCase();
  return message.includes("aborted") || message.includes("abort");
}

function formatPrice(amount: number | undefined, currency: string | undefined, locale: string): string | null {
  if (typeof amount !== "number" || !Number.isFinite(amount)) return null;
  const resolvedCurrency = (currency || "THB").toUpperCase();
  try {
    return new Intl.NumberFormat(locale || "th-TH", {
      style: "currency",
      currency: resolvedCurrency,
      maximumFractionDigits: 0
    }).format(amount);
  } catch {
    return `${amount.toLocaleString(locale || "th-TH")} ${resolvedCurrency}`;
  }
}

export function HeroBookingWidget() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const modalT = useTranslations("RoomSearchModal");
  const bookingT = useTranslations("HeroBooking");
  const searchButtonRef = useRef<HTMLButtonElement | null>(null);
  const tenantSlug = useMemo(() => resolveTenantSlug(pathname), [pathname]);
  const todayIso = new Date().toISOString().slice(0, 10);
  const [checkIn, setCheckIn] = useState(() => searchParams.get("checkIn") ?? "");
  const [nights, setNights] = useState(() => searchParams.get("nights") ?? "1");
  const [guests, setGuests] = useState(() => searchParams.get("guests") ?? "1");
  const [validationMessage, setValidationMessage] = useState<string>("");
  const [modalState, setModalState] = useState<RoomSearchModalState>({
    isOpen: false,
    status: "loading"
  });

  const isLoading = modalState.isOpen && modalState.status === "loading";
  const roomsPageHref = tenantSlug
    ? `/site/${tenantSlug}/rooms?checkIn=${encodeURIComponent(checkIn)}&nights=${encodeURIComponent(nights)}&guests=${encodeURIComponent(guests)}`
    : `/rooms?checkIn=${encodeURIComponent(checkIn)}&nights=${encodeURIComponent(nights)}&guests=${encodeURIComponent(guests)}`;

  const closeModal = useCallback(() => {
    if (isLoading) return;
    setModalState((prev) => ({ ...prev, isOpen: false }));
    setTimeout(() => searchButtonRef.current?.focus(), 0);
  }, [isLoading]);

  useEffect(() => {
    if (!modalState.isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isLoading) {
        closeModal();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [closeModal, isLoading, modalState.isOpen]);

  function validateCriteria(): { checkIn: string; nights: number; guests: number } | { message: string } {
    const normalizedCheckIn = checkIn.trim();
    if (!normalizedCheckIn) {
      return { message: modalT("validationCheckInRequired") };
    }
    if (!ISO_DATE_PATTERN.test(normalizedCheckIn)) {
      return { message: modalT("validationCheckInFormat") };
    }

    const parsedNights = parseNights(nights.trim());
    if (!parsedNights) {
      return { message: modalT("validationNightsRange", { min: MIN_NIGHTS, max: MAX_NIGHTS }) };
    }

    const parsedGuests = parseGuests(guests.trim());
    if (!parsedGuests) {
      return { message: modalT("validationGuestsMin", { min: MIN_GUESTS }) };
    }

    return {
      checkIn: normalizedCheckIn,
      nights: parsedNights,
      guests: parsedGuests
    };
  }

  async function runRoomSearch(nextCheckIn: string, nextNights: number, nextGuests: number) {
    setModalState({
      isOpen: true,
      status: "loading"
    });

    const params = new URLSearchParams({
      checkIn: nextCheckIn,
      nights: String(nextNights),
      guests: String(nextGuests)
    });
    const apiPath = tenantSlug ? `/api/site/${encodeURIComponent(tenantSlug)}/rooms` : "/api/site/rooms";
    const endpoint = `${apiPath}?${params.toString()}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), SEARCH_TIMEOUT_MS);

    try {
      const response = await fetch(endpoint, {
        method: "GET",
        cache: "no-store",
        signal: controller.signal
      });
      const payload: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        const apiError =
          payload && typeof payload === "object" && "error" in payload
            ? (payload as { error?: unknown }).error
            : undefined;
        throw new Error(sanitizeErrorMessage(apiError) ?? modalT("technicalGenericSafe"));
      }

      const normalized = normalizeRoomSearchResponse(payload, nextCheckIn, nextNights, nextGuests);
      if (normalized.availableRooms.length > 0) {
        setModalState({
          isOpen: true,
          status: "success",
          data: normalized
        });
      } else {
        setModalState({
          isOpen: true,
          status: "empty",
          data: normalized
        });
      }
    } catch (error) {
      const isAbortError = isAbortLikeError(error);
      if (!isAbortError && process.env.NODE_ENV !== "production") {
        console.error("[RoomSearchModal] room search failed", error);
      }

      const safeMessage =
        error instanceof Error ? sanitizeErrorMessage(error.message) : undefined;

      setModalState({
        isOpen: true,
        status: "error",
        errorMessage: safeMessage
      });
    } finally {
      clearTimeout(timeout);
    }
  }

  async function onSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isLoading) return;

    const validated = validateCriteria();
    if ("message" in validated) {
      setValidationMessage(validated.message);
      return;
    }

    setValidationMessage("");
    await runRoomSearch(validated.checkIn, validated.nights, validated.guests);
  }

  const modalHeadingId = "room-search-modal-title";
  const modalDescriptionId = "room-search-modal-description";
  const showModal = modalState.isOpen;
  const modalStatusClass = `room-search-modal--${modalState.status}`;

  const modalNode =
    showModal && typeof document !== "undefined"
      ? createPortal(
          <div className="room-search-modal-overlay" onClick={closeModal}>
            <section
              aria-describedby={modalDescriptionId}
              aria-labelledby={modalHeadingId}
              aria-modal="true"
              className={`room-search-modal ${modalStatusClass}`}
              onClick={(event) => event.stopPropagation()}
              role="dialog"
            >
              <header className="room-search-modal-header">
                <h2 id={modalHeadingId}>
                  {modalState.status === "loading"
                    ? modalT("loadingTitle")
                    : modalState.status === "success"
                      ? modalT("availableTitle")
                      : modalState.status === "empty"
                        ? modalT("emptyTitle")
                        : modalT("errorTitle")}
                </h2>
                <button
                  aria-label={modalT("closeButton")}
                  className="room-search-modal-close"
                  disabled={isLoading}
                  onClick={closeModal}
                  type="button"
                >
                  {modalT("closeButton")}
                </button>
              </header>

              <div className="room-search-modal-body" id={modalDescriptionId}>
                {modalState.status === "loading" ? (
                  <div className="room-search-loading">
                    <span aria-hidden className="room-search-spinner" />
                    <p>{modalT("loadingTitle")}</p>
                    <p>{modalT("loadingSubtitle")}</p>
                  </div>
                ) : null}

                {modalState.status === "success" && modalState.data ? (
                  <>
                    <div className="room-search-summary">
                      <p>{modalT("summaryCheckIn")}: {modalState.data.checkIn}</p>
                      <p>{modalT("summaryNights")}: {modalState.data.nights}</p>
                      <p>{modalT("summaryGuests")}: {modalState.data.guests}</p>
                      <p>{modalT("summaryCurrency")}: {modalState.data.currency || "THB"}</p>
                      <p>{modalT("availableCount", { count: modalState.data.totalAvailable })}</p>
                    </div>
                    <div className="room-search-results">
                      {modalState.data.availableRooms.map((room) => {
                        const priceText = formatPrice(room.pricePerNight, room.currency || modalState.data?.currency, locale);
                        return (
                          <article className="room-search-result-card" key={`available-${room.id}`}>
                            <div className="room-search-result-media">
                              {room.imageUrl ? (
                                <Image
                                  alt={room.name}
                                  className="room-search-result-image"
                                  fill
                                  sizes="(max-width: 767px) 100vw, (max-width: 1023px) 40vw, 240px"
                                  src={room.imageUrl}
                                  unoptimized
                                />
                              ) : (
                                <div aria-hidden className="room-search-result-media-empty" />
                              )}
                            </div>
                            <div className="room-search-result-content">
                              <div className="room-search-result-top">
                                <h3>{room.name}</h3>
                                {room.detailsUrl ? (
                                  <a className="room-search-details-link" href={room.detailsUrl} rel="noreferrer" target="_blank">
                                    {modalT("roomDetails")}
                                  </a>
                                ) : null}
                              </div>
                              {room.description ? <p className="room-search-description">{room.description}</p> : null}
                              <p className="room-search-rate-name">{room.rateName || modalT("rateFallback")}</p>
                              {priceText ? <p className="room-search-price">{priceText} {modalT("pricePerNight")}</p> : null}
                              <p className="room-search-tax-note">{room.taxesIncludedText || modalT("taxesIncluded")}</p>
                              <div className="room-search-card-actions">
                                <a className="room-search-select-btn" href={roomsPageHref}>
                                  {modalT("selectButton")}
                                </a>
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </>
                ) : null}

                {modalState.status === "empty" ? (
                  <>
                    <div className="room-search-empty">
                      <p>{modalT("emptyTitle")}</p>
                      <p>{modalT("emptyMessage")}</p>
                    </div>
                    {modalState.data?.unavailableRooms?.length ? (
                      <div className="room-search-results room-search-results--disabled">
                        {modalState.data.unavailableRooms.map((room) => (
                          <article className="room-search-result-card room-search-result-card--disabled" key={`unavailable-${room.id}`}>
                            <div className="room-search-result-media">
                              {room.imageUrl ? (
                                <Image
                                  alt={room.name}
                                  className="room-search-result-image"
                                  fill
                                  sizes="(max-width: 767px) 100vw, (max-width: 1023px) 40vw, 240px"
                                  src={room.imageUrl}
                                  unoptimized
                                />
                              ) : (
                                <div aria-hidden className="room-search-result-media-empty" />
                              )}
                            </div>
                            <div className="room-search-result-content">
                              <div className="room-search-result-top">
                                <h3>{room.name}</h3>
                                <span className="room-search-badge">
                                  {room.status === "full" ? modalT("fullBadge") : modalT("unavailableBadge")}
                                </span>
                              </div>
                              {room.description ? <p className="room-search-description">{room.description}</p> : null}
                              <p className="room-search-rate-name">{room.rateName || modalT("unavailableRateFallback")}</p>
                              <div className="room-search-card-actions">
                                <button className="room-search-select-btn" disabled type="button">
                                  {modalT("selectDisabled")}
                                </button>
                              </div>
                            </div>
                          </article>
                        ))}
                      </div>
                    ) : null}
                  </>
                ) : null}

                {modalState.status === "error" ? (
                  <div className="room-search-error">
                    <p>{modalT("errorTitle")}</p>
                    <p>{modalT("errorMessage")}</p>
                    {modalState.errorMessage ? <p className="room-search-error-safe">{modalState.errorMessage}</p> : null}
                    <div className="room-search-error-actions">
                      <button
                        className="room-search-retry-btn"
                        onClick={async (event) => {
                          event.preventDefault();
                          const validated = validateCriteria();
                          if ("message" in validated) {
                            setValidationMessage(validated.message);
                            closeModal();
                            return;
                          }

                          setValidationMessage("");
                          await runRoomSearch(validated.checkIn, validated.nights, validated.guests);
                        }}
                        type="button"
                      >
                        {modalT("retryButton")}
                      </button>
                      <button className="room-search-close-btn" onClick={closeModal} type="button">
                        {modalT("closeButton")}
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </section>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <form aria-busy={isLoading} className="hero-booking-card" onSubmit={onSearchSubmit}>
        <label className="hero-booking-cell" htmlFor="hero-search-checkin">
          <span aria-hidden className="hero-booking-icon">
            <svg viewBox="0 0 24 24">
              <rect height="16" rx="3" ry="3" width="18" x="3" y="5" />
              <path d="M8 3v4M16 3v4M3 10h18" />
            </svg>
          </span>
          <span>{bookingT("checkInLabel")}</span>
          <input
            disabled={isLoading}
            id="hero-search-checkin"
            min={todayIso}
            name="checkIn"
            onChange={(event) => setCheckIn(event.target.value)}
            required
            type="date"
            value={checkIn}
          />
        </label>
        <label className="hero-booking-cell" htmlFor="hero-search-nights">
          <span aria-hidden className="hero-booking-icon">
            <svg viewBox="0 0 24 24">
              <path d="M4 6h8a4 4 0 0 1 4 4v8H8a4 4 0 0 1-4-4z" />
              <path d="M12 6h4a4 4 0 0 1 4 4v8h-8z" />
            </svg>
          </span>
          <span>{bookingT("nightsLabel")}</span>
          <input
            disabled={isLoading}
            id="hero-search-nights"
            max={30}
            min={1}
            name="nights"
            onChange={(event) => setNights(event.target.value)}
            required
            type="number"
            value={nights}
          />
        </label>
        <label className="hero-booking-cell" htmlFor="hero-search-guests">
          <span aria-hidden className="hero-booking-icon">
            <svg viewBox="0 0 24 24">
              <circle cx="9" cy="8" r="3" />
              <circle cx="16.5" cy="9.5" r="2.5" />
              <path d="M3 18a6 6 0 0 1 12 0" />
              <path d="M13 18a4.5 4.5 0 0 1 8 0" />
            </svg>
          </span>
          <span>{bookingT("guestsLabel")}</span>
          <input
            disabled={isLoading}
            id="hero-search-guests"
            min={1}
            name="guests"
            onChange={(event) => setGuests(event.target.value)}
            required
            type="number"
            value={guests}
          />
        </label>
        <button className="hero-booking-btn" disabled={isLoading} ref={searchButtonRef} type="submit">
          {isLoading ? bookingT("searchLoading") : bookingT("searchIdle")}
        </button>
      </form>

      {validationMessage ? <p className="hero-booking-validation">{validationMessage}</p> : null}
      {modalNode}
    </>
  );
}
