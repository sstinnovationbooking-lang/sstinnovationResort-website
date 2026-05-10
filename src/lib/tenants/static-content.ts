import { getTenantBySlug } from "@/lib/tenants/registry";
import { toTenantDTO } from "@/lib/tenants/registry";
import type {
  CampingContentDTO,
  CampingImageItemDTO,
  HomepageActivitiesDTO,
  HomepageAmenitiesDTO,
  HomepageHotelInfoDTO,
  HomepageRoomHighlightsDTO,
  PackageCardDTO,
  RoomCardDTO,
  SiteHomeDTO
} from "@/lib/types/site";

interface TenantStaticContent {
  home: Omit<SiteHomeDTO, "tenant">;
  rooms: RoomCardDTO[];
}

const forestRooms: RoomCardDTO[] = [
  {
    id: "fr-garden-villa",
    name: "Garden Villa",
    title: "Garden Villa Private Retreat",
    description: "วิลล่ากลางสวนส่วนตัว เงียบสงบ เหมาะกับคู่รักและครอบครัวขนาดเล็ก",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80"
    ],
    sizeSqm: 42,
    maxGuests: 2,
    pricePerNight: 2990,
    currency: "THB",
    availableRooms: 3,
    totalRooms: 8,
    isAvailable: true,
    cancellationPolicy: "Free cancellation up to 72 hours before check-in.",
    taxFeeNote: "Taxes and fees not included",
    lowAvailabilityThreshold: 2,
    roomType: "Villa",
    category: "Private",
    sortOrder: 1,
    detailsUrl: "#",
    nightlyPriceTHB: 2990,
    badge: "สวนส่วนตัว",
    imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "fr-mountain-cabin",
    name: "Mountain Cabin",
    title: "Mountain Cabin Panorama",
    description: "เคบินวิวภูเขา โทนอบอุ่น พร้อมระเบียงชมธรรมชาติ",
    image: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80"
    ],
    sizeSqm: 36,
    maxGuests: 3,
    pricePerNight: 3490,
    currency: "THB",
    availableRooms: 1,
    totalRooms: 6,
    isAvailable: true,
    cancellationPolicy: "Free cancellation up to 48 hours before check-in.",
    taxFeeNote: "Taxes and fees not included",
    lowAvailabilityThreshold: 2,
    roomType: "Cabin",
    category: "Mountain view",
    sortOrder: 2,
    detailsUrl: "#",
    nightlyPriceTHB: 3490,
    badge: "วิวภูเขา",
    imageUrl: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "fr-river-pool-villa",
    name: "River Pool Villa",
    title: "River Pool Villa Premium",
    description: "พูลวิลล่าริมน้ำพร้อมสระส่วนตัว เหมาะกับทริปกลุ่มเพื่อน",
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1505692952047-1a78307da8f2?auto=format&fit=crop&w=1200&q=80"
    ],
    sizeSqm: 58,
    maxGuests: 4,
    pricePerNight: 5890,
    currency: "THB",
    availableRooms: 0,
    totalRooms: 4,
    isAvailable: false,
    cancellationPolicy: "Non-refundable rate for selected stay dates.",
    taxFeeNote: "Taxes and fees not included",
    lowAvailabilityThreshold: 1,
    roomType: "Pool Villa",
    category: "Private",
    sortOrder: 3,
    detailsUrl: "#",
    nightlyPriceTHB: 5890,
    badge: "พูลวิลล่า",
    imageUrl: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80"
  }
];

const forestPackages: PackageCardDTO[] = [
  {
    id: "fr-weekend",
    name: "Weekend Nature Retreat",
    description: "รวมอาหารเช้า เดินป่า และดินเนอร์ท้องถิ่น",
    priceTHB: 4590,
    durationText: "2 คืน / 2 ท่าน"
  },
  {
    id: "fr-family",
    name: "Family Explorer",
    description: "กิจกรรมครอบครัวพร้อมไกด์ และเวิร์กชอปธรรมชาติ",
    priceTHB: 6990,
    durationText: "2 คืน / 4 ท่าน"
  }
];

const lakeRooms: RoomCardDTO[] = [
  {
    id: "ls-lake-suite",
    name: "Lakeside Suite",
    title: "Lakeside Suite Serenity",
    description: "ห้องพักวิวทะเลสาบ ตื่นมาพร้อมหมอกเช้าและอาหารเช้าริมน้ำ",
    image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80"
    ],
    sizeSqm: 40,
    maxGuests: 2,
    pricePerNight: 3890,
    currency: "THB",
    availableRooms: 2,
    totalRooms: 5,
    isAvailable: true,
    cancellationPolicy: "Free cancellation up to 72 hours before check-in.",
    taxFeeNote: "Taxes and fees not included",
    lowAvailabilityThreshold: 2,
    roomType: "Suite",
    category: "Lake view",
    sortOrder: 1,
    detailsUrl: "#",
    nightlyPriceTHB: 3890,
    badge: "วิวทะเลสาบ",
    imageUrl: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "ls-wood-villa",
    name: "Wooden Villa",
    title: "Wooden Villa Family Stay",
    description: "บ้านไม้ร่วมสมัย เน้นความอบอุ่นและความเป็นส่วนตัว",
    image: "https://images.unsplash.com/photo-1499696010180-025ef6e1a8f9?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1499696010180-025ef6e1a8f9?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80"
    ],
    sizeSqm: 48,
    maxGuests: 4,
    pricePerNight: 4290,
    currency: "THB",
    availableRooms: 1,
    totalRooms: 4,
    isAvailable: true,
    cancellationPolicy: "Free cancellation up to 48 hours before check-in.",
    taxFeeNote: "Taxes and fees not included",
    lowAvailabilityThreshold: 1,
    roomType: "Villa",
    category: "Private",
    sortOrder: 2,
    detailsUrl: "#",
    nightlyPriceTHB: 4290,
    badge: "บ้านไม้",
    imageUrl: "https://images.unsplash.com/photo-1499696010180-025ef6e1a8f9?auto=format&fit=crop&w=1200&q=80"
  }
];

const lakePackages: PackageCardDTO[] = [
  {
    id: "ls-sunrise",
    name: "Sunrise Wellness",
    description: "โยคะริมทะเลสาบ + อาหารสุขภาพ + สปา",
    priceTHB: 5290,
    durationText: "2 คืน / 2 ท่าน"
  }
];

const defaultHomepageAmenities: HomepageAmenitiesDTO = {
  eyebrow: "บริการของเรา",
  heading: "สิ่งอำนวยความสะดวกของโรงแรม",
  isVisible: true,
  items: [
    {
      id: "security",
      iconKey: "security-camera",
      title: "ความปลอดภัย",
      description: "ระบบรักษาความปลอดภัยและกล้อง CCTV เพื่อความอุ่นใจของผู้เข้าพัก",
      order: 1,
      isVisible: true
    },
    {
      id: "laundry",
      iconKey: "laundry",
      title: "ซักรีดและซักแห้ง",
      description: "บริการซักรีดสำหรับผู้เข้าพัก เพื่อความสะดวกสบายตลอดการเข้าพัก",
      order: 2,
      isVisible: true
    },
    {
      id: "shuttle",
      iconKey: "shuttle",
      title: "บริการรถรับส่ง",
      description: "บริการรถรับส่งสำหรับผู้เข้าพัก ตามเงื่อนไขของรีสอร์ท",
      order: 3,
      isVisible: true
    },
    {
      id: "wifi",
      iconKey: "wifi",
      title: "อินเทอร์เน็ต Wi-Fi",
      description: "บริการอินเทอร์เน็ตไร้สายสำหรับผู้เข้าพักในพื้นที่ที่กำหนด",
      order: 4,
      isVisible: true
    },
    {
      id: "breakfast",
      iconKey: "breakfast",
      title: "อาหารเช้า",
      description: "บริการอาหารเช้าสำหรับผู้เข้าพักตามแพ็กเกจที่เลือก",
      order: 5,
      isVisible: true
    },
    {
      id: "support",
      iconKey: "support",
      title: "บริการลูกค้า",
      description: "ทีมงานพร้อมดูแลและให้ข้อมูลสำหรับการเข้าพักของคุณ",
      order: 6,
      isVisible: true
    }
  ]
};

function cloneDefaultHomepageAmenities(): HomepageAmenitiesDTO {
  return {
    ...defaultHomepageAmenities,
    items: defaultHomepageAmenities.items.map((item) => ({ ...item }))
  };
}

const defaultHomepageHotelInfo: HomepageHotelInfoDTO = {
  heading: "ข้อมูลโรงแรม",
  isVisible: true,
  items: [
    {
      id: "check-in",
      iconKey: "clock",
      title: "เช็คอิน:",
      description: "",
      order: 1,
      isVisible: true
    },
    {
      id: "check-out",
      iconKey: "clock",
      title: "เช็คเอาท์:",
      description: "",
      order: 2,
      isVisible: true
    },
    {
      id: "minimum-age",
      iconKey: "check",
      title: "อายุขั้นต่ำในการเช็คอิน 18",
      description: "",
      order: 3,
      isVisible: true
    },
    {
      id: "front-desk",
      iconKey: "bell",
      title: "เคาน์เตอร์ต้อนรับ",
      description: "",
      order: 4,
      isVisible: true
    },
    {
      id: "pet-policy",
      iconKey: "pet",
      title: "นโยบายด้านสัตว์เลี้ยง",
      description: "ไม่อนุญาตให้นำสัตว์เลี้ยงเข้าพัก",
      order: 5,
      isVisible: true
    },
    {
      id: "parking",
      iconKey: "parking",
      title: "ที่จอดรถ",
      description: "บริการที่จอดรถฟรี",
      order: 6,
      isVisible: true
    }
  ]
};

function cloneDefaultHomepageHotelInfo(): HomepageHotelInfoDTO {
  return {
    ...defaultHomepageHotelInfo,
    items: defaultHomepageHotelInfo.items.map((item) => ({ ...item }))
  };
}

const defaultHomepageRoomHighlights: HomepageRoomHighlightsDTO = {
  isVisible: true,
  maxItems: 4,
  displayLimit: 1,
  items: [
    {
      id: "deluxe-king-bed",
      title: "DELUXE KING BED",
      subtitle: "30 SQUARE METERS OF SPACE",
      description:
        "Deluxe King Bed is a private room, designed for a single guest or a couple. Equipped with a king-sized bed, comfortable bedding, and great amenities.",
      buttonText: "READ MORE",
      buttonHref: "/rooms",
      imageUrl: "",
      imageAlt: "Deluxe King Bed",
      imagePosition: "left",
      order: 1,
      isVisible: true
    },
    {
      id: "deluxe-twin-bed",
      title: "DELUXE TWIN BED",
      subtitle: "30 SQUARE METERS OF SPACE",
      description:
        "Deluxe Twin Room is a spacious room with two separate beds. This room is ideal for couples or friends who wish to stay in the same room.",
      buttonText: "READ MORE",
      buttonHref: "/rooms",
      imageUrl: "",
      imageAlt: "Deluxe Twin Bed",
      imagePosition: "right",
      order: 2,
      isVisible: false
    },
    {
      id: "deluxe-triple-room",
      title: "DELUXE TRIPLE ROOM",
      subtitle: "32 SQUARE METERS OF SPACE",
      description:
        "A comfortable room designed for small groups or families, with practical space and relaxing resort-style atmosphere.",
      buttonText: "READ MORE",
      buttonHref: "/rooms",
      imageUrl: "",
      imageAlt: "Deluxe Triple Room",
      imagePosition: "left",
      order: 3,
      isVisible: false
    },
    {
      id: "private-villa",
      title: "PRIVATE VILLA",
      subtitle: "RELAXING PRIVATE SPACE",
      description:
        "A private villa-style stay with a peaceful atmosphere, ideal for guests who want comfort, privacy, and a premium resort experience.",
      buttonText: "READ MORE",
      buttonHref: "/rooms",
      imageUrl: "",
      imageAlt: "Private Villa",
      imagePosition: "right",
      order: 4,
      isVisible: false
    }
  ]
};

function cloneDefaultHomepageRoomHighlights(): HomepageRoomHighlightsDTO {
  return {
    ...defaultHomepageRoomHighlights,
    items: defaultHomepageRoomHighlights.items.map((item) => ({ ...item }))
  };
}

const defaultHomepageActivities: HomepageActivitiesDTO = {
  heading: "กิจกรรมของเรา",
  isVisible: true,
  items: [
    {
      id: "tour",
      title: "ทัวร์และสถานที่ท่องเที่ยว",
      imageUrl: "",
      altText: "ทัวร์และสถานที่ท่องเที่ยว",
      order: 1,
      isVisible: true
    },
    {
      id: "kayak",
      title: "กิจกรรมสนุก ๆ",
      imageUrl: "",
      altText: "กิจกรรมสนุก ๆ",
      order: 2,
      isVisible: true
    },
    {
      id: "travel",
      title: "ประกันการเดินทาง",
      imageUrl: "",
      altText: "ประกันการเดินทาง",
      order: 3,
      isVisible: true
    },
    {
      id: "nature",
      title: "กิจกรรมกลางแจ้ง",
      imageUrl: "",
      altText: "กิจกรรมกลางแจ้ง",
      order: 4,
      isVisible: true
    },
    {
      id: "dining",
      title: "อาหารและเครื่องดื่ม",
      imageUrl: "",
      altText: "อาหารและเครื่องดื่ม",
      order: 5,
      isVisible: true
    },
    {
      id: "relax",
      title: "พักผ่อนและสปา",
      imageUrl: "",
      altText: "พักผ่อนและสปา",
      order: 6,
      isVisible: true
    }
  ]
};

function cloneDefaultHomepageActivities(images: string[]): HomepageActivitiesDTO {
  const safeImages = images.filter((value) => String(value).trim().length > 0);
  const firstImage = safeImages[0] ?? "";

  return {
    ...defaultHomepageActivities,
    items: defaultHomepageActivities.items.map((item, index) => ({
      ...item,
      imageUrl: safeImages[index] ?? firstImage
    }))
  };
}

function buildCampingContent(options: {
  heroImages: string[];
  galleryImages: string[];
  reservationMode: { th: string; en: string };
  capacity: { th: string; en: string };
  optionALabel?: { th: string; en: string };
  optionBLabel?: { th: string; en: string };
}): CampingContentDTO {
  const optionA = options.optionALabel ?? { th: "ลานกางเต็นท์", en: "Bring your own tent" };
  const optionB = options.optionBLabel ?? { th: "เช่าเต็นท์รีสอร์ต", en: "Resort tent rental" };
  const heroImages = options.heroImages.filter((item) => String(item).trim().length > 0);
  const galleryImages = options.galleryImages.filter((item) => String(item).trim().length > 0);
  const toMediaItems = (items: string[], key: "hero" | "gallery"): CampingImageItemDTO[] =>
    items.slice(0, 6).map((src, index) => ({
      id: `camp-${key}-${index + 1}`,
      src,
      altText: {
        "th-TH": key === "hero" ? `ภาพสไลด์แคมป์ ${index + 1}` : `ภาพแกลเลอรีแคมป์ ${index + 1}`,
        "en-US": key === "hero" ? `Camping hero slide ${index + 1}` : `Camping gallery image ${index + 1}`
      },
      title: {
        "th-TH": key === "hero" ? `บรรยากาศโซนแคมป์ ${index + 1}` : `โซนแคมป์ปิ้ง ${index + 1}`,
        "en-US": key === "hero" ? `Camping atmosphere ${index + 1}` : `Camping zone ${index + 1}`
      },
      description: {
        "th-TH": "รูปภาพตัวอย่างสำหรับเทมเพลต (เปลี่ยนตามรีสอร์ตได้ในอนาคต)",
        "en-US": "Template sample image (tenant-specific updates can come from backend later)."
      },
      order: index + 1,
      isVisible: true
    }));
  const heroImageItems = toMediaItems(heroImages, "hero");
  const galleryImageItems = toMediaItems(galleryImages, "gallery");

  return {
    heroEyebrow: {
      "th-TH": "Modern Camping by SST Resort Template",
      "en-US": "Modern camping by SST resort template"
    },
    heroTitle: {
      "th-TH": "Premium Camping Experience",
      "en-US": "Premium camping experience"
    },
    heroSubtitle: {
      "th-TH": "รองรับทั้งสายแคมป์ที่นำเต็นท์มาเอง และผู้เข้าพักที่ต้องการเช่าเต็นท์พร้อมบริการจากรีสอร์ต",
      "en-US": "Built for both self-camping guests and resort-managed tent rentals with ready-to-use services."
    },
    heroImageUrl: heroImages[0] ?? "",
    heroImages: heroImageItems,
    heroPrimaryCtaLabel: {
      "th-TH": "ติดต่อ / จองแคมป์",
      "en-US": "Contact / Reserve camping"
    },
    heroPrimaryCtaHref: "/contact",
    heroSecondaryCtaLabel: {
      "th-TH": "ดูห้องพักและแพ็กเกจ",
      "en-US": "View rooms and packages"
    },
    heroSecondaryCtaHref: "/rooms",
    overviewTitle: {
      "th-TH": "โซนแคมป์ปิ้งที่ปรับตามแต่ละรีสอร์ต",
      "en-US": "Tenant-ready camping setup"
    },
    overviewDescription: {
      "th-TH":
        "แต่ละเจ้าของรีสอร์ตสามารถกำหนดราคา บริการ เงื่อนไข และความพร้อมใช้งานได้เอง ข้อมูลในหน้านี้จึงออกแบบให้ต่อยอดกับ backend/central ได้ทันที",
      "en-US":
        "Each resort owner can configure pricing, services, conditions, and availability. This page model is designed for future backend and central integration."
    },
    quickInfoTitle: {
      "th-TH": "ข้อมูลสำคัญก่อนจอง",
      "en-US": "Quick trust information"
    },
    quickInfoItems: [
      {
        id: "check-in",
        title: { "th-TH": "เช็กอิน", "en-US": "Check-in" },
        description: { "th-TH": "ตั้งแต่ 14:00 น.", "en-US": "From 14:00" },
        iconKey: "clock",
        order: 1,
        isVisible: true
      },
      {
        id: "check-out",
        title: { "th-TH": "เช็กเอาต์", "en-US": "Check-out" },
        description: { "th-TH": "ภายใน 11:00 น.", "en-US": "Before 11:00" },
        iconKey: "clock",
        order: 2,
        isVisible: true
      },
      {
        id: "capacity",
        title: { "th-TH": "ความจุโดยประมาณ", "en-US": "Capacity" },
        description: { "th-TH": options.capacity.th, "en-US": options.capacity.en },
        iconKey: "users",
        order: 3,
        isVisible: true
      },
      {
        id: "reservation",
        title: { "th-TH": "สถานะการจอง", "en-US": "Reservation status" },
        description: { "th-TH": options.reservationMode.th, "en-US": options.reservationMode.en },
        iconKey: "shield",
        order: 4,
        isVisible: true
      }
    ],
    serviceTypesTitle: {
      "th-TH": "บริการแคมป์ปิ้ง",
      "en-US": "Camping Services"
    },
    serviceTypes: [
      {
        id: "bring-your-own-tent",
        name: { "th-TH": optionA.th, "en-US": optionA.en },
        description: {
          "th-TH": "เหมาะสำหรับผู้เข้าพักที่มีอุปกรณ์แคมป์ของตนเองและต้องการใช้บริการพื้นที่ลานกางเต็นท์",
          "en-US": "For guests bringing their own equipment and using the resort camping zone."
        },
        priceTHB: 150,
        durationText: { "th-TH": "ต่อคน / ต่อคืน", "en-US": "Per person / night" },
        includedItems: [
          { "th-TH": "พื้นที่กางเต็นท์", "en-US": "Tent pitch area" },
          { "th-TH": "ห้องน้ำส่วนกลาง", "en-US": "Shared bathrooms" },
          { "th-TH": "จุดจอดรถตามโซน", "en-US": "Designated parking zone" }
        ],
        recommendedFor: {
          "th-TH": "เหมาะกับสายแคมป์ที่มีอุปกรณ์ครบ",
          "en-US": "Recommended for experienced self-campers"
        },
        ctaLabel: { "th-TH": "สอบถามเงื่อนไขลานกางเต็นท์", "en-US": "Check pitch conditions" },
        ctaHref: "/contact",
        badge: { "th-TH": "เริ่มต้น 150", "en-US": "From 150" },
        priceNote: {
          "th-TH": "ราคาอาจปรับตามวันเข้าพักและจำนวนผู้เข้าพัก",
          "en-US": "Price may vary by date, season, and occupancy."
        },
        iconKey: "tent",
        order: 1,
        isVisible: true
      },
      {
        id: "resort-tent-rental",
        name: { "th-TH": optionB.th, "en-US": optionB.en },
        description: {
          "th-TH": "รีสอร์ตจัดเต็นท์และอุปกรณ์พื้นฐานให้พร้อม เน้นความสะดวกสำหรับผู้เข้าพักที่ไม่ต้องการเตรียมอุปกรณ์เอง",
          "en-US": "Resort-managed tent setup with essential equipment ready for convenient stays."
        },
        priceTHB: 450,
        durationText: { "th-TH": "เริ่มต้นต่อคน / ต่อคืน", "en-US": "Starting per person / night" },
        includedItems: [
          { "th-TH": "เต็นท์ตามขนาดที่เลือก", "en-US": "Tent based on selected size" },
          { "th-TH": "เครื่องนอนพื้นฐาน", "en-US": "Basic bedding" },
          { "th-TH": "สิทธิ์ใช้สิ่งอำนวยความสะดวกร่วม", "en-US": "Access to shared facilities" }
        ],
        recommendedFor: {
          "th-TH": "เหมาะกับผู้เริ่มต้นและครอบครัว",
          "en-US": "Recommended for beginners and families"
        },
        ctaLabel: { "th-TH": "ดูแพ็กเกจเช่าเต็นท์", "en-US": "View rental options" },
        ctaHref: "/contact",
        badge: { "th-TH": "เริ่มต้น 450", "en-US": "From 450" },
        priceNote: {
          "th-TH": "ราคาและอุปกรณ์ขึ้นกับแพ็กเกจและเงื่อนไขของรีสอร์ต",
          "en-US": "Pricing and inclusions depend on package and resort conditions."
        },
        iconKey: "star",
        order: 2,
        isVisible: true
      }
    ],
    facilitiesTitle: {
      "th-TH": "สิ่งอำนวยความสะดวกในโซนแคมป์",
      "en-US": "Camping facilities"
    },
    facilities: [
      {
        id: "bathroom",
        title: { "th-TH": "ห้องน้ำและจุดอาบน้ำ", "en-US": "Bathrooms and showers" },
        description: { "th-TH": "แยกโซนชาย/หญิง ทำความสะอาดตามรอบ", "en-US": "Separate male/female zones with scheduled cleaning." },
        iconKey: "water",
        order: 1,
        isVisible: true
      },
      {
        id: "electricity",
        title: { "th-TH": "จุดไฟฟ้า / ปลั๊กพ่วง", "en-US": "Power points" },
        description: { "th-TH": "มีจุดจ่ายไฟในพื้นที่ที่กำหนด", "en-US": "Power points available in designated areas." },
        iconKey: "bolt",
        order: 2,
        isVisible: true
      },
      {
        id: "parking",
        title: { "th-TH": "ที่จอดรถ", "en-US": "Parking" },
        description: { "th-TH": "จอดรถใกล้โซนแคมป์ตามผังพื้นที่", "en-US": "On-site parking near camping zones." },
        iconKey: "car",
        order: 3,
        isVisible: true
      },
      {
        id: "cooking",
        title: { "th-TH": "ลานทำอาหาร / BBQ", "en-US": "Cooking and BBQ area" },
        description: { "th-TH": "มีโซนสำหรับทำอาหารและนั่งพักรวม", "en-US": "Shared area for cooking, grilling, and gathering." },
        iconKey: "fire",
        order: 4,
        isVisible: true
      },
      {
        id: "signal",
        title: { "th-TH": "สัญญาณโทรศัพท์ / Wi‑Fi", "en-US": "Phone signal / Wi-Fi" },
        description: { "th-TH": "ให้บริการตามพื้นที่และเงื่อนไขรีสอร์ต", "en-US": "Coverage depends on area and resort conditions." },
        iconKey: "wifi",
        order: 5,
        isVisible: true
      }
    ],
    rulesTitle: {
      "th-TH": "กฎระเบียบและความปลอดภัย",
      "en-US": "Rules and safety"
    },
    rules: [
      {
        id: "quiet-hours",
        title: { "th-TH": "ช่วงเวลาเงียบ", "en-US": "Quiet hours" },
        description: { "th-TH": "22:00 - 06:00 น. งดใช้เสียงดัง", "en-US": "22:00 - 06:00. Please keep noise low." },
        iconKey: "moon",
        order: 1,
        isVisible: true
      },
      {
        id: "fire-policy",
        title: { "th-TH": "นโยบายการก่อไฟ", "en-US": "Campfire policy" },
        description: { "th-TH": "ห้ามก่อไฟบนพื้นหญ้า ให้ใช้จุดที่รีสอร์ตกำหนด", "en-US": "No campfire on grass. Use only designated fire points." },
        iconKey: "shield",
        order: 2,
        isVisible: true
      },
      {
        id: "pet-policy",
        title: { "th-TH": "นโยบายสัตว์เลี้ยง", "en-US": "Pet policy" },
        description: { "th-TH": "ขึ้นกับเงื่อนไขแต่ละรีสอร์ต โปรดสอบถามก่อนจอง", "en-US": "Depends on each resort policy. Please confirm before booking." },
        iconKey: "paw",
        order: 3,
        isVisible: true
      },
      {
        id: "waste-policy",
        title: { "th-TH": "การคัดแยกขยะ", "en-US": "Waste separation" },
        description: { "th-TH": "กรุณาแยกขยะและทิ้งตามจุดที่กำหนด", "en-US": "Please separate waste and dispose at designated points." },
        iconKey: "leaf",
        order: 4,
        isVisible: true
      }
    ],
    addOnsTitle: {
      "th-TH": "บริการเสริมและอุปกรณ์เช่า",
      "en-US": "Add-ons and rental equipment"
    },
    addOns: [
      {
        id: "addon-tent",
        name: { "th-TH": "เต็นท์เช่า", "en-US": "Tent rental" },
        description: { "th-TH": "ขนาด 2-4 ท่านตามความต้องการ", "en-US": "2-4 guest sizes available." },
        priceTHB: 450,
        durationText: { "th-TH": "เริ่มต้น / คืน", "en-US": "Starting / night" },
        priceNote: { "th-TH": "ขึ้นกับรุ่นและจำนวนผู้เข้าพัก", "en-US": "Depends on model and occupancy." },
        iconKey: "tent",
        order: 1,
        isVisible: true
      },
      {
        id: "addon-bedding",
        name: { "th-TH": "ชุดเครื่องนอน", "en-US": "Bedding set" },
        description: { "th-TH": "ที่นอน ผ้าห่ม หมอน", "en-US": "Mattress, blanket, and pillows." },
        priceTHB: 120,
        durationText: { "th-TH": "ต่อชุด", "en-US": "Per set" },
        iconKey: "moon",
        order: 2,
        isVisible: true
      },
      {
        id: "addon-grill",
        name: { "th-TH": "เตาปิ้งย่าง / เตาแก๊ส", "en-US": "Grill / Stove" },
        description: { "th-TH": "อุปกรณ์ทำอาหารสำหรับโซนกลางแจ้ง", "en-US": "Cooking equipment for outdoor use." },
        priceTHB: 180,
        durationText: { "th-TH": "ต่อชุด", "en-US": "Per set" },
        iconKey: "fire",
        order: 3,
        isVisible: true
      }
    ],
    galleryTitle: {
      "th-TH": "ภาพบรรยากาศโซนแคมป์",
      "en-US": "Camping Atmosphere Gallery"
    },
    galleryModalTitle: {
      "th-TH": "บรรยากาศแคมป์ปิ้ง",
      "en-US": "Camping atmosphere"
    },
    galleryModalDescription: {
      "th-TH": "ตัวอย่างภาพบรรยากาศของเทมเพลต สามารถปรับเป็นภาพจริงของแต่ละรีสอร์ตได้จากระบบหลังบ้านในอนาคต",
      "en-US": "Template preview images that can later be replaced by each resort's live content from backend systems."
    },
    galleryModalCtaLabel: {
      "th-TH": "ติดต่อเพื่อจองแคมป์",
      "en-US": "Contact to reserve camping"
    },
    galleryModalCtaHref: "/contact",
    galleryImages: galleryImageItems,
    galleryItems: galleryImages.slice(0, 3).map((imageUrl, index) => ({
      id: `camp-gallery-${index + 1}`,
      title: { "th-TH": `บรรยากาศแคมป์ ${index + 1}`, "en-US": `Camping view ${index + 1}` },
      sizeText: { "th-TH": "โซนแคมป์ปิ้ง", "en-US": "Camping area" },
      imageUrl,
      altText: { "th-TH": `ภาพแคมป์ปิ้ง ${index + 1}`, "en-US": `Camping image ${index + 1}` },
      order: index + 1,
      isVisible: true
    })),
    ctaTitle: {
      "th-TH": "ต้องการข้อเสนอแคมป์ที่เหมาะกับทริปของคุณ?",
      "en-US": "Need a camping option matched to your trip?"
    },
    ctaDescription: {
      "th-TH": "แจ้งจำนวนผู้เข้าพัก วันที่เข้าพัก และรูปแบบบริการที่ต้องการ ทีมงานจะช่วยแนะนำแพ็กเกจที่เหมาะที่สุด",
      "en-US": "Share guest count, stay dates, and preferred camping type. Our team will help recommend the best-fit option."
    },
    ctaPrimaryLabel: {
      "th-TH": "ติดต่อเพื่อจองแคมป์",
      "en-US": "Contact to reserve"
    },
    ctaSecondaryLabel: {
      "th-TH": "ดูห้องพักทั้งหมด",
      "en-US": "View all rooms"
    },
    isVisible: true
  };
}

const TENANT_CAMPING_CONTENT: Record<string, CampingContentDTO> = {
  "forest-escape": buildCampingContent({
    heroImages: ["/camping/forest/hero-1.svg", "/camping/forest/hero-2.svg", "/camping/forest/hero-3.svg"],
    galleryImages: ["/camping/forest/hero-1.svg", "/camping/forest/hero-2.svg", "/camping/forest/hero-3.svg"],
    reservationMode: { th: "รับจองล่วงหน้าและ Walk-in บางวัน", en: "Reservation + limited walk-in" },
    capacity: { th: "ประมาณ 80 คน / คืน", en: "Approx. 80 guests / night" }
  }),
  "lake-serenity": buildCampingContent({
    heroImages: ["/camping/lake/hero-1.svg", "/camping/lake/hero-2.svg", "/camping/lake/hero-3.svg"],
    galleryImages: ["/camping/lake/hero-1.svg", "/camping/lake/hero-2.svg", "/camping/lake/hero-3.svg"],
    reservationMode: { th: "แนะนำจองล่วงหน้า", en: "Advance reservation recommended" },
    capacity: { th: "ประมาณ 60 คน / คืน", en: "Approx. 60 guests / night" }
  }),
  "demo-resort": buildCampingContent({
    heroImages: ["/camping/demo/hero-1.svg", "/camping/demo/hero-2.svg", "/camping/demo/hero-3.svg"],
    galleryImages: ["/camping/demo/hero-1.svg", "/camping/demo/hero-2.svg", "/camping/demo/hero-3.svg"],
    reservationMode: { th: "โหมดทดสอบการจอง", en: "Demo reservation mode" },
    capacity: { th: "ประมาณ 30 คน / คืน", en: "Approx. 30 guests / night" },
    optionALabel: { th: "โหมดเดโม: นำเต็นท์มาเอง", en: "Demo: Bring your own tent" },
    optionBLabel: { th: "โหมดเดโม: เช่าเต็นท์รีสอร์ต", en: "Demo: Resort tent rental" }
  })
};

const TENANT_CONTENT: Record<string, TenantStaticContent> = {
  "forest-escape": {
    rooms: forestRooms,
    home: {
      hero: {
        eyebrow: "",
        title: "เว็บไซต์รีสอร์ตพร้อมระบบจอง ดีไซน์สวย รองรับทุกอุปกรณ์",
        subtitle: "เทมเพลตสำหรับรีสอร์ตที่ต้องการหน้าเว็บมืออาชีพ ปรับแบรนด์ได้ และเชื่อม backend",
        ctaLabel: "จองเลย",
        heroImageUrl:
          "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1800&q=80"
      },
      roomsIntro: {
        eyebrow: "ห้องพักหรูหรา นอนหลับสบาย",
        heading: "ห้องพัก",
        description:
          "เลือกสไตล์ห้องที่เหมาะกับการเข้าพักของคุณ พร้อมบรรยากาศรีสอร์ทที่ผ่อนคลาย สะดวกสบาย และรองรับทุกการใช้งาน",
        isVisible: true
      },
      homepageRoomHighlights: cloneDefaultHomepageRoomHighlights(),
      roomsFeaturedGallery: [
        {
          id: "forest-featured-king",
          title: "ห้องดีลักซ์เตียงคิงไซส์",
          sizeText: "พื้นที่ 32 ตร.ม",
          imageUrl: forestRooms[0]?.imageUrl ?? "",
          altText: "ห้องดีลักซ์เตียงคิงไซส์",
          order: 1,
          isVisible: true
        },
        {
          id: "forest-featured-twin",
          title: "ห้องดีลักซ์เตียงแฝด",
          sizeText: "พื้นที่ 32 ตร.ม",
          imageUrl: forestRooms[1]?.imageUrl ?? forestRooms[0]?.imageUrl ?? "",
          altText: "ห้องดีลักซ์เตียงแฝด",
          order: 2,
          isVisible: true
        },
        {
          id: "forest-featured-triple",
          title: "ห้องดีลักซ์สำหรับสามท่าน",
          sizeText: "พื้นที่ 32 ตร.ม",
          imageUrl: forestRooms[2]?.imageUrl ?? forestRooms[0]?.imageUrl ?? "",
          altText: "ห้องดีลักซ์สำหรับสามท่าน",
          order: 3,
          isVisible: true
        }
      ],
      homepageActivities: cloneDefaultHomepageActivities([
        forestRooms[0]?.imageUrl ?? "",
        forestRooms[1]?.imageUrl ?? "",
        forestRooms[2]?.imageUrl ?? "",
        "https://images.unsplash.com/photo-1470246973918-29a93221c455?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80"
      ]),
      homepageAmenities: cloneDefaultHomepageAmenities(),
      homepageHotelInfo: cloneDefaultHomepageHotelInfo(),
      footer: {
        brandName: "SST INNOVATION RESORT",
        description: "เว็บไซต์รีสอร์ทพร้อมระบบจอง รองรับหลายเจ้าของรีสอร์ท และเชื่อมต่อระบบหลังบ้าน",
        menuItems: [
          { label: "หน้าแรก", href: "/" },
          { label: "ห้องพัก", href: "/rooms" },
          { label: "กิจกรรม", href: "/activities" },
          { label: "เกี่ยวกับเรา", href: "/about" },
          { label: "ติดต่อเรา", href: "/contact" }
        ],
        contact: {
          address: "99/9 หมู่ 1 ตำบลตัวอย่าง อำเภอเมือง จังหวัดเชียงใหม่ 50000",
          phone: "084-337-4982",
          email: "contact@sstinnovationresort.com",
          supportHours: "ทุกวัน 08:00 - 20:00 น."
        },
        systemLinks: [
          { label: "ระบบจองห้องพัก" },
          { label: "เว็บไซต์รีสอร์ท" },
          { label: "รองรับ Multi-tenant" },
          { label: "เชื่อมต่อระบบหลังบ้าน" }
        ],
        socialLinks: [
          {
            id: "facebook",
            platform: "facebook",
            label: "Facebook",
            url: "https://facebook.com/forestescape",
            enabled: true,
            order: 1
          },
          {
            id: "line",
            platform: "line",
            label: "LINE",
            url: "https://line.me/ti/p/@forestescape",
            enabled: true,
            order: 2
          },
          {
            id: "messenger",
            platform: "messenger",
            label: "Messenger",
            url: "https://m.me/forestescape",
            enabled: true,
            order: 3
          },
          {
            id: "youtube",
            platform: "youtube",
            label: "YouTube",
            url: "https://youtube.com/@forestescape",
            enabled: true,
            order: 4
          }
        ],
        copyright: {
          year: 2026,
          developerName: {
            "th-TH": "SST INNOVATION CO., LTD.",
            "en-US": "SST INNOVATION CO., LTD."
          },
          resortName: {
            "th-TH": "Forest Escape Resort",
            "en-US": "Forest Escape Resort"
          },
          rightsText: {
            "th-TH": "สงวนลิขสิทธิ์ทั้งหมด",
            "en-US": "All rights reserved."
          },
          legalTitle: {
            "th-TH": "ข้อมูลลิขสิทธิ์และความเป็นเจ้าของ",
            "en-US": "Copyright and Ownership Information"
          },
          legalBody: {
            "th-TH":
              "ระบบเว็บไซต์นี้พัฒนาโดย {developerName} ส่วนเนื้อหาของรีสอร์ท เช่น ข้อความ รูปภาพ ข้อมูลห้องพัก โปรโมชั่น ข้อมูลติดต่อ และข้อมูลเฉพาะของรีสอร์ท เป็นลิขสิทธิ์ของ {resortName} ห้ามคัดลอก ดัดแปลง เผยแพร่ หรือนำไปใช้โดยไม่ได้รับอนุญาต",
            "en-US":
              "This website system is developed by {developerName}. The resort content, including text, images, room information, promotions, contact information, and other resort-specific materials, belongs to {resortName}. Copying, modifying, distributing, or reusing any content without permission is not allowed."
          }
        },
        copyrightText: "All rights reserved.",
        isVisible: true
      },
      stats: [
        { label: "โซนที่พัก", value: "12" },
        { label: "รีวิวเฉลี่ย", value: "4.9/5" },
        { label: "กิจกรรมกลางแจ้ง", value: "8" },
        { label: "บริการลูกค้า", value: "24/7" }
      ],
      highlights: [
        "รองรับมือถือ แท็บเล็ต และเดสก์ท็อป",
        "โครงสร้างพร้อมระบบ Multi-tenant",
        "เชื่อมระบบหลังบ้านผ่าน BFF API ได้ทันที"
      ],
      featuredRooms: forestRooms.slice(0, 3),
      featuredPackages: forestPackages,
      gallery: [
        {
          id: "fr-g1",
          alt: "Resort landscape",
          imageUrl:
            "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80"
        },
        {
          id: "fr-g2",
          alt: "Modern villa",
          imageUrl:
            "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80"
        },
        {
          id: "fr-g3",
          alt: "Nature cabin",
          imageUrl:
            "https://images.unsplash.com/photo-1470246973918-29a93221c455?auto=format&fit=crop&w=1200&q=80"
        }
      ],
      contact: {
        phone: "+66 89 000 1111",
        email: "booking@forestescape.example",
        lineId: "@forestescape",
        line: "@forestescape",
        country: {
          "th-TH": "ไทย",
          "en-US": "Thailand"
        },
        openingHours: {
          "th-TH": "ทุกวัน 08:00 - 20:00 น.",
          "en-US": "Daily 08:00 - 20:00"
        },
        address: {
          "th-TH": "99/9 หมู่ 1 ตำบลตัวอย่าง อำเภอเมือง จังหวัดเชียงใหม่ 50000",
          "en-US": "99/9 Moo 1, Example Subdistrict, Mueang District, Chiang Mai 50000"
        },
        contactTitle: {
          "th-TH": "ติดต่อเรา",
          "en-US": "Contact"
        },
        footerTitle: {
          "th-TH": "ข้อมูลการติดต่อ",
          "en-US": "Contact information"
        }
      },
      ui: {
        navbar: {
          mode: "transparent",
          logo: {
            type: "text",
            primaryText: "SST INNOVATION",
            secondaryText: "RESORT",
            accentColor: "#e86f4c"
          },
          leftLinks: [
            { label: "หน้าแรก", href: "/" },
            { label: "ห้องพัก", href: "/rooms" },
            { label: "กิจกรรม", href: "/activities" },
            { label: "เกี่ยวกับเรา", href: "/about" },
            { label: "ติดต่อเรา", href: "/contact" }
          ],
          rightLinks: [
            { label: "Help", href: "#contact" },
            { label: "Trips", href: "#rooms" }
          ],
          cta: { label: "Sign In or Join", href: "#lead-form" },
          showSearchStrip: true
        },
        booking: {
          mode: "booking_enabled",
          allowBookingForm: true,
          contactRoute: "/contact",
          paymentOptions: ["deposit_50", "full"],
          defaultPaymentOption: "deposit_50",
          depositPercent: 50
        }
      }
    }
  },
  "lake-serenity": {
    rooms: lakeRooms,
    home: {
      hero: {
        eyebrow: "รีสอร์ตริมทะเลสาบ สไตล์พักผ่อน",
        title: "Lake Serenity Resort\nพักสบาย ชมวิวทุกเช้า",
        subtitle: "เทมเพลตเดียวกัน ปรับแบรนด์สำหรับแต่ละ tenant ได้ทันที",
        ctaLabel: "ส่งคำขอเข้าพัก",
        heroImageUrl:
          "https://images.unsplash.com/photo-1470770903676-69b98201ea1c?auto=format&fit=crop&w=1800&q=80"
      },
      roomsIntro: {
        eyebrow: "ห้องพักหรูหรา นอนหลับสบาย",
        heading: "ห้องพัก",
        description:
          "เลือกสไตล์ห้องที่เหมาะกับการเข้าพักของคุณ พร้อมบรรยากาศรีสอร์ทที่ผ่อนคลาย สะดวกสบาย และรองรับทุกการใช้งาน",
        isVisible: true
      },
      homepageRoomHighlights: cloneDefaultHomepageRoomHighlights(),
      roomsFeaturedGallery: [
        {
          id: "lake-featured-king",
          title: "ห้องดีลักซ์เตียงคิงไซส์",
          sizeText: "พื้นที่ 32 ตร.ม",
          imageUrl: lakeRooms[0]?.imageUrl ?? "",
          altText: "ห้องดีลักซ์เตียงคิงไซส์",
          order: 1,
          isVisible: true
        },
        {
          id: "lake-featured-twin",
          title: "ห้องดีลักซ์เตียงแฝด",
          sizeText: "พื้นที่ 32 ตร.ม",
          imageUrl: lakeRooms[1]?.imageUrl ?? lakeRooms[0]?.imageUrl ?? "",
          altText: "ห้องดีลักซ์เตียงแฝด",
          order: 2,
          isVisible: true
        },
        {
          id: "lake-featured-triple",
          title: "ห้องดีลักซ์สำหรับสามท่าน",
          sizeText: "พื้นที่ 32 ตร.ม",
          imageUrl: lakeRooms[0]?.imageUrl ?? "",
          altText: "ห้องดีลักซ์สำหรับสามท่าน",
          order: 3,
          isVisible: true
        }
      ],
      homepageActivities: cloneDefaultHomepageActivities([
        lakeRooms[0]?.imageUrl ?? "",
        lakeRooms[1]?.imageUrl ?? "",
        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1482192505345-5655af888cc4?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80"
      ]),
      homepageAmenities: cloneDefaultHomepageAmenities(),
      homepageHotelInfo: cloneDefaultHomepageHotelInfo(),
      footer: {
        brandName: "SST INNOVATION RESORT",
        description: "เว็บไซต์รีสอร์ทพร้อมระบบจอง รองรับหลายเจ้าของรีสอร์ท และเชื่อมต่อระบบหลังบ้าน",
        menuItems: [
          { label: "หน้าแรก", href: "/" },
          { label: "ห้องพัก", href: "/rooms" },
          { label: "กิจกรรม", href: "/activities" },
          { label: "เกี่ยวกับเรา", href: "/about" },
          { label: "ติดต่อเรา", href: "/contact" }
        ],
        contact: {
          address: "99/9 หมู่ 1 ตำบลตัวอย่าง อำเภอเมือง จังหวัดเชียงใหม่ 50000",
          phone: "084-337-4982",
          email: "contact@sstinnovationresort.com",
          supportHours: "ทุกวัน 08:00 - 20:00 น."
        },
        systemLinks: [
          { label: "ระบบจองห้องพัก" },
          { label: "เว็บไซต์รีสอร์ท" },
          { label: "รองรับ Multi-tenant" },
          { label: "เชื่อมต่อระบบหลังบ้าน" }
        ],
        socialLinks: [
          {
            id: "facebook",
            platform: "facebook",
            label: "Facebook",
            url: "https://facebook.com/lakeserenity",
            enabled: true,
            order: 1
          },
          {
            id: "line",
            platform: "line",
            label: "LINE",
            url: "https://line.me/ti/p/@lakeserenity",
            enabled: true,
            order: 2
          },
          {
            id: "messenger",
            platform: "messenger",
            label: "Messenger",
            url: "https://m.me/lakeserenity",
            enabled: true,
            order: 3
          },
          {
            id: "youtube",
            platform: "youtube",
            label: "YouTube",
            url: "https://youtube.com/@lakeserenity",
            enabled: true,
            order: 4
          }
        ],
        copyright: {
          year: 2026,
          developerName: {
            "th-TH": "SST INNOVATION CO., LTD.",
            "en-US": "SST INNOVATION CO., LTD."
          },
          resortName: {
            "th-TH": "Lake Serenity Resort",
            "en-US": "Lake Serenity Resort"
          },
          rightsText: {
            "th-TH": "สงวนลิขสิทธิ์ทั้งหมด",
            "en-US": "All rights reserved."
          },
          legalTitle: {
            "th-TH": "ข้อมูลลิขสิทธิ์และความเป็นเจ้าของ",
            "en-US": "Copyright and Ownership Information"
          },
          legalBody: {
            "th-TH":
              "ระบบเว็บไซต์นี้พัฒนาโดย {developerName} ส่วนเนื้อหาของรีสอร์ท เช่น ข้อความ รูปภาพ ข้อมูลห้องพัก โปรโมชั่น ข้อมูลติดต่อ และข้อมูลเฉพาะของรีสอร์ท เป็นลิขสิทธิ์ของ {resortName} ห้ามคัดลอก ดัดแปลง เผยแพร่ หรือนำไปใช้โดยไม่ได้รับอนุญาต",
            "en-US":
              "This website system is developed by {developerName}. The resort content, including text, images, room information, promotions, contact information, and other resort-specific materials, belongs to {resortName}. Copying, modifying, distributing, or reusing any content without permission is not allowed."
          }
        },
        copyrightText: "All rights reserved.",
        isVisible: true
      },
      stats: [
        { label: "ห้องพัก", value: "28" },
        { label: "วิวทะเลสาบ", value: "100%" },
        { label: "กิจกรรม", value: "6" },
        { label: "เช็กอินเร็วสุด", value: "2 นาที" }
      ],
      highlights: [
        "รองรับ White-label ต่อผู้เช่า",
        "ใช้ BFF ป้องกันข้อมูลข้าม tenant",
        "พร้อมใช้งานบน Vercel production"
      ],
      featuredRooms: lakeRooms,
      featuredPackages: lakePackages,
      gallery: [
        {
          id: "ls-g1",
          alt: "Lake resort",
          imageUrl:
            "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80"
        },
        {
          id: "ls-g2",
          alt: "Cabin morning",
          imageUrl:
            "https://images.unsplash.com/photo-1482192505345-5655af888cc4?auto=format&fit=crop&w=1200&q=80"
        },
        {
          id: "ls-g3",
          alt: "Resort activity",
          imageUrl:
            "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80"
        }
      ],
      contact: {
        phone: "+66 89 000 2222",
        email: "booking@lakeserenity.example",
        lineId: "@lakeserenity",
        line: "@lakeserenity",
        country: {
          "th-TH": "ไทย",
          "en-US": "Thailand"
        },
        openingHours: {
          "th-TH": "ทุกวัน 08:00 - 20:00 น.",
          "en-US": "Daily 08:00 - 20:00"
        },
        address: {
          "th-TH": "99/9 หมู่ 1 ตำบลตัวอย่าง อำเภอเมือง จังหวัดเชียงใหม่ 50000",
          "en-US": "99/9 Moo 1, Example Subdistrict, Mueang District, Chiang Mai 50000"
        },
        contactTitle: {
          "th-TH": "ติดต่อเรา",
          "en-US": "Contact"
        },
        footerTitle: {
          "th-TH": "ข้อมูลการติดต่อ",
          "en-US": "Contact information"
        }
      },
      ui: {
        navbar: {
          mode: "solid",
          logo: {
            type: "text",
            primaryText: "LAKE SERENITY",
            secondaryText: "RESORT",
            accentColor: "#e86f4c"
          },
          leftLinks: [
            { label: "หน้าแรก", href: "/" },
            { label: "ห้องพัก", href: "/rooms" },
            { label: "กิจกรรม", href: "/activities" },
            { label: "เกี่ยวกับเรา", href: "/about" },
            { label: "ติดต่อเรา", href: "/contact" }
          ],
          rightLinks: [
            { label: "Help", href: "#contact" },
            { label: "Trips", href: "#rooms" }
          ],
          cta: { label: "Sign In or Join", href: "#lead-form" },
          showSearchStrip: true
        },
        booking: {
          mode: "contact_only",
          allowBookingForm: false,
          contactRoute: "/contact",
          paymentOptions: ["full"],
          defaultPaymentOption: "full"
        }
      }
    }
  },
  "demo-resort": {
    rooms: forestRooms.slice(0, 2),
    home: {
      hero: {
        eyebrow: "Demo tenant for preview and QA",
        title: "Demo Resort\nPreview Environment",
        subtitle: "This tenant is intended for testing, stakeholder demos, and staging previews.",
        ctaLabel: "Send Demo Lead",
        heroImageUrl:
          "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1800&q=80"
      },
      roomsIntro: {
        eyebrow: "ห้องพักหรูหรา นอนหลับสบาย",
        heading: "ห้องพัก",
        description:
          "เลือกสไตล์ห้องที่เหมาะกับการเข้าพักของคุณ พร้อมบรรยากาศรีสอร์ทที่ผ่อนคลาย สะดวกสบาย และรองรับทุกการใช้งาน",
        isVisible: true
      },
      homepageRoomHighlights: cloneDefaultHomepageRoomHighlights(),
      roomsFeaturedGallery: [
        {
          id: "demo-featured-king",
          title: "ห้องดีลักซ์เตียงคิงไซส์",
          sizeText: "พื้นที่ 32 ตร.ม",
          imageUrl: forestRooms[0]?.imageUrl ?? "",
          altText: "ห้องดีลักซ์เตียงคิงไซส์",
          order: 1,
          isVisible: true
        },
        {
          id: "demo-featured-twin",
          title: "ห้องดีลักซ์เตียงแฝด",
          sizeText: "พื้นที่ 32 ตร.ม",
          imageUrl: forestRooms[1]?.imageUrl ?? forestRooms[0]?.imageUrl ?? "",
          altText: "ห้องดีลักซ์เตียงแฝด",
          order: 2,
          isVisible: true
        },
        {
          id: "demo-featured-triple",
          title: "ห้องดีลักซ์สำหรับสามท่าน",
          sizeText: "พื้นที่ 32 ตร.ม",
          imageUrl: forestRooms[2]?.imageUrl ?? forestRooms[0]?.imageUrl ?? "",
          altText: "ห้องดีลักซ์สำหรับสามท่าน",
          order: 3,
          isVisible: true
        }
      ],
      homepageActivities: cloneDefaultHomepageActivities([
        forestRooms[0]?.imageUrl ?? "",
        forestRooms[1]?.imageUrl ?? "",
        forestRooms[2]?.imageUrl ?? "",
        "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=80"
      ]),
      homepageAmenities: cloneDefaultHomepageAmenities(),
      homepageHotelInfo: cloneDefaultHomepageHotelInfo(),
      footer: {
        brandName: "SST INNOVATION RESORT",
        description: "เว็บไซต์รีสอร์ทพร้อมระบบจอง รองรับหลายเจ้าของรีสอร์ท และเชื่อมต่อระบบหลังบ้าน",
        menuItems: [
          { label: "หน้าแรก", href: "/" },
          { label: "ห้องพัก", href: "/rooms" },
          { label: "กิจกรรม", href: "/activities" },
          { label: "เกี่ยวกับเรา", href: "/about" },
          { label: "ติดต่อเรา", href: "/contact" }
        ],
        contact: {
          address: "99/9 หมู่ 1 ตำบลตัวอย่าง อำเภอเมือง จังหวัดเชียงใหม่ 50000",
          phone: "084-337-4982",
          email: "contact@sstinnovationresort.com",
          supportHours: "ทุกวัน 08:00 - 20:00 น."
        },
        systemLinks: [
          { label: "ระบบจองห้องพัก" },
          { label: "เว็บไซต์รีสอร์ท" },
          { label: "รองรับ Multi-tenant" },
          { label: "เชื่อมต่อระบบหลังบ้าน" }
        ],
        socialLinks: [
          {
            id: "facebook",
            platform: "facebook",
            label: "Facebook",
            url: "https://facebook.com/demoresort",
            enabled: true,
            order: 1
          },
          {
            id: "line",
            platform: "line",
            label: "LINE",
            url: "https://line.me/ti/p/@demoresort",
            enabled: true,
            order: 2
          },
          {
            id: "messenger",
            platform: "messenger",
            label: "Messenger",
            url: "https://m.me/demoresort",
            enabled: true,
            order: 3
          },
          {
            id: "youtube",
            platform: "youtube",
            label: "YouTube",
            url: "https://youtube.com/@demoresort",
            enabled: true,
            order: 4
          }
        ],
        copyright: {
          year: 2026,
          developerName: {
            "th-TH": "SST INNOVATION CO., LTD.",
            "en-US": "SST INNOVATION CO., LTD."
          },
          resortName: {
            "th-TH": "Demo Resort",
            "en-US": "Demo Resort"
          },
          rightsText: {
            "th-TH": "สงวนลิขสิทธิ์ทั้งหมด",
            "en-US": "All rights reserved."
          },
          legalTitle: {
            "th-TH": "ข้อมูลลิขสิทธิ์และความเป็นเจ้าของ",
            "en-US": "Copyright and Ownership Information"
          },
          legalBody: {
            "th-TH":
              "ระบบเว็บไซต์นี้พัฒนาโดย {developerName} ส่วนเนื้อหาของรีสอร์ท เช่น ข้อความ รูปภาพ ข้อมูลห้องพัก โปรโมชั่น ข้อมูลติดต่อ และข้อมูลเฉพาะของรีสอร์ท เป็นลิขสิทธิ์ของ {resortName} ห้ามคัดลอก ดัดแปลง เผยแพร่ หรือนำไปใช้โดยไม่ได้รับอนุญาต",
            "en-US":
              "This website system is developed by {developerName}. The resort content, including text, images, room information, promotions, contact information, and other resort-specific materials, belongs to {resortName}. Copying, modifying, distributing, or reusing any content without permission is not allowed."
          }
        },
        copyrightText: "All rights reserved.",
        isVisible: true
      },
      stats: [
        { label: "Demo rooms", value: "2" },
        { label: "Mode", value: "Preview" },
        { label: "Uptime target", value: "99.9%" },
        { label: "Support", value: "On request" }
      ],
      highlights: [
        "Safe demo dataset with no production tenant secrets",
        "Supports QA of booking flow and metadata rendering",
        "Can be marked noindex to avoid SEO crawl noise"
      ],
      featuredRooms: forestRooms.slice(0, 2),
      featuredPackages: forestPackages.slice(0, 1),
      gallery: [
        {
          id: "dm-g1",
          alt: "Demo resort overview",
          imageUrl:
            "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80"
        },
        {
          id: "dm-g2",
          alt: "Demo villa",
          imageUrl:
            "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80"
        }
      ],
      contact: {
        phone: "+66 89 000 3333",
        email: "demo@resort.example",
        lineId: "@demoresort",
        line: "@demoresort",
        country: {
          "th-TH": "ไทย",
          "en-US": "Thailand"
        },
        openingHours: {
          "th-TH": "ทุกวัน 08:00 - 20:00 น.",
          "en-US": "Daily 08:00 - 20:00"
        },
        address: {
          "th-TH": "99/9 หมู่ 1 ตำบลตัวอย่าง อำเภอเมือง จังหวัดเชียงใหม่ 50000",
          "en-US": "99/9 Moo 1, Example Subdistrict, Mueang District, Chiang Mai 50000"
        },
        contactTitle: {
          "th-TH": "ติดต่อเรา",
          "en-US": "Contact"
        },
        footerTitle: {
          "th-TH": "ข้อมูลการติดต่อ",
          "en-US": "Contact information"
        }
      },
      ui: {
        navbar: {
          mode: "transparent",
          logo: {
            type: "text",
            primaryText: "DEMO",
            secondaryText: "RESORT",
            accentColor: "#e86f4c"
          },
          leftLinks: [
            { label: "หน้าแรก", href: "/" },
            { label: "ห้องพัก", href: "/rooms" },
            { label: "กิจกรรม", href: "/activities" },
            { label: "เกี่ยวกับเรา", href: "/about" },
            { label: "ติดต่อเรา", href: "/contact" }
          ],
          rightLinks: [{ label: "Help", href: "#contact" }],
          cta: { label: "Sign In or Join", href: "#lead-form" },
          showSearchStrip: false
        },
        booking: {
          mode: "booking_enabled",
          allowBookingForm: true,
          contactRoute: "/contact",
          paymentOptions: ["full"],
          defaultPaymentOption: "full"
        }
      }
    }
  }
};

export function getStaticHomeByTenant(tenantSlug: string): SiteHomeDTO | null {
  const tenant = getTenantBySlug(tenantSlug);
  const content = TENANT_CONTENT[tenantSlug];
  if (!tenant || !content) return null;
  return { tenant: toTenantDTO(tenant), ...content.home };
}

export function getStaticRoomsByTenant(tenantSlug: string): RoomCardDTO[] {
  const content = TENANT_CONTENT[tenantSlug];
  return content?.rooms ?? [];
}

export function getStaticCampingByTenant(tenantSlug: string): CampingContentDTO | null {
  const content = TENANT_CAMPING_CONTENT[tenantSlug];
  if (!content) return null;
  return {
    ...content,
    heroImages: content.heroImages?.map((item) => ({ ...item })),
    quickInfoItems: content.quickInfoItems.map((item) => ({ ...item })),
    serviceTypes: content.serviceTypes.map((item) => ({ ...item, includedItems: item.includedItems?.map((x) => x) })),
    facilities: content.facilities.map((item) => ({ ...item })),
    rules: content.rules.map((item) => ({ ...item })),
    addOns: content.addOns.map((item) => ({ ...item, includedItems: item.includedItems?.map((x) => x) })),
    galleryImages: content.galleryImages?.map((item) => ({ ...item })),
    galleryItems: content.galleryItems.map((item) => ({ ...item }))
  };
}
