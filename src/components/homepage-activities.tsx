"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { HomepageMediaModal, type HomepageMediaModalItem } from "@/components/homepage-media-modal";
import { DEFAULT_LOCALE, normalizeLocale } from "@/i18n/config";
import {
  DEFAULT_HOMEPAGE_ACTIVITIES,
  HOMEPAGE_ACTIVITIES_MAX_ITEMS,
  sanitizeHomepageActivities
} from "@/lib/content/homepage-activities";
import { getLocalizedValue } from "@/lib/i18n/localized";
import type { HomepageActivityItemDTO, SiteHomeDTO } from "@/lib/types/site";

interface HomepageActivitiesProps {
  home: SiteHomeDTO;
}

type ResolvedActivityItem = HomepageActivityItemDTO & { resolvedImageUrl: string };

const SAFE_ACTIVITY_ENGLISH_FALLBACK = {
  heading: "Our Activities",
  items: {
    tour: "Tours and Attractions",
    kayak: "Fun Activities",
    travel: "Travel Services",
    nature: "Outdoor Activities",
    dining: "Food and Drinks",
    relax: "Relaxation and Spa"
  }
} as const;

const SAFE_ACTIVITY_FALLBACK_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='960' height='600' viewBox='0 0 960 600'%3E%3Cdefs%3E%3ClinearGradient id='a' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%23eaf2ea'/%3E%3Cstop offset='1' stop-color='%23d8e7de'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='960' height='600' fill='url(%23a)'/%3E%3Ccircle cx='760' cy='170' r='96' fill='%23c7ddcf' opacity='0.55'/%3E%3Cpath d='M80 470c120-120 240-120 360 0s240 120 360 0' fill='none' stroke='%23afcbbb' stroke-width='18' stroke-linecap='round'/%3E%3C/svg%3E";

function resolveActivities(home: SiteHomeDTO): {
  section: ReturnType<typeof sanitizeHomepageActivities>;
  visibleItems: ResolvedActivityItem[];
  hasTenantActivitiesSource: boolean;
} {
  const hasTenantActivitiesSource = Boolean(home.homepageActivities);
  const section = sanitizeHomepageActivities(home.homepageActivities ?? DEFAULT_HOMEPAGE_ACTIVITIES);
  const visibleItems = section.items
    .filter((item) => item.isVisible !== false)
    .sort((a, b) => a.order - b.order)
    .slice(0, HOMEPAGE_ACTIVITIES_MAX_ITEMS)
    .map((item, index) => ({
      ...item,
      resolvedImageUrl:
        item.imageUrl ||
        home.gallery[index]?.imageUrl ||
        home.gallery[0]?.imageUrl ||
        home.featuredRooms[index]?.imageUrl ||
        home.featuredRooms[0]?.imageUrl ||
        SAFE_ACTIVITY_FALLBACK_IMAGE
    }));

  return {
    section,
    visibleItems,
    hasTenantActivitiesSource
  };
}

function normalizeText(value: string | undefined): string {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

function isUnsafeDisplayText(value: string): boolean {
  const normalized = normalizeText(value);
  if (!normalized) return true;
  if (/^\?+$/.test(normalized)) return true;
  if (/\?{2,}/.test(normalized)) return true;
  return false;
}

function pickSafeText(...candidates: Array<string | undefined>): string {
  for (const candidate of candidates) {
    const normalized = normalizeText(candidate);
    if (!normalized) continue;
    if (isUnsafeDisplayText(normalized)) continue;
    return normalized;
  }
  return "";
}

const DEFAULT_ACTIVITY_BY_ID: Record<string, HomepageActivityItemDTO> = DEFAULT_HOMEPAGE_ACTIVITIES.items.reduce<
  Record<string, HomepageActivityItemDTO>
>((acc, item) => {
  acc[item.id] = item;
  return acc;
}, {});

export function HomepageActivities({ home }: HomepageActivitiesProps) {
  const t = useTranslations("ResortHome");
  const locale = useLocale();
  const resolvedLocale = normalizeLocale(locale) ?? DEFAULT_LOCALE;
  const [brokenImageById, setBrokenImageById] = useState<Record<string, boolean>>({});
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const { section, visibleItems, hasTenantActivitiesSource } = useMemo(() => resolveActivities(home), [home]);

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

  if (section.isVisible === false || visibleItems.length === 0) {
    return null;
  }

  const modalItems: HomepageMediaModalItem[] = visibleItems.map((item) => {
    const fallbackDetail = tryTranslate("mediaModal.activityFallbackDetail", "Details coming soon.");
    const detailText = pickSafeText(localized(item.description), fallbackDetail);
    const englishItemFallback =
      SAFE_ACTIVITY_ENGLISH_FALLBACK.items[item.id as keyof typeof SAFE_ACTIVITY_ENGLISH_FALLBACK.items] ||
      "Activity";
    const translatedTitleCandidate = tryTranslate(
      `activities.items.${item.id}.title`,
      tryTranslate(`activitiesItems.${item.id}.title`, englishItemFallback)
    );
    const localizedTitle = localized(item.title);
    const title = !hasTenantActivitiesSource
      ? pickSafeText(translatedTitleCandidate, localizedTitle, englishItemFallback)
      : pickSafeText(localizedTitle, translatedTitleCandidate, englishItemFallback);
    const translatedAltCandidate = tryTranslate(
      `activities.items.${item.id}.altText`,
      tryTranslate(`activitiesItems.${item.id}.altText`, title)
    );
    const localizedAlt = localized(item.altText);
    const imageAlt = !hasTenantActivitiesSource
      ? pickSafeText(translatedAltCandidate, localizedAlt, title, englishItemFallback)
      : pickSafeText(localizedAlt, translatedAltCandidate, title, englishItemFallback);
    const imageUrl = brokenImageById[item.id] ? SAFE_ACTIVITY_FALLBACK_IMAGE : item.resolvedImageUrl;

    return {
      id: item.id,
      title,
      description: detailText,
      imageUrl,
      imageAlt
    };
  });

  const localizedHeading = localized(section.heading);
  const shouldTranslateHeading =
    !hasTenantActivitiesSource ||
    normalizeText(localizedHeading) === normalizeText(localized(DEFAULT_HOMEPAGE_ACTIVITIES.heading));
  const translatedHeading = tryTranslate("activities.heading", tryTranslate("activitiesHeading", localizedHeading));
  const heading = shouldTranslateHeading
    ? pickSafeText(translatedHeading, localizedHeading, SAFE_ACTIVITY_ENGLISH_FALLBACK.heading)
    : pickSafeText(localizedHeading, translatedHeading, SAFE_ACTIVITY_ENGLISH_FALLBACK.heading);

  return (
    <section aria-labelledby="activities-title" className="shell section activities-section reveal" id="activities-gallery">
      <div className="section-head activities-head">
        <h2 id="activities-title">{heading}</h2>
      </div>

      <div className="activities-grid">
        {visibleItems.map((item, index) => {
          const defaultItem = DEFAULT_ACTIVITY_BY_ID[item.id];
          const localizedItemTitle = localized(item.title);
          const shouldTranslateItem =
            !hasTenantActivitiesSource ||
            (Boolean(defaultItem) && normalizeText(localizedItemTitle) === normalizeText(localized(defaultItem.title)));
          const englishItemFallback =
            SAFE_ACTIVITY_ENGLISH_FALLBACK.items[item.id as keyof typeof SAFE_ACTIVITY_ENGLISH_FALLBACK.items] ||
            "Activity";
          const translatedTitleCandidate = tryTranslate(
            `activities.items.${item.id}.title`,
            tryTranslate(`activitiesItems.${item.id}.title`, localizedItemTitle || englishItemFallback)
          );
          const translatedTitle = shouldTranslateItem
            ? pickSafeText(translatedTitleCandidate, localizedItemTitle, englishItemFallback)
            : pickSafeText(localizedItemTitle, translatedTitleCandidate, englishItemFallback);
          const translatedAltCandidate = tryTranslate(
            `activities.items.${item.id}.altText`,
            tryTranslate(`activitiesItems.${item.id}.altText`, translatedTitle)
          );
          const localizedAlt = localized(item.altText);
          const translatedAlt = shouldTranslateItem
            ? pickSafeText(translatedAltCandidate, localizedAlt, translatedTitle, englishItemFallback)
            : pickSafeText(localizedAlt, translatedAltCandidate, translatedTitle, englishItemFallback);
          const useFallbackImage = Boolean(brokenImageById[item.id]);
          const imageUrl = useFallbackImage ? SAFE_ACTIVITY_FALLBACK_IMAGE : item.resolvedImageUrl;

          return (
            <article className="activity-card" key={item.id}>
              <button
                aria-label={t("mediaModal.openActivityPreview", { title: translatedTitle })}
                className="activity-card-button"
                onClick={() => setSelectedIndex(index)}
                type="button"
              >
                <div className="activity-image-wrap">
                  <Image
                    alt={translatedAlt}
                    className="activity-image"
                    fill
                    loading="lazy"
                    onError={() => setBrokenImageById((prev) => ({ ...prev, [item.id]: true }))}
                    sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw"
                    src={imageUrl}
                    unoptimized
                  />
                </div>
                <h3 className="activity-title">{translatedTitle}</h3>
              </button>
            </article>
          );
        })}
      </div>

      <HomepageMediaModal
        closeLabel={t("mediaModal.close")}
        currentIndex={selectedIndex ?? 0}
        emptyImageLabel={t("mediaModal.imageUnavailable")}
        isOpen={selectedIndex !== null}
        items={modalItems}
        nextLabel={t("mediaModal.nextActivity")}
        onChangeIndex={setSelectedIndex}
        onClose={() => setSelectedIndex(null)}
        previousLabel={t("mediaModal.previousActivity")}
      />
    </section>
  );
}
