import type { SiteHomeDTO } from "@/lib/types/site";
import { sanitizeSiteFooter } from "@/lib/content/footer";
import { sanitizeHomepageActivities } from "@/lib/content/homepage-activities";
import { sanitizeHomepageAmenities } from "@/lib/content/homepage-amenities";
import { sanitizeHomepageHotelInfo } from "@/lib/content/homepage-hotel-info";
import { sanitizeHomepageRoomHighlights } from "@/lib/content/homepage-room-highlights";
import { sanitizeRoomsFeaturedGallery } from "@/lib/content/rooms-featured-gallery";
import { sanitizeRoomsIntro } from "@/lib/content/rooms-intro";
import { sanitizeSiteUiSettings } from "@/lib/content/site-ui";

export function sanitizeSiteHomeDTO(home: SiteHomeDTO): SiteHomeDTO {
  return {
    ...home,
    roomsIntro: sanitizeRoomsIntro(home.roomsIntro),
    homepageRoomHighlights: sanitizeHomepageRoomHighlights(home.homepageRoomHighlights),
    roomsFeaturedGallery: sanitizeRoomsFeaturedGallery(home.roomsFeaturedGallery),
    homepageActivities: sanitizeHomepageActivities(home.homepageActivities),
    homepageAmenities: sanitizeHomepageAmenities(home.homepageAmenities),
    homepageHotelInfo: sanitizeHomepageHotelInfo(home.homepageHotelInfo),
    ui: sanitizeSiteUiSettings(home.ui),
    footer: sanitizeSiteFooter(home.footer),
    tenant: {
      tenantSlug: home.tenant.tenantSlug,
      brand: home.tenant.brand,
      locale: home.tenant.locale
    }
  };
}
