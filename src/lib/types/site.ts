export type ContentMode = "static" | "api";

export type LocaleCode =
  | "th"
  | "en"
  | "lo"
  | "zh"
  | "ja"
  | "ko"
  | "ru"
  | "fr"
  | "de"
  | "es"
  | "it"
  | "pt"
  | "id"
  | "vi"
  | "ms"
  | "hi"
  | "ar";

export type TenantContext = {
  tenantSlug: string;
  brand: string;
  locale: LocaleCode;
  ownerId: string;
  resortId: string;
};

export type TenantProfileDTO = Pick<TenantContext, "tenantSlug" | "brand" | "locale">;

export type HeroDTO = {
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  heroImageUrl: string;
};

export type RoomsIntroDTO = {
  eyebrow: string;
  heading: string;
  description: string;
  isVisible?: boolean;
};

export type FeaturedGalleryItemDTO = {
  id: string;
  title: string;
  sizeText: string;
  imageUrl: string;
  altText?: string;
  order?: number;
  isVisible?: boolean;
};

export type HomepageAmenityItemDTO = {
  id: string;
  iconKey: string;
  title: string;
  description: string;
  order: number;
  isVisible: boolean;
};

export type HomepageAmenitiesDTO = {
  eyebrow: string;
  heading: string;
  isVisible?: boolean;
  items: HomepageAmenityItemDTO[];
};

export type HomepageHotelInfoItemDTO = {
  id: string;
  iconKey: string;
  title: string;
  description?: string;
  order: number;
  isVisible: boolean;
};

export type HomepageHotelInfoDTO = {
  heading: string;
  isVisible?: boolean;
  items: HomepageHotelInfoItemDTO[];
};

export type HomepageRoomHighlightItemDTO = {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  buttonText?: string;
  buttonHref?: string;
  imageUrl: string;
  imageAlt?: string;
  imagePosition?: "left" | "right";
  order: number;
  isVisible: boolean;
};

export type HomepageRoomHighlightsDTO = {
  isVisible?: boolean;
  items: HomepageRoomHighlightItemDTO[];
};

export type FooterMenuItemDTO = {
  label: string;
  href?: string;
};

export type FooterContactDTO = {
  address: string;
  phone: string;
  email: string;
  supportHours?: string;
};

export type SiteFooterDTO = {
  brandName: string;
  description: string;
  logoUrl?: string;
  menuItems?: FooterMenuItemDTO[];
  contact: FooterContactDTO;
  systemLinks?: FooterMenuItemDTO[];
  copyrightText?: string;
  isVisible?: boolean;
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

export type RoomSearchCriteria = {
  checkIn?: string;
  nights?: number;
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
  roomsIntro?: RoomsIntroDTO;
  homepageRoomHighlights?: HomepageRoomHighlightsDTO;
  roomsFeaturedGallery?: FeaturedGalleryItemDTO[];
  homepageAmenities?: HomepageAmenitiesDTO;
  homepageHotelInfo?: HomepageHotelInfoDTO;
  footer?: SiteFooterDTO;
  stats: HighlightStatDTO[];
  highlights: string[];
  featuredRooms: RoomCardDTO[];
  featuredPackages: PackageCardDTO[];
  gallery: GalleryDTO[];
  contact: ContactDTO;
  ui?: SiteUiSettingsDTO;
};

export type NavbarVisualMode = "transparent" | "solid";

export type NavbarLogoDTO = {
  type: "text" | "image";
  primaryText?: string;
  secondaryText?: string;
  imageUrl?: string;
  alt?: string;
  accentColor?: string;
};

export type NavbarLinkDTO = {
  label: string;
  href: string;
};

export type NavbarSettingsDTO = {
  mode: NavbarVisualMode;
  logo: NavbarLogoDTO;
  leftLinks: NavbarLinkDTO[];
  rightLinks: NavbarLinkDTO[];
  cta?: NavbarLinkDTO;
  showSearchStrip?: boolean;
};

export type SiteUiSettingsDTO = {
  navbar?: NavbarSettingsDTO;
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
