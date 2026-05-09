"use client";

import type { JSX } from "react";
import { useLocale, useTranslations } from "next-intl";

import { DEFAULT_LOCALE, normalizeLocale } from "@/i18n/config";
import { DEFAULT_HOMEPAGE_HOTEL_INFO, sanitizeHomepageHotelInfo } from "@/lib/content/homepage-hotel-info";
import { getLocalizedValue } from "@/lib/i18n/localized";
import type { HomepageHotelInfoItemDTO, SiteHomeDTO } from "@/lib/types/site";

interface HomepageHotelInfoProps {
  home: SiteHomeDTO;
}

interface HotelInfoIconProps {
  iconKey: string;
}

function HotelInfoIcon({ iconKey }: HotelInfoIconProps) {
  const resolvedKey = iconKey.trim().toLowerCase();
  const iconProps = {
    className: "hotel-info-icon",
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.8,
    viewBox: "0 0 24 24"
  };

  const iconMap: Record<string, JSX.Element> = {
    clock: (
      <svg {...iconProps}>
        <circle cx="12" cy="12" r="8.2" />
        <path d="M12 7.8v4.6l3 1.8" />
      </svg>
    ),
    check: (
      <svg {...iconProps}>
        <path d="M5.4 12.4l4.1 4.1 9-9" />
      </svg>
    ),
    bell: (
      <svg {...iconProps}>
        <path d="M12 5.2a4.2 4.2 0 0 0-4.2 4.2V12c0 1.1-.3 2.1-.9 3l-.7 1h11.6l-.7-1c-.6-.9-.9-1.9-.9-3V9.4A4.2 4.2 0 0 0 12 5.2z" />
        <path d="M10.1 18a2.1 2.1 0 0 0 3.8 0" />
      </svg>
    ),
    pet: (
      <svg {...iconProps}>
        <circle cx="8.1" cy="8.5" r="1.6" />
        <circle cx="15.9" cy="8.5" r="1.6" />
        <circle cx="6.1" cy="12.8" r="1.4" />
        <circle cx="17.9" cy="12.8" r="1.4" />
        <path d="M9.3 16.4c0-1.8 1.2-2.9 2.7-2.9s2.7 1.1 2.7 2.9c0 1.3-1.2 2.2-2.7 2.2s-2.7-.9-2.7-2.2z" />
      </svg>
    ),
    parking: (
      <svg {...iconProps}>
        <rect height="16" rx="2.4" width="14" x="5" y="4" />
        <path d="M10 17V7.4h3a2.4 2.4 0 0 1 0 4.8h-3" />
      </svg>
    ),
    info: (
      <svg {...iconProps}>
        <circle cx="12" cy="12" r="8.2" />
        <path d="M12 10.4V16M12 7.8h.01" />
      </svg>
    )
  };

  return iconMap[resolvedKey] ?? iconMap.info;
}

function resolveHotelInfo(home: SiteHomeDTO) {
  const hasTenantHotelInfoSource = Boolean(home.homepageHotelInfo);
  const section = sanitizeHomepageHotelInfo(home.homepageHotelInfo ?? DEFAULT_HOMEPAGE_HOTEL_INFO);
  const visibleItems = section.items
    .filter((item) => item.isVisible !== false)
    .sort((a, b) => a.order - b.order);

  return {
    section,
    visibleItems,
    useStaticTranslationFallback: !hasTenantHotelInfoSource
  };
}

function HotelInfoItem({ item }: { item: HomepageHotelInfoItemDTO }) {
  return (
    <article className="hotel-info-item">
      <div aria-hidden className="hotel-info-icon-wrap">
        <HotelInfoIcon iconKey={item.iconKey} />
      </div>
      <div className="hotel-info-text">
        <h3 className="hotel-info-title">{String(item.title ?? "")}</h3>
        {item.description ? <p className="hotel-info-description">{String(item.description)}</p> : null}
      </div>
    </article>
  );
}

export function HomepageHotelInfo({ home }: HomepageHotelInfoProps) {
  const t = useTranslations("ResortHome");
  const locale = useLocale();
  const resolvedLocale = normalizeLocale(locale) ?? DEFAULT_LOCALE;
  const { section, visibleItems, useStaticTranslationFallback } = resolveHotelInfo(home);

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
    <section aria-labelledby="hotel-info-title" className="hotel-info-section reveal" id="hotel-info">
      <div className="shell">
        <div className="hotel-info-head">
          <h2 id="hotel-info-title">
            {useStaticTranslationFallback
              ? tryTranslate("hotelInfoHeading", localized(section.heading))
              : localized(section.heading, tryTranslate("hotelInfoHeading", ""))}
          </h2>
        </div>

        <div className="hotel-info-grid">
          {visibleItems.map((item) => (
            <HotelInfoItem
              item={{
                ...item,
                title: useStaticTranslationFallback
                  ? tryTranslate(`hotelInfoItems.${item.id}.title`, localized(item.title))
                  : localized(item.title),
                description: item.description
                  ? useStaticTranslationFallback
                    ? tryTranslate(`hotelInfoItems.${item.id}.description`, localized(item.description))
                    : localized(item.description)
                  : item.description
              }}
              key={item.id}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
