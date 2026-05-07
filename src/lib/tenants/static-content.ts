import { getTenantBySlug } from "@/lib/tenants/registry";
import { toTenantDTO } from "@/lib/tenants/registry";
import type {
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
    description: "วิลล่ากลางสวนส่วนตัว เงียบสงบ เหมาะกับคู่รักและครอบครัวขนาดเล็ก",
    nightlyPriceTHB: 2990,
    badge: "สวนส่วนตัว",
    imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "fr-mountain-cabin",
    name: "Mountain Cabin",
    description: "เคบินวิวภูเขา โทนอบอุ่น พร้อมระเบียงชมธรรมชาติ",
    nightlyPriceTHB: 3490,
    badge: "วิวภูเขา",
    imageUrl: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "fr-river-pool-villa",
    name: "River Pool Villa",
    description: "พูลวิลล่าริมน้ำพร้อมสระส่วนตัว เหมาะกับทริปกลุ่มเพื่อน",
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
    description: "ห้องพักวิวทะเลสาบ ตื่นมาพร้อมหมอกเช้าและอาหารเช้าริมน้ำ",
    nightlyPriceTHB: 3890,
    badge: "วิวทะเลสาบ",
    imageUrl: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "ls-wood-villa",
    name: "Wooden Villa",
    description: "บ้านไม้ร่วมสมัย เน้นความอบอุ่นและความเป็นส่วนตัว",
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
      isVisible: true
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
      isVisible: true
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
      isVisible: true
    }
  ]
};

function cloneDefaultHomepageRoomHighlights(): HomepageRoomHighlightsDTO {
  return {
    ...defaultHomepageRoomHighlights,
    items: defaultHomepageRoomHighlights.items.map((item) => ({ ...item }))
  };
}

const TENANT_CONTENT: Record<string, TenantStaticContent> = {
  "forest-escape": {
    rooms: forestRooms,
    home: {
      hero: {
        eyebrow: "",
        title: "เว็บไซต์รีสอร์ตพร้อมระบบจอง ดีไซน์สวย รองรับทุกอุปกรณ์",
        subtitle: "เทมเพลตสำหรับรีสอร์ตที่ต้องการหน้าเว็บมืออาชีพ ปรับแบรนด์ได้ และเชื่อม backend",
        ctaLabel: "เริ่มส่งคำขอจอง",
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
        lineId: "@forestescape"
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
        lineId: "@lakeserenity"
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
        lineId: "@demoresort"
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
