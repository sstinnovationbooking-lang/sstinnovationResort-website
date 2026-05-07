"use client";

import { useLocale, useTranslations } from "next-intl";

import { ResortTopNavbar } from "@/components/top-navbar";
import { DEFAULT_SITE_FOOTER, sanitizeSiteFooter } from "@/lib/content/footer";
import { DEFAULT_ROOMS_INTRO, sanitizeRoomsIntro } from "@/lib/content/rooms-intro";
import { DEFAULT_LOCALE, normalizeLocale } from "@/i18n/config";
import { formatCurrencyByLocale } from "@/lib/i18n/format";
import { getLocalizedValue } from "@/lib/i18n/localized";
import { translateStaticFallbackText } from "@/lib/i18n/static-fallback-text";
import type { NavbarSettingsDTO, RoomCardDTO, SiteHomeDTO } from "@/lib/types/site";

interface ResortRoomsPageProps {
  home: SiteHomeDTO;
  rooms: RoomCardDTO[];
  navbar?: NavbarSettingsDTO;
}

export function ResortRoomsPage({ home, rooms, navbar }: ResortRoomsPageProps) {
  const t = useTranslations("ResortHome");
  const locale = useLocale();
  const resolvedLocale = normalizeLocale(locale) ?? DEFAULT_LOCALE;
  const roomsIntro = sanitizeRoomsIntro(home.roomsIntro ?? DEFAULT_ROOMS_INTRO);
  const roomsIntroLooksLikeStaticDefault =
    String(roomsIntro.eyebrow).trim() === String(DEFAULT_ROOMS_INTRO.eyebrow).trim() &&
    String(roomsIntro.heading).trim() === String(DEFAULT_ROOMS_INTRO.heading).trim() &&
    String(roomsIntro.description).trim() === String(DEFAULT_ROOMS_INTRO.description).trim();
  const roomsIntroEyebrow = roomsIntroLooksLikeStaticDefault
    ? t("roomsIntroEyebrow")
    : getLocalizedValue(roomsIntro.eyebrow, resolvedLocale, roomsIntro.eyebrow);
  const roomsIntroHeading = roomsIntroLooksLikeStaticDefault
    ? t("roomsTitle")
    : getLocalizedValue(roomsIntro.heading, resolvedLocale, roomsIntro.heading);
  const roomsIntroDescription = roomsIntroLooksLikeStaticDefault
    ? t("roomsIntroDescription")
    : getLocalizedValue(roomsIntro.description, resolvedLocale, roomsIntro.description);
  const footer = sanitizeSiteFooter(home.footer ?? DEFAULT_SITE_FOOTER);
  const footerMenuItems = footer.menuItems?.length
    ? footer.menuItems
    : navbar?.leftLinks?.length
      ? navbar.leftLinks
      : DEFAULT_SITE_FOOTER.menuItems ?? [];
  const footerSystemItems = footer.systemLinks ?? DEFAULT_SITE_FOOTER.systemLinks ?? [];
  const roomsCtaHref = `/site/${home.tenant.tenantSlug}#lead-form`;
  const navbarPhoneDisplay = String(home.contact.phone || footer.contact.phone || "").trim();
  const roomsCtaLabel = translateStaticFallbackText(
    getLocalizedValue(home.hero.ctaLabel, resolvedLocale, home.hero.ctaLabel),
    t
  );

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
        {roomsIntro.isVisible !== false ? (
          <section aria-labelledby="rooms-intro-title" className="rooms-intro reveal">
            <div className="shell rooms-intro-inner">
              <span className="rooms-intro-eyebrow">{roomsIntroEyebrow}</span>
              <h1 id="rooms-intro-title">{roomsIntroHeading}</h1>
              <p>{roomsIntroDescription}</p>
            </div>
          </section>
        ) : null}

        <section className="shell section reveal rooms-page-list" id="rooms">
          <div className="section-head">
            <h2>{t("roomsTitle")}</h2>
            <p>{t("roomsDescription")}</p>
          </div>
          {rooms.length > 0 ? (
            <div className="card-grid">
              {rooms.map((room) => (
                <article className="room-card" key={room.id}>
                  <div aria-hidden className="room-image" style={{ backgroundImage: `url(${room.imageUrl})` }} />
                  <div className="room-body">
                    {room.badge ? <span className="tag">{translateStaticFallbackText(room.badge, t)}</span> : null}
                    <h3>{translateStaticFallbackText(room.name, t)}</h3>
                    <p className="room-description">{translateStaticFallbackText(room.description, t)}</p>
                    <div className="room-foot">
                      <strong className="room-price">
                        {formatCurrencyByLocale(resolvedLocale, room.nightlyPriceTHB)} {t("perNight")}
                      </strong>
                      <a className="btn btn-ghost btn-compact" href={roomsCtaHref}>
                        {roomsCtaLabel}
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="empty-state">{t("roomsEmpty")}</p>
          )}
        </section>
      </section>

      {footer.isVisible !== false ? (
        <footer className="site-footer" id="footer">
          <div className="shell footer-shell">
            <div className="footer-grid">
              <section aria-label="Resort brand" className="footer-col footer-brand">
                <h3 className="footer-brand-name">{footer.brandName || "SST INNOVATION RESORT"}</h3>
                <p>{translateStaticFallbackText(footer.description, t)}</p>
              </section>

              <section aria-label="Footer menu" className="footer-col footer-menu">
                <h4>{t("footerMenuTitle")}</h4>
                <ul>
                  {footerMenuItems.map((item) => (
                    <li key={`footer-menu-${item.label}-${item.href ?? "nohref"}`}>
                      {item.href ? <a href={item.href}>{resolveMenuLabel(item.label, item.href)}</a> : <span>{item.label}</span>}
                    </li>
                  ))}
                </ul>
              </section>

              <section aria-label="Contact information" className="footer-col footer-contact">
                <h4>{t("footerContactTitle")}</h4>
                <ul>
                  <li>{footer.contact.address}</li>
                  <li>{footer.contact.phone}</li>
                  <li>{footer.contact.email}</li>
                  {footer.contact.supportHours ? <li>{translateStaticFallbackText(footer.contact.supportHours, t)}</li> : null}
                </ul>
              </section>

              <section aria-label="System information" className="footer-col footer-system">
                <h4>{t("footerSystemTitle")}</h4>
                <ul>
                  {footerSystemItems.map((item) => (
                    <li key={`footer-system-${item.label}-${item.href ?? "nohref"}`}>
                      {item.href ? (
                        <a href={item.href}>{translateStaticFallbackText(item.label, t)}</a>
                      ) : (
                        <span>{translateStaticFallbackText(item.label, t)}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            <div className="footer-bottom">
              <p className="footer-meta">
                {t("copyrightPrefix")} {new Date().getFullYear()} {home.tenant.brand}. {footer.copyrightText ?? t("copyrightFallback")}
              </p>
              <a className="footer-backtop" href="#hero">
                {t("backToTop")}
              </a>
            </div>
          </div>
        </footer>
      ) : null}
    </main>
  );
}
