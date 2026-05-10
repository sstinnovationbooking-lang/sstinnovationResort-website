"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import { HomepageActivities } from "@/components/homepage-activities";
import { FeaturedRoomGallery } from "@/components/featured-room-gallery";
import { HeroBookingWidget } from "@/components/hero-booking-widget";
import { HomepageAmenities } from "@/components/homepage-amenities";
import { HomepageHotelInfo } from "@/components/homepage-hotel-info";
import { HomepageRoomHighlights } from "@/components/homepage-room-highlights";
import { ResortSiteFooter } from "@/components/resort-site-footer";
import { SiteAlertNotice } from "@/components/site-alert-notice";
import { ResortTopNavbar } from "@/components/top-navbar";
import { DEFAULT_ROOMS_INTRO } from "@/lib/content/rooms-intro";
import { resolveSiteContact } from "@/lib/content/site-contact";
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
  const siteContact = resolveSiteContact(home, resolvedLocale);
  const navbarPhoneDisplay = siteContact.phone;
  const roomsIntro = home.roomsIntro;
  const roomsIntroLooksLikeStaticDefault =
    String(roomsIntro?.eyebrow ?? "").trim() === String(DEFAULT_ROOMS_INTRO.eyebrow).trim() &&
    String(roomsIntro?.heading ?? "").trim() === String(DEFAULT_ROOMS_INTRO.heading).trim() &&
    String(roomsIntro?.description ?? "").trim() === String(DEFAULT_ROOMS_INTRO.description).trim();
  const roomsIntroEyebrow =
    !roomsIntro || roomsIntroLooksLikeStaticDefault
      ? t("roomsIntroEyebrow")
      : getLocalizedValue(roomsIntro.eyebrow, resolvedLocale, "");
  const roomsIntroHeading =
    !roomsIntro || roomsIntroLooksLikeStaticDefault
      ? t("roomsTitle")
      : getLocalizedValue(roomsIntro.heading, resolvedLocale, "");
  const roomsIntroDescription =
    !roomsIntro || roomsIntroLooksLikeStaticDefault
      ? t("roomsIntroDescription")
      : getLocalizedValue(roomsIntro.description, resolvedLocale, "");
  const heroEyebrow = getLocalizedValue(home.hero.eyebrow, resolvedLocale, "");
  const heroTitle = getLocalizedValue(home.hero.title, resolvedLocale, "");
  const heroSubtitle = getLocalizedValue(home.hero.subtitle, resolvedLocale, "");

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
            <a className="hero-cta-btn" href={`/site/${home.tenant.tenantSlug}/rooms`}>
              {t("heroBookNow")}
            </a>
            <a className="hero-cta-link" href={`/site/${home.tenant.tenantSlug}/contact`}>
              {t("nav.contact")}
            </a>
          </div>
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

      <HomepageAmenities home={home} />
      <HomepageHotelInfo home={home} />
      <HomepageActivities home={home} />
      <ResortSiteFooter home={home} navbar={navbar} />
    </main>
  );
}
