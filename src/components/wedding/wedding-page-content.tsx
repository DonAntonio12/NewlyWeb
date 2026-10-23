import Image from "next/image";
import {
  ArrowDown,
  ArrowUpRight,
  CalendarDays,
  Clock3,
  Flower2,
  MapPin,
  Sparkles,
} from "lucide-react";
import { Countdown } from "@/components/wedding/countdown";
import { Gallery } from "@/components/wedding/gallery";
import { ReplayInvitationButton } from "@/components/wedding/replay-invitation-button";
import { RsvpForm } from "@/components/wedding/rsvp-form";
import { wedding } from "@/lib/wedding-data";


export function WeddingPageContent() {
  return (
    <main className="page-shell">
      <div className="announcement">A little bit of forever · {wedding.dateShort} · Garden of Eden</div>

      <header className="site-header">
        <a className="brand" href="#home" aria-label={`${wedding.couple.groom} and ${wedding.couple.bride}, home`}>
          <span className="brand-monogram">{wedding.couple.initials}</span>
          <span>
            {wedding.couple.groom} &amp; {wedding.couple.bride}
            <span className="brand-caption">Our wedding day</span>
          </span>
        </a>
        <nav className="site-nav" aria-label="Main navigation">
          <a href="#story">Our story</a>
          <a href="#details">The day</a>
          <a href="#wedding-party">Wedding party</a>
          <a href="#gallery">Gallery</a>
          <a className="nav-rsvp" href="#rsvp">
            RSVP <ArrowUpRight size={13} aria-hidden="true" />
          </a>
        </nav>
      </header>

      <section className="hero" id="home" aria-labelledby="hero-title">
        <div className="hero-copy">
          <span className="eyebrow">Together with our families</span>
          <h1 id="hero-title">
            <span className="couple-name">{wedding.couple.groom}</span>
            <span className="couple-ampersand">&amp;</span>
            <span className="couple-name">{wedding.couple.bride}</span>
          </h1>
          <p className="hero-description">
            With full hearts, we invite you to join us as we begin our forever.
          </p>
          <p className="hero-date">
            <span aria-hidden="true" />
            {wedding.dateLabel}
            <span aria-hidden="true" />
          </p>
          <div className="hero-actions">
            <a className="button-primary" href="#details">
              Explore the day <ArrowDown size={14} aria-hidden="true" />
            </a>
            <a className="button-outline" href="#rsvp">
              RSVP details
            </a>
          </div>
          <p className="hero-location">
            <MapPin size={13} aria-hidden="true" /> {wedding.location}
          </p>
        </div>

        <div className="hero-art">
          <span className="hero-side-note">Our next chapter begins here</span>
          <div className="hero-image-frame">
            <Image
              className="hero-image"
              src={wedding.heroImage}
              alt="A woman smiling for the camera"
              fill
              priority
              sizes="(max-width: 640px) 90vw, (max-width: 900px) 50vw, 48vw"
            />
            <span className="hero-image-caption">The start of something beautiful</span>
          </div>
          <div className="hero-stamp" aria-hidden="true">
            <span className="hero-stamp-inner">
              Save
              <br />
              the date
              <small>{wedding.saveDate}</small>
            </span>
          </div>
        </div>
      </section>

      <Countdown dateTime={wedding.dateTime} />

      <section className="section" id="story" aria-labelledby="story-title">
        <div className="section-inner story-layout">
          <div className="story-image">
            <Image
              src={wedding.storyImage}
              alt={`${wedding.couple.groom} and ${wedding.couple.bride} sharing a quiet moment before their wedding`}
              fill
              sizes="(max-width: 640px) 90vw, 44vw"
            />
            <span className="story-image-note">Every good thing led us here</span>
          </div>
          <div className="story-copy">
            <span className="section-kicker">A little about us</span>
            <h2 id="story-title">Our story, so far.</h2>
            <p>
              What began as a hello grew into a life we love. Here are a few of the moments
              that brought us to this very happy beginning.
            </p>
            <ol className="timeline">
              {wedding.story.map((milestone) => (
                <li key={milestone.date}>
                  <time>{milestone.date}</time>
                  <div>
                    <h3>{milestone.title}</h3>
                    <p>{milestone.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section
        className="section details-section"
        id="details"
        aria-labelledby="details-title"
      >
        <div className="section-inner">
          <div className="section-heading">
            <span className="section-kicker">The day we say “I do”</span>
            <h2 id="details-title">A day to remember.</h2>
            <p>
              We can hardly wait to celebrate with you. Here is everything you need to know
              about the day.
            </p>
          </div>

          <div className="details-grid">
            <article className="detail-card">
              <div className="detail-card-top">
                Ceremony <Flower2 size={17} strokeWidth={1.3} aria-hidden="true" />
              </div>
              <h3>The Glasshouse</h3>
              <p className="detail-time">
                <Clock3 size={13} aria-hidden="true" /> 4:00 in the afternoon
              </p>
              <p>Km. 58, Aguinaldo Highway<br />Tagaytay, Cavite, Philippines</p>
              <a
                className="text-link"
                href="https://maps.google.com/?q=The+Glasshouse+Tagaytay+Philippines"
                target="_blank"
                rel="noreferrer"
              >
                Get directions <ArrowUpRight size={13} aria-hidden="true" />
              </a>
            </article>

            <article className="detail-card">
              <div className="detail-card-top">
                Reception <Sparkles size={17} strokeWidth={1.3} aria-hidden="true" />
              </div>
              <h3>The Glasshouse</h3>
              <p className="detail-time">
                <Clock3 size={13} aria-hidden="true" /> Following the ceremony
              </p>
              <p>Join us for dinner, heartfelt toasts, and a little dancing under the lights.</p>
              <a
                className="text-link"
                href="https://maps.google.com/?q=The+Glasshouse+Tagaytay+Philippines"
                target="_blank"
                rel="noreferrer"
              >
                View venue <ArrowUpRight size={13} aria-hidden="true" />
              </a>
            </article>
          </div>

          <div className="schedule">
            <div className="schedule-intro">
              <span className="section-kicker">Mark your afternoon</span>
              <h3>A little timeline</h3>
              <p>Come as you are, settle in, and let us take care of the rest.</p>
            </div>
            <ol className="schedule-list">
              {wedding.schedule.map((item) => (
                <li key={item.time}>
                  <time>{item.time}</time>
                  <span>{item.event}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="section theme-section" aria-labelledby="dress-title">
        <div className="section-inner">
          <div className="theme-card">
            <div className="theme-visual">
              <Image
                src={wedding.themeImage}
                alt="A romantic garden reception with soft greenery and candlelight"
                fill
                sizes="(max-width: 640px) 100vw, 50vw"
              />
              <span className="theme-visual-caption">An evening in the garden</span>
            </div>
            <div className="dress-copy">
              <span className="section-kicker">The look &amp; feel</span>
              <h2 id="dress-title">Garden formal.</h2>
              <p>
                Think elegant, comfortable, and a little romantic. Our palette is inspired
                by the greens of the garden and the warmth of candlelight.
              </p>
              <div className="palette" aria-label="Wedding color palette">
                {wedding.palette.map((color) => (
                  <span
                    className="palette-swatch"
                    key={color.name}
                    style={{ backgroundColor: color.color }}
                    title={`${color.name}: ${color.color}`}
                  />
                ))}
              </div>
              <p className="dress-note">
                We would love to see soft, natural colors. Kindly reserve white and ivory for
                the couple.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section outfit-section" aria-labelledby="outfit-title">
        <div className="section-inner">
          <div className="section-heading">
            <span className="section-kicker">A little style inspiration</span>
            <h2 id="outfit-title">What to wear.</h2>
            <p>
              A few ideas for garden formal attire. Choose the look that feels most like
              you, in colors that complement the day.
            </p>
          </div>
          <div className="outfit-grid">
            {wedding.attireExamples.map((example) => (
              <article className="outfit-card" key={example.label}>
                <div className="outfit-image">
                  <Image
                    src={example.image}
                    alt={example.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, 50vw"
                    style={{ objectPosition: example.imagePosition }}
                  />
                  <span className="outfit-label">{example.label}</span>
                </div>
                <div className="outfit-copy">
                  <h3>{example.title}</h3>
                  <p>{example.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        className="section wedding-party-section"
        id="wedding-party"
        aria-labelledby="wedding-party-title"
      >
        <div className="section-inner">
          <div className="section-heading">
            <span className="section-kicker">Surrounded by love</span>
            <h2 id="wedding-party-title">Our wedding party.</h2>
            <p>
              We are grateful for the loved ones standing by our side. These sample names
              are here for preview.
            </p>
          </div>

          <div className="wedding-party-grid">
            <section className="party-card sponsor-card" aria-labelledby="sponsors-title">
              <div className="party-card-heading">
                <div>
                  <span className="party-card-kicker">With gratitude</span>
                  <h3 id="sponsors-title">Principal Sponsors</h3>
                </div>
                <span className="party-card-count">
                </span>
              </div>
              <ul className="sponsor-list">
                {wedding.weddingParty.principalSponsors.map((sponsor, index) => (
                  <li key={`${sponsor.ninong}-${sponsor.ninang}-${index}`}>
                    <div>
                      <strong>{sponsor.ninong}</strong>
                    </div>
                    <span className="sponsor-ampersand" aria-hidden="true">
                      &amp;
                    </span>
                    <div>
                      <strong>{sponsor.ninang}</strong>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section className="party-card honor-card" aria-labelledby="best-man-title">
              <span className="party-card-kicker">By the groom’s side</span>
              <span className="honor-monogram" aria-hidden="true">
                {wedding.weddingParty.bestMan
                  .split(" ")
                  .map((part) => part[0])
                  .join("")}
              </span>
              <span className="honor-role">Best Man</span>
              <h3 id="best-man-title">{wedding.weddingParty.bestMan}</h3>
            </section>

            <section className="party-card honor-card" aria-labelledby="maid-of-honor-title">
              <span className="party-card-kicker">By the bride’s side</span>
              <span className="honor-monogram" aria-hidden="true">
                {wedding.weddingParty.maidOfHonor
                  .split(" ")
                  .map((part) => part[0])
                  .join("")}
              </span>
              <span className="honor-role">Maid of Honor</span>
              <h3 id="maid-of-honor-title">{wedding.weddingParty.maidOfHonor}</h3>
            </section>

            <section className="party-card attendant-card" aria-labelledby="groomsmen-title">
              <span className="party-card-kicker">Standing with the groom</span>
              <h3 id="groomsmen-title">Groomsmen</h3>
              <ul className="party-name-list">
                {wedding.weddingParty.groomsmen.map((name, index) => (
                  <li key={`${name}-${index}`}>
                    <span className="party-name-monogram" aria-hidden="true">
                      {name
                        .split(" ")
                        .map((part) => part[0])
                        .join("")}
                    </span>
                    <span>{name}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="party-card attendant-card" aria-labelledby="bridesmaids-title">
              <span className="party-card-kicker">Standing with the bride</span>
              <h3 id="bridesmaids-title">Bridesmaids</h3>
              <ul className="party-name-list">
                {wedding.weddingParty.bridesmaids.map((name, index) => (
                  <li key={`${name}-${index}`}>
                    <span className="party-name-monogram" aria-hidden="true">
                      {name
                        .split(" ")
                        .map((part) => part[0])
                        .join("")}
                    </span>
                    <span>{name}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </section>

      <section className="section" id="gallery" aria-labelledby="gallery-title">
        <div className="section-inner">
          <div className="section-heading">
            <span className="section-kicker">Little moments, big love</span>
            <h2 id="gallery-title">A glimpse of us.</h2>
            <p>A few favorite memories while we count down to making new ones with you.</p>
          </div>
          <Gallery />
        </div>
      </section>

      <section className="rsvp-section" id="rsvp" aria-labelledby="rsvp-title">
        <div className="rsvp-copy">
          <span className="section-kicker">Save your seat</span>
          <h2 id="rsvp-title">We hope you can be there.</h2>
          <p className="rsvp-notice">
            Please let us know by {wedding.rsvpDeadline}. We would love to hear from you.
          </p>
          <RsvpForm />
          <p className="rsvp-deadline">
            <CalendarDays size={13} aria-hidden="true" /> Kindly reply by {wedding.rsvpDeadline}
          </p>
        </div>
      </section>

      <section className="section faq-section" aria-labelledby="faq-title">
        <div className="section-inner">
          <div className="section-heading">
            <span className="section-kicker">A few helpful notes</span>
            <h2 id="faq-title">Before the big day.</h2>
          </div>
          <div className="faq-list">
            {wedding.faqs.map((item) => (
              <details key={item.question}>
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <span className="footer-monogram">{wedding.couple.initials}</span>
        <p>
          With love, {wedding.couple.groom} &amp; {wedding.couple.bride}
        </p>
        <p>{wedding.dateLabel} · {wedding.location}</p>
        <ReplayInvitationButton />
      </footer>
    </main>
  );
}
