"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import { HomepageMediaModal, type HomepageMediaModalItem } from "@/components/homepage-media-modal";
import { DEFAULT_LOCALE, normalizeLocale } from "@/i18n/config";
import {
  DEFAULT_ROOMS_FEATURED_GALLERY,
  ROOMS_FEATURED_GALLERY_MAX_ITEMS,
  sanitizeRoomsFeaturedGallery
} from "@/lib/content/rooms-featured-gallery";
import { getLocalizedValue } from "@/lib/i18n/localized";
import type { FeaturedGalleryItemDTO, SiteHomeDTO } from "@/lib/types/site";

interface FeaturedRoomGalleryProps {
  home: SiteHomeDTO;
}

const SAFE_GALLERY_FALLBACK_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1280' height='840' viewBox='0 0 1280 840'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%23dbe7df'/%3E%3Cstop offset='1' stop-color='%23f0e7d8'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='1280' height='840' fill='url(%23g)'/%3E%3Ccircle cx='1000' cy='180' r='110' fill='%23c9dacd' opacity='0.55'/%3E%3Cpath d='M110 680c170-150 340-150 510 0s340 150 510 0' fill='none' stroke='%23b4cab9' stroke-width='24' stroke-linecap='round'/%3E%3C/svg%3E";

function resolveFeaturedGalleryItems(home: SiteHomeDTO): {
  items: FeaturedGalleryItemDTO[];
  useStaticTranslationFallback: boolean;
} {
  const hasTenantGallerySource = Array.isArray(home.roomsFeaturedGallery) && home.roomsFeaturedGallery.length > 0;
  const resolvedFeaturedGallery = sanitizeRoomsFeaturedGallery(home.roomsFeaturedGallery ?? DEFAULT_ROOMS_FEATURED_GALLERY);
  const featuredGalleryVisibleItems = resolvedFeaturedGallery
    .filter((item) => item.isVisible !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const useStaticFallbackItems = featuredGalleryVisibleItems.length === 0;
  const featuredGalleryBaseItems = (
    !useStaticFallbackItems
      ? featuredGalleryVisibleItems
      : DEFAULT_ROOMS_FEATURED_GALLERY.map((item) => ({ ...item, isVisible: true }))
  ).slice(0, ROOMS_FEATURED_GALLERY_MAX_ITEMS);

  return {
    items: featuredGalleryBaseItems.map((item, index) => ({
      ...item,
      imageUrl:
        item.imageUrl ||
        home.featuredRooms[index]?.imageUrl ||
        home.featuredRooms[0]?.imageUrl ||
        home.gallery[index]?.imageUrl ||
        home.gallery[0]?.imageUrl ||
        "",
      altText: item.altText || item.title
    })),
    useStaticTranslationFallback: !hasTenantGallerySource || useStaticFallbackItems
  };
}

export function FeaturedRoomGallery({ home }: FeaturedRoomGalleryProps) {
  const t = useTranslations("ResortHome");
  const locale = useLocale();
  const resolvedLocale = normalizeLocale(locale) ?? DEFAULT_LOCALE;
  const { items: featuredGalleryItems, useStaticTranslationFallback } = resolveFeaturedGalleryItems(home);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [slideStep, setSlideStep] = useState(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [brokenImageById, setBrokenImageById] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const query = window.matchMedia("(max-width: 767px)");
    const apply = () => setIsMobile(query.matches);
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    const measure = () => {
      const track = trackRef.current;
      if (!track) return;
      const firstCard = track.querySelector<HTMLElement>(".rooms-featured-card");
      if (!firstCard) return;
      const styles = window.getComputedStyle(track);
      const gap = Number.parseFloat(styles.columnGap || styles.gap || "0") || 0;
      setSlideStep(firstCard.offsetWidth + gap);
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [featuredGalleryItems.length, isMobile]);

  const visibleCount = isMobile ? 1 : 3;
  const maxIndex = useMemo(
    () => Math.max(0, featuredGalleryItems.length - visibleCount),
    [featuredGalleryItems.length, visibleCount]
  );
  const boundedCurrentIndex = currentIndex > maxIndex ? maxIndex : currentIndex;

  const canNavigate = featuredGalleryItems.length > visibleCount;
  const isPrevDisabled = boundedCurrentIndex <= 0;
  const isNextDisabled = boundedCurrentIndex >= maxIndex;
  const translateX = slideStep > 0 ? boundedCurrentIndex * slideStep : 0;
  function localized(value: unknown, fallback = ""): string {
    return getLocalizedValue(value, resolvedLocale, fallback);
  }

  const modalItems: HomepageMediaModalItem[] = featuredGalleryItems.map((item) => {
    const localizedTitle = localized(item.title);
    return {
      id: item.id,
      title: useStaticTranslationFallback
        ? tryTranslate(`featuredGallery.${item.id}.title`, localizedTitle)
        : localizedTitle,
      description: useStaticTranslationFallback
        ? tryTranslate(`featuredGallery.${item.id}.sizeText`, localized(item.sizeText))
        : localized(item.sizeText),
      imageUrl: brokenImageById[item.id] ? SAFE_GALLERY_FALLBACK_IMAGE : (item.imageUrl || SAFE_GALLERY_FALLBACK_IMAGE),
      imageAlt: localized(item.altText, localizedTitle) || localizedTitle
    };
  });

  const handlePrev = () => setCurrentIndex(Math.max(0, boundedCurrentIndex - 1));
  const handleNext = () => setCurrentIndex(Math.min(maxIndex, boundedCurrentIndex + 1));
  const closeModal = () => setSelectedImageIndex(null);

  function tryTranslate(key: string, fallback: string): string {
    try {
      return t(key as never);
    } catch {
      return fallback;
    }
  }

  return (
    <section aria-label={t("featuredGalleryAria")} className="shell rooms-featured-gallery reveal">
      {canNavigate ? (
        <button
          aria-label={t("featuredGalleryPrev")}
          className="rooms-featured-arrow rooms-featured-arrow--left"
          disabled={isPrevDisabled}
          onClick={handlePrev}
          type="button"
        >
          {"<"}
        </button>
      ) : null}

      <div className="rooms-featured-gallery-viewport">
        <div
          className="rooms-featured-gallery-track"
          ref={trackRef}
          style={{ transform: `translateX(-${translateX}px)` }}
        >
          {featuredGalleryItems.map((item, index) => {
            const localizedTitle = localized(item.title);
            const title = useStaticTranslationFallback
              ? tryTranslate(`featuredGallery.${item.id}.title`, localizedTitle)
              : localizedTitle;
            const sizeText = useStaticTranslationFallback
              ? tryTranslate(`featuredGallery.${item.id}.sizeText`, localized(item.sizeText))
              : localized(item.sizeText);
            const imageUrl = brokenImageById[item.id] ? SAFE_GALLERY_FALLBACK_IMAGE : (item.imageUrl || SAFE_GALLERY_FALLBACK_IMAGE);
            return (
            <article className="rooms-featured-card" key={item.id}>
              <button
                aria-label={t("mediaModal.openImagePreview", { title })}
                className="rooms-featured-card-button"
                onClick={() => setSelectedImageIndex(index)}
                type="button"
              >
                <Image
                  alt={localized(item.altText, title) || title}
                  className="rooms-featured-card-image"
                  fill
                  loading="lazy"
                  onError={() => setBrokenImageById((prev) => ({ ...prev, [item.id]: true }))}
                  sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw"
                  src={imageUrl}
                  unoptimized
                />
                <div aria-hidden className="rooms-featured-card-overlay" />
                <div className="rooms-featured-card-text">
                  <h2 className="rooms-featured-card-title">{title}</h2>
                  <p className="rooms-featured-card-size">{sizeText}</p>
                </div>
              </button>
            </article>
          );})}
        </div>
      </div>

      {canNavigate ? (
        <button
          aria-label={t("featuredGalleryNext")}
          className="rooms-featured-arrow rooms-featured-arrow--right"
          disabled={isNextDisabled}
          onClick={handleNext}
          type="button"
        >
          {">"}
        </button>
      ) : null}

      <HomepageMediaModal
        closeLabel={t("mediaModal.close")}
        currentIndex={selectedImageIndex ?? 0}
        emptyImageLabel={t("mediaModal.imageUnavailable")}
        isOpen={selectedImageIndex !== null}
        items={modalItems}
        nextLabel={t("mediaModal.nextImage")}
        onChangeIndex={setSelectedImageIndex}
        onClose={closeModal}
        previousLabel={t("mediaModal.previousImage")}
      />
    </section>
  );
}
