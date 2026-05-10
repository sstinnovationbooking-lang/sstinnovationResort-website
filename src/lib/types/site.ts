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

export type SupportedLocaleTag =
  | "th-TH"
  | "en-US"
  | "lo-LA"
  | "zh-CN"
  | "ja-JP"
  | "ko-KR"
  | "ru-RU"
  | "fr-FR"
  | "de-DE"
  | "es-ES"
  | "it-IT"
  | "pt-PT"
  | "id-ID"
  | "vi-VN"
  | "ms-MY"
  | "hi-IN"
  | "ar-SA";

export type LocalizedText = string | Partial<Record<LocaleCode | SupportedLocaleTag | string, string>>;

export type TenantContext = {
  tenantSlug: string;
  brand: string;
  locale: LocaleCode;
  ownerId: string;
  resortId: string;
};

export type TenantProfileDTO = Pick<TenantContext, "tenantSlug" | "brand" | "locale">;

export type HeroDTO = {
  eyebrow: LocalizedText;
  title: LocalizedText;
  subtitle: LocalizedText;
  ctaLabel: LocalizedText;
  heroImageUrl: string;
};

export type RoomsIntroDTO = {
  eyebrow: LocalizedText;
  heading: LocalizedText;
  description: LocalizedText;
  isVisible?: boolean;
};

export type FeaturedGalleryItemDTO = {
  id: string;
  title: LocalizedText;
  sizeText: LocalizedText;
  imageUrl: string;
  altText?: LocalizedText;
  order?: number;
  isVisible?: boolean;
};

export type HomepageAmenityItemDTO = {
  id: string;
  iconKey: string;
  title: LocalizedText;
  description: LocalizedText;
  order: number;
  isVisible: boolean;
};

export type HomepageAmenitiesDTO = {
  eyebrow: LocalizedText;
  heading: LocalizedText;
  isVisible?: boolean;
  items: HomepageAmenityItemDTO[];
};

export type HomepageHotelInfoItemDTO = {
  id: string;
  iconKey: string;
  title: LocalizedText;
  description?: LocalizedText;
  order: number;
  isVisible: boolean;
};

export type HomepageHotelInfoDTO = {
  heading: LocalizedText;
  isVisible?: boolean;
  items: HomepageHotelInfoItemDTO[];
};

export type HomepageRoomHighlightItemDTO = {
  id: string;
  title: LocalizedText;
  subtitle?: LocalizedText;
  description: LocalizedText;
  buttonText?: LocalizedText;
  buttonHref?: string;
  imageUrl: string;
  imageAlt?: LocalizedText;
  imagePosition?: "left" | "right";
  order: number;
  isVisible: boolean;
};

export type HomepageRoomHighlightsDTO = {
  isVisible?: boolean;
  maxItems?: number;
  displayLimit?: number;
  items: HomepageRoomHighlightItemDTO[];
};

export type HomepageActivityItemDTO = {
  id: string;
  title: LocalizedText;
  description?: LocalizedText;
  imageUrl: string;
  altText?: LocalizedText;
  order: number;
  isVisible: boolean;
};

export type HomepageActivitiesDTO = {
  heading: LocalizedText;
  isVisible?: boolean;
  items: HomepageActivityItemDTO[];
};

export type CampingHighlightItemDTO = {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  iconKey?: string;
  order: number;
  isVisible: boolean;
};

export type CampingPackageItemDTO = {
  id: string;
  name: LocalizedText;
  description: LocalizedText;
  priceTHB: number;
  durationText: LocalizedText;
  includedItems?: LocalizedText[];
  recommendedFor?: LocalizedText;
  ctaLabel?: LocalizedText;
  ctaHref?: string;
  badge?: LocalizedText;
  priceNote?: LocalizedText;
  iconKey?: string;
  order: number;
  isVisible: boolean;
};

export type CampingImageItemDTO = {
  id: string;
  src: string;
  altText: LocalizedText;
  title?: LocalizedText;
  description?: LocalizedText;
  order?: number;
  isVisible?: boolean;
};

export type CampingContentDTO = {
  heroEyebrow: LocalizedText;
  heroTitle: LocalizedText;
  heroSubtitle: LocalizedText;
  heroImageUrl: string;
  heroImages?: CampingImageItemDTO[];
  heroPrimaryCtaLabel: LocalizedText;
  heroPrimaryCtaHref?: string;
  heroSecondaryCtaLabel: LocalizedText;
  heroSecondaryCtaHref?: string;
  overviewTitle: LocalizedText;
  overviewDescription: LocalizedText;
  quickInfoTitle: LocalizedText;
  quickInfoItems: CampingHighlightItemDTO[];
  serviceTypesTitle: LocalizedText;
  serviceTypes: CampingPackageItemDTO[];
  facilitiesTitle: LocalizedText;
  facilities: CampingHighlightItemDTO[];
  rulesTitle: LocalizedText;
  rules: CampingHighlightItemDTO[];
  addOnsTitle: LocalizedText;
  addOns: CampingPackageItemDTO[];
  galleryTitle: LocalizedText;
  galleryModalTitle?: LocalizedText;
  galleryModalDescription?: LocalizedText;
  galleryModalCtaLabel?: LocalizedText;
  galleryModalCtaHref?: string;
  galleryImages?: CampingImageItemDTO[];
  galleryItems: FeaturedGalleryItemDTO[];
  ctaTitle: LocalizedText;
  ctaDescription: LocalizedText;
  ctaPrimaryLabel: LocalizedText;
  ctaSecondaryLabel?: LocalizedText;
  isVisible?: boolean;
};

export type AboutSectionItemDTO = {
  id: string;
  title: LocalizedText;
  description?: LocalizedText;
  href?: string;
  order: number;
  isVisible: boolean;
};

export type AboutPageDTO = {
  eyebrow?: LocalizedText;
  heading: LocalizedText;
  subtitle?: LocalizedText;
  description?: LocalizedText;
  content?: LocalizedText;
  imageUrl?: string;
  imageAlt?: LocalizedText;
  sections?: AboutSectionItemDTO[];
  isVisible?: boolean;
};

export type ArticleCardItemDTO = {
  id: string;
  title: LocalizedText;
  excerpt?: LocalizedText;
  href?: string;
  slug?: string;
  imageUrl?: string;
  imageAlt?: LocalizedText;
  category?: LocalizedText;
  publishedAt?: string;
  order: number;
  isVisible: boolean;
};

export type ArticlesPageDTO = {
  eyebrow?: LocalizedText;
  heading: LocalizedText;
  description?: LocalizedText;
  items: ArticleCardItemDTO[];
  isVisible?: boolean;
};

export type FooterMenuItemDTO = {
  label: LocalizedText;
  href?: string;
};

export type FooterSocialPlatform = "facebook" | "line" | "messenger" | "youtube" | string;

export type FooterSocialLinkDTO = {
  id: string;
  platform: FooterSocialPlatform;
  label?: LocalizedText;
  url?: string;
  enabled?: boolean;
  order?: number;
};

export type FooterContactDTO = {
  address: LocalizedText;
  phone: LocalizedText;
  email: LocalizedText;
  supportHours?: LocalizedText;
};

export type FooterCopyrightDTO = {
  year?: number;
  developerName?: LocalizedText;
  resortName?: LocalizedText;
  rightsText?: LocalizedText;
  legalTitle?: LocalizedText;
  legalBody?: LocalizedText;
};

export type SiteFooterDTO = {
  brandName: LocalizedText;
  description: LocalizedText;
  logoUrl?: string;
  menuItems?: FooterMenuItemDTO[];
  contact: FooterContactDTO;
  systemLinks?: FooterMenuItemDTO[];
  socialLinks?: FooterSocialLinkDTO[];
  copyrightText?: LocalizedText;
  copyright?: FooterCopyrightDTO;
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
  line?: string;
  lineId?: string;
  country?: LocalizedText;
  openingHours?: LocalizedText;
  address?: LocalizedText;
  mapUrl?: string;
  facebookUrl?: string;
  contactTitle?: LocalizedText;
  footerTitle?: LocalizedText;
};

export type RoomCardDTO = {
  id: string;
  tenantSlug?: string;
  ownerId?: string;
  resortId?: string;
  zoneId?: string;
  zoneName?: LocalizedText;
  name: string;
  title?: string;
  description: string;
  image?: string;
  gallery?: string[];
  sizeSqm?: number;
  maxGuests?: number;
  pricePerNight?: number;
  currency?: string;
  availableRooms?: number;
  totalRooms?: number;
  isAvailable?: boolean;
  cancellationPolicy?: string;
  taxFeeNote?: string;
  lowAvailabilityThreshold?: number;
  roomType?: string;
  category?: string;
  sortOrder?: number;
  detailsUrl?: string;
  amenities?: string[];
  features?: string[];
  nightlyPriceTHB: number;
  imageUrl: string;
  badge?: string;
};

export type RoomSearchCriteria = {
  checkIn?: string;
  nights?: number;
  guests?: number;
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
  aboutPage?: AboutPageDTO;
  articlesPage?: ArticlesPageDTO;
  camping?: CampingContentDTO;
  homepageRoomHighlights?: HomepageRoomHighlightsDTO;
  roomsFeaturedGallery?: FeaturedGalleryItemDTO[];
  homepageActivities?: HomepageActivitiesDTO;
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

export type BookingPackageMode = "contact_only" | "booking_enabled";
export type BookingPaymentOption = "deposit_50" | "full";

export type SiteBookingSettingsDTO = {
  mode?: BookingPackageMode;
  allowBookingForm?: boolean;
  contactRoute?: string;
  paymentOptions?: BookingPaymentOption[];
  defaultPaymentOption?: BookingPaymentOption;
  depositPercent?: number;
};

export type SiteAlertMode =
  | "none"
  | "lock_maintenance"
  | "lock_payment_overdue"
  | "banner_maintenance";

export type SiteAlertButtonDTO = {
  label: LocalizedText;
  href?: string;
  style?: "primary" | "secondary";
};

export type SiteAlertSettingsDTO = {
  enabled?: boolean;
  mode?: SiteAlertMode;
  noticeId?: string;
  title?: LocalizedText;
  message?: LocalizedText;
  description?: LocalizedText;
  bannerMessage?: LocalizedText;
  bannerDetail?: LocalizedText;
  dismissible?: boolean;
  buttons?: SiteAlertButtonDTO[];
};

export type SiteUiSettingsDTO = {
  navbar?: NavbarSettingsDTO;
  booking?: SiteBookingSettingsDTO;
  alerts?: SiteAlertSettingsDTO;
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
