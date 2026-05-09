"use client";

import type { JSX } from "react";
import { useLocale, useTranslations } from "next-intl";

import { DEFAULT_LOCALE, normalizeLocale } from "@/i18n/config";
import { DEFAULT_HOMEPAGE_AMENITIES, sanitizeHomepageAmenities } from "@/lib/content/homepage-amenities";
import { getLocalizedValue } from "@/lib/i18n/localized";
import type { HomepageAmenityItemDTO, SiteHomeDTO } from "@/lib/types/site";

interface HomepageAmenitiesProps {
  home: SiteHomeDTO;
}

interface AmenityIconProps {
  iconKey: string;
}

function AmenityIcon({ iconKey }: AmenityIconProps) {
  const resolvedKey = iconKey.trim().toLowerCase();

  const iconProps = {
    className: "amenity-icon",
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.8,
    viewBox: "0 0 24 24"
  };

  const iconMap: Record<string, JSX.Element> = {
    "security-camera": (
      <svg {...iconProps}>
        <path d="M3 10.5h8.6l3.2 2.7V7.8L11.6 10.5H3z" />
        <path d="M4.5 10.5V8.8a2 2 0 0 1 2-2h4.8a2 2 0 0 1 2 2v4.4" />
        <circle cx="6.8" cy="13.8" r="1.8" />
        <path d="M4.2 17.5h7.6" />
      </svg>
    ),
    laundry: (
      <svg {...iconProps}>
        <rect height="15" rx="2.2" width="14" x="5" y="4.5" />
        <circle cx="12" cy="12.4" r="3.5" />
        <path d="M8.2 7.6h1.4M11.1 7.6h1.4M14 7.6h1.4" />
      </svg>
    ),
    shuttle: (
      <svg {...iconProps}>
        <path d="M4 14.2h16v-4.3a2.3 2.3 0 0 0-2.3-2.3h-8l-3.3 2.8a2.3 2.3 0 0 0-.8 1.8z" />
        <circle cx="8.1" cy="16.4" r="1.8" />
        <circle cx="16" cy="16.4" r="1.8" />
        <path d="M13 8v4.2M6.8 9.6h3.8" />
      </svg>
    ),
    wifi: (
      <svg {...iconProps}>
        <path d="M3.8 9.6a12.8 12.8 0 0 1 16.4 0" />
        <path d="M6.8 12.7a8.2 8.2 0 0 1 10.4 0" />
        <path d="M9.9 15.8a3.7 3.7 0 0 1 4.2 0" />
        <circle cx="12" cy="19" r="1.1" />
      </svg>
    ),
    breakfast: (
      <svg {...iconProps}>
        <path d="M4.8 8.5h14.4v5.7a2.6 2.6 0 0 1-2.6 2.6H7.4a2.6 2.6 0 0 1-2.6-2.6z" />
        <path d="M8.2 8.5V7a1.7 1.7 0 0 1 3.4 0v1.5M12.4 8.5V7a1.7 1.7 0 0 1 3.4 0v1.5" />
        <path d="M4 16.8h16" />
      </svg>
    ),
    support: (
      <svg {...iconProps}>
        <circle cx="12" cy="8.2" r="3.2" />
        <path d="M6.2 18.7a6 6 0 0 1 11.6 0" />
        <path d="M4.5 12.4a7.5 7.5 0 0 1 2.6-5.7M19.5 12.4a7.5 7.5 0 0 0-2.6-5.7" />
      </svg>
    )
  };

  return iconMap[resolvedKey] ?? (
    <svg {...iconProps}>
      <circle cx="12" cy="12" r="7.2" />
      <path d="M12 8.5v4.6M12 16h.01" />
    </svg>
  );
}

function resolveAmenities(home: SiteHomeDTO) {
  const hasTenantAmenitiesSource = Boolean(home.homepageAmenities);
  const section = sanitizeHomepageAmenities(home.homepageAmenities ?? DEFAULT_HOMEPAGE_AMENITIES);
  const visibleItems = section.items
    .filter((item) => item.isVisible !== false)
    .sort((a, b) => a.order - b.order)
    .slice(0, 6);

  return {
    section,
    visibleItems,
    useStaticTranslationFallback: !hasTenantAmenitiesSource
  };
}

function AmenityCard({ item }: { item: HomepageAmenityItemDTO }) {
  return (
    <article className="amenity-card">
      <div aria-hidden className="amenity-icon-wrap">
        <AmenityIcon iconKey={item.iconKey} />
      </div>
      <h3 className="amenity-title">{String(item.title ?? "")}</h3>
    </article>
  );
}

export function HomepageAmenities({ home }: HomepageAmenitiesProps) {
  const t = useTranslations("ResortHome");
  const locale = useLocale();
  const resolvedLocale = normalizeLocale(locale) ?? DEFAULT_LOCALE;
  const { section, visibleItems, useStaticTranslationFallback } = resolveAmenities(home);

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

  return (
    <section aria-labelledby="amenities-title" className="shell section amenities-section reveal" id="amenities">
      <div className="amenities-head">
        <span className="amenities-eyebrow">
          {useStaticTranslationFallback
            ? tryTranslate("amenitiesEyebrow", localized(section.eyebrow))
            : localized(section.eyebrow, tryTranslate("amenitiesEyebrow", ""))}
        </span>
        <h2 id="amenities-title">
          {useStaticTranslationFallback
            ? tryTranslate("amenitiesHeading", localized(section.heading))
            : localized(section.heading, tryTranslate("amenitiesHeading", ""))}
        </h2>
      </div>

      <div className="amenities-grid">
        {visibleItems.map((item) => {
          const localizedTitle = localized(item.title);
          return (
            <AmenityCard
              item={{
                ...item,
                title: useStaticTranslationFallback
                  ? tryTranslate(`amenitiesItems.${item.id}.title`, localizedTitle)
                  : localizedTitle
              }}
              key={item.id}
            />
          );
        })}
      </div>
    </section>
  );
}
