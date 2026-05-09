"use client";

import { RoomPrice } from "@/components/room-price";
import { RoomStatusBadge } from "@/components/room-status-badge";
import type { AppLocale } from "@/i18n/config";
import type { RoomCardViewModel } from "@/components/room-mobile-card";

interface RoomAvailabilityTableProps {
  room: RoomCardViewModel;
  locale: AppLocale;
  onOpenDetails: (room: RoomCardViewModel) => void;
  labels: {
    roomOptions: string;
    cancellationPolicy: string;
    guests: string;
    pricePerRoomPerNight: string;
    available: string;
    select: string;
    soldOut: string;
    roomUnit: string;
    roomsUnit: string;
    taxesFeesNotIncluded: string;
    notSpecified: string;
  };
}

export function RoomAvailabilityTable({ room, locale, labels, onOpenDetails }: RoomAvailabilityTableProps) {
  const showLowAvailability =
    room.isAvailable &&
    typeof room.availableRooms === "number" &&
    room.availableRooms > 0 &&
    room.availableRooms <= room.lowAvailabilityThreshold;
  const statusType = room.isAvailable ? "available" : room.availableRooms === 0 ? "soldout" : "unavailable";
  const availabilityCountLabel =
    typeof room.availableRooms === "number"
      ? `${room.availableRooms} ${room.availableRooms === 1 ? labels.roomUnit : labels.roomsUnit}`
      : labels.available;

  return (
    <div className="room-availability-table-wrap">
      <table className="room-availability-table">
        <thead>
          <tr>
            <th>{labels.roomOptions}</th>
            <th>{labels.guests}</th>
            <th>{labels.pricePerRoomPerNight}</th>
            <th>{labels.available}</th>
            <th>{labels.select}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <p className="room-option-title">{room.title || room.name}</p>
              {room.roomType ? <p className="room-option-type">{room.roomType}</p> : null}
            </td>
            <td>
              <p className="room-guests-text">{room.maxGuests ?? "-"}</p>
            </td>
            <td>
              <RoomPrice amount={room.pricePerNight} currency={room.currency} locale={locale} />
              <p className="room-tax-text">{room.taxFeeNote || labels.taxesFeesNotIncluded}</p>
            </td>
            <td>
              <RoomStatusBadge label={room.statusLabel} status={statusType} />
              <p className="room-availability-count">{availabilityCountLabel}</p>
              {showLowAvailability && room.lowAvailabilityLabel ? (
                <p className="room-low-availability">{room.lowAvailabilityLabel}</p>
              ) : null}
            </td>
            <td>
              <button className="btn btn-dark room-select-btn" onClick={() => onOpenDetails(room)} type="button">
                {room.selectLabel}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <section className="room-availability-policy-fill" aria-label={labels.cancellationPolicy}>
        <p className="room-availability-policy-fill-title">{labels.cancellationPolicy}</p>
        <p className="room-availability-policy-fill-content">{room.cancellationPolicy || labels.notSpecified}</p>
      </section>
    </div>
  );
}
