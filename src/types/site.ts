export type ContentMode = "static" | "api";

export type LocaleCode = "th" | "en";

export interface TenantContext {
  tenantSlug: string;
  tenantId: string;
  brand: string;
  locale: LocaleCode;
}

export interface HeroBlock {
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  heroImageUrl: string;
}

export interface HighlightStat {
  label: string;
  value: string;
}

export interface GalleryImage {
  id: string;
  alt: string;
  imageUrl: string;
}

export interface ContactBlock {
  phone: string;
  email: string;
  lineId?: string;
}

export interface RoomCardDTO {
  id: string;
  name: string;
  description: string;
  nightlyPriceTHB: number;
  imageUrl: string;
  badge?: string;
}

export interface PackageCardDTO {
  id: string;
  name: string;
  description: string;
  priceTHB: number;
  durationText: string;
}

export interface SiteHomeDTO {
  tenant: TenantContext;
  hero: HeroBlock;
  stats: HighlightStat[];
  highlights: string[];
  featuredRooms: RoomCardDTO[];
  featuredPackages: PackageCardDTO[];
  gallery: GalleryImage[];
  contact: ContactBlock;
}

export interface LeadRequestDTO {
  name: string;
  email?: string;
  phone?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  message?: string;
}
