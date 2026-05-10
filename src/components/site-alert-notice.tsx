"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "next-intl";

import { DEFAULT_LOCALE, normalizeLocale } from "@/i18n/config";
import { getLocalizedValue } from "@/lib/i18n/localized";
import type { SiteAlertButtonDTO, SiteAlertSettingsDTO } from "@/lib/types/site";

interface SiteAlertNoticeProps {
  tenantSlug: string;
  alerts?: SiteAlertSettingsDTO;
}

const ALERT_LOGO_SRC = "/assets/alerts/central-alert-logo.png";

const TH_TEXT = {
  maintenanceTitle: "ขออภัย! เว็บไซต์กำลังปิดปรับปรุง",
  maintenanceMessage: "เพื่อการปรับปรุงระบบและหน้าเว็บไซต์ให้มีประสิทธิภาพมากขึ้น",
  maintenanceDetail: "ขณะนี้ระบบอยู่ระหว่างการปรับปรุง กรุณากลับมาอีกครั้งภายหลัง",
  paymentTitle: "ไม่สามารถเข้าใช้งานเว็บไซต์ได้ เนื่องจากระบบมีค้างชำระ",
  paymentMessage: "กรุณาชำระค่าบริการที่ค้างชำระ เพื่อเปิดการใช้งานเว็บไซต์อีกครั้ง",
  paymentDetail: "หากชำระแล้ว กรุณารอสักครู่หรือติดต่อเจ้าหน้าที่",
  bannerTitle: "แจ้งเพื่อทราบ: จะมีการปรับปรุงระบบและเว็บไซต์ ในช่วงเวลา 01:00 - 04:00 น.",
  bannerDetail: "ในช่วงเวลาดังกล่าว อาจไม่สามารถใช้งานบางฟังก์ชันได้ ขออภัยในความไม่สะดวก",
  closeNotice: "ปิดแจ้งเตือน",
  backHome: "กลับสู่หน้าแรก",
  contactSupport: "ติดต่อเจ้าหน้าที่",
  reviewPayment: "ตรวจสอบการชำระเงิน",
  continue: "ดำเนินการต่อ",
  logoAlt: "โลโก้ระบบส่วนกลาง"
};

const EN_TEXT = {
  maintenanceTitle: "Sorry! This website is under maintenance",
  maintenanceMessage: "We are improving the system and website for better performance.",
  maintenanceDetail: "The system is currently under maintenance. Please come back later.",
  paymentTitle: "Website access is locked due to overdue payment",
  paymentMessage: "Please settle outstanding payment to reactivate the website.",
  paymentDetail: "If payment is completed, please wait a moment or contact support.",
  bannerTitle: "Notice: System and website maintenance is scheduled from 01:00 - 04:00.",
  bannerDetail: "During this period, some features may be temporarily unavailable.",
  closeNotice: "Close notice",
  backHome: "Back to home",
  contactSupport: "Contact support",
  reviewPayment: "Review payment status",
  continue: "Continue",
  logoAlt: "Central system logo"
};

function resolveTenantAwareHref(tenantSlug: string, href: string): string {
  const normalized = String(href ?? "").trim();
  if (!normalized) return `/site/${tenantSlug}`;
  if (normalized.startsWith("http://") || normalized.startsWith("https://")) return normalized;
  if (normalized.startsWith("/site/")) return normalized;
  if (normalized === "/") return `/site/${tenantSlug}`;
  if (normalized.startsWith("/")) return `/site/${tenantSlug}${normalized}`;
  return normalized;
}

function resolveLocalizedText(value: unknown, locale: "th" | "en", fallback: string): string {
  const resolved = getLocalizedValue(value, locale, fallback).trim();
  return resolved || fallback;
}

function buildDefaultButtons(
  mode: NonNullable<SiteAlertSettingsDTO["mode"]>,
  locale: "th" | "en",
  tenantSlug: string
): SiteAlertButtonDTO[] {
  const text = locale === "th" ? TH_TEXT : EN_TEXT;

  if (mode === "lock_maintenance") {
    return [
      {
        label: text.backHome,
        href: `/site/${tenantSlug}`,
        style: "primary"
      }
    ];
  }

  if (mode === "lock_payment_overdue") {
    return [
      {
        label: text.contactSupport,
        href: `/site/${tenantSlug}/contact`,
        style: "secondary"
      },
      {
        label: text.reviewPayment,
        href: `/site/${tenantSlug}/contact?topic=payment`,
        style: "primary"
      }
    ];
  }

  return [];
}

export function SiteAlertNotice({ tenantSlug, alerts }: SiteAlertNoticeProps) {
  const locale = normalizeLocale(useLocale()) ?? DEFAULT_LOCALE;
  const text = locale === "th" ? TH_TEXT : EN_TEXT;
  const mode = alerts?.enabled === false ? "none" : alerts?.mode ?? "none";
  const isLockMode = mode === "lock_maintenance" || mode === "lock_payment_overdue";
  const isBannerMode = mode === "banner_maintenance";
  const bannerRef = useRef<HTMLDivElement | null>(null);
  const bannerMessageFingerprint =
    typeof alerts?.bannerMessage === "string"
      ? alerts.bannerMessage
      : JSON.stringify(alerts?.bannerMessage ?? "");
  const bannerNoticeId = String(alerts?.noticeId ?? `${mode}-${bannerMessageFingerprint}`).trim();
  const [dismissedNoticeId, setDismissedNoticeId] = useState<string | null>(null);
  const isBannerDismissed = dismissedNoticeId !== null && dismissedNoticeId === bannerNoticeId;

  const lockTitle = useMemo(
    () =>
      resolveLocalizedText(
        alerts?.title,
        locale,
        mode === "lock_payment_overdue" ? text.paymentTitle : text.maintenanceTitle
      ),
    [alerts?.title, locale, mode, text.maintenanceTitle, text.paymentTitle]
  );

  const lockMessage = useMemo(
    () =>
      resolveLocalizedText(
        alerts?.message,
        locale,
        mode === "lock_payment_overdue" ? text.paymentMessage : text.maintenanceMessage
      ),
    [alerts?.message, locale, mode, text.maintenanceMessage, text.paymentMessage]
  );

  const lockDescription = useMemo(
    () =>
      resolveLocalizedText(
        alerts?.description,
        locale,
        mode === "lock_payment_overdue" ? text.paymentDetail : text.maintenanceDetail
      ),
    [alerts?.description, locale, mode, text.maintenanceDetail, text.paymentDetail]
  );

  const bannerTitle = resolveLocalizedText(alerts?.bannerMessage ?? alerts?.message, locale, text.bannerTitle);
  const bannerDetail = resolveLocalizedText(alerts?.bannerDetail ?? alerts?.description, locale, text.bannerDetail);

  const configuredButtons = Array.isArray(alerts?.buttons) ? alerts.buttons : [];
  const buttons = configuredButtons.length > 0 ? configuredButtons : buildDefaultButtons(mode, locale, tenantSlug);

  useEffect(() => {
    if (!isLockMode) {
      document.body.classList.remove("site-alert-lock-active");
      return;
    }
    document.body.classList.add("site-alert-lock-active");
    return () => {
      document.body.classList.remove("site-alert-lock-active");
    };
  }, [isLockMode]);

  useEffect(() => {
    if (!isBannerMode || isBannerDismissed) {
      document.documentElement.style.setProperty("--site-alert-banner-h", "0px");
      return;
    }

    const element = bannerRef.current;
    if (!element) return;

    const updateHeight = () => {
      document.documentElement.style.setProperty(
        "--site-alert-banner-h",
        `${Math.ceil(element.getBoundingClientRect().height)}px`
      );
    };

    updateHeight();
    const resizeObserver = new ResizeObserver(() => updateHeight());
    resizeObserver.observe(element);
    window.addEventListener("resize", updateHeight);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateHeight);
      document.documentElement.style.setProperty("--site-alert-banner-h", "0px");
    };
  }, [isBannerDismissed, isBannerMode, bannerTitle, bannerDetail]);

  if (!alerts || mode === "none") {
    return null;
  }

  return (
    <>
      {isBannerMode && !isBannerDismissed ? (
        <div className="site-alert-top-banner" ref={bannerRef} role="status">
          <div className="site-alert-top-banner-shell">
            <span aria-hidden className="site-alert-top-banner-icon">i</span>
            <div className="site-alert-top-banner-copy">
              <p className="site-alert-top-banner-title">{bannerTitle}</p>
              <p className="site-alert-top-banner-detail">{bannerDetail}</p>
            </div>
            {alerts.dismissible !== false ? (
              <button
                aria-label={text.closeNotice}
                className="site-alert-top-banner-close"
                onClick={() => setDismissedNoticeId(bannerNoticeId)}
                type="button"
              >
                X
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      {isLockMode ? (
        <div className="site-alert-lock-overlay" role="dialog" aria-modal="true">
          <article className={`site-alert-lock-card ${mode === "lock_payment_overdue" ? "is-payment" : "is-maintenance"}`}>
            <Image alt={text.logoAlt} className="site-alert-lock-logo" height={74} src={ALERT_LOGO_SRC} width={74} />
            <h2>{lockTitle}</h2>
            <p className="site-alert-lock-message">{lockMessage}</p>
            <p className="site-alert-lock-description">{lockDescription}</p>
            {buttons.length > 0 ? (
              <div className="site-alert-lock-actions">
                {buttons.map((button, index) => {
                  const href = resolveTenantAwareHref(tenantSlug, String(button.href ?? "").trim() || `/site/${tenantSlug}`);
                  const label = resolveLocalizedText(button.label, locale, text.continue);
                  const styleClass = button.style === "secondary" ? "is-secondary" : "is-primary";
                  return (
                    <a className={`site-alert-lock-btn ${styleClass}`} href={href} key={`${href}-${index}`}>
                      {label}
                    </a>
                  );
                })}
              </div>
            ) : null}
          </article>
        </div>
      ) : null}
    </>
  );
}
