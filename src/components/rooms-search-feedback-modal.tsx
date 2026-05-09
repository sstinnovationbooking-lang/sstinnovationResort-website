"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";

type RoomsSearchFeedbackState = "hidden" | "loading" | "error" | "noResults" | "validation";

interface RoomsSearchFeedbackModalProps {
  state: RoomsSearchFeedbackState;
  detail?: string;
  onClose: () => void;
  onRetry?: () => void;
}

export function RoomsSearchFeedbackModal({ state, detail, onClose, onRetry }: RoomsSearchFeedbackModalProps) {
  const t = useTranslations("ResortHome");
  const isOpen = state !== "hidden";
  const canClose = state !== "loading";

  useEffect(() => {
    if (!isOpen || !canClose) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [canClose, isOpen, onClose]);

  if (!isOpen) return null;

  const title =
    state === "loading"
      ? t("roomsSearchLoadingTitle")
      : state === "error"
        ? t("roomsSearchErrorTitle")
        : state === "noResults"
          ? t("roomsSearchNoResultsTitle")
          : t("roomsSearchValidationTitle");

  const description =
    state === "loading"
      ? t("roomsSearchLoadingDescription")
      : state === "error"
        ? t("roomsSearchErrorDescription")
        : state === "noResults"
          ? t("roomsSearchNoResultsDescription")
          : detail || t("roomsSearchValidationCheckInRequired");
  const noResultsHint = state === "noResults" ? t("roomsSearchNoResultsHint") : null;

  return (
    <div className="rooms-search-feedback-overlay" onClick={canClose ? onClose : undefined}>
      <section
        aria-live="polite"
        aria-modal="true"
        className={`rooms-search-feedback-modal rooms-search-feedback-modal--${state}`}
        onClick={(event) => event.stopPropagation()}
        role={state === "error" || state === "validation" ? "alertdialog" : "dialog"}
      >
        {state === "loading" ? <span aria-hidden className="rooms-search-feedback-spinner" /> : null}
        <h3>{title}</h3>
        <p>{description}</p>
        {noResultsHint ? <p className="rooms-search-feedback-detail">{noResultsHint}</p> : null}
        {detail && state === "error" ? <p className="rooms-search-feedback-detail">{detail}</p> : null}
        {state !== "loading" ? (
          <div className="rooms-search-feedback-actions">
            {(state === "error" || state === "noResults") && onRetry ? (
              <button className="btn btn-dark" onClick={onRetry} type="button">
                {t("roomsSearchTryAgain")}
              </button>
            ) : null}
            <button className="btn btn-ghost" onClick={onClose} type="button">
              {t("roomsSearchClose")}
            </button>
          </div>
        ) : null}
      </section>
    </div>
  );
}
