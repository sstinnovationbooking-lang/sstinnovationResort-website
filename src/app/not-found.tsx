import { StatusNoticePage } from "@/components/status-notice-page";

export default function NotFound() {
  return (
    <StatusNoticePage
      primaryAction={{ action: "home", href: "/" }}
      status="not_found"
    />
  );
}
