import Image from "next/image";
import { LeadForm } from "@/components/lead-form";
import type { RoomCardDTO, SiteHomeDTO } from "@/types/site";

interface ResortHomeProps {
  home: SiteHomeDTO;
  rooms: RoomCardDTO[];
}

function formatTHB(price: number): string {
  return new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", maximumFractionDigits: 0 }).format(
    price
  );
}

export function ResortHome({ home, rooms }: ResortHomeProps) {
  return (
    <main>
      <section className="shell hero">
        <div className="hero-copy">
          <span className="pill">{home.hero.eyebrow}</span>
          <h1>{home.hero.title}</h1>
          <p>{home.hero.subtitle}</p>
          <a className="btn btn-primary" href="#contact">
            {home.hero.ctaLabel}
          </a>
          <ul className="highlights">
            {home.highlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="hero-media" style={{ backgroundImage: `url(${home.hero.heroImageUrl})` }} />
      </section>

      <section className="shell stats-grid">
        {home.stats.map((stat) => (
          <article className="stat-card" key={stat.label}>
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </article>
        ))}
      </section>

      <section className="shell section">
        <div className="section-head">
          <h2>ห้องพักและแพ็กเกจแนะนำ</h2>
          <p>เทมเพลตเดียว ปรับข้อมูลตาม tenant ได้ทันที</p>
        </div>
        <div className="card-grid">
          {rooms.map((room) => (
            <article className="room-card" key={room.id}>
              <div className="room-image" style={{ backgroundImage: `url(${room.imageUrl})` }} />
              <div className="room-body">
                {room.badge ? <span className="tag">{room.badge}</span> : null}
                <h3>{room.name}</h3>
                <p>{room.description}</p>
                <strong>{formatTHB(room.nightlyPriceTHB)} / คืน</strong>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="shell section">
        <div className="section-head">
          <h2>แกลเลอรีรีสอร์ต</h2>
        </div>
        <div className="gallery-grid">
          {home.gallery.map((item) => (
            <figure className="gallery-item" key={item.id}>
              <Image alt={item.alt} className="gallery-image" height={220} src={item.imageUrl} width={380} />
            </figure>
          ))}
        </div>
      </section>

      <section className="shell section contact" id="contact">
        <div className="contact-meta">
          <h2>ติดต่อและส่งคำขอจอง</h2>
          <p>โทร: {home.contact.phone}</p>
          <p>อีเมล: {home.contact.email}</p>
          {home.contact.lineId ? <p>LINE: {home.contact.lineId}</p> : null}
        </div>
        <LeadForm />
      </section>
    </main>
  );
}
