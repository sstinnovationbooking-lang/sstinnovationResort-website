"use client";

import { useTranslations } from "next-intl";

import type { AppLocale } from "@/i18n/config";
import { getLocalizedValue } from "@/lib/i18n/localized";
import type { FooterSocialLinkDTO, FooterSocialPlatform } from "@/lib/types/site";

type FooterSocialLinksProps = {
  socialLinks?: FooterSocialLinkDTO[];
  locale: AppLocale;
};

function isExternalUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

function normalizePlatform(value: FooterSocialPlatform): FooterSocialPlatform {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (!normalized) return "facebook";
  return normalized as FooterSocialPlatform;
}

function SocialIcon({ platform }: { platform: FooterSocialPlatform }) {
  const normalized = normalizePlatform(platform);

  if (normalized === "line") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path
          d="M12 4c4.5 0 8 2.8 8 6.3 0 3.2-2.9 5.8-6.7 6.2l-2.2 2.4c-.2.2-.5.1-.5-.2v-2.2C7.1 16.1 4 13.5 4 10.3 4 6.8 7.5 4 12 4z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <text fill="currentColor" fontFamily="sans-serif" fontSize="4" fontWeight="700" x="7.2" y="12.4">
          LINE
        </text>
      </svg>
    );
  }

  if (normalized === "messenger") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path
          d="M12 4c4.7 0 8.5 3.3 8.5 7.4 0 4-3.8 7.3-8.5 7.3-.8 0-1.6-.1-2.3-.3l-2.9 1.6.8-2.7C5.6 16 3.5 13.4 3.5 11.4 3.5 7.3 7.3 4 12 4z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path d="M8 13.6l3-3 2.2 2.2 3.1-3-3 4.8-2.2-2.2-3.1 1.2z" fill="currentColor" />
      </svg>
    );
  }

  if (normalized === "youtube") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <rect fill="none" height="12" rx="3" ry="3" stroke="currentColor" strokeWidth="1.8" width="18" x="3" y="6" />
        <path d="M10 9.5l5 2.5-5 2.5z" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path
        d="M13.6 20.7V13h2.6l.4-3h-3V8.2c0-.9.3-1.6 1.7-1.6h1.5V3.9c-.8-.1-1.5-.1-2.2-.1-2.2 0-3.8 1.4-3.8 3.9V10H8.6v3h2.2v7.7h2.8z"
        fill="currentColor"
      />
    </svg>
  );
}

export function FooterSocialLinks({ socialLinks, locale }: FooterSocialLinksProps) {
  const t = useTranslations("ResortHome");
  const safeT = (key: string, fallback: string): string => {
    try {
      return t(key as never);
    } catch {
      return fallback;
    }
  };

  const followUsText = safeT("footerFollowUs", "Follow us");
  const platformLabelByType: Record<string, string> = {
    facebook: safeT("footerSocialFacebook", "Facebook"),
    line: safeT("footerSocialLine", "LINE"),
    messenger: safeT("footerSocialMessenger", "Messenger"),
    youtube: safeT("footerSocialYoutube", "YouTube")
  };

  const visibleLinks = [...(socialLinks ?? [])]
    .sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
    .filter((item) => item.enabled !== false && String(item.url ?? "").trim().length > 0)
    .map((item) => {
      const normalizedPlatform = normalizePlatform(item.platform);
      const fallbackLabel = platformLabelByType[normalizedPlatform] ?? "Social";
      const resolvedLabel = getLocalizedValue(item.label, locale, fallbackLabel) || fallbackLabel;
      return {
        ...item,
        platform: normalizedPlatform,
        url: String(item.url ?? "").trim(),
        label: resolvedLabel
      };
    });

  if (!visibleLinks.length) return null;

  return (
    <section aria-label={followUsText} className="footer-social">
      <h5 className="footer-social-title">{followUsText}</h5>
      <div className="footer-social-links">
        {visibleLinks.map((item) => {
          const external = isExternalUrl(item.url);
          return (
            <a
              aria-label={item.label}
              className="footer-social-link"
              href={item.url}
              key={item.id}
              rel={external ? "noopener noreferrer" : undefined}
              target={external ? "_blank" : undefined}
              title={item.label}
            >
              <SocialIcon platform={item.platform} />
            </a>
          );
        })}
      </div>
    </section>
  );
}
