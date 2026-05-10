"use client";

import { useLocale, useTranslations } from "next-intl";

import { FooterSocialLinks } from "@/components/footer-social-links";
import { BackToTopButton } from "@/components/back-to-top-button";
import { FooterCopyrightLegal } from "@/components/footer-copyright-legal";
import { LeadForm } from "@/components/lead-form";
import { ResortTopNavbar } from "@/components/top-navbar";
import { DEFAULT_SITE_FOOTER, sanitizeSiteFooter } from "@/lib/content/footer";
import { resolveSiteContact } from "@/lib/content/site-contact";
import { DEFAULT_LOCALE, normalizeLocale } from "@/i18n/config";
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

  function resolveMenuLabel(label: string, href?: string): string {
    const normalized = String(href ?? "").trim().toLowerCase();
    if (normalized === "/") return t("nav.home");
    if (normalized === "/rooms") return t("nav.rooms");
    if (normalized === "/camping") return resolvedLocale === "th" ? "\u0E41\u0E04\u0E21\u0E1B\u0E4C\u0E1B\u0E34\u0E49\u0E07" : "Camping";
    if (normalized === "/activities") return t("nav.activities");
    if (normalized === "/about") return t("nav.about");
    if (normalized === "/contact") return t("nav.contact");
    return label;
  }

  return (
    <main className="site-main contact-page" id="hero">
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
          <div id="lead-form">
            <h2 className="visually-hidden">{t("leadFormTitle")}</h2>
            <LeadForm tenantSlug={home.tenant.tenantSlug} />
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
