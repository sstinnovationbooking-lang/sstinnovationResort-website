import { getTenantBySlug } from "@/lib/tenants/registry";
import type { PackageCardDTO, RoomCardDTO, SiteHomeDTO } from "@/types/site";

interface TenantStaticContent {
  home: Omit<SiteHomeDTO, "tenant">;
  rooms: RoomCardDTO[];
}

const forestRooms: RoomCardDTO[] = [
  {
    id: "fr-garden-villa",
    name: "Garden Villa",
    description: "วิลล่าท่ามกลางสวนส่วนตัว เงียบสงบ เหมาะกับคู่รักและครอบครัวเล็ก",
    nightlyPriceTHB: 2990,
    badge: "สวนส่วนตัว",
    imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "fr-mountain-cabin",
    name: "Mountain Cabin",
    description: "เคบินวิวภูเขา โทนอบอุ่น พร้อมมุมถ่ายรูปและระเบียงชมธรรมชาติ",
    nightlyPriceTHB: 3490,
    badge: "วิวภูเขา",
    imageUrl: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "fr-river-pool-villa",
    name: "River Pool Villa",
    description: "พูลวิลล่าริมน้ำ พร้อมสระส่วนตัวและโซนบาร์บีคิวสำหรับกลุ่มเพื่อน",
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
    description: "กิจกรรมครอบครัวพร้อมไกด์ และเวิร์กช็อปธรรมชาติ",
    priceTHB: 6990,
    durationText: "2 คืน / 4 ท่าน"
  }
];

const lakeRooms: RoomCardDTO[] = [
  {
    id: "ls-lake-suite",
    name: "Lakeside Suite",
    description: "ห้องพักวิวทะเลสาบ ตื่นมาพร้อมหมอกเช้าและอาหารเช้าบนดาดฟ้า",
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
    description: "โยคะริมน้ำ + อาหารเพื่อสุขภาพ + สปา",
    priceTHB: 5290,
    durationText: "2 คืน / 2 ท่าน"
  }
];

const TENANT_CONTENT: Record<string, TenantStaticContent> = {
  "forest-escape": {
    rooms: forestRooms,
    home: {
      hero: {
        eyebrow: "รีสอร์ตธรรมชาติ โทนสีเขียวอบอุ่น",
        title: "เว็บไซต์รีสอร์ตพร้อมจอง\nดีไซน์สวย รองรับทุกอุปกรณ์",
        subtitle:
          "เทมเพลตสำหรับรีสอร์ตที่ต้องการหน้าเว็บมืออาชีพ ปรับแบรนด์ได้ และต่อหลังบ้านผ่าน API ได้ทันที",
        ctaLabel: "เริ่มส่งคำขอจอง",
        heroImageUrl:
          "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1800&q=80"
      },
      stats: [
        { label: "โซนที่พัก", value: "12" },
        { label: "รีวิวเฉลี่ย", value: "4.9/5" },
        { label: "กิจกรรมกลางแจ้ง", value: "8" },
        { label: "บริการลูกค้า", value: "24/7" }
      ],
      highlights: [
        "รองรับมือถือ แท็บเล็ต และเดสก์ท็อป",
        "โครงสร้างพร้อม Multi-tenant",
        "เชื่อมระบบหลังบ้านผ่าน API ได้ทันที"
      ],
      featuredRooms: forestRooms.slice(0, 3),
      featuredPackages: forestPackages,
      gallery: [
        {
          id: "fr-g1",
          alt: "Resort landscape",
          imageUrl:
            "https://images.unsplash.com/photo-1464822759844-d150ad6d1d1f?auto=format&fit=crop&w=1200&q=80"
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
      }
    }
  },
  "lake-serenity": {
    rooms: lakeRooms,
    home: {
      hero: {
        eyebrow: "รีสอร์ตริมทะเลสาบ สไตล์พักผ่อน",
        title: "Lake Serenity Resort\nพักสบาย ชมวิวทุกเช้า",
        subtitle: "เทมเพลตเดียวกัน ปรับเป็นแบรนด์ผู้เช่าแต่ละรายได้ทันที",
        ctaLabel: "ส่งคำขอเข้าพัก",
        heroImageUrl:
          "https://images.unsplash.com/photo-1470770903676-69b98201ea1c?auto=format&fit=crop&w=1800&q=80"
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
      }
    }
  }
};

export function getStaticHomeByTenant(tenantSlug: string): SiteHomeDTO | null {
  const tenant = getTenantBySlug(tenantSlug);
  const content = TENANT_CONTENT[tenantSlug];
  if (!tenant || !content) return null;
  return { tenant, ...content.home };
}

export function getStaticRoomsByTenant(tenantSlug: string): RoomCardDTO[] {
  const content = TENANT_CONTENT[tenantSlug];
  return content?.rooms ?? [];
}
