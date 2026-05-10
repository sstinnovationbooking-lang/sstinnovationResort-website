import type { AboutPageDTO, AboutSectionItemDTO, ArticleCardItemDTO, ArticlesPageDTO, LocalizedText } from "@/lib/types/site";

function toText(value: unknown): string {
  return String(value ?? "").trim();
}

function toOptionalText(value: unknown): string | undefined {
  const normalized = toText(value);
  return normalized || undefined;
}

function asLocalizedText(value: unknown): LocalizedText | undefined {
  if (typeof value === "string") {
    const normalized = value.trim();
    return normalized || undefined;
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;

  const output: Record<string, string> = {};
  for (const [key, candidate] of Object.entries(value)) {
    const text = toText(candidate);
    if (text) output[key] = text;
  }

  return Object.keys(output).length > 0 ? output : undefined;
}

function toOrder(value: unknown, fallback: number): number {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.max(0, Math.floor(numeric));
}

function sanitizeAboutSections(value: unknown): AboutSectionItemDTO[] | undefined {
  if (!Array.isArray(value)) return undefined;

  const sections = value
    .map((item, index) => {
      if (!item || typeof item !== "object") return null;
      const record = item as Record<string, unknown>;
      const title =
        asLocalizedText(record.title) ??
        asLocalizedText(record.heading) ??
        asLocalizedText(record.label);
      if (!title) return null;

      return {
        id: toOptionalText(record.id) ?? toOptionalText(record.slug) ?? `about-section-${index + 1}`,
        title,
        description:
          asLocalizedText(record.description) ??
          asLocalizedText(record.summary) ??
          asLocalizedText(record.content),
        href:
          toOptionalText(record.href) ??
          toOptionalText(record.link) ??
          toOptionalText(record.url),
        order: toOrder(record.order, index + 1),
        isVisible: record.isVisible !== false
      } as AboutSectionItemDTO;
    })
    .filter((item): item is AboutSectionItemDTO => item !== null)
    .sort((a, b) => a.order - b.order);

  return sections.length > 0 ? sections : undefined;
}

export function sanitizeAboutPagePayload(value: unknown): AboutPageDTO | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const raw = value as Record<string, unknown>;

  const heading =
    asLocalizedText(raw.heading) ??
    asLocalizedText(raw.title) ??
    asLocalizedText(raw.name);
  if (!heading) return undefined;

  return {
    eyebrow: asLocalizedText(raw.eyebrow) ?? asLocalizedText(raw.kicker),
    heading,
    subtitle: asLocalizedText(raw.subtitle),
    description:
      asLocalizedText(raw.description) ??
      asLocalizedText(raw.summary),
    content:
      asLocalizedText(raw.content) ??
      asLocalizedText(raw.body),
    imageUrl:
      toOptionalText(raw.imageUrl) ??
      toOptionalText(raw.image) ??
      toOptionalText(raw.coverImage),
    imageAlt:
      asLocalizedText(raw.imageAlt) ??
      asLocalizedText(raw.altText),
    sections: sanitizeAboutSections(raw.sections),
    isVisible: raw.isVisible !== false
  };
}

function sanitizeArticleItems(value: unknown, tenantSlug: string): ArticleCardItemDTO[] | undefined {
  if (!Array.isArray(value)) return undefined;

  const items = value
    .map((item, index) => {
      if (!item || typeof item !== "object") return null;
      const record = item as Record<string, unknown>;
      const title =
        asLocalizedText(record.title) ??
        asLocalizedText(record.headline) ??
        asLocalizedText(record.name);
      if (!title) return null;

      const slug =
        toOptionalText(record.slug) ??
        toOptionalText(record.articleSlug);

      const href =
        toOptionalText(record.href) ??
        toOptionalText(record.url) ??
        toOptionalText(record.link) ??
        (slug ? `/site/${tenantSlug}/articles?slug=${encodeURIComponent(slug)}` : `/site/${tenantSlug}/articles`);

      return {
        id: toOptionalText(record.id) ?? slug ?? `article-${index + 1}`,
        title,
        excerpt:
          asLocalizedText(record.excerpt) ??
          asLocalizedText(record.summary) ??
          asLocalizedText(record.description),
        href,
        slug,
        imageUrl:
          toOptionalText(record.imageUrl) ??
          toOptionalText(record.image) ??
          toOptionalText(record.thumbnail) ??
          toOptionalText(record.coverImage),
        imageAlt:
          asLocalizedText(record.imageAlt) ??
          asLocalizedText(record.altText),
        category:
          asLocalizedText(record.category) ??
          asLocalizedText(record.tag),
        publishedAt:
          toOptionalText(record.publishedAt) ??
          toOptionalText(record.publishDate) ??
          toOptionalText(record.createdAt),
        order: toOrder(record.order, index + 1),
        isVisible: record.isVisible !== false
      } as ArticleCardItemDTO;
    })
    .filter((item): item is ArticleCardItemDTO => item !== null)
    .sort((a, b) => a.order - b.order);

  return items.length > 0 ? items : undefined;
}

export function sanitizeArticlesPagePayload(value: unknown, tenantSlug: string): ArticlesPageDTO | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const raw = value as Record<string, unknown>;

  const heading =
    asLocalizedText(raw.heading) ??
    asLocalizedText(raw.title) ??
    asLocalizedText(raw.name);
  if (!heading) return undefined;

  const items =
    sanitizeArticleItems(raw.items, tenantSlug) ??
    sanitizeArticleItems(raw.articles, tenantSlug) ??
    sanitizeArticleItems(raw.list, tenantSlug) ??
    [];

  return {
    eyebrow: asLocalizedText(raw.eyebrow) ?? asLocalizedText(raw.kicker),
    heading,
    description:
      asLocalizedText(raw.description) ??
      asLocalizedText(raw.summary),
    items,
    isVisible: raw.isVisible !== false
  };
}

export function isValidAboutPage(value: unknown): boolean {
  return Boolean(sanitizeAboutPagePayload(value));
}

export function isValidArticlesPage(value: unknown): boolean {
  return Boolean(sanitizeArticlesPagePayload(value, "demo-resort"));
}
