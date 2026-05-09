"use client";

interface RoomStatusBadgeProps {
  status: "available" | "unavailable" | "soldout" | "unknown";
  label: string;
}

export function RoomStatusBadge({ status, label }: RoomStatusBadgeProps) {
  return <span className={`room-status-badge room-status-badge--${status}`}>{label}</span>;
}
