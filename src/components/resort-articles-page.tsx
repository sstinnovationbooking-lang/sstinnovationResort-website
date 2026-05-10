"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale } from "next-intl";

import { ResortSiteFooter } from "@/components/resort-site-footer";
import { SiteAlertNotice } from "@/components/site-alert-notice";
import { ResortTopNavbar } from "@/components/top-navbar";
import { DEFAULT_LOCALE, normalizeLocale } from "@/i18n/config";
import { resolveArticlesPageContent } from "@/lib/content/articles-page";
import { resolveSiteContact } from "@/lib/content/site-contact";
import { getLocalizedValue } from "@/lib/i18n/localized";
import type { NavbarSettingsDTO, SiteHomeDTO } from "@/lib/types/site";

interface ResortArticlesPageProps {
  home: SiteHomeDTO;
  navbar?: NavbarSettingsDTO;
}

export function ResortArticlesPage({ home, navbar }: ResortArticlesPageProps) {
  const locale = normalizeLocale(useLocale()) ?? DEFAULT_LOCALE;
  const siteContact = resolveSiteContact(home, locale);
  const articles = resolveArticlesPageContent(home);
  const heading = getLocalizedValue(articles.heading, locale, locale === "th" ? "บทความ" : "Articles");
  const eyebrow = getLocalizedValue(articles.eyebrow, locale, locale === "th" ? "คอนเทนต์รีสอร์ต" : "Resort Content");
  const description = getLocalizedValue(
    articles.description,
    locale,
    locale === "th" ? "บทความ ข่าวสาร และคอนเทนต์ของรีสอร์ต" : "Resort articles and editorial content."
  );
  const visibleItems = articles.items.filter((item) => item.isVisible !== false).sort((a, b) => a.order - b.order);

  return (
    <main className="site-main articles-page" id="hero">
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

      <section className="articles-page-content">
        <section className="shell section articles-placeholder reveal" id="articles">
          <article className="articles-placeholder-card">
            <p className="articles-placeholder-eyebrow">{eyebrow}</p>
            <h1>{heading}</h1>
            <p>{description}</p>
          </article>
        </section>

        <section className="shell section articles-listing reveal">
          <div className="articles-grid">
            {visibleItems.map((item) => {
              const title = getLocalizedValue(item.title, locale, "");
              const excerpt = getLocalizedValue(item.excerpt, locale, "");
              const category = getLocalizedValue(item.category, locale, "");
              const imageAlt = getLocalizedValue(item.imageAlt, locale, title || heading);
              const href = String(item.href ?? "").trim() || `/site/${home.tenant.tenantSlug}/articles`;
              const imageUrl = String(item.imageUrl ?? "").trim();
              const publishedAt = String(item.publishedAt ?? "").trim();

              return (
                <article className="article-card" key={item.id}>
                  <Link className="article-card-link" href={href}>
                    <div className="article-card-image-wrap">
                      {imageUrl ? (
                        <Image
                          alt={imageAlt}
                          className="article-card-image"
                          fill
                          sizes="(max-width: 767px) 100vw, (max-width: 1199px) 50vw, 25vw"
                          src={imageUrl}
                          unoptimized
                        />
                      ) : null}
                    </div>
                    <div className="article-card-body">
                      {category ? <span className="article-card-category">{category}</span> : null}
                      {publishedAt ? <span className="article-card-date">{publishedAt}</span> : null}
                      <h3>{title}</h3>
                      {excerpt ? <p>{excerpt}</p> : null}
                    </div>
                  </Link>
                </article>
              );
            })}
          </div>
        </section>
      </section>

      <ResortSiteFooter home={home} navbar={navbar} />
    </main>
  );
}

