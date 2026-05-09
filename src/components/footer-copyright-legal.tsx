"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";

import type { AppLocale } from "@/i18n/config";
import { getLocalizedValue } from "@/lib/i18n/localized";
import type { SiteFooterDTO } from "@/lib/types/site";

interface FooterCopyrightLegalProps {
  footer: SiteFooterDTO;
  locale: AppLocale;
  tenantBrand: string;
}

function safeYear(value: unknown): number | null {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return null;
  const year = Math.floor(numeric);
  if (year < 1900 || year > 9999) return null;
  return year;
}

export function FooterCopyrightLegal({ footer, locale, tenantBrand }: FooterCopyrightLegalProps) {
  const t = useTranslations("ResortHome");
  const [isOpen, setIsOpen] = useState(false);

  const safeT = (key: string, fallback: string, values?: Record<string, string | number>): string => {
    try {
      return t(key as never, values as never);
    } catch {
      return fallback;
    }
  };

  const copyright = footer.copyright;
  const fallbackYear = new Date().getFullYear();
  const year = safeYear(copyright?.year) ?? fallbackYear;
  const developerName =
    getLocalizedValue(copyright?.developerName, locale, "SST INNOVATION CO., LTD.") || "SST INNOVATION CO., LTD.";
  const resortName = getLocalizedValue(copyright?.resortName, locale, tenantBrand) || tenantBrand;
  const rightsText =
    getLocalizedValue(copyright?.rightsText, locale, safeT("footerRightsReserved", "All rights reserved.")) ||
    safeT("footerRightsReserved", "All rights reserved.");
  const legalTitle =
    getLocalizedValue(copyright?.legalTitle, locale, safeT("footerLegalTitle", "Copyright and Ownership Information")) ||
    safeT("footerLegalTitle", "Copyright and Ownership Information");

  const fallbackLegalBody = safeT(
    "footerCopyrightNotice",
    "This website system is developed by {developerName}. The resort content, including text, images, room information, promotions, contact information, and other resort-specific materials, belongs to {resortName}. Copying, modifying, distributing, or reusing any content without permission is not allowed.",
    { developerName, resortName }
  );

  const legalBodyTemplate = getLocalizedValue(copyright?.legalBody, locale, "").trim();
  const legalBody =
    (legalBodyTemplate
      ? legalBodyTemplate.replaceAll("{developerName}", developerName).replaceAll("{resortName}", resortName)
      : fallbackLegalBody) || fallbackLegalBody;

  const legalInfoLabel = safeT("footerLegalInfo", "Legal info");
  const closeLabel = safeT("footerCloseLegalInfo", "Close");
  const developerLabel = safeT("footerDeveloperLabel", "Website system developer");
  const contentOwnerLabel = safeT("footerContentOwnerLabel", "Resort content owner");
  const developerCreditLabel = safeT("footerDeveloperCredit", "Developed by SST INNOVATION CO., LTD.");

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  return (
    <>
      <div className="footer-meta-layout">
        <div className="footer-meta-wrap">
          <p className="footer-meta">
            {safeT("copyrightPrefix", "©")} {year} {developerName} / {resortName}. {rightsText}
          </p>
          <button className="footer-legal-link" onClick={() => setIsOpen(true)} type="button">
            {legalInfoLabel}
          </button>
        </div>
        <a className="footer-dev-credit-link" href="https://sstinnovation.vercel.app/" rel="noopener noreferrer">
          {developerCreditLabel}
        </a>
      </div>

      {isOpen && typeof document !== "undefined"
        ? createPortal(
            <div className="footer-legal-overlay" onClick={() => setIsOpen(false)}>
              <section
                aria-modal="true"
                className="footer-legal-sheet"
                onClick={(event) => event.stopPropagation()}
                role="dialog"
              >
                <header className="footer-legal-sheet-header">
                  <h3>{legalTitle}</h3>
                  <button
                    aria-label={closeLabel}
                    className="footer-legal-close"
                    onClick={() => setIsOpen(false)}
                    type="button"
                  >
                    {closeLabel}
                  </button>
                </header>
                <div className="footer-legal-sheet-body">
                  <p>
                    <strong>{developerLabel}: </strong>
                    <span>{developerName}</span>
                  </p>
                  <p>
                    <strong>{contentOwnerLabel}: </strong>
                    <span>{resortName}</span>
                  </p>
                  <p>{legalBody}</p>
                </div>
              </section>
            </div>,
            document.body
          )
        : null}
    </>
  );
}
