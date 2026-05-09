"use client";

import type { AppLocale } from "@/i18n/config";
import { LOCALE_TO_BCP47 } from "@/i18n/config";

interface RoomPriceProps {
  amount: number;
  currency?: string;
  locale: AppLocale;
  suffix?: string;
}

export function RoomPrice({ amount, currency = "THB", locale, suffix }: RoomPriceProps) {
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  const safeCurrency = String(currency || "THB").toUpperCase();
  let formatted = "";

  try {
    formatted = new Intl.NumberFormat(LOCALE_TO_BCP47[locale], {
      style: "currency",
      currency: safeCurrency,
      maximumFractionDigits: 0
    }).format(safeAmount);
  } catch {
    formatted = `${safeAmount.toLocaleString(LOCALE_TO_BCP47[locale])} ${safeCurrency}`;
  }

  return (
    <p className="room-price-display">
      <strong>{formatted}</strong>
      {suffix ? <span>{suffix}</span> : null}
    </p>
  );
}
