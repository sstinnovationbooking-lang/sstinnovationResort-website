"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { iconKeyByStatus, type StatusIconKey, type StatusNoticeType } from "@/lib/status-notice";

type NoticeActionType = "retry" | "home" | "contact" | "close";

interface NoticeAction {
  action: NoticeActionType;
  href?: string;
  onClick?: () => void;
}

interface StatusNoticePageProps {
  status: StatusNoticeType;
  tenantBrand?: string | null;
  tenantSlug?: string | null;
  detail?: string | null;
  primaryAction?: NoticeAction | null;
  secondaryAction?: NoticeAction | null;
}

function iconByKey(iconKey: StatusIconKey) {
  switch (iconKey) {
    case "wifi-off":
      return (
        <svg aria-hidden viewBox="0 0 24 24">
          <path d="M2 8.5A17.5 17.5 0 0 1 22 8.5m-3.4 4.3a12.6 12.6 0 0 0-10.8 0M8.5 16.6a6.8 6.8 0 0 1 7 0M12 20.3h.01" />
          <path d="M3 3l18 18" />
        </svg>
      );
    case "alert-circle":
      return (
        <svg aria-hidden viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7.6v5.7M12 16.6h.01" />
        </svg>
      );
    case "server-off":
      return (
        <svg aria-hidden viewBox="0 0 24 24">
          <rect x="4" y="5" width="16" height="6" rx="1.6" />
          <rect x="4" y="13" width="16" height="6" rx="1.6" />
          <path d="M8 8h.01M8 16h.01M3 3l18 18" />
        </svg>
      );
    case "wrench":
      return (
        <svg aria-hidden viewBox="0 0 24 24">
          <path d="M14.2 4.5a4.3 4.3 0 0 0-1.2 4.2l-6.7 6.7a1.9 1.9 0 0 0 2.7 2.7l6.7-6.7a4.3 4.3 0 0 0 4.2-1.2 4.5 4.5 0 0 0 1.1-4.6l-2.8 2.8-2.3-.4-.4-2.3 2.8-2.8a4.5 4.5 0 0 0-4.1 1.2Z" />
        </svg>
      );
    case "search-off":
      return (
        <svg aria-hidden viewBox="0 0 24 24">
          <circle cx="10.5" cy="10.5" r="6.5" />
          <path d="m15.5 15.5 4.5 4.5M3 3l18 18" />
        </svg>
      );
    case "info-circle":
    default:
      return (
        <svg aria-hidden viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 10.2v5.4M12 7.8h.01" />
        </svg>
      );
  }
}

function statusClass(status: StatusNoticeType): string {
  return `status-notice-card--${status}`;
}

export function StatusNoticePage({
  status,
  tenantBrand,
  tenantSlug,
  detail,
  primaryAction,
  secondaryAction
}: StatusNoticePageProps) {
  const t = useTranslations("StatusNotice");
  const router = useRouter();
  const iconKey = iconKeyByStatus(status);

  const defaultHomeHref = tenantSlug ? `/site/${tenantSlug}` : "/";
  const defaultContactHref = tenantSlug ? `/site/${tenantSlug}/contact` : "/contact";

  function resolveActionHref(action: NoticeAction): string | null {
    if (action.href) return action.href;
    if (action.action === "home") return defaultHomeHref;
    if (action.action === "contact") return defaultContactHref;
    return null;
  }

  function runAction(action: NoticeAction) {
    if (action.onClick) {
      action.onClick();
      return;
    }

    const href = resolveActionHref(action);
    if (href) {
      router.push(href);
      return;
    }

    if (action.action === "retry") {
      window.location.reload();
    }
  }

  function actionLabel(actionType: NoticeActionType): string {
    if (actionType === "retry") return t("actions.retry");
    if (actionType === "home") return t("actions.home");
    if (actionType === "contact") return t("actions.contact");
    return t("actions.close");
  }

  const defaultPrimaryAction: NoticeAction =
    status === "maintenance"
      ? { action: "home" }
      : status === "not_found"
        ? { action: "home", href: "/" }
        : { action: "retry" };

  const defaultSecondaryAction: NoticeAction | null =
    status === "temporary_unavailable"
      ? { action: "home" }
      : status === "backend_unavailable"
        ? { action: "contact" }
        : null;

  const resolvedPrimary = primaryAction ?? defaultPrimaryAction;
  const resolvedSecondary = secondaryAction ?? defaultSecondaryAction;

  return (
    <main className="status-notice-page" role="alert">
      <div className="status-notice-bg" />
      <section className={`status-notice-card ${statusClass(status)}`}>
        <div className="status-notice-icon-wrap">
          <span className="status-notice-icon">{iconByKey(iconKey)}</span>
        </div>

        {tenantBrand ? <p className="status-notice-brand">{tenantBrand}</p> : null}
        <h1>{t(`states.${status}.title`)}</h1>
        <p className="status-notice-message">{t(`states.${status}.message`)}</p>

        <p className="status-notice-help">{t(`states.${status}.help`)}</p>

        {detail ? (
          <div className="status-notice-detail">
            <h2>{t("detailTitle")}</h2>
            <p>{detail}</p>
          </div>
        ) : null}

        <div className="status-notice-actions">
          <button className="status-notice-btn status-notice-btn--primary" onClick={() => runAction(resolvedPrimary)} type="button">
            {actionLabel(resolvedPrimary.action)}
          </button>
          {resolvedSecondary ? (
            <button className="status-notice-btn status-notice-btn--secondary" onClick={() => runAction(resolvedSecondary)} type="button">
              {actionLabel(resolvedSecondary.action)}
            </button>
          ) : null}
        </div>
      </section>
    </main>
  );
}

