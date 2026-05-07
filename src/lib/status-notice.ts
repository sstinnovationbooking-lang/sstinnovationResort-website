export type StatusNoticeType =
  | "network_issue"
  | "temporary_unavailable"
  | "maintenance"
  | "backend_unavailable"
  | "not_found"
  | "generic_error";

export type StatusIconKey =
  | "wifi-off"
  | "alert-circle"
  | "server-off"
  | "wrench"
  | "search-off"
  | "info-circle";

const NETWORK_PATTERNS = [
  "network",
  "fetch failed",
  "failed to fetch",
  "timed out",
  "timeout",
  "econn",
  "enotfound",
  "dns",
  "connection",
  "socket",
  "offline",
  "abort"
];

const MAINTENANCE_PATTERNS = [
  "maintenance",
  "upgrading",
  "upgrade in progress",
  "system update",
  "scheduled update"
];

const BACKEND_UNAVAILABLE_PATTERNS = [
  "backend",
  "upstream",
  "origin",
  "content source",
  "home failover failed",
  "bff",
  "api error 502",
  "api error 503",
  "api error 504"
];

const NOT_FOUND_PATTERNS = [
  "not found",
  "404",
  "tenant not found",
  "missing tenant",
  "resource not found"
];

const TEMP_UNAVAILABLE_PATTERNS = [
  "temporarily unavailable",
  "service unavailable",
  "unable to load",
  "try again soon",
  "unavailable"
];

const SENSITIVE_PATTERNS = [
  "x-internal-secret",
  "authorization",
  "bearer",
  "token",
  "cookie",
  "password",
  "stack",
  "trace"
];

function containsPattern(message: string, patterns: string[]): boolean {
  return patterns.some((pattern) => message.includes(pattern));
}

export function classifyStatusFromError(error: unknown): StatusNoticeType {
  const rawMessage = error instanceof Error ? error.message : String(error ?? "");
  const message = rawMessage.toLowerCase();

  if (containsPattern(message, NOT_FOUND_PATTERNS)) return "not_found";
  if (containsPattern(message, MAINTENANCE_PATTERNS)) return "maintenance";
  if (containsPattern(message, NETWORK_PATTERNS)) return "network_issue";
  if (containsPattern(message, BACKEND_UNAVAILABLE_PATTERNS)) return "backend_unavailable";
  if (containsPattern(message, TEMP_UNAVAILABLE_PATTERNS)) return "temporary_unavailable";
  return "generic_error";
}

export function iconKeyByStatus(status: StatusNoticeType): StatusIconKey {
  switch (status) {
    case "network_issue":
      return "wifi-off";
    case "temporary_unavailable":
      return "alert-circle";
    case "maintenance":
      return "wrench";
    case "backend_unavailable":
      return "server-off";
    case "not_found":
      return "search-off";
    case "generic_error":
    default:
      return "info-circle";
  }
}

export function safeDevErrorDetail(error: unknown): string | null {
  if (process.env.NODE_ENV === "production") return null;

  const text = (error instanceof Error ? error.message : String(error ?? "")).replace(/\s+/g, " ").trim();
  if (!text) return null;

  const lower = text.toLowerCase();
  if (containsPattern(lower, SENSITIVE_PATTERNS)) return null;
  return text.slice(0, 240);
}

