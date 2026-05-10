export interface ResolvedMapEmbed {
  embedSrc: string | null;
  externalUrl: string | null;
}

const DEFAULT_TEMPLATE_MAP_URL = "https://maps.app.goo.gl/o5KacUwbLLT7B5E76";

function toText(value: unknown): string {
  return String(value ?? "").trim();
}

function isLikelyUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

function isGoogleMapHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  if (host === "maps.app.goo.gl") return true;
  if (host === "goo.gl") return true;
  return /(^|\.)google\./.test(host);
}

function isGoogleMapShortHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return host === "maps.app.goo.gl" || host === "goo.gl";
}

function sanitizeIframeSrc(raw: string): string | null {
  const match = raw.match(/src\s*=\s*["']([^"']+)["']/i);
  const src = toText(match?.[1]);
  if (!src || !isLikelyUrl(src)) return null;
  try {
    const parsed = new URL(src);
    if (!isGoogleMapHost(parsed.hostname)) return null;
    return toEmbedSrcFromUrl(parsed.toString()) ?? parsed.toString();
  } catch {
    return null;
  }
}

function decodePathSegment(value: string): string {
  try {
    return decodeURIComponent(value.replace(/\+/g, " ")).trim();
  } catch {
    return value.trim();
  }
}

function extractMapQuery(parsed: URL): string | null {
  const queryCandidates = ["q", "query", "destination", "daddr", "saddr"];
  for (const key of queryCandidates) {
    const value = toText(parsed.searchParams.get(key));
    if (value) return value;
  }

  const coordinateMatch = parsed.pathname.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  if (coordinateMatch) {
    return `${coordinateMatch[1]},${coordinateMatch[2]}`;
  }

  const coordinateDataMatch = `${parsed.pathname}${parsed.search}`.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);
  if (coordinateDataMatch) {
    return `${coordinateDataMatch[1]},${coordinateDataMatch[2]}`;
  }

  const placeIdMatch = `${parsed.pathname}${parsed.search}`.match(/!1s([^!/?&]+)/);
  if (placeIdMatch?.[1]) {
    return `place_id:${placeIdMatch[1]}`;
  }

  const placeMatch = parsed.pathname.match(/\/place\/([^/]+)/i);
  if (placeMatch?.[1]) {
    const decoded = decodePathSegment(placeMatch[1]);
    if (decoded) return decoded;
  }

  const directionMatch = parsed.pathname.match(/\/dir\/(.+)/i);
  if (directionMatch?.[1]) {
    const segments = directionMatch[1]
      .split("/")
      .map((item) => decodePathSegment(item))
      .filter(Boolean);
    if (segments.length > 0) {
      return segments[segments.length - 1];
    }
  }

  return null;
}

function toGoogleEmbedFromQuery(query: string): string {
  return `https://www.google.com/maps?output=embed&q=${encodeURIComponent(query)}`;
}

export function shouldResolveMapViaServer(rawInput: unknown): boolean {
  const value = toText(rawInput);
  if (!value) return false;
  if (value.includes("<iframe")) return false;
  if (!isLikelyUrl(value)) return false;
  try {
    const parsed = new URL(value);
    return isGoogleMapShortHost(parsed.hostname);
  } catch {
    return false;
  }
}

function toEmbedSrcFromUrl(rawUrl: string): string | null {
  if (!isLikelyUrl(rawUrl)) return null;
  try {
    const parsed = new URL(rawUrl);
    if (!isGoogleMapHost(parsed.hostname)) return null;

    const normalized = parsed.toString();
    if (normalized.includes("/maps/embed")) {
      const queryFromEmbed = extractMapQuery(parsed);
      return queryFromEmbed ? toGoogleEmbedFromQuery(queryFromEmbed) : normalized;
    }
    if (parsed.pathname === "/maps" && parsed.searchParams.get("pb")) {
      const queryFromPb = extractMapQuery(parsed);
      if (queryFromPb) return toGoogleEmbedFromQuery(queryFromPb);
      return `https://www.google.com/maps/embed?pb=${encodeURIComponent(parsed.searchParams.get("pb") ?? "")}`;
    }
    if (parsed.searchParams.get("output") === "embed") return normalized;
    if (isGoogleMapShortHost(parsed.hostname)) return null;

    const query = extractMapQuery(parsed);
    if (query) {
      return toGoogleEmbedFromQuery(query);
    }

    return `https://www.google.com/maps?output=embed&z=14&q=${encodeURIComponent(normalized)}`;
  } catch {
    return null;
  }
}

export function resolveMapEmbed(rawInput: unknown): ResolvedMapEmbed {
  const value = toText(rawInput) || DEFAULT_TEMPLATE_MAP_URL;

  if (value.includes("<iframe")) {
    const src = sanitizeIframeSrc(value);
    return {
      embedSrc: src ?? toEmbedSrcFromUrl(DEFAULT_TEMPLATE_MAP_URL),
      externalUrl: src ?? DEFAULT_TEMPLATE_MAP_URL
    };
  }

  if (isLikelyUrl(value)) {
    return {
      embedSrc: toEmbedSrcFromUrl(value),
      externalUrl: value
    };
  }

  return {
    embedSrc: toEmbedSrcFromUrl(DEFAULT_TEMPLATE_MAP_URL),
    externalUrl: DEFAULT_TEMPLATE_MAP_URL
  };
}
