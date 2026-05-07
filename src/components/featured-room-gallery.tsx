"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";

import {
  DEFAULT_ROOMS_FEATURED_GALLERY,
  ROOMS_FEATURED_GALLERY_MAX_ITEMS,
  sanitizeRoomsFeaturedGallery
} from "@/lib/content/rooms-featured-gallery";
import type { FeaturedGalleryItemDTO, SiteHomeDTO } from "@/lib/types/site";

interface FeaturedRoomGalleryProps {
  home: SiteHomeDTO;
}

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
  const { items: featuredGalleryItems, useStaticTranslationFallback } = resolveFeaturedGalleryItems(home);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [slideStep, setSlideStep] = useState(0);

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

  const handlePrev = () => setCurrentIndex(Math.max(0, boundedCurrentIndex - 1));
  const handleNext = () => setCurrentIndex(Math.min(maxIndex, boundedCurrentIndex + 1));

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
          {featuredGalleryItems.map((item) => {
            const title = useStaticTranslationFallback
              ? tryTranslate(`featuredGallery.${item.id}.title`, item.title)
              : item.title;
            const sizeText = useStaticTranslationFallback
              ? tryTranslate(`featuredGallery.${item.id}.sizeText`, item.sizeText)
              : item.sizeText;
            return (
            <article className="rooms-featured-card" key={item.id}>
              {item.imageUrl ? (
                <Image
                  alt={item.altText || title}
                  className="rooms-featured-card-image"
                  fill
                  loading="lazy"
                  sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw"
                  src={item.imageUrl}
                  unoptimized
                />
              ) : (
                <div aria-hidden className="rooms-featured-card-image rooms-featured-card-image--empty" />
              )}
              <div aria-hidden className="rooms-featured-card-overlay" />
              <div className="rooms-featured-card-text">
                <h2 className="rooms-featured-card-title">{title}</h2>
                <p className="rooms-featured-card-size">{sizeText}</p>
              </div>
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
    </section>
  );
}
