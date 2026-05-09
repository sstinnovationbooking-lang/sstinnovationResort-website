"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import { HomepageActivities } from "@/components/homepage-activities";
import { FeaturedRoomGallery } from "@/components/featured-room-gallery";
import { BackToTopButton } from "@/components/back-to-top-button";
import { FooterCopyrightLegal } from "@/components/footer-copyright-legal";
import { FooterSocialLinks } from "@/components/footer-social-links";
import { HeroBookingWidget } from "@/components/hero-booking-widget";
import { HomepageAmenities } from "@/components/homepage-amenities";
import { HomepageHotelInfo } from "@/components/homepage-hotel-info";
import { HomepageRoomHighlights } from "@/components/homepage-room-highlights";
import { ResortTopNavbar } from "@/components/top-navbar";
import { DEFAULT_SITE_FOOTER, sanitizeSiteFooter } from "@/lib/content/footer";
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
  const footer = sanitizeSiteFooter(home.footer ?? DEFAULT_SITE_FOOTER);
  const footerMenuItems = footer.menuItems?.length
    ? footer.menuItems
    : navbar?.leftLinks?.length
      ? navbar.leftLinks
      : DEFAULT_SITE_FOOTER.menuItems ?? [];
  const footerSystemItems = footer.systemLinks ?? DEFAULT_SITE_FOOTER.systemLinks ?? [];
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
  const footerBrandName = getLocalizedValue(footer.brandName, resolvedLocale, "SST INNOVATION RESORT");
  const footerDescription = getLocalizedValue(footer.description, resolvedLocale, "");

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
            <a className="hero-cta-btn" href={`/site/${home.tenant.tenantSlug}/rooms`}>
              {t("heroBookNow")}
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

      {footer.isVisible !== false ? (
        <>
          <footer className="site-footer" id="footer">
            <div className="shell footer-shell">
              <div className="footer-grid">
                <section className="footer-col footer-brand" aria-label="Resort brand">
                  <h3 className="footer-brand-name">{footerBrandName || "SST INNOVATION RESORT"}</h3>
                  <p>{translateStaticFallbackText(footerDescription, t)}</p>
                  <FooterSocialLinks locale={resolvedLocale} socialLinks={footer.socialLinks} />
                </section>

                <section className="footer-col footer-menu" aria-label="Footer menu">
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

                <section className="footer-col footer-contact" aria-label="Contact information">
                  <h4>{siteContact.footerTitle || t("footerContactTitle")}</h4>
                  <ul>
                    <li>{siteContact.address}</li>
                    <li>{siteContact.phone}</li>
                    <li>{siteContact.email}</li>
                    {siteContact.openingHours ? <li>{translateStaticFallbackText(siteContact.openingHours, t)}</li> : null}
                  </ul>
                </section>

                <section className="footer-col footer-system" aria-label="System information">
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
