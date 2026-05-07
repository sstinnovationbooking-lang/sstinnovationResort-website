"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import {
  DEFAULT_HOMEPAGE_ROOM_HIGHLIGHTS,
  HOMEPAGE_ROOM_HIGHLIGHTS_MAX_ITEMS,
  sanitizeHomepageRoomHighlights
} from "@/lib/content/homepage-room-highlights";
import type { HomepageRoomHighlightItemDTO, SiteHomeDTO } from "@/lib/types/site";

interface HomepageRoomHighlightsProps {
  home: SiteHomeDTO;
}

type PositionedHighlightItem = HomepageRoomHighlightItemDTO & { resolvedImagePosition: "left" | "right"; resolvedImageUrl: string };

function resolveHighlights(home: SiteHomeDTO): PositionedHighlightItem[] {
  const highlights = sanitizeHomepageRoomHighlights(
    home.homepageRoomHighlights ?? DEFAULT_HOMEPAGE_ROOM_HIGHLIGHTS
  );

  const visible = highlights.items
    .filter((item) => item.isVisible !== false)
    .sort((a, b) => a.order - b.order)
    .slice(0, HOMEPAGE_ROOM_HIGHLIGHTS_MAX_ITEMS);

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
  const t = useTranslations("ResortHome");
  const [failedImageIds, setFailedImageIds] = useState<Record<string, boolean>>({});
  const highlights = useMemo(() => resolveHighlights(home), [home]);
  const sectionVisible = home.homepageRoomHighlights?.isVisible !== false;
  const useStaticTranslationFallback = !home.homepageRoomHighlights;

  function tryTranslate(key: string, fallback: string): string {
    try {
      return t(key as never);
    } catch {
      return fallback;
    }
  }

  if (!sectionVisible || highlights.length === 0) return null;

  return (
    <section className="room-highlights-section reveal" id="room-highlights">
      <div className="shell room-highlights-inner">
        {highlights.map((item) => {
          const isImageLeft = item.resolvedImagePosition === "left";
          const isImageFailed = Boolean(failedImageIds[item.id]);
          const hasImage = Boolean(item.resolvedImageUrl) && !isImageFailed;
          const buttonText = item.buttonText || t("readMore");
          const buttonHref = item.buttonHref || "/rooms";
          const title = useStaticTranslationFallback ? tryTranslate(`roomHighlights.${item.id}.title`, item.title) : item.title;
          const subtitle = item.subtitle
            ? useStaticTranslationFallback
              ? tryTranslate(`roomHighlights.${item.id}.subtitle`, item.subtitle)
              : item.subtitle
            : item.subtitle;
          const description = useStaticTranslationFallback
            ? tryTranslate(`roomHighlights.${item.id}.description`, item.description)
            : item.description;

          return (
            <article
              className={`room-highlight-block ${isImageLeft ? "room-highlight-block--image-left" : "room-highlight-block--image-right"}`}
              key={item.id}
            >
              <div className="room-highlight-image-wrap">
                {hasImage ? (
                  <Image
                    alt={item.imageAlt || title}
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
    </section>
  );
}
