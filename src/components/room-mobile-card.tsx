"use client";

import Image from "next/image";
import { useState } from "react";
import { useTranslations } from "next-intl";

import { RoomPrice } from "@/components/room-price";
import { RoomStatusBadge } from "@/components/room-status-badge";
import type { AppLocale } from "@/i18n/config";

export interface RoomCardViewModel {
  id: string;
  tenantSlug?: string;
  ownerId?: string;
  resortId?: string;
  name: string;
  title: string;
  description: string;
  imageUrl: string;
  badge?: string;
  category?: string;
  sizeSqm?: number;
  maxGuests?: number;
  availableRooms?: number;
  totalRooms?: number;
  isAvailable: boolean;
  lowAvailabilityThreshold: number;
  cancellationPolicy: string;
  taxFeeNote: string;
  detailsUrl?: string;
  gallery?: string[];
  amenities?: string[];
  features?: string[];
  roomType?: string;
  currency: string;
  pricePerNight: number;
  roomSelectHref: string;
  detailsLabel: string;
  selectLabel: string;
  soldOutLabel: string;
  statusLabel: string;
  lowAvailabilityLabel?: string;
}

interface RoomMobileCardProps {
  room: RoomCardViewModel;
  locale: AppLocale;
  priceSuffix: string;
  onOpenDetails: (room: RoomCardViewModel) => void;
  imagePriority?: boolean;
}

const FALLBACK_ROOM_IMAGE = "/placeholders/room-sample.svg";

function normalizeImageSource(value: unknown): string {
  const normalized = String(value ?? "").trim();
  if (!normalized) return "";
  if (normalized === "undefined" || normalized === "null") return "";
  return normalized;
}

export function RoomMobileCard({ room, locale, priceSuffix, onOpenDetails, imagePriority = false }: RoomMobileCardProps) {
  const t = useTranslations("ResortHome");
  const [failedImageSrc, setFailedImageSrc] = useState<string | null>(null);
  const normalizedImageSrc = normalizeImageSource(room.imageUrl);
  const imageSrc =
    normalizedImageSrc && failedImageSrc !== normalizedImageSrc
      ? normalizedImageSrc
      : FALLBACK_ROOM_IMAGE;

  const showLowAvailability =
    room.isAvailable &&
    typeof room.availableRooms === "number" &&
    room.availableRooms > 0 &&
    room.availableRooms <= room.lowAvailabilityThreshold;

  const statusType = room.isAvailable ? "available" : room.availableRooms === 0 ? "soldout" : "unavailable";

  return (
    <article className="room-mobile-card">
      <button
        aria-label={`${room.detailsLabel}: ${room.title || room.name}`}
        className="room-mobile-card-media room-image-open-btn"
        onClick={() => onOpenDetails(room)}
        type="button"
      >
        <Image
          alt={room.title || room.name}
          className="room-mobile-card-image"
          fill
          onError={() => setFailedImageSrc(normalizedImageSrc || "__fallback__")}
          priority={imagePriority}
          loading={imagePriority ? "eager" : "lazy"}
          sizes="(max-width: 767px) 100vw, 48vw"
          src={imageSrc}
          unoptimized
        />
        {room.badge || room.category ? <span className="room-mobile-card-badge">{room.badge || room.category}</span> : null}
      </button>

      <div className="room-mobile-card-body">
        <h3>{room.title || room.name}</h3>
        <p className="room-mobile-card-description">{room.description}</p>
        <div className="room-mobile-policy">
          <p className="room-mobile-policy-title">{t("roomCancellationPolicy")}</p>
          <p className="room-mobile-policy-content">{room.cancellationPolicy || t("roomNotSpecified")}</p>
        </div>

        <RoomPrice amount={room.pricePerNight} currency={room.currency} locale={locale} suffix={priceSuffix} />

        <div className="room-mobile-card-status-row">
          <RoomStatusBadge label={room.statusLabel} status={statusType} />
          {showLowAvailability && room.lowAvailabilityLabel ? (
            <p className="room-low-availability">{room.lowAvailabilityLabel}</p>
          ) : null}
        </div>

        <div className="room-mobile-card-actions">
          <button className="btn btn-dark room-book-btn" onClick={() => onOpenDetails(room)} type="button">
            {room.selectLabel}
          </button>
          <button className="btn btn-ghost room-detail-btn" onClick={() => onOpenDetails(room)} type="button">
            {room.detailsLabel}
          </button>
        </div>
      </div>
    </article>
  );
}
