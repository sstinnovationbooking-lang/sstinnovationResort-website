"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import { RoomAvailabilityTable } from "@/components/room-availability-table";
import { RoomDetailModal } from "@/components/room-detail-modal";
import { RoomMobileCard, type RoomCardViewModel } from "@/components/room-mobile-card";
import { DEFAULT_LOCALE, normalizeLocale } from "@/i18n/config";
import { getLocalizedValue } from "@/lib/i18n/localized";
import { normalizeRoomSearchCriteria } from "@/lib/content/rooms";
import type { RoomSearchCriteria, RoomCardDTO, SiteBookingSettingsDTO } from "@/lib/types/site";

interface RoomAvailabilityListProps {
  rooms: RoomCardDTO[];
  tenantSlug: string;
  searchCriteria?: RoomSearchCriteria;
  isSearchActive?: boolean;
  onClearSearch?: () => void;
  bookingSettings?: SiteBookingSettingsDTO;
}

const FALLBACK_ROOM_IMAGE =
  "/placeholders/room-sample.svg";

interface RoomAvailabilityImageProps {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}

function RoomAvailabilityImage({ src, alt, sizes, priority = false, className }: RoomAvailabilityImageProps) {
  const [hasError, setHasError] = useState(false);
  const normalizedSrc = String(src ?? "").trim();
  const resolvedSrc = normalizedSrc && !hasError ? normalizedSrc : FALLBACK_ROOM_IMAGE;

  return (
    <Image
      alt={alt}
      className={className}
      fill
      loading={priority ? "eager" : "lazy"}
      onError={() => setHasError(true)}
      priority={priority}
      sizes={sizes}
      src={resolvedSrc}
      unoptimized
    />
  );
}

function buildRoomSelectHref(tenantSlug: string, roomId: string, criteria: ReturnType<typeof normalizeRoomSearchCriteria>): string {
  const params = new URLSearchParams();
  params.set("roomId", roomId);
  if (criteria.checkIn) params.set("checkIn", criteria.checkIn);
  params.set("nights", String(criteria.nights));
  params.set("guests", String(criteria.guests));
  return `/site/${tenantSlug}/contact?${params.toString()}`;
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => String(item ?? "").trim())
    .filter(Boolean);
}

function normalizeZoneId(value: string): string {
  const normalized = String(value ?? "").trim().toLowerCase();
  return normalized.replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "") || "general";
}

export function RoomAvailabilityList({
  rooms,
  tenantSlug,
  searchCriteria,
  isSearchActive = false,
  onClearSearch,
  bookingSettings
}: RoomAvailabilityListProps) {
  const t = useTranslations("ResortHome");
  const locale = useLocale();
  const resolvedLocale = normalizeLocale(locale) ?? DEFAULT_LOCALE;
  const criteria = normalizeRoomSearchCriteria(searchCriteria);
  const [selectedRoom, setSelectedRoom] = useState<RoomCardViewModel | null>(null);
  const [selectedZoneId, setSelectedZoneId] = useState<string>("all");

  const roomModels: RoomCardViewModel[] = useMemo(
    () =>
      rooms.map((room, index) => {
        const availableRooms = typeof room.availableRooms === "number" ? Math.max(0, room.availableRooms) : undefined;
        const isAvailable = typeof room.isAvailable === "boolean" ? room.isAvailable : (availableRooms ?? 1) > 0;
        const lowAvailabilityThreshold =
          typeof room.lowAvailabilityThreshold === "number" && room.lowAvailabilityThreshold > 0
            ? Math.floor(room.lowAvailabilityThreshold)
            : 2;
        const roomId = String(room.id || `room-${index + 1}`);
        const roomName = String(room.name || room.title || `Room ${index + 1}`);
        const roomTitle = String(room.title || room.name || roomName);
        const roomType = String(room.roomType || room.category || "").trim() || undefined;
        const zoneLabel = getLocalizedValue(room.zoneName, resolvedLocale, "");
        const hasZoneConfig = Boolean(String(room.zoneId ?? "").trim() || zoneLabel);
        const zoneId = hasZoneConfig ? normalizeZoneId(String((room.zoneId ?? zoneLabel) || "general")) : undefined;
        const statusLabel = isAvailable ? t("roomStatusAvailable") : availableRooms === 0 ? t("roomStatusSoldOut") : t("roomStatusUnavailable");
        const lowAvailabilityLabel =
          isAvailable && typeof availableRooms === "number" && availableRooms > 0 && availableRooms <= lowAvailabilityThreshold
            ? t("roomOnlyLeft", { count: availableRooms })
            : undefined;

        return {
          id: roomId,
          tenantSlug: room.tenantSlug,
          ownerId: room.ownerId,
          resortId: room.resortId,
          zoneId: zoneId || undefined,
          zoneName: zoneLabel || undefined,
          name: roomName,
          title: roomTitle,
          description: String(room.description || t("roomsAdjustDates")),
          imageUrl: String(room.imageUrl || room.image || FALLBACK_ROOM_IMAGE),
          badge: room.badge,
          category: room.category,
          sizeSqm: room.sizeSqm,
          maxGuests: room.maxGuests,
          availableRooms,
          totalRooms: room.totalRooms,
          isAvailable,
          lowAvailabilityThreshold,
          cancellationPolicy: String(room.cancellationPolicy || "").trim(),
          taxFeeNote: String(room.taxFeeNote || t("roomTaxesAndFees")),
          detailsUrl: room.detailsUrl,
          gallery: toStringArray(room.gallery),
          amenities: toStringArray((room as RoomCardDTO & { amenities?: unknown }).amenities),
          features: toStringArray((room as RoomCardDTO & { features?: unknown }).features),
          roomType,
          currency: String(room.currency || "THB"),
          pricePerNight:
            typeof room.pricePerNight === "number"
              ? room.pricePerNight
              : typeof room.nightlyPriceTHB === "number"
                ? room.nightlyPriceTHB
                : 0,
          roomSelectHref: buildRoomSelectHref(tenantSlug, roomId, criteria),
          detailsLabel: t("roomDetails"),
          selectLabel: t("roomSelect"),
          soldOutLabel: t("roomStatusSoldOut"),
          statusLabel,
          lowAvailabilityLabel
        };
      }),
    [criteria, resolvedLocale, rooms, t, tenantSlug]
  );

  const zoneFilters = useMemo(() => {
    const map = new Map<string, { id: string; label: string; availableCount: number }>();
    roomModels.forEach((room) => {
      const zoneId = String(room.zoneId ?? "").trim();
      if (!zoneId) return;
      const label = String(room.zoneName ?? "").trim() || (resolvedLocale === "th" ? "โซนทั่วไป" : "General zone");
      const availableCount = typeof room.availableRooms === "number" ? Math.max(0, room.availableRooms) : room.isAvailable ? 1 : 0;
      const existing = map.get(zoneId);
      if (existing) {
        existing.availableCount += availableCount;
        return;
      }
      map.set(zoneId, { id: zoneId, label, availableCount });
    });
    return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [resolvedLocale, roomModels]);

  const effectiveSelectedZoneId = useMemo(
    () => (selectedZoneId === "all" || zoneFilters.some((zone) => zone.id === selectedZoneId) ? selectedZoneId : "all"),
    [selectedZoneId, zoneFilters]
  );

  const filteredRoomModels = useMemo(() => {
    if (effectiveSelectedZoneId === "all" || zoneFilters.length === 0) return roomModels;
    return roomModels.filter((room) => String(room.zoneId ?? "").trim() === effectiveSelectedZoneId);
  }, [effectiveSelectedZoneId, roomModels, zoneFilters.length]);

  const selectedRoomForModal = useMemo(() => {
    if (!selectedRoom) return null;
    return roomModels.some((room) => room.id === selectedRoom.id) ? selectedRoom : null;
  }, [roomModels, selectedRoom]);

  return (
    <section className="rooms-availability-list" aria-labelledby="rooms-availability-title">
      <header className="rooms-availability-head">
        {zoneFilters.length > 0 ? (
          <div className="rooms-zone-filter" aria-label={resolvedLocale === "th" ? "ตัวกรองโซนห้องพัก" : "Room zone filter"}>
            <div className="rooms-zone-filter-head">
              <h3>{resolvedLocale === "th" ? "โซนห้องพัก" : "Room zones"}</h3>
              <p>
                {resolvedLocale === "th"
                  ? "เลือกโซนเพื่อกรองห้องพัก หรือเลือกทั้งหมดเพื่อดูทุกโซน"
                  : "Select a zone to filter rooms, or choose all zones."}
              </p>
            </div>
            <div className="rooms-zone-filter-options">
                <button
                aria-pressed={effectiveSelectedZoneId === "all"}
                className={`rooms-zone-pill ${effectiveSelectedZoneId === "all" ? "is-active" : ""}`}
                onClick={() => setSelectedZoneId("all")}
                type="button"
              >
                <span>{resolvedLocale === "th" ? "ทั้งหมด" : "All zones"}</span>
                <strong>{roomModels.length}</strong>
              </button>
              {zoneFilters.map((zone) => (
                <button
                  aria-pressed={effectiveSelectedZoneId === zone.id}
                  className={`rooms-zone-pill ${effectiveSelectedZoneId === zone.id ? "is-active" : ""}`}
                  key={zone.id}
                  onClick={() => setSelectedZoneId(zone.id)}
                  type="button"
                >
                  <span>{zone.label}</span>
                  <strong>
                    {zone.availableCount} {zone.availableCount === 1 ? t("roomUnit") : t("roomsUnit")}
                  </strong>
                </button>
              ))}
            </div>
          </div>
        ) : null}
        <h2 id="rooms-availability-title">
          {isSearchActive ? t("roomsSearchResultsTitle") : t("roomsAvailabilityTitle")}
        </h2>
        <p>{isSearchActive ? t("roomsSearchResultsSubtitle") : t("roomsAvailabilitySubtitle")}</p>
        {isSearchActive ? (
          <div className="rooms-criteria-pills-row">
            <div className="rooms-criteria-pills" aria-label={t("roomsAvailabilitySearchSummary")}>
              <span>{t("roomsAvailabilityCheckIn")}: {criteria.checkIn || "-"}</span>
              <span>{t("roomsAvailabilityNights")}: {criteria.nights}</span>
              <span>{t("roomsAvailabilityGuests")}: {criteria.guests}</span>
              {effectiveSelectedZoneId !== "all" ? (
                <span>
                  {resolvedLocale === "th" ? "โซน" : "Zone"}: {zoneFilters.find((zone) => zone.id === effectiveSelectedZoneId)?.label ?? "-"}
                </span>
              ) : null}
            </div>
            {onClearSearch ? (
              <button className="btn btn-ghost btn-compact rooms-clear-search-btn" onClick={onClearSearch} type="button">
                {t("roomsSearchClear")}
              </button>
            ) : null}
          </div>
        ) : null}
      </header>

      {filteredRoomModels.length === 0 ? (
        <div className="rooms-empty-state">
          <p className="rooms-empty-title">{t("roomsNoRoomAvailable")}</p>
          <p>
            {effectiveSelectedZoneId === "all"
              ? t("roomsAdjustDates")
              : resolvedLocale === "th"
                ? "ยังไม่พบห้องว่างในโซนที่เลือก"
                : "No available rooms in the selected zone."}
          </p>
        </div>
      ) : (
        <>
          <div className="rooms-desktop-groups">
            {filteredRoomModels.map((room, index) => (
              <article className="room-availability-group" key={`desktop-${room.id}`}>
                <div className="room-availability-identity">
                  <button
                    aria-label={`${t("roomDetails")}: ${room.title || room.name}`}
                    className="room-availability-media room-image-open-btn"
                    onClick={() => setSelectedRoom(room)}
                    type="button"
                  >
                    <RoomAvailabilityImage
                      alt={room.title || room.name}
                      className="room-availability-image"
                      priority={index === 0}
                      sizes="(max-width: 1199px) 40vw, 360px"
                      src={room.imageUrl}
                    />
                  </button>
                  <div className="room-availability-copy">
                    <h3>{room.title || room.name}</h3>
                    <p>{room.description}</p>
                    <button
                      aria-label={`${t("roomDetails")}: ${room.title || room.name}`}
                      className="room-details-link"
                      onClick={() => setSelectedRoom(room)}
                      type="button"
                    >
                      {t("roomDetails")}
                    </button>
                  </div>
                </div>

                <RoomAvailabilityTable
                  labels={{
                    roomOptions: t("roomOptions"),
                    zone: resolvedLocale === "th" ? "โซน" : "Zone",
                    cancellationPolicy: t("roomCancellationPolicy"),
                    guests: t("roomGuests"),
                    pricePerRoomPerNight: t("roomPricePerRoomPerNight"),
                    available: t("roomStatusAvailable"),
                    select: t("roomSelect"),
                    soldOut: t("roomStatusSoldOut"),
                    roomUnit: t("roomUnit"),
                    roomsUnit: t("roomsUnit"),
                    taxesFeesNotIncluded: t("roomTaxesAndFees"),
                    notSpecified: t("roomNotSpecified")
                  }}
                  locale={resolvedLocale}
                  onOpenDetails={setSelectedRoom}
                  room={room}
                />
              </article>
            ))}
          </div>

          <div className="rooms-mobile-cards">
            {filteredRoomModels.map((room, index) => (
              <RoomMobileCard
                imagePriority={index === 0}
                key={`mobile-${room.id}`}
                locale={resolvedLocale}
                onOpenDetails={setSelectedRoom}
                priceSuffix={t("roomPricePerNight")}
                room={room}
              />
            ))}
          </div>
        </>
      )}
      <RoomDetailModal
        key={selectedRoomForModal?.id ?? "no-room-selected"}
        bookingSettings={bookingSettings}
        isOpen={Boolean(selectedRoomForModal)}
        onClose={() => setSelectedRoom(null)}
        room={selectedRoomForModal}
        searchCriteria={searchCriteria}
        tenantSlug={tenantSlug}
      />
    </section>
  );
}
