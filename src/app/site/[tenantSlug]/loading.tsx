"use client";

import { useTranslations } from "next-intl";

export default function TenantLoadingPage() {
  const t = useTranslations("TenantPage");

  return (
    <main className="shell section page-loading" aria-busy="true" aria-live="polite">
      <p className="visually-hidden">{t("loadingAria")}</p>
      <div className="loading-block loading-title" />
      <div className="loading-block loading-text" />
      <div className="loading-grid">
        <div className="loading-card" />
        <div className="loading-card" />
        <div className="loading-card" />
      </div>
    </main>
  );
}
