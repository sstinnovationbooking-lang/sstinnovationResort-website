"use client";

import { useParams } from "next/navigation";

import { StatusNoticePage } from "@/components/status-notice-page";
import { classifyStatusFromError, safeDevErrorDetail } from "@/lib/status-notice";

interface TenantErrorPageProps {
  error: Error;
  reset: () => void;
}

export default function TenantErrorPage({ error, reset }: TenantErrorPageProps) {
  const params = useParams<{ tenantSlug?: string }>();
  const tenantSlug = String(params?.tenantSlug ?? "").trim().toLowerCase() || undefined;
  const status = classifyStatusFromError(error);
  const detail = safeDevErrorDetail(error);

  return (
    <StatusNoticePage
      detail={detail}
      primaryAction={{ action: "retry", onClick: reset }}
      secondaryAction={{ action: "home" }}
      status={status}
      tenantSlug={tenantSlug}
    />
  );
}
