"use client";

import { useLocale, useTranslations } from "next-intl";

import { LeadForm } from "@/components/lead-form";
import { ResortTopNavbar } from "@/components/top-navbar";
import { DEFAULT_SITE_FOOTER, sanitizeSiteFooter } from "@/lib/content/footer";
import { DEFAULT_LOCALE, normalizeLocale } from "@/i18n/config";
import { formatCountryByLocale, formatPhoneByLocale } from "@/lib/i18n/format";
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
  const navbarPhoneDisplay = String(home.contact.phone || footer.contact.phone || "").trim();

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
            <h2>{t("contactTitle")}</h2>
            <p>
              {t("phoneLabel")}: {formatPhoneByLocale(resolvedLocale, home.contact.phone)}
            </p>
            <p>
              {t("emailLabel")}: {home.contact.email}
            </p>
            {home.contact.lineId ? (
              <p>
                {t("lineLabel")}: {home.contact.lineId}
              </p>
            ) : null}
            <p>
              {t("countryLabel")}: {formatCountryByLocale(resolvedLocale)}
            </p>
            {footer.contact.supportHours ? <p>{translateStaticFallbackText(footer.contact.supportHours, t)}</p> : null}
            <p>{footer.contact.address}</p>
          </div>
          <div id="lead-form">
            <h2 className="visually-hidden">{t("leadFormTitle")}</h2>
            <LeadForm tenantSlug={home.tenant.tenantSlug} />
          </div>
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
