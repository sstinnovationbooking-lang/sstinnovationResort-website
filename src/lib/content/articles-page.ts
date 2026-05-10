import type { ArticleCardItemDTO, ArticlesPageDTO, LocalizedText, SiteHomeDTO } from "@/lib/types/site";

const FALLBACK_COVER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='960' height='600' viewBox='0 0 960 600'%3E%3Cdefs%3E%3ClinearGradient id='a' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%23dcebdd'/%3E%3Cstop offset='1' stop-color='%23efe4cf'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='960' height='600' fill='url(%23a)'/%3E%3Cpath d='M100 430c110-90 220-90 330 0s220 90 330 0' fill='none' stroke='%2389a794' stroke-width='20' stroke-linecap='round'/%3E%3C/svg%3E";

function toText(value: unknown): string {
  return String(value ?? "").trim();
}

function normalizeHref(href: unknown, tenantSlug: string): string {
  const raw = toText(href);
  if (!raw) return `/site/${tenantSlug}/articles`;
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  if (raw.startsWith("/site/")) return raw;
  if (raw.startsWith("/")) return raw;
  return `/site/${tenantSlug}/articles`;
}

function normalizeSlug(value: unknown): string | undefined {
  const raw = toText(value).toLowerCase();
  if (!raw) return undefined;
  const slug = raw
    .replace(/[^a-z0-9-_\s]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return slug || undefined;
}

function normalizeItems(input: unknown, tenantSlug: string, home: SiteHomeDTO): ArticleCardItemDTO[] {
  if (!Array.isArray(input)) return [];
  const fallbackImage = home.gallery[0]?.imageUrl || home.featuredRooms[0]?.imageUrl || FALLBACK_COVER;
  const result: ArticleCardItemDTO[] = [];

  input.forEach((item, index) => {
    if (!item || typeof item !== "object") return;
    const row = item as Record<string, unknown>;
    const title = row.title as LocalizedText | undefined;
    if (!title) return;

    const hrefCandidate = toText(row.href ?? row.url ?? row.link);

    result.push({
      id: toText(row.id) || `article-${index + 1}`,
      title,
      excerpt: row.excerpt as LocalizedText | undefined,
      slug: normalizeSlug(row.slug ?? row.articleSlug),
      href: hrefCandidate ? normalizeHref(hrefCandidate, tenantSlug) : undefined,
      imageUrl: toText(row.imageUrl ?? row.image ?? row.coverImage) || fallbackImage,
      imageAlt: row.imageAlt as LocalizedText | undefined,
      category: (row.category as LocalizedText | undefined) ?? (row.tag as LocalizedText | undefined),
      publishedAt: toText(row.publishedAt ?? row.publishDate ?? row.createdAt) || undefined,
      order: Number.isFinite(Number(row.order)) ? Number(row.order) : index + 1,
      isVisible: row.isVisible !== false
    });
  });

  return result.sort((a, b) => a.order - b.order);
}

function createTemplateItems(home: SiteHomeDTO): ArticleCardItemDTO[] {
  const tenantSlug = home.tenant.tenantSlug;
  const images = [
    home.gallery[0]?.imageUrl,
    home.gallery[1]?.imageUrl,
    home.gallery[2]?.imageUrl,
    home.featuredRooms[0]?.imageUrl,
    home.featuredRooms[1]?.imageUrl,
    home.featuredRooms[2]?.imageUrl
  ].filter((item): item is string => Boolean(toText(item)));

  const safeImage = images[0] || FALLBACK_COVER;
  const cover = (index: number) => images[index % Math.max(images.length, 1)] || safeImage;

  const base: ArticleCardItemDTO[] = [
    {
      id: "article-template-1",
      title: { "th-TH": "แนะนำโซนไฮไลต์ของรีสอร์ต", "en-US": "Top resort zones to explore" },
      excerpt: {
        "th-TH": "รวมบรรยากาศและโซนที่แขกนิยม พร้อมคำแนะนำสำหรับการเข้าพักครั้งแรก",
        "en-US": "A quick guide to the most popular resort zones for first-time guests."
      },
      href: `/site/${tenantSlug}/about`,
      imageUrl: cover(0),
      category: { "th-TH": "แนะนำรีสอร์ต", "en-US": "Resort Guide" },
      order: 1,
      isVisible: true
    },
    {
      id: "article-template-2",
      title: { "th-TH": "กิจกรรมประจำฤดูกาล", "en-US": "Seasonal activities" },
      excerpt: {
        "th-TH": "อัปเดตกิจกรรมที่เหมาะกับฤดูกาลและช่วงเวลาการท่องเที่ยว",
        "en-US": "Recommended activities matched to the current travel season."
      },
      href: `/site/${tenantSlug}#activities-gallery`,
      imageUrl: cover(1),
      category: { "th-TH": "กิจกรรม", "en-US": "Activities" },
      order: 2,
      isVisible: true
    },
    {
      id: "article-template-3",
      title: { "th-TH": "เคล็ดลับการเลือกห้องพัก", "en-US": "How to pick the right room" },
      excerpt: {
        "th-TH": "แนวทางเลือกห้องพักตามจำนวนผู้เข้าพักและรูปแบบทริป",
        "en-US": "Simple tips to choose rooms by trip type and group size."
      },
      href: `/site/${tenantSlug}/rooms`,
      imageUrl: cover(2),
      category: { "th-TH": "ห้องพัก", "en-US": "Rooms" },
      order: 3,
      isVisible: true
    },
    {
      id: "article-template-4",
      title: { "th-TH": "คู่มือแคมป์ปิ้งสำหรับมือใหม่", "en-US": "Camping guide for beginners" },
      excerpt: {
        "th-TH": "เตรียมตัวให้พร้อมก่อนเข้าพักโซนแคมป์ พร้อมเช็กลิสต์ที่ควรรู้",
        "en-US": "Checklist and practical tips before your first camping stay."
      },
      href: `/site/${tenantSlug}/camping`,
      imageUrl: cover(3),
      category: { "th-TH": "แคมป์ปิ้ง", "en-US": "Camping" },
      order: 4,
      isVisible: true
    }
  ];

  return base;
}

export function resolveArticlesPageContent(home: SiteHomeDTO): ArticlesPageDTO {
  const tenantSlug = home.tenant.tenantSlug;
  const raw = (home as unknown as Record<string, unknown>).articlesPage as Record<string, unknown> | undefined;
  const items = normalizeItems(raw?.items, tenantSlug, home);

  const withHrefFromSlug = items.map((item) => {
    if (item.href) return item;
    if (!item.slug) return item;
    return {
      ...item,
      href: `/site/${tenantSlug}/articles?slug=${encodeURIComponent(item.slug)}`
    };
  });

  return {
    eyebrow: raw?.eyebrow ?? { "th-TH": "คอนเทนต์รีสอร์ต", "en-US": "Resort content" },
    heading: raw?.heading ?? { "th-TH": "บทความ", "en-US": "Articles" },
    description:
      raw?.description ??
      {
        "th-TH": "บทความ ข่าวสาร และคอนเทนต์ของรีสอร์ตจากเจ้าของรีสอร์ตแต่ละราย สามารถเพิ่ม/แก้ไข/ลบได้จากระบบหลังบ้านและระบบกลาง",
        "en-US": "Tenant-owned resort articles and news. Items can be created, edited, and removed from backoffice and central systems."
      },
    items: withHrefFromSlug.length > 0 ? withHrefFromSlug : createTemplateItems(home),
    isVisible: raw?.isVisible !== false
  };
}
