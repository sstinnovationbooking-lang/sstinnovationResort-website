"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useLocale } from "next-intl";

import { CampingHeroSlider } from "@/components/camping-hero-slider";
import { ResortSiteFooter } from "@/components/resort-site-footer";
import { SiteAlertNotice } from "@/components/site-alert-notice";
import { ResortTopNavbar } from "@/components/top-navbar";
import { DEFAULT_LOCALE, normalizeLocale } from "@/i18n/config";
import { resolveCampingContent } from "@/lib/content/camping";
import { resolveSiteContact } from "@/lib/content/site-contact";
import { getLocalizedValue } from "@/lib/i18n/localized";
import type {
  CampingHighlightItemDTO,
  CampingPackageItemDTO,
  FeaturedGalleryItemDTO,
  NavbarSettingsDTO,
  SiteHomeDTO
} from "@/lib/types/site";

interface ResortCampingPageProps {
  home: SiteHomeDTO;
  navbar?: NavbarSettingsDTO;
}

function iconForKey(iconKey: string | undefined): string {
  const key = String(iconKey ?? "").trim().toLowerCase();
  if (key === "clock") return "\u23F0";
  if (key === "users") return "\uD83D\uDC65";
  if (key === "shield") return "\uD83D\uDEE1";
  if (key === "tent") return "\u26FA";
  if (key === "star") return "\u2605";
  if (key === "fire") return "\uD83D\uDD25";
  if (key === "water") return "\uD83D\uDCA7";
  if (key === "bolt") return "\u26A1";
  if (key === "car") return "\uD83D\uDE97";
  if (key === "wifi") return "\uD83D\uDCF6";
  if (key === "moon") return "\uD83C\uDF19";
  if (key === "paw") return "\uD83D\uDC3E";
  if (key === "leaf") return "\uD83C\uDF31";
  return "\u2022";
}

function localize(locale: "th" | "en", value: unknown, fallback = ""): string {
  return getLocalizedValue(value, locale, fallback);
}

function visibleSorted<T extends { isVisible?: boolean; order?: number }>(items: T[]): T[] {
  return items
    .filter((item) => item.isVisible !== false)
    .sort((a, b) => Number(a.order ?? 999) - Number(b.order ?? 999));
}

function resolveTenantAwareHref(tenantSlug: string, href: string | undefined, fallbackPath: "/contact" | "/rooms" | "/camping"): string {
  const normalizedHref = String(href ?? "").trim();
  const fallbackHref = `/site/${tenantSlug}${fallbackPath}`;

  if (!normalizedHref) return fallbackHref;
  if (normalizedHref.startsWith("http://") || normalizedHref.startsWith("https://")) return normalizedHref;
  if (normalizedHref.startsWith("/site/")) return normalizedHref;
  if (normalizedHref.startsWith("#")) return normalizedHref;
  if (normalizedHref === "/") return `/site/${tenantSlug}`;
  if (normalizedHref.startsWith("/contact")) return `/site/${tenantSlug}/contact`;
  if (normalizedHref.startsWith("/rooms")) return `/site/${tenantSlug}/rooms`;
  if (normalizedHref.startsWith("/camping")) return `/site/${tenantSlug}/camping`;
  if (normalizedHref.startsWith("/")) return normalizedHref;
  return normalizedHref;
}

function campingCardCtaHref(tenantSlug: string, item: CampingPackageItemDTO): string {
  return resolveTenantAwareHref(tenantSlug, item.ctaHref, "/contact");
}

export function ResortCampingPage({ home, navbar }: ResortCampingPageProps) {
  const locale = normalizeLocale(useLocale()) ?? DEFAULT_LOCALE;
  const camping = resolveCampingContent(home);
  const siteContact = resolveSiteContact(home, locale);
  const tenantSlug = home.tenant.tenantSlug;

  const quickInfo = visibleSorted(camping.quickInfoItems);
  const serviceTypes = visibleSorted(camping.serviceTypes);
  const addOns = visibleSorted(camping.addOns);
  const galleryItems = visibleSorted(camping.galleryItems);
  const heroImages = visibleSorted(camping.heroImages ?? []);
  const [selectedGalleryItem, setSelectedGalleryItem] = useState<FeaturedGalleryItemDTO | null>(null);
  const heroPrimaryCtaLabel = localize(locale, camping.heroPrimaryCtaLabel).trim();
  const heroSecondaryCtaLabel = localize(locale, camping.heroSecondaryCtaLabel).trim();
  const heroPrimaryCtaHref = resolveTenantAwareHref(tenantSlug, camping.heroPrimaryCtaHref, "/contact");
  const heroSecondaryCtaHref = resolveTenantAwareHref(tenantSlug, camping.heroSecondaryCtaHref, "/rooms");
  const galleryModalTitle = localize(locale, camping.galleryModalTitle).trim();
  const galleryModalDescription = localize(locale, camping.galleryModalDescription).trim();
  const galleryModalCtaLabel = localize(locale, camping.galleryModalCtaLabel, localize(locale, camping.ctaPrimaryLabel)).trim();
  const galleryModalCtaHref = resolveTenantAwareHref(tenantSlug, camping.galleryModalCtaHref, "/contact");

  const formatCurrency = new Intl.NumberFormat(locale === "th" ? "th-TH" : "en-US", {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0
  });
  const labels = locale === "th"
    ? {
        closeModal: "ปิดหน้าต่างแกลเลอรี",
        openGalleryItem: "เปิดภาพแกลเลอรี"
      }
    : {
        closeModal: "Close gallery modal",
        openGalleryItem: "Open gallery image"
      };

  useEffect(() => {
    if (!selectedGalleryItem) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setSelectedGalleryItem(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selectedGalleryItem]);

  return (
    <main className="site-main camping-page" id="hero">
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

      <section className="camping-page-content">
        <section className="camping-hero-banner reveal" id="camping">
          <div className="camping-hero-banner-visual">
            <CampingHeroSlider images={heroImages} locale={locale} />
            <div className="shell camping-hero-banner-content">
              <div className="camping-hero-copy camping-hero-copy--overlay">
                <span className="camping-eyebrow">{localize(locale, camping.heroEyebrow)}</span>
                <h1>{localize(locale, camping.heroTitle)}</h1>
                <p>{localize(locale, camping.heroSubtitle)}</p>
                <div className="camping-hero-cta-row">
                  {heroPrimaryCtaLabel ? (
                    <a className="btn btn-primary" href={heroPrimaryCtaHref}>
                      {heroPrimaryCtaLabel}
                    </a>
                  ) : null}
                  {heroSecondaryCtaLabel ? (
                    <a className="btn btn-ghost" href={heroSecondaryCtaHref}>
                      {heroSecondaryCtaLabel}
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="shell section camping-trust-strip reveal">
          <div className="section-head">
            <h2>{localize(locale, camping.quickInfoTitle)}</h2>
          </div>
          <div className="camping-trust-grid">
            {quickInfo.map((item: CampingHighlightItemDTO) => (
              <article className="camping-trust-item" key={item.id}>
                <span aria-hidden className="camping-item-icon">{iconForKey(item.iconKey)}</span>
                <div>
                  <h3>{localize(locale, item.title)}</h3>
                  <p>{localize(locale, item.description)}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="shell section camping-service-types reveal">
          <div className="section-head camping-section-head">
            <h2 className="camping-section-title">{localize(locale, camping.serviceTypesTitle)}</h2>
          </div>
          <div className="camping-service-grid">
            {serviceTypes.map((item: CampingPackageItemDTO) => (
              <article className="camping-service-card" key={item.id}>
                <div className="camping-service-head">
                  {item.badge ? <span className="camping-badge">{localize(locale, item.badge)}</span> : null}
                  <h3>{localize(locale, item.name)}</h3>
                  <p>{localize(locale, item.description)}</p>
                </div>
                <p className="camping-service-price">
                  {formatCurrency.format(item.priceTHB)} THB
                  <span>{localize(locale, item.durationText)}</span>
                </p>
                {item.priceNote ? <p className="camping-service-note">{localize(locale, item.priceNote)}</p> : null}
                {item.includedItems?.length ? (
                  <ul className="camping-service-list">
                    {item.includedItems.map((includeItem, index) => (
                      <li key={`${item.id}-include-${index}`}>{localize(locale, includeItem)}</li>
                    ))}
                  </ul>
                ) : null}
                <a className="btn btn-ghost" href={campingCardCtaHref(tenantSlug, item)}>
                  {localize(locale, item.ctaLabel, localize(locale, camping.ctaPrimaryLabel))}
                </a>
              </article>
            ))}
          </div>
        </section>

        <section className="shell section camping-addons reveal">
          <div className="section-head camping-section-head">
            <h2 className="camping-section-title">{localize(locale, camping.addOnsTitle)}</h2>
          </div>
          <div className="camping-addon-grid">
            {addOns.map((item) => (
              <article className="camping-addon-card" key={item.id}>
                <div className="camping-addon-top">
                  <span aria-hidden className="camping-item-icon">{iconForKey(item.iconKey)}</span>
                  <h3>{localize(locale, item.name)}</h3>
                </div>
                <p>{localize(locale, item.description)}</p>
                <p className="camping-addon-price">
                  {formatCurrency.format(item.priceTHB)} THB
                  <span>{localize(locale, item.durationText)}</span>
                </p>
                {item.priceNote ? <p className="camping-addon-note">{localize(locale, item.priceNote)}</p> : null}
              </article>
            ))}
          </div>
        </section>

        <section className="shell section camping-gallery reveal">
          <div className="section-head camping-section-head">
            <h2 className="camping-section-title">{localize(locale, camping.galleryTitle)}</h2>
          </div>
          <div className="camping-gallery-grid">
            {galleryItems.map((item) => (
              <figure className="camping-gallery-card" key={item.id}>
                <button
                  aria-label={`${labels.openGalleryItem}: ${localize(locale, item.title)}`}
                  className="camping-gallery-open-btn"
                  onClick={() => setSelectedGalleryItem(item)}
                  type="button"
                >
                  <div className="camping-gallery-image">
                    <Image
                      alt={localize(locale, item.altText, localize(locale, item.title))}
                      fill
                      sizes="(max-width: 767px) 100vw, (max-width: 1199px) 50vw, 33vw"
                      src={item.imageUrl}
                      unoptimized
                    />
                  </div>
                </button>
                <figcaption>
                  <strong>{localize(locale, item.title)}</strong>
                  <span>{localize(locale, item.altText)}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      </section>

      {selectedGalleryItem ? (
        <div className="camping-gallery-modal-overlay" onClick={() => setSelectedGalleryItem(null)}>
          <article
            aria-modal="true"
            className="camping-gallery-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <header className="camping-gallery-modal-header">
              <div className="camping-gallery-modal-header-copy">
                {galleryModalTitle ? <p>{galleryModalTitle}</p> : null}
                <h3>{localize(locale, selectedGalleryItem.title)}</h3>
              </div>
              <button
                aria-label={labels.closeModal}
                className="camping-gallery-modal-close-btn"
                onClick={() => setSelectedGalleryItem(null)}
                type="button"
              >
                X
              </button>
            </header>
            <div className="camping-gallery-modal-body">
              <div className="camping-gallery-modal-image-wrap">
                <Image
                  alt={localize(locale, selectedGalleryItem.altText, localize(locale, selectedGalleryItem.title))}
                  fill
                  sizes="(max-width: 767px) 96vw, (max-width: 1199px) 88vw, 860px"
                  src={selectedGalleryItem.imageUrl}
                  unoptimized
                />
              </div>
              <div className="camping-gallery-modal-content">
                <p>{localize(locale, selectedGalleryItem.sizeText, localize(locale, selectedGalleryItem.altText)) || galleryModalDescription}</p>
                {galleryModalDescription ? <p>{galleryModalDescription}</p> : null}
                <a className="btn btn-primary" href={galleryModalCtaHref}>
                  {galleryModalCtaLabel}
                </a>
              </div>
            </div>
          </article>
        </div>
      ) : null}

      <ResortSiteFooter home={home} navbar={navbar} />
    </main>
  );
}
