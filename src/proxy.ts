import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE_NAME,
  LOCALE_QUERY_PARAM,
  normalizeLocale
} from "@/i18n/config";
import { isKnownTenantSlug } from "@/lib/tenants/registry";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function cookieOptions() {
  return {
    path: "/",
    sameSite: "lax" as const,
    maxAge: COOKIE_MAX_AGE
  };
}

function tenantSlugFromSitePath(pathname: string): string | null {
  const match = pathname.match(/^\/site\/([^/?#]+)/i);
  if (!match?.[1]) return null;
  return match[1].trim().toLowerCase();
}

export function proxy(request: NextRequest) {
  const nextUrl = request.nextUrl;
  const pathTenantSlug = tenantSlugFromSitePath(nextUrl.pathname);

  // Explicit unknown tenant routes must return true 404.
  if (pathTenantSlug && !isKnownTenantSlug(pathTenantSlug)) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const localeQuery = normalizeLocale(nextUrl.searchParams.get(LOCALE_QUERY_PARAM));

  if (localeQuery) {
    const redirectUrl = nextUrl.clone();
    redirectUrl.searchParams.delete(LOCALE_QUERY_PARAM);

    const response = NextResponse.redirect(redirectUrl);
    response.cookies.set(LOCALE_COOKIE_NAME, localeQuery, cookieOptions());
    return response;
  }

  const localeCookie = normalizeLocale(request.cookies.get(LOCALE_COOKIE_NAME)?.value);
  if (!localeCookie) {
    const response = NextResponse.next();
    response.cookies.set(LOCALE_COOKIE_NAME, DEFAULT_LOCALE, cookieOptions());
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\..*).*)"]
};
