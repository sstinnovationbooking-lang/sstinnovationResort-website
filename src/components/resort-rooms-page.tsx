"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import { RoomAvailabilityList } from "@/components/room-availability-list";
import { ResortSiteFooter } from "@/components/resort-site-footer";
import { SiteAlertNotice } from "@/components/site-alert-notice";
import { RoomsSearchFeedbackModal } from "@/components/rooms-search-feedback-modal";
import { RoomsSearchCard } from "@/components/rooms-search-card";
import { ResortTopNavbar } from "@/components/top-navbar";
import { normalizeRoomSearchCriteria, sanitizeRoomsPayload } from "@/lib/content/rooms";
import { resolveSiteContact } from "@/lib/content/site-contact";
import { DEFAULT_LOCALE, normalizeLocale } from "@/i18n/config";
import { translateStaticFallbackText } from "@/lib/i18n/static-fallback-text";
import { normalizeRoomSearchCheckInInput } from "@/lib/search/room-search";
import type { NavbarSettingsDTO, RoomCardDTO, RoomSearchCriteria, SiteBookingSettingsDTO, SiteHomeDTO } from "@/lib/types/site";

interface ResortRoomsPageProps {
  home: SiteHomeDTO;
  rooms: RoomCardDTO[];
  searchCriteria?: RoomSearchCriteria;
  roomsLoadError?: boolean;
  navbar?: NavbarSettingsDTO;
}

type SearchFeedbackState = "hidden" | "loading" | "error" | "noResults" | "validation";

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MIN_NIGHTS = 1;
const MAX_NIGHTS = 30;
const MIN_GUESTS = 1;
const MAX_GUESTS = 20;
const SEARCH_TIMEOUT_MS = 20000;

function clampInt(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  if (value < min) return min;
  if (value > max) return max;
  return Math.floor(value);
}

function hasActiveSearch(criteria?: RoomSearchCriteria): boolean {
  return Boolean(String(criteria?.checkIn ?? "").trim());
}

function isAbortLikeError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const name = String((error as { name?: unknown }).name ?? "").toLowerCase();
  if (name === "aborterror") return true;
  const message = String((error as { message?: unknown }).message ?? "").toLowerCase();
  return message.includes("aborted") || message.includes("abort");
}

function toSafeErrorDetail(error: unknown): string | undefined {
  const text = error instanceof Error ? error.message : String(error ?? "").trim();
  if (!text) return undefined;
  const sensitivePattern = /(x-internal-secret|authorization|bearer|token|stack|trace|cookie|password)/i;
  if (sensitivePattern.test(text)) return undefined;
  return text.slice(0, 220);
}

function filterAvailableRooms(rooms: RoomCardDTO[], criteria?: Pick<RoomSearchCriteria, "guests">): RoomCardDTO[] {
  const guests = Number(criteria?.guests ?? 0);
  return rooms.filter((room) => {
    const availabilityCount = typeof room.availableRooms === "number" ? room.availableRooms : undefined;
    const isAvailable = availabilityCount !== undefined ? availabilityCount > 0 : typeof room.isAvailable === "boolean" ? room.isAvailable : true;
    if (!isAvailable) return false;
    if (guests >= 1 && typeof room.maxGuests === "number" && room.maxGuests > 0) {
      return room.maxGuests >= guests;
    }
    return true;
  });
}

function buildRoomsRetryHref(tenantSlug: string, criteria?: RoomSearchCriteria): string {
  const params = new URLSearchParams();
  if (criteria?.checkIn) params.set("checkIn", criteria.checkIn);
  if (criteria?.nights && criteria.nights >= 1) params.set("nights", String(criteria.nights));
  if (criteria?.guests && criteria.guests >= 1) params.set("guests", String(criteria.guests));
  const query = params.toString();
  return `/site/${tenantSlug}/rooms${query ? `?${query}` : ""}`;
}

function normalizeBookingSettings(value: SiteBookingSettingsDTO | undefined): SiteBookingSettingsDTO | undefined {
  if (!value || typeof value !== "object") return undefined;
  const mode = value.mode === "booking_enabled" ? "booking_enabled" : value.mode === "contact_only" ? "contact_only" : undefined;
  const paymentOptions = Array.isArray(value.paymentOptions)
    ? value.paymentOptions.filter((option): option is "deposit_50" | "full" => option === "deposit_50" || option === "full")
    : undefined;
  const defaultPaymentOption =
    value.defaultPaymentOption === "deposit_50" || value.defaultPaymentOption === "full"
      ? value.defaultPaymentOption
      : undefined;
  const depositPercent = Number.isFinite(Number(value.depositPercent)) ? Number(value.depositPercent) : undefined;
  const contactRoute = String(value.contactRoute ?? "").trim();

  return {
    mode,
    allowBookingForm: value.allowBookingForm === true,
    contactRoute: contactRoute || undefined,
    paymentOptions: paymentOptions?.length ? paymentOptions : undefined,
    defaultPaymentOption,
    depositPercent
  };
}

export function ResortRoomsPage({ home, rooms, searchCriteria, roomsLoadError, navbar }: ResortRoomsPageProps) {
  const t = useTranslations("ResortHome");
  const locale = useLocale();
  const resolvedLocale = normalizeLocale(locale) ?? DEFAULT_LOCALE;
  const hasInitialSearch = hasActiveSearch(searchCriteria);
  const initialCriteria = hasInitialSearch ? normalizeRoomSearchCriteria(searchCriteria) : undefined;
  const [displayRooms, setDisplayRooms] = useState<RoomCardDTO[]>(
    hasInitialSearch ? filterAvailableRooms(rooms, initialCriteria) : rooms
  );
  const [activeSearchCriteria, setActiveSearchCriteria] = useState<RoomSearchCriteria | undefined>(initialCriteria);
  const [isSearching, setIsSearching] = useState(false);
  const [feedbackState, setFeedbackState] = useState<SearchFeedbackState>("hidden");
  const [feedbackDetail, setFeedbackDetail] = useState<string | undefined>(undefined);
  const [lastSearchCriteria, setLastSearchCriteria] = useState<RoomSearchCriteria | undefined>(undefined);
  const searchAbortRef = useRef<AbortController | null>(null);

  const siteContact = resolveSiteContact(home, resolvedLocale);
  const navbarPhoneDisplay = siteContact.phone;
  const retryHref = buildRoomsRetryHref(home.tenant.tenantSlug, activeSearchCriteria ?? searchCriteria);
  const isSearchActive = hasActiveSearch(activeSearchCriteria);
  const bookingSettings = normalizeBookingSettings(home.ui?.booking);
  const contactHref = `/site/${home.tenant.tenantSlug}/contact`;
  const searchCardKey = `${activeSearchCriteria?.checkIn ?? "none"}-${activeSearchCriteria?.nights ?? "1"}-${activeSearchCriteria?.guests ?? "2"}`;

  useEffect(() => {
    return () => {
      searchAbortRef.current?.abort();
    };
  }, []);

  const updateRoomsUrl = useCallback((criteria?: RoomSearchCriteria) => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams();
    if (criteria?.checkIn) params.set("checkIn", criteria.checkIn);
    if (criteria?.nights) params.set("nights", String(criteria.nights));
    if (criteria?.guests) params.set("guests", String(criteria.guests));
    const basePath = `/site/${home.tenant.tenantSlug}/rooms`;
    const query = params.toString();
    const nextHref = query ? `${basePath}?${query}` : basePath;
    window.history.replaceState(null, "", nextHref);
  }, [home.tenant.tenantSlug]);

  const closeFeedback = () => {
    if (feedbackState === "loading") return;
    setFeedbackState("hidden");
    setFeedbackDetail(undefined);
  };

  const executeSearch = async (criteria: RoomSearchCriteria) => {
    const checkIn = normalizeRoomSearchCheckInInput(criteria.checkIn) ?? "";
    const rawNights = Number(criteria.nights ?? 0);
    const rawGuests = Number(criteria.guests ?? 0);

    if (!checkIn || !ISO_DATE_PATTERN.test(checkIn)) {
      setFeedbackDetail(t("roomsSearchValidationCheckInRequired"));
      setFeedbackState("validation");
      return;
    }
    if (!Number.isFinite(rawNights) || rawNights < MIN_NIGHTS || rawNights > MAX_NIGHTS) {
      setFeedbackDetail(t("roomsSearchValidationNightsRange"));
      setFeedbackState("validation");
      return;
    }
    if (!Number.isFinite(rawGuests) || rawGuests < MIN_GUESTS) {
      setFeedbackDetail(t("roomsSearchValidationGuestsMin"));
      setFeedbackState("validation");
      return;
    }

    const nights = clampInt(rawNights, MIN_NIGHTS, MAX_NIGHTS);
    const guests = clampInt(rawGuests, MIN_GUESTS, MAX_GUESTS);
    const nextCriteria = { checkIn, nights, guests };
    searchAbortRef.current?.abort();
    const controller = new AbortController();
    searchAbortRef.current = controller;
    const timeoutHandle = window.setTimeout(() => controller.abort(), SEARCH_TIMEOUT_MS);

    setIsSearching(true);
    setFeedbackDetail(undefined);
    setFeedbackState("loading");
    setLastSearchCriteria(nextCriteria);
    updateRoomsUrl(nextCriteria);

    try {
      const params = new URLSearchParams({
        checkIn: nextCriteria.checkIn,
        nights: String(nextCriteria.nights),
        guests: String(nextCriteria.guests)
      });
      const endpoint = `/api/site/${encodeURIComponent(home.tenant.tenantSlug)}/rooms?${params.toString()}`;
      const response = await fetch(endpoint, {
        method: "GET",
        cache: "no-store",
        signal: controller.signal
      });
      const payload: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        const message =
          payload && typeof payload === "object" && "error" in payload
            ? String((payload as { error?: unknown }).error ?? "")
            : t("roomsSearchErrorDescription");
        throw new Error(message || t("roomsSearchErrorDescription"));
      }
      if (!Array.isArray(payload) && (typeof payload !== "object" || payload === null)) {
        throw new Error(t("roomsSearchInvalidResponse"));
      }

      const normalizedRooms = sanitizeRoomsPayload(payload);
      const availableRooms = filterAvailableRooms(normalizedRooms, nextCriteria);
      setActiveSearchCriteria(nextCriteria);
      setDisplayRooms(availableRooms);

      if (availableRooms.length === 0) {
        setFeedbackState("noResults");
      } else {
        setFeedbackState("hidden");
      }
    } catch (error) {
      if (isAbortLikeError(error)) {
        return;
      }
      if (process.env.NODE_ENV !== "production") {
        console.error("[RoomsSearch] failed", error);
      }
      setFeedbackDetail(toSafeErrorDetail(error));
      setFeedbackState("error");
    } finally {
      window.clearTimeout(timeoutHandle);
      if (searchAbortRef.current === controller) {
        searchAbortRef.current = null;
      }
      setIsSearching(false);
    }
  };

  const onClearSearch = () => {
    searchAbortRef.current?.abort();
    searchAbortRef.current = null;
    setFeedbackState("hidden");
    setFeedbackDetail(undefined);
    setIsSearching(false);
    setLastSearchCriteria(undefined);
    setActiveSearchCriteria(undefined);
    setDisplayRooms(rooms);
    updateRoomsUrl(undefined);
  };

  return (
    <main className="site-main rooms-page" id="hero">
      <SiteAlertNotice alerts={home.ui?.alerts} tenantSlug={home.tenant.tenantSlug} />
      <ResortTopNavbar
        brand={home.tenant.brand}
        navbar={navbar}
        siteContact={{
          phoneDisplay: navbarPhoneDisplay,
          phoneTel: navbarPhoneDisplay,
          isVisible: Boolean(navbarPhoneDisplay)
        }}
      />

      <section className="rooms-page-content">
        <RoomsSearchCard
          key={searchCardKey}
          initialCriteria={activeSearchCriteria}
          isSearching={isSearching}
          onSearch={(criteria) => {
            void executeSearch(criteria);
          }}
        />

        <section className="shell section reveal rooms-page-list" id="rooms">
          {roomsLoadError ? (
            <div className="rooms-state-card rooms-state-card--error" role="status">
              <h3>{t("roomsFailedToLoad")}</h3>
              <p>{t("serviceUnavailable")}</p>
              <div className="rooms-state-actions">
                <a className="btn btn-ghost btn-compact" href={retryHref}>
                  {t("roomsTryAgain")}
                </a>
                <a className="btn btn-primary btn-compact" href={contactHref}>
                  {t("nav.contact")}
                </a>
              </div>
            </div>
          ) : null}
          {!roomsLoadError ? (
            displayRooms.length > 0 ? (
              <RoomAvailabilityList
                bookingSettings={bookingSettings}
                isSearchActive={isSearchActive}
                onClearSearch={isSearchActive ? onClearSearch : undefined}
                rooms={displayRooms}
                searchCriteria={activeSearchCriteria}
                tenantSlug={home.tenant.tenantSlug}
              />
            ) : (
              <div className="rooms-state-card rooms-state-card--empty">
                <h3>{translateStaticFallbackText(t("roomsNoRoomAvailable"), t)}</h3>
                <p>{translateStaticFallbackText(t("roomsAdjustDates"), t)}</p>
                <div className="rooms-state-actions">
                  {isSearchActive ? (
                    <button className="btn btn-ghost btn-compact" onClick={onClearSearch} type="button">
                      {t("roomsSearchClear")}
                    </button>
                  ) : null}
                  <a className="btn btn-primary btn-compact" href={contactHref}>
                    {t("nav.contact")}
                  </a>
                </div>
              </div>
            )
          ) : null}
        </section>
      </section>
      <RoomsSearchFeedbackModal
        detail={feedbackDetail}
        onClose={closeFeedback}
        onRetry={lastSearchCriteria ? () => void executeSearch(lastSearchCriteria) : undefined}
        state={feedbackState}
      />
      <ResortSiteFooter home={home} navbar={navbar} />
    </main>
  );
}
