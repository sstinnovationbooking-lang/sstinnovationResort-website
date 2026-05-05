export type ContentMode = "static" | "api";

export type LocaleCode = "th" | "en";

export type TenantContext = {
  tenantSlug: string;
  brand: string;
  locale: LocaleCode;
};

export type TenantProfileDTO = Pick<TenantContext, "tenantSlug" | "brand" | "locale">;

export type HeroDTO = {
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  heroImageUrl: string;
};

export type HighlightStatDTO = {
  label: string;
  value: string;
};

export type GalleryDTO = {
  id: string;
  alt: string;
  imageUrl: string;
};

export type ContactDTO = {
  phone: string;
  email: string;
  lineId?: string;
};

export type RoomCardDTO = {
  id: string;
  name: string;
  description: string;
  nightlyPriceTHB: number;
  imageUrl: string;
  badge?: string;
};

export type PackageCardDTO = {
  id: string;
  name: string;
  description: string;
  priceTHB: number;
  durationText: string;
};

export type SiteHomeDTO = {
  tenant: TenantProfileDTO;
  hero: HeroDTO;
  stats: HighlightStatDTO[];
  highlights: string[];
  featuredRooms: RoomCardDTO[];
  featuredPackages: PackageCardDTO[];
  gallery: GalleryDTO[];
  contact: ContactDTO;
};

export type LeadRequestDTO = {
  customerName: string;
  phone?: string;
  email?: string;
  checkIn?: string;
  checkOut?: string;
  roomId?: string;
  message?: string;
};

export type LeadResponseDTO = {
  ok: true;
  referenceId: string;
};

export type ApiErrorDTO = {
  error: string;
  details?: string[];
};
