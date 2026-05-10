"use client";

import { FormEvent, useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import { normalizeRoomSearchCheckInInput } from "@/lib/search/room-search";
import type { RoomSearchCriteria } from "@/lib/types/site";

const MIN_NIGHTS = 1;
const MAX_NIGHTS = 30;
const MIN_GUESTS = 1;
const MAX_GUESTS = 20;

interface RoomsSearchCardProps {
  initialCriteria?: RoomSearchCriteria;
  isSearching?: boolean;
  onSearch: (criteria: { checkIn: string; nights: number; guests: number }) => void;
}

function parsePositiveInt(raw: string, fallback: number): number {
  const parsed = Number.parseInt(String(raw).trim(), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return parsed;
}

export function RoomsSearchCard({ initialCriteria, isSearching = false, onSearch }: RoomsSearchCardProps) {
  const t = useTranslations("ResortHome");
  const todayIso = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [checkIn, setCheckIn] = useState(initialCriteria?.checkIn ?? "");
  const [nights, setNights] = useState(String(initialCriteria?.nights ?? 1));
  const [guests, setGuests] = useState(String(initialCriteria?.guests ?? 2));

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSearching) return;

    const nextCheckIn = String(checkIn ?? "").trim();
    const parsedNights = parsePositiveInt(nights, 0);
    const parsedGuests = parsePositiveInt(guests, 0);
    const normalizedCheckIn = normalizeRoomSearchCheckInInput(nextCheckIn) ?? "";
    onSearch({
      checkIn: normalizedCheckIn,
      nights: parsedNights,
      guests: parsedGuests
    });
  }

  return (
    <section className="shell section rooms-search-section reveal" aria-label={t("roomsSearchCardTitle")}>
      <div className="rooms-search-card-wrap">
        <form aria-busy={isSearching} className="hero-booking-card rooms-search-card" onSubmit={onSubmit}>
          <label className="hero-booking-cell" htmlFor="rooms-search-checkin">
            <span aria-hidden className="hero-booking-icon">
              <svg viewBox="0 0 24 24">
                <rect height="16" rx="3" ry="3" width="18" x="3" y="5" />
                <path d="M8 3v4M16 3v4M3 10h18" />
              </svg>
            </span>
            <span>{t("roomsSearchCheckInLabel")}</span>
            <input
              disabled={isSearching}
              id="rooms-search-checkin"
              min={todayIso}
              name="checkIn"
              onChange={(event) => setCheckIn(event.target.value)}
              required
              type="date"
              value={checkIn}
            />
          </label>

          <label className="hero-booking-cell" htmlFor="rooms-search-nights">
            <span aria-hidden className="hero-booking-icon">
              <svg viewBox="0 0 24 24">
                <path d="M4 6h8a4 4 0 0 1 4 4v8H8a4 4 0 0 1-4-4z" />
                <path d="M12 6h4a4 4 0 0 1 4 4v8h-8z" />
              </svg>
            </span>
            <span>{t("roomsSearchNightsLabel")}</span>
            <input
              disabled={isSearching}
              id="rooms-search-nights"
              inputMode="numeric"
              max={MAX_NIGHTS}
              min={MIN_NIGHTS}
              name="nights"
              onChange={(event) => setNights(event.target.value)}
              required
              type="number"
              value={nights}
            />
          </label>

          <label className="hero-booking-cell" htmlFor="rooms-search-guests">
            <span aria-hidden className="hero-booking-icon">
              <svg viewBox="0 0 24 24">
                <circle cx="9" cy="8" r="3" />
                <circle cx="16.5" cy="9.5" r="2.5" />
                <path d="M3 18a6 6 0 0 1 12 0" />
                <path d="M13 18a4.5 4.5 0 0 1 8 0" />
              </svg>
            </span>
            <span>{t("roomsSearchGuestsLabel")}</span>
            <input
              disabled={isSearching}
              id="rooms-search-guests"
              inputMode="numeric"
              max={MAX_GUESTS}
              min={MIN_GUESTS}
              name="guests"
              onChange={(event) => setGuests(event.target.value)}
              required
              type="number"
              value={guests}
            />
          </label>

          <button className="hero-booking-btn" disabled={isSearching} type="submit">
            {isSearching ? t("roomsSearchLoading") : t("roomsSearchSubmit")}
          </button>
        </form>
      </div>
    </section>
  );
}
