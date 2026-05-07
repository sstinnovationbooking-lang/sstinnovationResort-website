"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import { LanguageSwitcher } from "@/components/language-switcher";
import { DEFAULT_LOCALE, normalizeLocale } from "@/i18n/config";
import { getLocalizedValue } from "@/lib/i18n/localized";
import type { NavbarSettingsDTO } from "@/lib/types/site";

interface ResortTopNavbarProps {
  brand: string;
  navbar?: NavbarSettingsDTO;
  siteContact?: {
    phoneDisplay?: string;
    phoneTel?: string;
    isVisible?: boolean;
  };
}

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

export function ResortTopNavbar({ brand, navbar, siteContact }: ResortTopNavbarProps) {
  const t = useTranslations("Layout");
  const locale = useLocale();
  const resolvedLocale = normalizeLocale(locale) ?? DEFAULT_LOCALE;
  const settings = withFallback(navbar);
  const pathname = usePathname();
  const activeRouteKey = toActiveRouteKey(pathname);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuButtonRef = useRef<HTMLButtonElement | null>(null);
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
    if (restoreFocus) {
      window.setTimeout(() => mobileMenuButtonRef.current?.focus(), 0);
    }
  }

  function resolveNavLabel(label: string, href: string): string {
    const normalized = normalizeNavHref(href).toLowerCase();
    if (normalized === "/") return t("nav.home");
    if (normalized === "/rooms") return t("nav.rooms");
    if (normalized === "/activities") return t("nav.activities");
    if (normalized === "/about") return t("nav.about");
    if (normalized === "/contact") return t("nav.contact");
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
          onClick={() => setIsMobileMenuOpen((value) => !value)}
          ref={mobileMenuButtonRef}
          type="button"
        >
          <span />
          <span />
          <span />
        </button>

        <Link aria-label={t("goHome")} className="top-logo-link" href="/" onClick={() => closeMobileMenu()}>
          {renderLogo(brand, settings)}
        </Link>

        <nav className="top-main-menu" aria-label="Primary">
          {settings.leftLinks.map((item) => {
            const href = normalizeNavHref(item.href);
            const isActive = href.toLowerCase() === activeRouteKey;
            const label = resolveNavLabel(item.label, href);
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
            <Link aria-label={t("goHome")} className="top-logo-link" href="/" onClick={() => closeMobileMenu()}>
              {renderLogo(brand, settings)}
            </Link>
          </div>
        </div>

        <nav aria-label="Mobile Primary" className="mobile-nav-links">
          {settings.leftLinks.map((item, index) => {
            const href = normalizeNavHref(item.href);
            const isActive = href.toLowerCase() === activeRouteKey;
            const label = resolveNavLabel(item.label, href);
            return (
              <Link
                aria-current={isActive ? "page" : undefined}
                className={isActive ? "active" : undefined}
                href={href}
                key={`mobile-link-${item.label}-${item.href}`}
                onClick={() => closeMobileMenu()}
                ref={index === 0 ? mobileFirstLinkRef : undefined}
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
