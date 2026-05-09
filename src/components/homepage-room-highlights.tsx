"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import { HomepageMediaModal, type HomepageMediaModalItem } from "@/components/homepage-media-modal";
import { DEFAULT_LOCALE, normalizeLocale } from "@/i18n/config";
import {
  HOMEPAGE_ROOM_HIGHLIGHTS_DEFAULT_DISPLAY_LIMIT,
  DEFAULT_HOMEPAGE_ROOM_HIGHLIGHTS,
  HOMEPAGE_ROOM_HIGHLIGHTS_MAX_ITEMS,
  sanitizeHomepageRoomHighlights
} from "@/lib/content/homepage-room-highlights";
import { getLocalizedValue } from "@/lib/i18n/localized";
import type { HomepageRoomHighlightItemDTO, SiteHomeDTO } from "@/lib/types/site";

interface HomepageRoomHighlightsProps {
  home: SiteHomeDTO;
}

type PositionedHighlightItem = HomepageRoomHighlightItemDTO & { resolvedImagePosition: "left" | "right"; resolvedImageUrl: string };

const SAFE_ROOM_HIGHLIGHT_FALLBACK_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1280' height='840' viewBox='0 0 1280 840'%3E%3Cdefs%3E%3ClinearGradient id='h' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%23ebe2d3'/%3E%3Cstop offset='1' stop-color='%23dce8df'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='1280' height='840' fill='url(%23h)'/%3E%3Cpath d='M120 660c190-190 380-190 570 0s380 190 570 0' fill='none' stroke='%23c7d3c4' stroke-width='26' stroke-linecap='round'/%3E%3Ccircle cx='980' cy='180' r='110' fill='%23d6e0d3' opacity='0.6'/%3E%3C/svg%3E";

function resolveTenantSlug(pathname: string): string | null {
  const match = pathname.match(/^\/site\/([^/?#]+)/i);
  return String(match?.[1] ?? "").trim().toLowerCase() || null;
}

function resolveRoomsHref(tenantSlug: string | null, buttonHref: string | undefined): string {
  const rawHref = String(buttonHref ?? "").trim();
  const tenantRoomsPath = tenantSlug ? `/site/${tenantSlug}/rooms` : "/rooms";
  if (!rawHref) return tenantRoomsPath;
  if (rawHref === "/rooms") return tenantRoomsPath;
  if (/^https?:\/\//i.test(rawHref)) return rawHref;
  if (rawHref.startsWith("mailto:") || rawHref.startsWith("tel:")) return tenantRoomsPath;
  return rawHref;
}

function resolveHighlights(home: SiteHomeDTO): PositionedHighlightItem[] {
  const highlights = sanitizeHomepageRoomHighlights(
    home.homepageRoomHighlights ?? DEFAULT_HOMEPAGE_ROOM_HIGHLIGHTS
  );
  const displayLimit = Math.min(
    HOMEPAGE_ROOM_HIGHLIGHTS_MAX_ITEMS,
    Math.max(1, Math.floor(highlights.displayLimit ?? HOMEPAGE_ROOM_HIGHLIGHTS_DEFAULT_DISPLAY_LIMIT))
  );

  const visible = highlights.items
    .filter((item) => item.isVisible !== false)
    .sort((a, b) => a.order - b.order)
    .slice(0, displayLimit);

  return visible.map((item, index) => {
    const fallbackImage =
      home.featuredRooms[index]?.imageUrl ||
      home.featuredRooms[0]?.imageUrl ||
      home.roomsFeaturedGallery?.[index]?.imageUrl ||
      home.roomsFeaturedGallery?.[0]?.imageUrl ||
      home.gallery[index]?.imageUrl ||
      home.gallery[0]?.imageUrl ||
      "";

    return {
      ...item,
      resolvedImagePosition: item.imagePosition ?? (index % 2 === 0 ? "left" : "right"),
      resolvedImageUrl: item.imageUrl || fallbackImage
    };
  });
}

export function HomepageRoomHighlights({ home }: HomepageRoomHighlightsProps) {
  const pathname = usePathname();
  const t = useTranslations("ResortHome");
  const locale = useLocale();
  const resolvedLocale = normalizeLocale(locale) ?? DEFAULT_LOCALE;
  const [failedImageIds, setFailedImageIds] = useState<Record<string, boolean>>({});
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const highlights = useMemo(() => resolveHighlights(home), [home]);
  const tenantSlug = useMemo(() => resolveTenantSlug(pathname), [pathname]);
  const sectionVisible = home.homepageRoomHighlights?.isVisible !== false;
  const useStaticTranslationFallback = !home.homepageRoomHighlights;

  function localized(value: unknown, fallback = ""): string {
    return getLocalizedValue(value, resolvedLocale, fallback);
  }

  function tryTranslate(key: string, fallback: string): string {
    try {
      return t(key as never);
    } catch {
      return fallback;
    }
  }

  if (!sectionVisible || highlights.length === 0) return null;

  const modalItems: HomepageMediaModalItem[] = highlights.map((item) => {
    const localizedTitle = localized(item.title);
    const title = useStaticTranslationFallback ? tryTranslate(`roomHighlights.${item.id}.title`, localizedTitle) : localizedTitle;
    const description = useStaticTranslationFallback
      ? tryTranslate(`roomHighlights.${item.id}.description`, localized(item.description))
      : localized(item.description);
    const imageUrl =
      !failedImageIds[item.id] && item.resolvedImageUrl
        ? item.resolvedImageUrl
        : SAFE_ROOM_HIGHLIGHT_FALLBACK_IMAGE;

    return {
      id: item.id,
      title,
      description,
      imageUrl,
      imageAlt: localized(item.imageAlt, title) || title
    };
  });

  return (
    <section className="room-highlights-section reveal" id="room-highlights">
      <div className="shell room-highlights-inner">
        {highlights.map((item, index) => {
          const isImageLeft = item.resolvedImagePosition === "left";
          const isImageFailed = Boolean(failedImageIds[item.id]);
          const hasImage = Boolean(item.resolvedImageUrl) && !isImageFailed;
          const buttonText = localized(item.buttonText, t("readMore")) || t("readMore");
          const buttonHref = resolveRoomsHref(tenantSlug, item.buttonHref);
          const localizedTitle = localized(item.title);
          const title = useStaticTranslationFallback ? tryTranslate(`roomHighlights.${item.id}.title`, localizedTitle) : localizedTitle;
          const subtitle = item.subtitle
            ? useStaticTranslationFallback
              ? tryTranslate(`roomHighlights.${item.id}.subtitle`, localized(item.subtitle))
              : localized(item.subtitle)
            : item.subtitle;
          const description = useStaticTranslationFallback
            ? tryTranslate(`roomHighlights.${item.id}.description`, localized(item.description))
            : localized(item.description);

          return (
            <article
              className={`room-highlight-block ${isImageLeft ? "room-highlight-block--image-left" : "room-highlight-block--image-right"}`}
              key={item.id}
            >
              <div className="room-highlight-image-wrap">
                <button
                  aria-label={t("mediaModal.openImagePreview", { title })}
                  className="room-highlight-image-button"
                  onClick={() => setSelectedImageIndex(index)}
                  type="button"
                >
                  {hasImage ? (
                    <Image
                      alt={localized(item.imageAlt, title) || title}
                      className="room-highlight-image"
                      fill
                      onError={() => setFailedImageIds((prev) => ({ ...prev, [item.id]: true }))}
                      sizes="(max-width: 767px) 100vw, 50vw"
                      src={item.resolvedImageUrl}
                      unoptimized
                    />
                  ) : (
                    <div aria-hidden className="room-highlight-image-empty" />
                  )}
                </button>
              </div>

              <div className="room-highlight-content">
                {subtitle ? <p className="room-highlight-subtitle">{subtitle}</p> : null}
                <h3 className="room-highlight-title">{title}</h3>
                <p className="room-highlight-description">{description}</p>
                <Link className="room-highlight-link" href={buttonHref}>
                  <span>{buttonText}</span>
                  <span aria-hidden className="room-highlight-link-arrow">
                    {">"}
                  </span>
                </Link>
              </div>
            </article>
          );
        })}
      </div>

      <HomepageMediaModal
        closeLabel={t("mediaModal.close")}
        currentIndex={selectedImageIndex ?? 0}
        emptyImageLabel={t("mediaModal.imageUnavailable")}
        isOpen={selectedImageIndex !== null}
        items={modalItems}
        nextLabel={t("mediaModal.nextImage")}
        onChangeIndex={setSelectedImageIndex}
        onClose={() => setSelectedImageIndex(null)}
        previousLabel={t("mediaModal.previousImage")}
      />
    </section>
  );
}
