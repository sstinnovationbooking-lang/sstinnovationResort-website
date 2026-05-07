"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import { FeaturedRoomGallery } from "@/components/featured-room-gallery";
import { HeroBookingWidget } from "@/components/hero-booking-widget";
import { HomepageAmenities } from "@/components/homepage-amenities";
import { HomepageHotelInfo } from "@/components/homepage-hotel-info";
import { HomepageRoomHighlights } from "@/components/homepage-room-highlights";
import { ResortTopNavbar } from "@/components/top-navbar";
import { DEFAULT_SITE_FOOTER, sanitizeSiteFooter } from "@/lib/content/footer";
import { DEFAULT_ROOMS_INTRO } from "@/lib/content/rooms-intro";
import { DEFAULT_LOCALE, normalizeLocale } from "@/i18n/config";
import { getLocalizedValue } from "@/lib/i18n/localized";
import { translateStaticFallbackText } from "@/lib/i18n/static-fallback-text";
import type { NavbarSettingsDTO, SiteHomeDTO } from "@/lib/types/site";

interface ResortHomeProps {
  home: SiteHomeDTO;
  navbar?: NavbarSettingsDTO;
}

export function ResortHome({ home, navbar }: ResortHomeProps) {
  const t = useTranslations("ResortHome");
  const locale = useLocale();
  const resolvedLocale = normalizeLocale(locale) ?? DEFAULT_LOCALE;
  const [isBookingCardVisible, setIsBookingCardVisible] = useState(true);
  const footer = sanitizeSiteFooter(home.footer ?? DEFAULT_SITE_FOOTER);
  const footerMenuItems = footer.menuItems?.length
    ? footer.menuItems
    : navbar?.leftLinks?.length
      ? navbar.leftLinks
      : DEFAULT_SITE_FOOTER.menuItems ?? [];
  const footerSystemItems = footer.systemLinks ?? DEFAULT_SITE_FOOTER.systemLinks ?? [];
  const navbarPhoneDisplay = String(home.contact.phone || footer.contact.phone || "").trim();
  const roomsIntro = home.roomsIntro;
  const roomsIntroLooksLikeStaticDefault =
    String(roomsIntro?.eyebrow ?? "").trim() === String(DEFAULT_ROOMS_INTRO.eyebrow).trim() &&
    String(roomsIntro?.heading ?? "").trim() === String(DEFAULT_ROOMS_INTRO.heading).trim() &&
    String(roomsIntro?.description ?? "").trim() === String(DEFAULT_ROOMS_INTRO.description).trim();
  const roomsIntroEyebrow =
    !roomsIntro || roomsIntroLooksLikeStaticDefault
      ? t("roomsIntroEyebrow")
      : getLocalizedValue(roomsIntro.eyebrow, resolvedLocale, roomsIntro.eyebrow);
  const roomsIntroHeading =
    !roomsIntro || roomsIntroLooksLikeStaticDefault
      ? t("roomsTitle")
      : getLocalizedValue(roomsIntro.heading, resolvedLocale, roomsIntro.heading);
  const roomsIntroDescription =
    !roomsIntro || roomsIntroLooksLikeStaticDefault
      ? t("roomsIntroDescription")
      : getLocalizedValue(roomsIntro.description, resolvedLocale, roomsIntro.description);
  const heroEyebrow = getLocalizedValue(home.hero.eyebrow, resolvedLocale, home.hero.eyebrow);
  const heroTitle = getLocalizedValue(home.hero.title, resolvedLocale, home.hero.title);
  const heroSubtitle = getLocalizedValue(home.hero.subtitle, resolvedLocale, home.hero.subtitle);
  const heroCtaLabel = getLocalizedValue(home.hero.ctaLabel, resolvedLocale, home.hero.ctaLabel);

  function resolveMenuLabel(label: string, href?: string): string {
    const normalized = String(href ?? "").trim().toLowerCase();
    if (normalized === "/") return t("nav.home");
    if (normalized === "/rooms") return t("nav.rooms");
    if (normalized === "/activities") return t("nav.activities");
    if (normalized === "/about") return t("nav.about");
    if (normalized === "/contact") return t("nav.contact");
    return label;
  }

  useEffect(() => {
    if (!navbar?.showSearchStrip) return;

    let lastScrollY = window.scrollY;
    const threshold = 8;

    const handleScroll = () => {
      const currentY = window.scrollY;
      const delta = currentY - lastScrollY;

      if (currentY < 48) {
        setIsBookingCardVisible(true);
      } else if (delta > threshold) {
        setIsBookingCardVisible(false);
      } else if (delta < -threshold) {
        setIsBookingCardVisible(true);
      }

      lastScrollY = currentY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [navbar?.showSearchStrip]);

  return (
    <main aria-labelledby="hero-title" className="site-main">
      <ResortTopNavbar
        brand={home.tenant.brand}
        navbar={navbar}
        siteContact={{
          phoneDisplay: navbarPhoneDisplay,
          phoneTel: navbarPhoneDisplay,
          isVisible: Boolean(navbarPhoneDisplay)
        }}
      />
      <section
        aria-label={t("heroImageAria", { brand: home.tenant.brand })}
        className={`hero-banner ${navbar?.showSearchStrip ? "hero-banner--with-search" : "hero-banner--simple"}`}
        id="hero"
        role="img"
        style={{ backgroundImage: `url(${home.hero.heroImageUrl})` }}
      >
        <div className="hero-banner-overlay" />
        {navbar?.showSearchStrip ? (
          <div className={`shell hero-booking-sticky ${isBookingCardVisible ? "is-visible" : "is-hidden"}`}>
            <HeroBookingWidget />
          </div>
        ) : null}
        <div className={`shell hero-banner-content reveal ${navbar?.showSearchStrip ? "has-search-strip" : ""}`}>
          {home.hero.eyebrow ? (
            <span className="hero-kicker">{translateStaticFallbackText(heroEyebrow, t)}</span>
          ) : null}
          <h1 id="hero-title">{translateStaticFallbackText(heroTitle, t)}</h1>
          <p>{translateStaticFallbackText(heroSubtitle, t)}</p>
          <div className="hero-banner-actions">
            <a className="hero-cta-btn" href="#lead-form">
              {translateStaticFallbackText(heroCtaLabel, t)}
            </a>
          </div>
          {home.stats.length > 0 ? <div className="hero-banner-caption">{home.tenant.brand}</div> : null}
        </div>
      </section>

      <section aria-labelledby="rooms-intro-title" className="rooms-intro reveal">
        <div className="shell rooms-intro-inner">
          <span className="rooms-intro-eyebrow">{roomsIntroEyebrow}</span>
          <h2 id="rooms-intro-title">{roomsIntroHeading}</h2>
          <p>{roomsIntroDescription}</p>
        </div>
      </section>

      <HomepageRoomHighlights home={home} />

      <FeaturedRoomGallery home={home} />

      <section className="shell section reveal" id="gallery">
        <div className="section-head">
          <h2>{t("galleryTitle")}</h2>
        </div>
        {home.gallery.length > 0 ? (
          <div className="gallery-grid">
            {home.gallery.map((item) => (
              <figure className="gallery-item" key={item.id}>
                <Image
                  alt={item.alt}
                  className="gallery-image"
                  height={220}
                  loading="lazy"
                  sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw"
                  src={item.imageUrl}
                  unoptimized
                  width={380}
                />
              </figure>
            ))}
          </div>
        ) : (
          <p className="empty-state">{t("galleryEmpty")}</p>
        )}
      </section>

      <HomepageAmenities home={home} />
      <HomepageHotelInfo home={home} />

      {footer.isVisible !== false ? (
        <footer className="site-footer" id="footer">
          <div className="shell footer-shell">
            <div className="footer-grid">
              <section className="footer-col footer-brand" aria-label="Resort brand">
                <h3 className="footer-brand-name">{footer.brandName || "SST INNOVATION RESORT"}</h3>
                <p>{translateStaticFallbackText(footer.description, t)}</p>
              </section>

              <section className="footer-col footer-menu" aria-label="Footer menu">
                <h4>{t("footerMenuTitle")}</h4>
                <ul>
                  {footerMenuItems.map((item) => (
                    <li key={`footer-menu-${item.label}-${item.href ?? "nohref"}`}>
                      {item.href ? <a href={item.href}>{resolveMenuLabel(item.label, item.href)}</a> : <span>{item.label}</span>}
                    </li>
                  ))}
                </ul>
              </section>

              <section className="footer-col footer-contact" aria-label="Contact information">
                <h4>{t("footerContactTitle")}</h4>
                <ul>
                  <li>{footer.contact.address}</li>
                  <li>{footer.contact.phone}</li>
                  <li>{footer.contact.email}</li>
                  {footer.contact.supportHours ? <li>{translateStaticFallbackText(footer.contact.supportHours, t)}</li> : null}
                </ul>
              </section>

              <section className="footer-col footer-system" aria-label="System information">
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
