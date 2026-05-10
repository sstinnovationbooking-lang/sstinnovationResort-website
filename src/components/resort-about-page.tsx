"use client";

import Image from "next/image";
import { useLocale } from "next-intl";

import { HomepageHotelInfo } from "@/components/homepage-hotel-info";
import { ResortSiteFooter } from "@/components/resort-site-footer";
import { SiteAlertNotice } from "@/components/site-alert-notice";
import { ResortTopNavbar } from "@/components/top-navbar";
import { DEFAULT_LOCALE, normalizeLocale } from "@/i18n/config";
import { resolveAboutPageContent } from "@/lib/content/about-page";
import { resolveSiteContact } from "@/lib/content/site-contact";
import { getLocalizedValue } from "@/lib/i18n/localized";
import type { NavbarSettingsDTO, SiteHomeDTO } from "@/lib/types/site";

interface ResortAboutPageProps {
  home: SiteHomeDTO;
  navbar?: NavbarSettingsDTO;
}

export function ResortAboutPage({ home, navbar }: ResortAboutPageProps) {
  const locale = normalizeLocale(useLocale()) ?? DEFAULT_LOCALE;
  const siteContact = resolveSiteContact(home, locale);
  const about = resolveAboutPageContent(home);
  const heading = getLocalizedValue(about.heading, locale, locale === "th" ? "เกี่ยวกับเรา" : "About Us");
  const subheading = getLocalizedValue(about.eyebrow, locale, locale === "th" ? "เรื่องราวของรีสอร์ต" : "Resort Story");
  const subtitle = getLocalizedValue(about.subtitle, locale, "");
  const description = getLocalizedValue(
    about.description,
    locale,
    locale === "th"
      ? "ข้อมูลแนะนำรีสอร์ต รายละเอียดการบริการ และข้อมูลสำคัญสำหรับผู้เข้าพัก"
      : "Resort background, service highlights, and key guest information."
  );
  const content = getLocalizedValue(about.content, locale, "");
  const imageUrl = String(about.imageUrl ?? "").trim();
  const imageAlt = getLocalizedValue(about.imageAlt, locale, heading);
  const sectionItems = (about.sections ?? []).filter((item) => item.isVisible !== false).sort((a, b) => a.order - b.order);

  return (
    <main className="site-main about-page" id="hero">
      <SiteAlertNotice alerts={home.ui?.alerts} tenantSlug={home.tenant.tenantSlug} />
      <ResortTopNavbar
        brand={home.tenant.brand}
        navbar={navbar}
        siteContact={{
          phoneDisplay: siteContact.phone,
          phoneTel: siteContact.phone,
          isVisible: Boolean(siteContact.phone)
        }}
      />

      <section className="about-page-content">
        <section className="shell section about-page-intro reveal">
          <article className="about-page-intro-card">
            <p className="about-page-eyebrow">{subheading}</p>
            <h1>{heading}</h1>
            {subtitle ? <p className="about-page-subtitle">{subtitle}</p> : null}
            <p>{description}</p>
            {content ? <p>{content}</p> : null}
            {imageUrl ? (
              <div className="about-page-image-wrap">
                <Image
                  alt={imageAlt}
                  className="about-page-image"
                  fill
                  sizes="(max-width: 767px) 100vw, 960px"
                  src={imageUrl}
                  unoptimized
                />
              </div>
            ) : null}
          </article>
        </section>

        {sectionItems.length > 0 ? (
          <section className="shell section about-sections reveal" id="about-sections">
            <div className="about-sections-grid">
              {sectionItems.map((item) => {
                const title = getLocalizedValue(item.title, locale, "");
                const body = getLocalizedValue(item.description, locale, "");
                const href = String(item.href ?? "").trim();

                return (
                  <article className="about-section-card" key={item.id}>
                    <h3>{title}</h3>
                    {body ? <p>{body}</p> : null}
                    {href ? (
                      <a className="about-section-link" href={href}>
                        {locale === "th" ? "ดูรายละเอียด" : "Read more"}
                      </a>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </section>
        ) : null}

        <HomepageHotelInfo home={home} />
      </section>

      <ResortSiteFooter home={home} navbar={navbar} />
    </main>
  );
}
