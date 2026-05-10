"use client";

import { useLocale } from "next-intl";

import { ResortSiteFooter } from "@/components/resort-site-footer";
import { ResortTopNavbar } from "@/components/top-navbar";
import { DEFAULT_LOCALE, normalizeLocale } from "@/i18n/config";
import { resolveSiteContact } from "@/lib/content/site-contact";
import type { NavbarSettingsDTO, SiteHomeDTO } from "@/lib/types/site";

interface ResortArticlesPageProps {
  home: SiteHomeDTO;
  navbar?: NavbarSettingsDTO;
}

export function ResortArticlesPage({ home, navbar }: ResortArticlesPageProps) {
  const locale = normalizeLocale(useLocale()) ?? DEFAULT_LOCALE;
  const siteContact = resolveSiteContact(home, locale);
  const heading = locale === "th" ? "บทความ" : "Articles";
  const eyebrow = locale === "th" ? "คอนเทนต์รีสอร์ต" : "Resort Content";
  const description =
    locale === "th"
      ? "พื้นที่นี้จะแสดงบทความ ข่าวสาร และคอนเทนต์ของรีสอร์ต โดยโครงสร้างรองรับการเชื่อมต่อข้อมูลจากระบบกลาง/หลังบ้านในขั้นตอนถัดไป"
      : "This page will display resort articles, news, and content. The structure is ready for future backend and central content integration.";

  return (
    <main className="site-main articles-page" id="hero">
      <ResortTopNavbar
        brand={home.tenant.brand}
        navbar={navbar}
        siteContact={{
          phoneDisplay: siteContact.phone,
          phoneTel: siteContact.phone,
          isVisible: Boolean(siteContact.phone)
        }}
      />

      <section className="articles-page-content">
        <section className="shell section articles-placeholder reveal" id="articles">
          <article className="articles-placeholder-card">
            <p className="articles-placeholder-eyebrow">{eyebrow}</p>
            <h1>{heading}</h1>
            <p>{description}</p>
          </article>
        </section>
      </section>

      <ResortSiteFooter home={home} navbar={navbar} />
    </main>
  );
}
