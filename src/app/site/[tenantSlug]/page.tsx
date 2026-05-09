import type { Metadata } from "next";
import { createTranslator } from "next-intl";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { ResortHome } from "@/components/resort-home";
import { StatusNoticePage } from "@/components/status-notice-page";
import {
  LOCALE_QUERY_PARAM,
  LOCALE_TO_BCP47,
  SUPPORTED_LOCALES,
  resolveLocaleFromCookieHeader
} from "@/i18n/config";
import { loadMessages } from "@/i18n/messages";
import { getContentAdapter } from "@/lib/content/get-adapter";
import { getLocalizedValue } from "@/lib/i18n/localized";
import { classifyStatusFromError, safeDevErrorDetail } from "@/lib/status-notice";
import { resolveTenant } from "@/lib/tenant-resolver";
import type { SiteHomeDTO } from "@/lib/types/site";

interface PageProps {
  params: Promise<{ tenantSlug: string }>;
}

function isDemoTenantSlug(tenantSlug: string): boolean {
  return tenantSlug.startsWith("demo-") || tenantSlug.includes("demo");
}

function getBasePathFromHeaders(headerStore: Awaited<ReturnType<typeof headers>>): string | undefined {
  const host = String(headerStore.get("x-forwarded-host") ?? headerStore.get("host") ?? "")
    .split(",")[0]
    .trim();
  if (!host) return undefined;

  const proto = String(headerStore.get("x-forwarded-proto") ?? "https")
    .split(",")[0]
    .trim();
  return `${proto}://${host}`;
}

function inferMetadataBase(rawHost: string | null): URL | undefined {
  const host = String(rawHost ?? "").trim();
  if (!host) return undefined;
  return new URL(`https://${host}`);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tenantSlug } = await params;
  const isDemoTenant = isDemoTenantSlug(tenantSlug);
  const headerStore = await headers();
  const localeFromCookie = resolveLocaleFromCookieHeader(headerStore.get("cookie"));
  const { locale, messages } = await loadMessages(localeFromCookie);
  const mt = createTranslator({ locale, messages, namespace: "Metadata" });
  const rawHost = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  const tenant = resolveTenant({ rawHost, tenantSlug, enforceHostTenant: true });

  if (!tenant) {
    return {
      title: mt("tenantFallbackTitle"),
      description: mt("tenantFallbackDescription"),
      robots: { index: false, follow: false }
    };
  }

  try {
    const adapter = getContentAdapter({ basePath: getBasePathFromHeaders(headerStore) });
    const home = await adapter.getSiteHome(tenantSlug);
    const title = `${home.tenant.brand} | ${mt("siteTitleSuffix")}`;
    const description = getLocalizedValue(home.hero.subtitle, locale, mt("defaultDescription")) || mt("defaultDescription");
    const canonicalPath = `/site/${home.tenant.tenantSlug}`;
    const metadataBase = inferMetadataBase(rawHost);
    const languageAlternates = Object.fromEntries(
      SUPPORTED_LOCALES.map((item) => [item, `${canonicalPath}?${LOCALE_QUERY_PARAM}=${item}`])
    );

    return {
      title,
      description,
      metadataBase,
      alternates: { canonical: canonicalPath, languages: languageAlternates },
      openGraph: {
        title,
        description,
        url: canonicalPath,
        type: "website",
        locale: LOCALE_TO_BCP47[locale],
        images: [{ url: home.hero.heroImageUrl }]
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [home.hero.heroImageUrl]
      },
      robots: { index: !isDemoTenant, follow: !isDemoTenant }
    };
  } catch {
    return {
      title: `${tenant.brand} | ${mt("siteTitleSuffix")}`,
      description: mt("defaultDescription"),
      robots: { index: !isDemoTenant, follow: !isDemoTenant }
    };
  }
}

export default async function TenantPage({ params }: PageProps) {
  const { tenantSlug } = await params;
  const headerStore = await headers();
  const localeFromCookie = resolveLocaleFromCookieHeader(headerStore.get("cookie"));
  const { locale, messages } = await loadMessages(localeFromCookie);
  const t = createTranslator({ locale, messages, namespace: "TenantPage" });
  const tenant = resolveTenant({
    rawHost: headerStore.get("x-forwarded-host") ?? headerStore.get("host"),
    tenantSlug,
    enforceHostTenant: true
  });

  if (!tenant) notFound();

  let homeData: SiteHomeDTO | null = null;
  let fallbackError: unknown = null;

  try {
    const adapter = getContentAdapter({ basePath: getBasePathFromHeaders(headerStore) });
    homeData = await adapter.getSiteHome(tenantSlug);
  } catch (error) {
    fallbackError = error;
  }

  if (!homeData) {
    const status = classifyStatusFromError(fallbackError ?? t("serviceUnavailable"));
    const detail = safeDevErrorDetail(fallbackError);
    return (
      <StatusNoticePage
        detail={detail}
        status={status}
        tenantBrand={tenant.brand}
        tenantSlug={tenant.tenantSlug}
      />
    );
  }

  return (
    <ResortHome
      home={homeData}
      navbar={homeData.ui?.navbar}
    />
  );
}
