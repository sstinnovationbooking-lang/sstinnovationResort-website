"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { BackToTopButton } from "@/components/back-to-top-button";
import { FooterCopyrightLegal } from "@/components/footer-copyright-legal";
import { FooterSocialLinks } from "@/components/footer-social-links";
import { SiteAlertNotice } from "@/components/site-alert-notice";
import { ResortTopNavbar } from "@/components/top-navbar";
import { DEFAULT_LOCALE, normalizeLocale } from "@/i18n/config";
import { DEFAULT_SITE_FOOTER, sanitizeSiteFooter } from "@/lib/content/footer";
import { resolveMapEmbed, shouldResolveMapViaServer, type ResolvedMapEmbed } from "@/lib/content/map-embed";
import { resolveSiteContact } from "@/lib/content/site-contact";
import { formatPhoneByLocale } from "@/lib/i18n/format";
import { getLocalizedValue } from "@/lib/i18n/localized";
import { translateStaticFallbackText } from "@/lib/i18n/static-fallback-text";
import type { NavbarSettingsDTO, SiteHomeDTO } from "@/lib/types/site";

interface ResortContactPageProps {
  home: SiteHomeDTO;
  navbar?: NavbarSettingsDTO;
}

export function ResortContactPage({ home, navbar }: ResortContactPageProps) {
  const t = useTranslations("ResortHome");
  const locale = useLocale();
  const resolvedLocale = normalizeLocale(locale) ?? DEFAULT_LOCALE;
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
  const mapUrl = String(siteContact.mapUrl ?? "").trim();
  const fallbackMapEmbed = resolveMapEmbed(mapUrl);
  const [resolvedMapBySource, setResolvedMapBySource] = useState<{ source: string; value: ResolvedMapEmbed } | null>(null);
  const mapEmbed = resolvedMapBySource?.source === mapUrl ? resolvedMapBySource.value : fallbackMapEmbed;
  const addressFallbackEmbedSrc = siteContact.address
    ? `https://www.google.com/maps?output=embed&q=${encodeURIComponent(siteContact.address)}`
    : null;
  const mapFrameSrc = mapEmbed.embedSrc ?? addressFallbackEmbedSrc;
  const mapExternalUrl =
    mapEmbed.externalUrl ??
    (siteContact.address ? `https://www.google.com/maps?q=${encodeURIComponent(siteContact.address)}` : null);

  useEffect(() => {
    let isMounted = true;

    if (!shouldResolveMapViaServer(mapUrl)) {
      return () => {
        isMounted = false;
      };
    }

    const controller = new AbortController();
    const endpoint = `/api/site/map-embed?url=${encodeURIComponent(mapUrl)}`;

    fetch(endpoint, {
      method: "GET",
      cache: "no-store",
      signal: controller.signal
    })
      .then(async (response) => {
        if (!response.ok) return null;
        return (await response.json()) as Partial<ResolvedMapEmbed> | null;
      })
      .then((payload) => {
        if (!isMounted || !payload) return;
        const embedSrc = String(payload.embedSrc ?? "").trim() || null;
        const externalUrl = String(payload.externalUrl ?? "").trim() || null;
        if (!embedSrc && !externalUrl) return;
        setResolvedMapBySource({
          source: mapUrl,
          value: {
            embedSrc,
            externalUrl
          }
        });
      })
      .catch(() => {
        // Keep fallback map when resolver fails.
      });

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [mapUrl]);

  function resolveMenuLabel(label: string, href?: string): string {
    const normalized = String(href ?? "").trim().toLowerCase();
    if (normalized === "/") return t("nav.home");
    if (normalized === "/rooms") return t("nav.rooms");
    if (normalized === "/camping") return resolvedLocale === "th" ? "แคมป์ปิ้ง" : "Camping";
    if (normalized === "/activities") return t("nav.activities");
    if (normalized === "/about") return t("nav.about");
    if (normalized === "/contact") return t("nav.contact");
    return label;
  }

  return (
    <main className="site-main contact-page" id="hero">
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

      <section className="contact-page-content">
        <section className="shell section contact reveal" id="contact">
          <div className="contact-meta">
            <h2>{siteContact.contactTitle || t("contactTitle")}</h2>
            <p>
              {t("phoneLabel")}: {formatPhoneByLocale(resolvedLocale, siteContact.phone)}
            </p>
            <p>
              {t("emailLabel")}: {siteContact.email}
            </p>
            {siteContact.line ? (
              <p>
                {t("lineLabel")}: {siteContact.line}
              </p>
            ) : null}
            <p>
              {t("countryLabel")}: {siteContact.country}
            </p>
            {siteContact.openingHours ? <p>{translateStaticFallbackText(siteContact.openingHours, t)}</p> : null}
            <p>{siteContact.address}</p>
          </div>

          <div className="contact-map-card" id="contact-map">
            <h3>{resolvedLocale === "th" ? "แผนที่รีสอร์ต" : "Resort Map"}</h3>
            {mapFrameSrc ? (
              <div className="contact-map-frame-wrap">
                <iframe
                  allowFullScreen
                  className="contact-map-frame"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src={mapFrameSrc}
                  title={resolvedLocale === "th" ? "แผนที่รีสอร์ต" : "Resort map"}
                />
              </div>
            ) : (
              <p className="contact-map-empty">
                {resolvedLocale === "th"
                  ? "ยังไม่มีลิงก์แผนที่จากระบบหลังบ้าน"
                  : "No map link configured from backoffice yet."}
              </p>
            )}
            {mapExternalUrl ? (
              <a className="btn btn-primary" href={mapExternalUrl} rel="noreferrer" target="_blank">
                {resolvedLocale === "th" ? "เปิดแผนที่" : "Open map"}
              </a>
            ) : null}
          </div>
        </section>
      </section>

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

