"use client";

import { useParams } from "next/navigation";

import { StatusNoticePage } from "@/components/status-notice-page";

export default function TenantNotFoundPage() {
  const params = useParams<{ tenantSlug?: string }>();
  const tenantSlug = String(params?.tenantSlug ?? "").trim().toLowerCase() || undefined;

  return (
    <StatusNoticePage
      primaryAction={{ action: "home", href: "/" }}
      status="not_found"
      tenantSlug={tenantSlug}
    />
  );
}

