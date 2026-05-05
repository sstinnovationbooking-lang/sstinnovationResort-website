import Image from "next/image";

import { LeadForm } from "@/components/lead-form";
import type { RoomCardDTO, SiteHomeDTO } from "@/lib/types/site";

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
    <main aria-labelledby="hero-title">
      <section className="shell hero" id="hero">
        <div className="hero-copy">
          <span className="pill">{home.hero.eyebrow}</span>
          <h1 id="hero-title">{home.hero.title}</h1>
          <p>{home.hero.subtitle}</p>
          <a className="btn btn-primary" href="#lead-form">
            {home.hero.ctaLabel}
          </a>
        </div>
        <div
          aria-label={`${home.tenant.brand} hero image`}
          className="hero-media"
          role="img"
          style={{ backgroundImage: `url(${home.hero.heroImageUrl})` }}
        />
      </section>

      <section className="shell section" id="highlights">
        <div className="section-head">
          <h2>Highlight</h2>
          <p>What makes this tenant experience unique.</p>
        </div>
        {home.highlights.length > 0 ? (
          <ul className="highlights-grid">
            {home.highlights.map((item) => (
              <li className="highlight-card" key={item}>
                {item}
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty-state">No highlights available right now.</p>
        )}
      </section>

      <section aria-label="Key stats" className="shell stats-grid" id="stats">
        {home.stats.length > 0 ? (
          home.stats.map((stat) => (
            <article className="stat-card" key={stat.label}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </article>
          ))
        ) : (
          <article className="stat-card stat-empty">
            <strong>-</strong>
            <span>Stats are currently unavailable.</span>
          </article>
        )}
      </section>

      <section className="shell section" id="rooms">
        <div className="section-head">
          <h2>Rooms</h2>
          <p>Choose the best room style for your stay.</p>
        </div>
        {rooms.length > 0 ? (
          <div className="card-grid">
            {rooms.map((room) => (
              <article className="room-card" key={room.id}>
                <div aria-hidden className="room-image" style={{ backgroundImage: `url(${room.imageUrl})` }} />
                <div className="room-body">
                  {room.badge ? <span className="tag">{room.badge}</span> : null}
                  <h3>{room.name}</h3>
                  <p>{room.description}</p>
                  <strong>{formatTHB(room.nightlyPriceTHB)} / night</strong>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="empty-state">No rooms are available yet for this tenant.</p>
        )}
      </section>

      <section className="shell section" id="gallery">
        <div className="section-head">
          <h2>Gallery</h2>
        </div>
        {home.gallery.length > 0 ? (
          <div className="gallery-grid">
            {home.gallery.map((item) => (
              <figure className="gallery-item" key={item.id}>
                <Image alt={item.alt} className="gallery-image" height={220} src={item.imageUrl} width={380} />
              </figure>
            ))}
          </div>
        ) : (
          <p className="empty-state">Gallery is coming soon.</p>
        )}
      </section>

      <section className="shell section contact" id="contact">
        <div className="contact-meta">
          <h2>Contact</h2>
          <p>Phone: {home.contact.phone}</p>
          <p>Email: {home.contact.email}</p>
          {home.contact.lineId ? <p>LINE: {home.contact.lineId}</p> : null}
        </div>
        <div id="lead-form">
          <h2 className="visually-hidden">Lead Form</h2>
          <LeadForm tenantSlug={home.tenant.tenantSlug} />
        </div>
      </section>

      <footer className="site-footer" id="footer">
        <div className="shell footer-inner">
          <p>{home.tenant.brand}</p>
          <a className="footer-link" href="#hero">
            Back to top
          </a>
        </div>
      </footer>
    </main>
  );
}
