"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import { BackToTopButton } from "@/components/back-to-top-button";
import { FooterCopyrightLegal } from "@/components/footer-copyright-legal";
import { FooterSocialLinks } from "@/components/footer-social-links";
import { RoomAvailabilityList } from "@/components/room-availability-list";
import { RoomsSearchFeedbackModal } from "@/components/rooms-search-feedback-modal";
import { RoomsSearchCard } from "@/components/rooms-search-card";
import { ResortTopNavbar } from "@/components/top-navbar";
import { normalizeRoomSearchCriteria, sanitizeRoomsPayload } from "@/lib/content/rooms";
import { DEFAULT_SITE_FOOTER, sanitizeSiteFooter } from "@/lib/content/footer";
import { resolveSiteContact } from "@/lib/content/site-contact";
import { DEFAULT_LOCALE, normalizeLocale } from "@/i18n/config";
import { getLocalizedValue } from "@/lib/i18n/localized";
import { translateStaticFallbackText } from "@/lib/i18n/static-fallback-text";
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

function filterAvailableRooms(rooms: RoomCardDTO[]): RoomCardDTO[] {
  return rooms.filter((room) => {
    const availabilityCount = typeof room.availableRooms === "number" ? room.availableRooms : undefined;
    if (availabilityCount !== undefined) return availabilityCount > 0;
    if (typeof room.isAvailable === "boolean") return room.isAvailable;
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
    hasInitialSearch ? filterAvailableRooms(rooms) : rooms
  );
  const [activeSearchCriteria, setActiveSearchCriteria] = useState<RoomSearchCriteria | undefined>(initialCriteria);
  const [isSearching, setIsSearching] = useState(false);
  const [feedbackState, setFeedbackState] = useState<SearchFeedbackState>("hidden");
  const [feedbackDetail, setFeedbackDetail] = useState<string | undefined>(undefined);
  const [lastSearchCriteria, setLastSearchCriteria] = useState<RoomSearchCriteria | undefined>(undefined);
  const searchAbortRef = useRef<AbortController | null>(null);

  const footer = sanitizeSiteFooter(home.footer ?? DEFAULT_SITE_FOOTER);
  const footerMenuItems = footer.menuItems?.length
    ? footer.menuItems
    : navbar?.leftLinks?.length
      ? navbar.leftLinks
      : DEFAULT_SITE_FOOTER.menuItems ?? [];
  const footerSystemItems = footer.systemLinks ?? DEFAULT_SITE_FOOTER.systemLinks ?? [];
  const siteContact = resolveSiteContact(home, resolvedLocale);
  const navbarPhoneDisplay = siteContact.phone;
  const footerBrandName = getLocalizedValue(footer.brandName, resolvedLocale, "SST INNOVATION RESORT");
  const footerDescription = getLocalizedValue(footer.description, resolvedLocale, "");
  const retryHref = buildRoomsRetryHref(home.tenant.tenantSlug, activeSearchCriteria ?? searchCriteria);
  const isSearchActive = hasActiveSearch(activeSearchCriteria);
  const bookingSettings = normalizeBookingSettings(home.ui?.booking);
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

  const closeFeedback = useCallback(() => {
    if (feedbackState === "loading") return;
    setFeedbackState("hidden");
    setFeedbackDetail(undefined);
  }, [feedbackState]);

  const executeSearch = useCallback(async (criteria: RoomSearchCriteria) => {
    const checkIn = String(criteria.checkIn ?? "").trim();
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
      const availableRooms = filterAvailableRooms(normalizedRooms);
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
  }, [home.tenant.tenantSlug, t, updateRoomsUrl]);

  const onClearSearch = useCallback(() => {
    searchAbortRef.current?.abort();
    searchAbortRef.current = null;
    setFeedbackState("hidden");
    setFeedbackDetail(undefined);
    setIsSearching(false);
    setLastSearchCriteria(undefined);
    setActiveSearchCriteria(undefined);
    setDisplayRooms(rooms);
    updateRoomsUrl(undefined);
  }, [rooms, updateRoomsUrl]);

  function resolveMenuLabel(label: string, href?: string): string {
    const normalized = String(href ?? "").trim().toLowerCase();
    if (normalized === "/") return t("nav.home");
    if (normalized === "/rooms") return t("nav.rooms");
    if (normalized === "/activities") return t("nav.activities");
    if (normalized === "/about") return t("nav.about");
    if (normalized === "/contact") return t("nav.contact");
    return label;
  }

  return (
    <main className="site-main rooms-page" id="hero">
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
            <div className="rooms-load-error" role="status">
              <p>{t("roomsFailedToLoad")}</p>
              <a className="btn btn-ghost btn-compact" href={retryHref}>
                {t("roomsTryAgain")}
              </a>
            </div>
          ) : null}
          {displayRooms.length > 0 ? (
            <RoomAvailabilityList
              bookingSettings={bookingSettings}
              isSearchActive={isSearchActive}
              onClearSearch={isSearchActive ? onClearSearch : undefined}
              rooms={displayRooms}
              searchCriteria={activeSearchCriteria}
              tenantSlug={home.tenant.tenantSlug}
            />
          ) : (
            <p className="empty-state">{translateStaticFallbackText(t("roomsNoRoomAvailable"), t)}</p>
          )}
        </section>
      </section>
      <RoomsSearchFeedbackModal
        detail={feedbackDetail}
        onClose={closeFeedback}
        onRetry={lastSearchCriteria ? () => void executeSearch(lastSearchCriteria) : undefined}
        state={feedbackState}
      />

      {footer.isVisible !== false ? (
        <>
          <footer className="site-footer" id="footer">
            <div className="shell footer-shell">
              <div className="footer-grid">
                <section aria-label="Resort brand" className="footer-col footer-brand">
                  <h3 className="footer-brand-name">{footerBrandName || "SST INNOVATION RESORT"}</h3>
                  <p>{translateStaticFallbackText(footerDescription, t)}</p>
                  <FooterSocialLinks locale={resolvedLocale} socialLinks={footer.socialLinks} />
                </section>

                <section aria-label="Footer menu" className="footer-col footer-menu">
                  <h4>{t("footerMenuTitle")}</h4>
                  <ul>
                    {footerMenuItems.map((item) => (
                      <li key={`footer-menu-${item.label}-${item.href ?? "nohref"}`}>
                        {item.href ? (
                          <a href={item.href}>{resolveMenuLabel(getLocalizedValue(item.label, resolvedLocale, ""), item.href)}</a>
                        ) : (
                          <span>{translateStaticFallbackText(getLocalizedValue(item.label, resolvedLocale, ""), t)}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </section>

                <section aria-label="Contact information" className="footer-col footer-contact">
                  <h4>{siteContact.footerTitle || t("footerContactTitle")}</h4>
                  <ul>
                    <li>{siteContact.address}</li>
                    <li>{siteContact.phone}</li>
                    <li>{siteContact.email}</li>
                    {siteContact.openingHours ? <li>{translateStaticFallbackText(siteContact.openingHours, t)}</li> : null}
                  </ul>
                </section>

                <section aria-label="System information" className="footer-col footer-system">
                  <h4>{t("footerSystemTitle")}</h4>
                  <ul>
                    {footerSystemItems.map((item) => (
                      <li key={`footer-system-${item.label}-${item.href ?? "nohref"}`}>
                        {item.href ? (
                          <a href={item.href}>{translateStaticFallbackText(getLocalizedValue(item.label, resolvedLocale, ""), t)}</a>
                        ) : (
                          <span>{translateStaticFallbackText(getLocalizedValue(item.label, resolvedLocale, ""), t)}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </section>
              </div>

              <div className="footer-bottom">
                <FooterCopyrightLegal footer={footer} locale={resolvedLocale} tenantBrand={home.tenant.brand} />
              </div>
            </div>
          </footer>
          <BackToTopButton />
        </>
      ) : null}
    </main>
  );
}
