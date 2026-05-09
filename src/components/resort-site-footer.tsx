"use client";

import { useLocale, useTranslations } from "next-intl";

import { BackToTopButton } from "@/components/back-to-top-button";
import { FooterCopyrightLegal } from "@/components/footer-copyright-legal";
import { FooterSocialLinks } from "@/components/footer-social-links";
import { DEFAULT_LOCALE, normalizeLocale } from "@/i18n/config";
import { DEFAULT_SITE_FOOTER, sanitizeSiteFooter } from "@/lib/content/footer";
import { resolveSiteContact } from "@/lib/content/site-contact";
import { getLocalizedValue } from "@/lib/i18n/localized";
import { translateStaticFallbackText } from "@/lib/i18n/static-fallback-text";
import type { NavbarSettingsDTO, SiteHomeDTO } from "@/lib/types/site";

interface ResortSiteFooterProps {
  home: SiteHomeDTO;
  navbar?: NavbarSettingsDTO;
  showBackToTop?: boolean;
}

export function ResortSiteFooter({ home, navbar, showBackToTop = true }: ResortSiteFooterProps) {
  const t = useTranslations("ResortHome");
  const locale = useLocale();
  const resolvedLocale = normalizeLocale(locale) ?? DEFAULT_LOCALE;
  const footer = sanitizeSiteFooter(home.footer ?? DEFAULT_SITE_FOOTER);

  if (footer.isVisible === false) return null;

  const footerMenuItems = footer.menuItems?.length
    ? footer.menuItems
    : navbar?.leftLinks?.length
      ? navbar.leftLinks
      : DEFAULT_SITE_FOOTER.menuItems ?? [];
  const footerSystemItems = footer.systemLinks ?? DEFAULT_SITE_FOOTER.systemLinks ?? [];
  const siteContact = resolveSiteContact(home, resolvedLocale);
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

  return (
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
      {showBackToTop ? <BackToTopButton /> : null}
    </>
  );
}
