"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import { LanguageSwitcher } from "@/components/language-switcher";
import { DEFAULT_LOCALE, normalizeLocale } from "@/i18n/config";
import { getLocalizedValue } from "@/lib/i18n/localized";
import type { NavbarLinkDTO, NavbarSettingsDTO } from "@/lib/types/site";

interface ResortTopNavbarProps {
  brand: string;
  navbar?: NavbarSettingsDTO;
  siteContact?: {
    phoneDisplay?: string;
    phoneTel?: string;
    isVisible?: boolean;
  };
}

const TH_CAMPING_LABEL = "\u0E41\u0E04\u0E21\u0E1B\u0E4C\u0E1B\u0E34\u0E49\u0E07";
const TH_ARTICLES_LABEL = "\u0E1A\u0E17\u0E04\u0E27\u0E32\u0E21";
const EN_ARTICLES_LABEL = "Articles";

const STARTER_NAVBAR: NavbarSettingsDTO = {
  mode: "transparent",
  logo: {
    type: "text",
    primaryText: "SST INNOVATION",
    secondaryText: "RESORT",
    accentColor: "#e86f4c"
  },
  leftLinks: [
    { label: "หน้าแรก", href: "/" },
    { label: "ห้องพัก", href: "/rooms" },
    { label: "กิจกรรม", href: "/activities" },
    { label: "เกี่ยวกับเรา", href: "/about" },
    { label: "ติดต่อเรา", href: "/contact" }
  ],
  rightLinks: [
    { label: "Help", href: "#contact" },
    { label: "Trips", href: "#rooms" }
  ],
  cta: { label: "Sign In or Join", href: "#lead-form" },
  showSearchStrip: false
};

function withFallback(value: NavbarSettingsDTO | undefined): NavbarSettingsDTO {
  if (!value) return STARTER_NAVBAR;
  return {
    ...STARTER_NAVBAR,
    ...value,
    logo: { ...STARTER_NAVBAR.logo, ...value.logo },
    leftLinks: value.leftLinks?.length ? value.leftLinks : STARTER_NAVBAR.leftLinks,
    rightLinks: value.rightLinks?.length ? value.rightLinks : STARTER_NAVBAR.rightLinks
  };
}

function renderLogo(brand: string, settings: NavbarSettingsDTO) {
  const logo = settings.logo;
  if (logo.type === "image" && logo.imageUrl) {
    return (
      <div className="top-logo top-logo-image">
        <Image alt={logo.alt || brand} height={56} src={logo.imageUrl} unoptimized width={160} />
      </div>
    );
  }

  return (
    <div className="top-logo top-logo-text" aria-label={brand}>
      <div className="top-logo-primary">{logo.primaryText || brand}</div>
      <div className="top-logo-secondary">{logo.secondaryText || "RESORT"}</div>
      <div className="top-logo-accent" style={{ borderColor: logo.accentColor || STARTER_NAVBAR.logo.accentColor }} />
    </div>
  );
}

function normalizeNavHref(href?: string | null): string {
  const raw = String(href ?? "").trim();
  if (!raw) return "/";
  const pathOnly = raw.split("#")[0]?.split("?")[0] ?? "/";
  if (!pathOnly || pathOnly === "/") return "/";
  const normalized = pathOnly.startsWith("/") ? pathOnly : `/${pathOnly}`;
  return normalized.replace(/\/+$/, "") || "/";
}

function resolveTenantSlugFromPathname(pathname: string): string | null {
  const match = String(pathname ?? "").match(/^\/site\/([^/?#]+)/i);
  const tenantSlug = String(match?.[1] ?? "").trim().toLowerCase();
  return tenantSlug || null;
}

function resolveTenantAwareNavHref(href: string, tenantSlug: string | null): string {
  const normalized = normalizeNavHref(href);
  if (!tenantSlug) return normalized;

  if (normalized === "/") {
    return `/site/${tenantSlug}`;
  }

  if (normalized.toLowerCase() === "/rooms") {
    return `/site/${tenantSlug}/rooms`;
  }

  if (normalized.toLowerCase() === "/camping") {
    return `/site/${tenantSlug}/camping`;
  }

  if (normalized.toLowerCase() === "/activities") {
    return `/site/${tenantSlug}#activities-gallery`;
  }

  if (normalized.toLowerCase() === "/about") {
    return `/site/${tenantSlug}#hotel-info`;
  }

  if (normalized.toLowerCase() === "/articles") {
    return `/site/${tenantSlug}/articles`;
  }

  return normalized;
}

function toActiveRouteKey(pathname: string): string {
  const cleaned = String(pathname || "/").trim().replace(/\/+$/, "") || "/";
  if (cleaned === "/") return "/";

  const segments = cleaned.split("/").filter(Boolean);
  if (segments[0] === "site") {
    if (segments.length <= 2) return "/";
    const section = segments[2]?.toLowerCase();
    if (!section) return "/";
    return `/${section}`;
  }

  return `/${String(segments[0] || "").toLowerCase()}`;
}

function toTelHref(value: string): string {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const normalized = raw
    .replace(/(?!^\+)[^\d]/g, "")
    .replace(/\s+/g, "");
  return normalized ? `tel:${normalized}` : "";
}

function renderPhoneIcon() {
  return (
    <span aria-hidden className="top-phone-icon">
      <svg viewBox="0 0 24 24">
        <path d="M6.6 3.5h2.8l1.2 4.2-2 1.2a13.5 13.5 0 0 0 6.6 6.6l1.2-2 4.2 1.2v2.8c0 .8-.6 1.5-1.4 1.6-1 .1-2 .2-3 .2-7.3 0-13.2-5.9-13.2-13.2 0-1 .1-2 .2-3 .1-.8.8-1.4 1.6-1.4Z" />
      </svg>
    </span>
  );
}

function ensureCampingLink(links: NavbarLinkDTO[], locale: "th" | "en"): NavbarLinkDTO[] {
  const normalizedLinks = links.map((item) => ({ ...item }));
  const hasCamping = normalizedLinks.some((item) => normalizeNavHref(item.href).toLowerCase() === "/camping");
  if (hasCamping) return normalizedLinks;

  const insertIndex = normalizedLinks.findIndex((item) => normalizeNavHref(item.href).toLowerCase() === "/rooms");
  const campingLink: NavbarLinkDTO = {
    label: locale === "th" ? TH_CAMPING_LABEL : "Camping",
    href: "/camping"
  };

  if (insertIndex < 0) {
    return [...normalizedLinks, campingLink];
  }

  return [...normalizedLinks.slice(0, insertIndex + 1), campingLink, ...normalizedLinks.slice(insertIndex + 1)];
}

function getArticlesLabel(locale: "th" | "en"): string {
  return locale === "th" ? TH_ARTICLES_LABEL : EN_ARTICLES_LABEL;
}

export function ResortTopNavbar({ brand, navbar, siteContact }: ResortTopNavbarProps) {
  const t = useTranslations("Layout");
  const locale = useLocale();
  const resolvedLocale = normalizeLocale(locale) ?? DEFAULT_LOCALE;
  const settings = withFallback(navbar);
  const leftLinks = ensureCampingLink(settings.leftLinks, resolvedLocale);
  const pathname = usePathname();
  const currentTenantSlug = resolveTenantSlugFromPathname(pathname);
  const tenantHomeHref = currentTenantSlug ? `/site/${currentTenantSlug}` : "/";
  const activeRouteKey = toActiveRouteKey(pathname);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDesktopSubmenu, setOpenDesktopSubmenu] = useState<string | null>(null);
  const [isMobileAboutSubmenuOpen, setIsMobileAboutSubmenuOpen] = useState(false);
  const mobileMenuButtonRef = useRef<HTMLButtonElement | null>(null);
  const desktopMainMenuRef = useRef<HTMLElement | null>(null);
  const mobileNavPanelRef = useRef<HTMLDivElement | null>(null);
  const mobileFirstLinkRef = useRef<HTMLAnchorElement | null>(null);
  const phoneDisplay = String(siteContact?.phoneDisplay ?? "").trim();
  const phoneTelRaw = String(siteContact?.phoneTel ?? phoneDisplay).trim();
  const phoneHref = toTelHref(phoneTelRaw);
  const showPhoneContact = siteContact?.isVisible !== false && Boolean(phoneDisplay) && Boolean(phoneHref);

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    const focusTarget = mobileFirstLinkRef.current;
    document.body.style.overflow = "hidden";
    if (focusTarget) {
      window.setTimeout(() => focusTarget.focus(), 0);
    }
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (!openDesktopSubmenu) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (desktopMainMenuRef.current?.contains(target)) return;
      setOpenDesktopSubmenu(null);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenDesktopSubmenu(null);
      }
    };

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [openDesktopSubmenu]);

  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsMobileMenuOpen(false);
        window.setTimeout(() => mobileMenuButtonRef.current?.focus(), 0);
        return;
      }

      if (event.key !== "Tab") return;

      const panel = mobileNavPanelRef.current;
      if (!panel) return;
      const focusableElements = Array.from(
        panel.querySelectorAll<HTMLElement>(
          "a[href], button:not([disabled]), select:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])"
        )
      );
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement as HTMLElement | null;

      if (event.shiftKey) {
        if (activeElement === firstElement || !panel.contains(activeElement)) {
          event.preventDefault();
          lastElement.focus();
        }
        return;
      }

      if (activeElement === lastElement || !panel.contains(activeElement)) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isMobileMenuOpen]);

  function closeMobileMenu(restoreFocus = false) {
    setIsMobileMenuOpen(false);
    setIsMobileAboutSubmenuOpen(false);
    if (restoreFocus) {
      window.setTimeout(() => mobileMenuButtonRef.current?.focus(), 0);
    }
  }

  function resolveNavLabel(label: string, href: string): string {
    const routeKey = toActiveRouteKey(href).toLowerCase();
    if (routeKey === "/") return t("nav.home");
    if (routeKey === "/rooms") return t("nav.rooms");
    if (routeKey === "/camping") return resolvedLocale === "th" ? TH_CAMPING_LABEL : "Camping";
    if (routeKey === "/articles") return getArticlesLabel(resolvedLocale);
    if (routeKey === "/activities") return t("nav.activities");
    if (routeKey === "/about") return t("nav.about");
    if (routeKey === "/contact") return t("nav.contact");
    return getLocalizedValue(label, resolvedLocale, label);
  }

  return (
    <header className={`top-navbar top-navbar--${settings.mode} ${isMobileMenuOpen ? "mobile-open" : ""}`}>
      <div className="top-navbar-overlay" />

      <div className="shell top-navbar-container">
        <button
          aria-controls="mobile-primary-nav-panel"
          aria-expanded={isMobileMenuOpen}
          aria-label={isMobileMenuOpen ? t("closeMenu") : t("openMenu")}
          className={`mobile-menu-btn ${isMobileMenuOpen ? "is-open" : ""}`}
          onClick={() =>
            setIsMobileMenuOpen((value) => {
              const next = !value;
              if (!next) {
                setIsMobileAboutSubmenuOpen(false);
              }
              return next;
            })
          }
          ref={mobileMenuButtonRef}
          type="button"
        >
          <span />
          <span />
          <span />
        </button>

        <Link aria-label={t("goHome")} className="top-logo-link" href={tenantHomeHref} onClick={() => closeMobileMenu()}>
          {renderLogo(brand, settings)}
        </Link>

        <nav className="top-main-menu" aria-label="Primary" ref={desktopMainMenuRef}>
          {leftLinks.map((item) => {
            const routeKey = toActiveRouteKey(item.href).toLowerCase();
            const href = resolveTenantAwareNavHref(item.href, currentTenantSlug);
            const isActive = routeKey === activeRouteKey;
            const label = resolveNavLabel(item.label, item.href);

            if (routeKey === "/about") {
              const articlesHref = resolveTenantAwareNavHref("/articles", currentTenantSlug);
              const isAboutGroupActive = activeRouteKey === "/about" || activeRouteKey === "/articles";
              const isSubmenuOpen = openDesktopSubmenu === "about";
              const aboutLabel = label;

              return (
                <div
                  className={`top-menu-item top-menu-item--has-submenu ${isSubmenuOpen ? "is-open" : ""} ${isAboutGroupActive ? "is-active" : ""}`}
                  key={`${item.label}-${item.href}`}
                  onMouseEnter={() => setOpenDesktopSubmenu("about")}
                  onMouseLeave={() => setOpenDesktopSubmenu(null)}
                >
                  <div className="top-submenu-anchor-row">
                    <Link
                      aria-current={activeRouteKey === "/about" ? "page" : undefined}
                      className={`top-submenu-trigger ${isAboutGroupActive ? "active" : ""}`}
                      href={href}
                    >
                      <span>{aboutLabel}</span>
                    </Link>
                    <button
                      aria-controls="top-about-submenu"
                      aria-expanded={isSubmenuOpen}
                      aria-haspopup="menu"
                      className={`top-submenu-toggle-btn ${isAboutGroupActive ? "active" : ""}`}
                      onClick={() => setOpenDesktopSubmenu((value) => (value === "about" ? null : "about"))}
                      onKeyDown={(event) => {
                        if (event.key === "ArrowDown" || event.key === " " || event.key === "Enter") {
                          event.preventDefault();
                          setOpenDesktopSubmenu("about");
                        }
                      }}
                      type="button"
                    >
                      <span aria-hidden className="top-submenu-caret">v</span>
                      <span className="visually-hidden">{getArticlesLabel(resolvedLocale)}</span>
                    </button>
                  </div>

                  <div className="top-submenu-panel" id="top-about-submenu" role="menu">
                    <Link
                      aria-current={activeRouteKey === "/articles" ? "page" : undefined}
                      className={activeRouteKey === "/articles" ? "active" : undefined}
                      href={articlesHref}
                      onClick={() => setOpenDesktopSubmenu(null)}
                      role="menuitem"
                    >
                      {getArticlesLabel(resolvedLocale)}
                    </Link>
                  </div>
                </div>
              );
            }

            return (
              <Link
                aria-current={isActive ? "page" : undefined}
                className={isActive ? "active" : undefined}
                href={href}
                key={`${item.label}-${item.href}`}
              >
              {label}
              </Link>
            );
          })}
        </nav>

        <div className="top-right-menu">
          <LanguageSwitcher />
          {showPhoneContact ? (
            <a
              aria-label={t("callAria", { phone: phoneDisplay })}
              className="top-phone-link"
              href={phoneHref}
            >
              {renderPhoneIcon()}
              <span className="top-phone-label">{phoneDisplay}</span>
            </a>
          ) : null}
        </div>
      </div>

      <div className={`mobile-nav-panel ${isMobileMenuOpen ? "is-open" : ""}`} id="mobile-primary-nav-panel" ref={mobileNavPanelRef}>
        <div className="mobile-nav-header">
          <button aria-label={t("closeMenu")} className="mobile-close-btn" onClick={() => closeMobileMenu(true)} type="button">
            X
          </button>
          <div className="mobile-logo-wrap">
            <Link aria-label={t("goHome")} className="top-logo-link" href={tenantHomeHref} onClick={() => closeMobileMenu()}>
              {renderLogo(brand, settings)}
            </Link>
          </div>
        </div>

        <nav aria-label="Mobile Primary" className="mobile-nav-links">
          {leftLinks.map((item, index) => {
            const routeKey = toActiveRouteKey(item.href).toLowerCase();
            const href = resolveTenantAwareNavHref(item.href, currentTenantSlug);
            const isActive = routeKey === activeRouteKey;
            const label = resolveNavLabel(item.label, item.href);
            const firstLinkRef = index === 0 ? mobileFirstLinkRef : undefined;

            if (routeKey === "/about") {
              const articlesHref = resolveTenantAwareNavHref("/articles", currentTenantSlug);
              const isAboutGroupActive = activeRouteKey === "/about" || activeRouteKey === "/articles";

              return (
                <div
                  className={`mobile-nav-submenu ${isMobileAboutSubmenuOpen ? "is-open" : ""} ${isAboutGroupActive ? "is-active" : ""}`}
                  key={`mobile-link-${item.label}-${item.href}`}
                >
                  <div className={`mobile-nav-submenu-top ${isAboutGroupActive ? "active" : ""}`}>
                    <Link
                      aria-current={activeRouteKey === "/about" ? "page" : undefined}
                      className={`mobile-nav-submenu-main-link ${activeRouteKey === "/about" ? "active" : ""}`}
                      href={href}
                      onClick={() => closeMobileMenu()}
                      ref={firstLinkRef}
                    >
                      <span>{label}</span>
                      <span aria-hidden>{">"}</span>
                    </Link>
                    <button
                      aria-controls="mobile-about-submenu"
                      aria-expanded={isMobileAboutSubmenuOpen}
                      className={`mobile-nav-submenu-trigger ${isAboutGroupActive ? "active" : ""}`}
                      onClick={() => setIsMobileAboutSubmenuOpen((value) => !value)}
                      type="button"
                    >
                      <span aria-hidden>{isMobileAboutSubmenuOpen ? "-" : "+"}</span>
                    </button>
                  </div>

                  <div className="mobile-nav-submenu-links" id="mobile-about-submenu">
                    <Link
                      aria-current={activeRouteKey === "/articles" ? "page" : undefined}
                      className={activeRouteKey === "/articles" ? "active" : undefined}
                      href={articlesHref}
                      onClick={() => closeMobileMenu()}
                    >
                      <span>{getArticlesLabel(resolvedLocale)}</span>
                      <span aria-hidden>{">"}</span>
                    </Link>
                  </div>
                </div>
              );
            }

            return (
              <Link
                aria-current={isActive ? "page" : undefined}
                className={isActive ? "active" : undefined}
                href={href}
                key={`mobile-link-${item.label}-${item.href}`}
                onClick={() => closeMobileMenu()}
                ref={firstLinkRef}
              >
              <span>{label}</span>
              <span aria-hidden>{">"}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mobile-nav-footer">
          <LanguageSwitcher />
          {showPhoneContact ? (
            <a
              aria-label={t("callAria", { phone: phoneDisplay })}
              className="mobile-phone-link"
              href={phoneHref}
              onClick={() => closeMobileMenu()}
            >
              {renderPhoneIcon()}
              <span className="mobile-phone-label">{phoneDisplay}</span>
            </a>
          ) : null}
        </div>
      </div>
    </header>
  );
}

