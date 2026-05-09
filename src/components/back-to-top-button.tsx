"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

export function BackToTopButton() {
  const t = useTranslations("ResortHome");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let rafId: number | null = null;

    const updateVisibility = () => {
      const doc = document.documentElement;
      const scrollY = window.scrollY || doc.scrollTop || 0;
      const distanceFromBottom = doc.scrollHeight - window.innerHeight - scrollY;
      const shouldShow = scrollY >= 120 && distanceFromBottom <= 450;
      setIsVisible(shouldShow);
      rafId = null;
    };

    const onViewportChange = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(updateVisibility);
    };

    updateVisibility();
    window.addEventListener("scroll", onViewportChange, { passive: true });
    window.addEventListener("resize", onViewportChange);

    return () => {
      window.removeEventListener("scroll", onViewportChange);
      window.removeEventListener("resize", onViewportChange);
      if (rafId !== null) window.cancelAnimationFrame(rafId);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <button
      aria-label={t("backToTop")}
      className="back-to-top-fab"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      title={t("backToTop")}
      type="button"
    >
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M12 5l-6 6 1.4 1.4L11 8.8V19h2V8.8l3.6 3.6L18 11z" fill="currentColor" />
      </svg>
    </button>
  );
}
