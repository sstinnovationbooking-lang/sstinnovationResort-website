import { getStaticCampingByTenant } from "@/lib/tenants/static-content";
import type {
  CampingContentDTO,
  CampingHighlightItemDTO,
  CampingImageItemDTO,
  CampingPackageItemDTO,
  FeaturedGalleryItemDTO,
  LocalizedText,
  SiteHomeDTO
} from "@/lib/types/site";

const MAX_ITEMS = 8;

const DEFAULT_CAMPING_CONTENT: CampingContentDTO = {
  heroEyebrow: {
    "th-TH": "เธเธฑเธเธเนเธญเธเธเธฅเธฒเธเธเธฃเธฃเธกเธเธฒเธ•เธด",
    "en-US": "Nature-first stay"
  },
  heroTitle: {
    "th-TH": "Camping Experience",
    "en-US": "Premium camping experience"
  },
  heroSubtitle: {
    "th-TH": "เนเธเธเนเธเธกเธเนเธเธดเนเธเธ—เธตเนเธญเธญเธเนเธเธเนเธซเนเธชเธฐเธ”เธงเธ เธเธฅเธญเธ”เธ เธฑเธข เนเธฅเธฐเธเนเธฒเธเธฑเธเธเนเธญเธเธชเธณเธซเธฃเธฑเธเธ—เธธเธเธเธฅเธธเนเธกเธเธนเนเน€เธเนเธฒเธเธฑเธ",
    "en-US": "A resort camping zone designed for comfort, safety, and memorable outdoor stays."
  },
  heroImageUrl: "",
  heroImages: [],
  heroPrimaryCtaLabel: {
    "th-TH": "เธ•เธดเธ”เธ•เนเธญเน€เธเธทเนเธญเธเธญเธเนเธเธกเธเน",
    "en-US": "Contact to reserve"
  },
  heroPrimaryCtaHref: "/contact",
  heroSecondaryCtaLabel: {
    "th-TH": "เธ”เธนเธซเนเธญเธเธเธฑเธ",
    "en-US": "View rooms"
  },
  heroSecondaryCtaHref: "/rooms",
  overviewTitle: {
    "th-TH": "เธ เธฒเธเธฃเธงเธกเธเธฃเธดเธเธฒเธฃเนเธเธกเธเนเธเธดเนเธ",
    "en-US": "Camping overview"
  },
  overviewDescription: {
    "th-TH": "เนเธ•เนเธฅเธฐเธฃเธตเธชเธญเธฃเนเธ•เธชเธฒเธกเธฒเธฃเธ–เธเธณเธซเธเธ”เธฃเธฒเธเธฒ เน€เธเธทเนเธญเธเนเธ เนเธฅเธฐเธชเธดเนเธเธญเธณเธเธงเธขเธเธงเธฒเธกเธชเธฐเธ”เธงเธเนเธ”เนเธ•เนเธฒเธเธเธฑเธ เธเธฃเธธเธ“เธฒเธ•เธฃเธงเธเธชเธญเธเธเนเธญเธกเธนเธฅเธฅเนเธฒเธชเธธเธ”เธเนเธญเธเธเธญเธ",
    "en-US": "Each resort owner can configure pricing, conditions, and facilities differently. Please confirm the latest details before booking."
  },
  quickInfoTitle: {
    "th-TH": "เธเนเธญเธกเธนเธฅเน€เธเธทเนเธญเธเธ•เนเธ",
    "en-US": "Quick info"
  },
  quickInfoItems: [],
  serviceTypesTitle: {
    "th-TH": "เธ•เธฑเธงเน€เธฅเธทเธญเธเธเธฃเธดเธเธฒเธฃเนเธเธกเธเนเธเธดเนเธ",
    "en-US": "Camping Services"
  },
  serviceTypes: [],
  facilitiesTitle: {
    "th-TH": "เธชเธดเนเธเธญเธณเธเธงเธขเธเธงเธฒเธกเธชเธฐเธ”เธงเธ",
    "en-US": "Facilities"
  },
  facilities: [],
  rulesTitle: {
    "th-TH": "เธเธเนเธฅเธฐเธเธงเธฒเธกเธเธฅเธญเธ”เธ เธฑเธข",
    "en-US": "Rules and safety"
  },
  rules: [],
  addOnsTitle: {
    "th-TH": "เธเธฃเธดเธเธฒเธฃเน€เธชเธฃเธดเธก / เธญเธธเธเธเธฃเธ“เนเน€เธเนเธฒ",
    "en-US": "Add-ons and rentals"
  },
  addOns: [],
  galleryTitle: {
    "th-TH": "เธเธฃเธฃเธขเธฒเธเธฒเธจเนเธเธกเธเนเธเธดเนเธ",
    "en-US": "Camping Atmosphere Gallery"
  },
  galleryModalTitle: {
    "th-TH": "เธเธฃเธฃเธขเธฒเธเธฒเธจเนเธเธกเธเนเธเธดเนเธ",
    "en-US": "Camping Atmosphere Gallery"
  },
  galleryModalDescription: {
    "th-TH": "เธฃเธนเธเธ เธฒเธเธ•เธฑเธงเธญเธขเนเธฒเธเธชเธณเธซเธฃเธฑเธเน€เธ—เธกเน€เธเธฅเธ• เธชเธฒเธกเธฒเธฃเธ–เธเธฃเธฑเธเน€เธเนเธเธ เธฒเธเธเธฃเธดเธเธเธญเธเธฃเธตเธชเธญเธฃเนเธ•เนเธ”เนเนเธเธฃเธฐเธเธเธซเธฅเธฑเธเธเนเธฒเธเธ เธฒเธขเธซเธฅเธฑเธ",
    "en-US": "Template preview images that can later be replaced by each resort's live content from backend systems."
  },
  galleryModalCtaLabel: {
    "th-TH": "เธ•เธดเธ”เธ•เนเธญเน€เธเธทเนเธญเธเธญเธเนเธเธกเธเน",
    "en-US": "Contact to reserve camping"
  },
  galleryModalCtaHref: "/contact",
  galleryImages: [],
  galleryItems: [],
  ctaTitle: {
    "th-TH": "เธเธฃเนเธญเธกเธญเธญเธเธ—เธฃเธดเธเนเธเธกเธเนเนเธฅเนเธงเธซเธฃเธทเธญเธขเธฑเธ?",
    "en-US": "Ready for your camping trip?"
  },
  ctaDescription: {
    "th-TH": "เธชเนเธเธฃเธฒเธขเธฅเธฐเน€เธญเธตเธขเธ”เธงเธฑเธเน€เธเนเธฒเธเธฑเธเนเธฅเธฐเธเธณเธเธงเธเธเธนเนเน€เธเนเธฒเธเธฑเธ เน€เธเธทเนเธญเนเธซเนเธ—เธตเธกเธเธฒเธเธเนเธงเธขเธเธฑเธ”เนเธเนเธเน€เธเธเธ—เธตเนเน€เธซเธกเธฒเธฐเธชเธก",
    "en-US": "Share your preferred dates and guest count so our team can recommend the best setup."
  },
  ctaPrimaryLabel: {
    "th-TH": "เธ•เธดเธ”เธ•เนเธญเธ—เธตเธกเธฃเธตเธชเธญเธฃเนเธ•",
    "en-US": "Contact resort team"
  },
  ctaSecondaryLabel: {
    "th-TH": "เธ”เธนเธซเนเธญเธเธเธฑเธเธ—เธฑเนเธเธซเธกเธ”",
    "en-US": "Browse rooms"
  },
  isVisible: true
};

const HERO_PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1600' height='900' viewBox='0 0 1600 900'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%23192c26'/%3E%3Cstop offset='1' stop-color='%233f6b59'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='1600' height='900' fill='url(%23g)'/%3E%3Ccircle cx='1320' cy='180' r='180' fill='%23ffffff22'/%3E%3Cpath d='M120 720c180-120 360-120 540 0s360 120 540 0s280-120 400 0' fill='none' stroke='%23ffffff33' stroke-width='18'/%3E%3C/svg%3E";

function cleanText(value: unknown): string {
  return String(value ?? "").trim();
}

function normalizeLocalizedText(value: unknown): LocalizedText | null {
  if (typeof value === "string") {
    const normalized = cleanText(value);
    return normalized || null;
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;

  const record: Record<string, string> = {};
  Object.entries(value).forEach(([key, raw]) => {
    const text = cleanText(raw);
    if (!text) return;
    record[key] = text;
  });

  return Object.keys(record).length > 0 ? record : null;
}

function normalizeLocalizedArray(value: unknown): LocalizedText[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const items = value
    .map((item) => normalizeLocalizedText(item))
    .filter((item): item is LocalizedText => item !== null);
  return items.length > 0 ? items : undefined;
}

function sanitizeHighlightItems(value: unknown, fallback: CampingHighlightItemDTO[]): CampingHighlightItemDTO[] {
  if (!Array.isArray(value)) return fallback.map((item) => ({ ...item }));
  const mapped: Array<CampingHighlightItemDTO | null> = value.map((item, index) => {
      if (!item || typeof item !== "object") return null;
      const raw = item as Partial<CampingHighlightItemDTO>;
      const title = normalizeLocalizedText(raw.title);
      const description = normalizeLocalizedText(raw.description);
      if (!title || !description) return null;
      const normalized: CampingHighlightItemDTO = {
        id: cleanText(raw.id) || `item-${index + 1}`,
        title,
        description,
        iconKey: cleanText(raw.iconKey) || undefined,
        order: typeof raw.order === "number" ? raw.order : index + 1,
        isVisible: raw.isVisible === false ? false : true
      };
      return normalized;
    });

  const items = mapped
    .filter((item): item is CampingHighlightItemDTO => item !== null)
    .sort((a, b) => a.order - b.order)
    .slice(0, MAX_ITEMS);

  return items.length > 0 ? items : fallback.map((item) => ({ ...item }));
}

function sanitizePackageItems(value: unknown, fallback: CampingPackageItemDTO[]): CampingPackageItemDTO[] {
  if (!Array.isArray(value)) return fallback.map((item) => ({ ...item }));
  const mapped: Array<CampingPackageItemDTO | null> = value.map((item, index) => {
      if (!item || typeof item !== "object") return null;
      const raw = item as Partial<CampingPackageItemDTO>;
      const name = normalizeLocalizedText(raw.name);
      const description = normalizeLocalizedText(raw.description);
      const durationText = normalizeLocalizedText(raw.durationText);
      if (!name || !description || !durationText) return null;

      const parsedPrice = Number(raw.priceTHB);
      const priceTHB = Number.isFinite(parsedPrice) && parsedPrice > 0 ? parsedPrice : 0;

      const normalized: CampingPackageItemDTO = {
        id: cleanText(raw.id) || `package-${index + 1}`,
        name,
        description,
        priceTHB,
        durationText,
        includedItems: normalizeLocalizedArray(raw.includedItems),
        recommendedFor: normalizeLocalizedText(raw.recommendedFor) ?? undefined,
        ctaLabel: normalizeLocalizedText(raw.ctaLabel) ?? undefined,
        ctaHref: cleanText(raw.ctaHref) || undefined,
        badge: normalizeLocalizedText(raw.badge) ?? undefined,
        priceNote: normalizeLocalizedText(raw.priceNote) ?? undefined,
        iconKey: cleanText(raw.iconKey) || undefined,
        order: typeof raw.order === "number" ? raw.order : index + 1,
        isVisible: raw.isVisible === false ? false : true
      };
      return normalized;
    });

  const items = mapped
    .filter((item): item is CampingPackageItemDTO => item !== null)
    .sort((a, b) => a.order - b.order)
    .slice(0, MAX_ITEMS);

  return items.length > 0 ? items : fallback.map((item) => ({ ...item }));
}

function sanitizeGalleryItems(value: unknown, fallback: FeaturedGalleryItemDTO[]): FeaturedGalleryItemDTO[] {
  if (!Array.isArray(value)) return fallback.map((item) => ({ ...item }));
  const mapped: Array<FeaturedGalleryItemDTO | null> = value.map((item, index) => {
      if (!item || typeof item !== "object") return null;
      const raw = item as Partial<FeaturedGalleryItemDTO>;
      const title = normalizeLocalizedText(raw.title);
      const imageUrl = cleanText(raw.imageUrl);
      if (!title || !imageUrl) return null;
      const normalized: FeaturedGalleryItemDTO = {
        id: cleanText(raw.id) || `gallery-${index + 1}`,
        title,
        sizeText: normalizeLocalizedText(raw.sizeText) ?? "",
        imageUrl,
        altText: normalizeLocalizedText(raw.altText) ?? title,
        order: typeof raw.order === "number" ? raw.order : index + 1,
        isVisible: raw.isVisible === false ? false : true
      };
      return normalized;
    });

  const items = mapped
    .filter((item): item is FeaturedGalleryItemDTO => item !== null)
    .sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
    .slice(0, MAX_ITEMS);

  return items.length > 0 ? items : fallback.map((item) => ({ ...item }));
}

function sanitizeCampingImages(value: unknown, fallback: CampingImageItemDTO[]): CampingImageItemDTO[] {
  if (!Array.isArray(value)) return fallback.map((item) => ({ ...item }));

  const mapped: Array<CampingImageItemDTO | null> = value.map((item, index) => {
    if (!item || typeof item !== "object") return null;
    const raw = item as Partial<CampingImageItemDTO>;
    const src = cleanText(raw.src);
    const altText = normalizeLocalizedText(raw.altText);
    if (!src || !altText) return null;

    const normalized: CampingImageItemDTO = {
      id: cleanText(raw.id) || `camp-image-${index + 1}`,
      src,
      altText,
      title: normalizeLocalizedText(raw.title) ?? undefined,
      description: normalizeLocalizedText(raw.description) ?? undefined,
      order: typeof raw.order === "number" ? raw.order : index + 1,
      isVisible: raw.isVisible === false ? false : true
    };
    return normalized;
  });

  const items = mapped
    .filter((item): item is CampingImageItemDTO => item !== null)
    .sort((a, b) => Number(a.order ?? 999) - Number(b.order ?? 999))
    .slice(0, MAX_ITEMS);

  return items.length > 0 ? items : fallback.map((item) => ({ ...item }));
}

function cloneContent(value: CampingContentDTO): CampingContentDTO {
  return {
    ...value,
    heroImages: value.heroImages?.map((item) => ({ ...item })),
    quickInfoItems: value.quickInfoItems.map((item) => ({ ...item })),
    serviceTypes: value.serviceTypes.map((item) => ({ ...item, includedItems: item.includedItems?.map((x) => x) })),
    facilities: value.facilities.map((item) => ({ ...item })),
    rules: value.rules.map((item) => ({ ...item })),
    addOns: value.addOns.map((item) => ({ ...item, includedItems: item.includedItems?.map((x) => x) })),
    galleryImages: value.galleryImages?.map((item) => ({ ...item })),
    galleryItems: value.galleryItems.map((item) => ({ ...item }))
  };
}

export function sanitizeCampingContent(value: unknown, fallbackSource: CampingContentDTO): CampingContentDTO {
  const fallback = cloneContent(fallbackSource);
  if (!value || typeof value !== "object") return fallback;
  const raw = value as Partial<CampingContentDTO>;

  return {
    heroEyebrow: normalizeLocalizedText(raw.heroEyebrow) ?? fallback.heroEyebrow,
    heroTitle: normalizeLocalizedText(raw.heroTitle) ?? fallback.heroTitle,
    heroSubtitle: normalizeLocalizedText(raw.heroSubtitle) ?? fallback.heroSubtitle,
    heroImageUrl: cleanText(raw.heroImageUrl) || fallback.heroImageUrl,
    heroImages: sanitizeCampingImages(raw.heroImages, fallback.heroImages ?? []),
    heroPrimaryCtaLabel: normalizeLocalizedText(raw.heroPrimaryCtaLabel) ?? fallback.heroPrimaryCtaLabel,
    heroPrimaryCtaHref: cleanText(raw.heroPrimaryCtaHref) || cleanText(fallback.heroPrimaryCtaHref),
    heroSecondaryCtaLabel: normalizeLocalizedText(raw.heroSecondaryCtaLabel) ?? fallback.heroSecondaryCtaLabel,
    heroSecondaryCtaHref: cleanText(raw.heroSecondaryCtaHref) || cleanText(fallback.heroSecondaryCtaHref),
    overviewTitle: normalizeLocalizedText(raw.overviewTitle) ?? fallback.overviewTitle,
    overviewDescription: normalizeLocalizedText(raw.overviewDescription) ?? fallback.overviewDescription,
    quickInfoTitle: normalizeLocalizedText(raw.quickInfoTitle) ?? fallback.quickInfoTitle,
    quickInfoItems: sanitizeHighlightItems(raw.quickInfoItems, fallback.quickInfoItems),
    serviceTypesTitle: normalizeLocalizedText(raw.serviceTypesTitle) ?? fallback.serviceTypesTitle,
    serviceTypes: sanitizePackageItems(raw.serviceTypes, fallback.serviceTypes),
    facilitiesTitle: normalizeLocalizedText(raw.facilitiesTitle) ?? fallback.facilitiesTitle,
    facilities: sanitizeHighlightItems(raw.facilities, fallback.facilities),
    rulesTitle: normalizeLocalizedText(raw.rulesTitle) ?? fallback.rulesTitle,
    rules: sanitizeHighlightItems(raw.rules, fallback.rules),
    addOnsTitle: normalizeLocalizedText(raw.addOnsTitle) ?? fallback.addOnsTitle,
    addOns: sanitizePackageItems(raw.addOns, fallback.addOns),
    galleryTitle: normalizeLocalizedText(raw.galleryTitle) ?? fallback.galleryTitle,
    galleryModalTitle: normalizeLocalizedText(raw.galleryModalTitle) ?? fallback.galleryModalTitle,
    galleryModalDescription: normalizeLocalizedText(raw.galleryModalDescription) ?? fallback.galleryModalDescription,
    galleryModalCtaLabel: normalizeLocalizedText(raw.galleryModalCtaLabel) ?? fallback.galleryModalCtaLabel,
    galleryModalCtaHref: cleanText(raw.galleryModalCtaHref) || cleanText(fallback.galleryModalCtaHref),
    galleryImages: sanitizeCampingImages(raw.galleryImages, fallback.galleryImages ?? []),
    galleryItems: sanitizeGalleryItems(raw.galleryItems, fallback.galleryItems),
    ctaTitle: normalizeLocalizedText(raw.ctaTitle) ?? fallback.ctaTitle,
    ctaDescription: normalizeLocalizedText(raw.ctaDescription) ?? fallback.ctaDescription,
    ctaPrimaryLabel: normalizeLocalizedText(raw.ctaPrimaryLabel) ?? fallback.ctaPrimaryLabel,
    ctaSecondaryLabel: normalizeLocalizedText(raw.ctaSecondaryLabel) ?? fallback.ctaSecondaryLabel,
    isVisible: raw.isVisible === false ? false : true
  };
}

export function resolveCampingContent(home: SiteHomeDTO): CampingContentDTO {
  const staticFallback = getStaticCampingByTenant(home.tenant.tenantSlug) ?? DEFAULT_CAMPING_CONTENT;
  const resolved = sanitizeCampingContent(home.camping, staticFallback);
  const normalizedHeroImages = sanitizeCampingImages(resolved.heroImages, []);

  if (normalizedHeroImages.length > 0) {
    return {
      ...resolved,
      heroImages: normalizedHeroImages,
      heroImageUrl: cleanText(normalizedHeroImages[0]?.src) || cleanText(resolved.heroImageUrl) || HERO_PLACEHOLDER_IMAGE
    };
  }

  const heroImageSrc = cleanText(resolved.heroImageUrl);
  if (heroImageSrc) {
    return {
      ...resolved,
      heroImageUrl: heroImageSrc,
      heroImages: [
        {
          id: "hero-primary",
          src: heroImageSrc,
          altText: {
            "th-TH": "เธ เธฒเธเธเธฃเธฃเธขเธฒเธเธฒเธจเนเธเธกเธเนเธเธดเนเธ",
            "en-US": "Camping atmosphere image"
          },
          title: resolved.heroTitle,
          order: 1,
          isVisible: true
        }
      ]
    };
  }

  return {
    ...resolved,
    heroImageUrl: HERO_PLACEHOLDER_IMAGE,
    heroImages: [
      {
        id: "hero-placeholder",
        src: HERO_PLACEHOLDER_IMAGE,
        altText: {
          "th-TH": "เธ เธฒเธเธ•เธฑเธงเธญเธขเนเธฒเธเนเธเธเนเธเธกเธเนเธเธดเนเธ",
          "en-US": "Camping placeholder visual"
        },
        title: resolved.heroTitle,
        order: 1,
        isVisible: true
      }
    ]
  };
}


