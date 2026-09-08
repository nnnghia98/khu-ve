'use client';

import Image from 'next/image';
import travelPartners from '@/data/travel-partners.json';
import { useEffect, useRef, useState, type SubmitEvent } from 'react';
import { scrollToSection, useLandingMotion } from './use-landing-motion';
import { HeroCarousel } from './hero-carousel';
import {
  articles,
  awards,
  culture,
  faqs,
  paradise,
  reviews,
  storyPhotos,
  trips,
  type Trip,
} from './content';
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Compass,
  Download,
  Flag,
  Camera,
  MapPin,
  Menu,
  Search,
  Smile,
  Trees,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';

function Brand() {
  return (
    <a href="#home" className="brand" aria-label="KHUVÉ home">
      <span className="brand-wordmark">KHUVÉ</span>
    </a>
  );
}

export default function Home() {
  const { compact, navScrolled } = useLandingMotion();
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const [tripOpen, setTripOpen] = useState(false);
  const [articleOpen, setArticleOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [featuredDestination, setFeaturedDestination] = useState('Da Nang');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [budget, setBudget] = useState('');
  const [search, setSearch] = useState<{
    destination: string;
    date: string;
    budget: string;
  } | null>(null);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [review, setReview] = useState(0);
  const [award, setAward] = useState(1);
  const [article, setArticle] = useState<number | null>(null);
  const [info, setInfo] = useState<'privacy' | 'terms' | 'social' | null>(null);
  const [story, setStory] = useState(false);
  const [storySlide, setStorySlide] = useState(0);
  const [newsletterMessage, setNewsletterMessage] = useState('');
  const [saved, setSaved] = useState(false);
  const matchingTrips = search?.destination
    ? trips.filter((item) => item.name === search.destination)
    : trips;

  function searchTrips(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearch({ destination, date, budget });
    scrollToSection('destinations');
  }
  function openTrip(item: Trip) {
    setTrip(item);
    setTripOpen(true);
    setSaved(false);
  }
  function downloadPlan() {
    if (!trip) return;
    const text = `KHUVÉ · YOUR TRIP PLAN\n\n${trip.name}\n${trip.days}\n${date ? `Preferred departure: ${date}\n` : ''}${budget ? `Budget preference: ${budget}\n` : ''}\n${trip.description}\n\nSUGGESTED ITINERARY\n${trip.route.map((stop, i) => `${i + 1}. ${stop}`).join('\n')}\n\nThis is a saved trip idea, not a booking confirmation. Dates, availability, and prices need to be confirmed with a travel advisor.`;
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `khuve-${trip.name.toLowerCase().replaceAll(' ', '-')}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
    setSaved(true);
  }
  function openArticle(index: number) {
    setArticle(index);
    setArticleOpen(true);
  }
  function openInfo(value: NonNullable<typeof info>) {
    setInfo(value);
    setInfoOpen(true);
  }
  const closeMenu = () => setMenuOpen(false);
  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setMenuOpen(false);
      menuButtonRef.current?.focus();
    };
    const closeOutside = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !headerRef.current?.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('keydown', closeOnEscape);
    document.addEventListener('pointerdown', closeOutside);
    return () => {
      document.removeEventListener('keydown', closeOnEscape);
      document.removeEventListener('pointerdown', closeOutside);
    };
  }, [menuOpen]);

  return (
    <>
      <a href="#destinations" className="skip-link">
        Skip to destinations
      </a>
      <main>
        <HeroCarousel
          header={
            <>
              <span className="nav-scroll-sentinel" aria-hidden="true" />
              <header
                ref={headerRef}
                className="site-header wrap"
                data-scrolled={navScrolled}
                data-menu-open={menuOpen && compact}
              >
                <Brand />
                <nav
                  className={menuOpen ? 'main-nav is-open' : 'main-nav'}
                  aria-label="Main navigation"
                  id="main-navigation"
                  inert={compact && !menuOpen}
                  aria-hidden={compact && !menuOpen ? true : undefined}
                >
                  <a href="#destinations" onClick={closeMenu}>
                    Destinations <ChevronDown size={13} />
                  </a>
                  <a href="#packages" onClick={closeMenu}>
                    Tours <ChevronDown size={13} />
                  </a>
                  <a href="#about" onClick={closeMenu}>
                    About
                  </a>
                  <a href="#contact" onClick={closeMenu}>
                    Contact
                  </a>
                </nav>
                <div className="header-actions">
                  <Button
                    className="menu-toggle"
                    variant="ghost"
                    aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                    aria-expanded={menuOpen}
                    aria-controls="main-navigation"
                    ref={menuButtonRef}
                    onClick={() => setMenuOpen((open) => !open)}
                  >
                    <Menu className="menu-icon" aria-hidden="true" />
                    <X className="close-icon" aria-hidden="true" />
                  </Button>
                </div>
              </header>
            </>
          }
        >
          <form
            className="travel-search"
            aria-label="Find your Vietnam trip"
            onSubmit={searchTrips}
          >
            <label className="search-field">
              <span>Destination</span>
              <select
                aria-label="Destination"
                value={destination}
                onChange={(event) => setDestination(event.target.value)}
              >
                <option value="">Where to?</option>
                {trips.map((item) => (
                  <option key={item.name} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="search-field-chevron"
                aria-hidden="true"
              />
            </label>
            <label className="search-field">
              <span>Date</span>
              <input
                type="date"
                aria-label="Departure date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            </label>
            <label className="search-field">
              <span>Price</span>
              <select
                aria-label="Travel budget"
                value={budget}
                onChange={(event) => setBudget(event.target.value)}
              >
                <option value="">Any budget</option>
                <option value="$500 – $1,000">$500–1,000</option>
                <option value="$1,000 – $2,000">$1,000–2,000</option>
                <option value="$2,000+">$2,000+</option>
              </select>
              <ChevronDown
                className="search-field-chevron"
                aria-hidden="true"
              />
            </label>
            <Button type="submit" className="blue-button search-button">
              <Search aria-hidden="true" />
              Search
            </Button>
          </form>
          <ul className="partners" aria-label="Travel partners">
            {travelPartners.map((partner) => (
              <li className="partner" key={partner.id}>
                <Image
                  className={`partner-logo partner-logo-${partner.id}`}
                  src={partner.logo}
                  alt={partner.name}
                  width={partner.width}
                  height={partner.height}
                  unoptimized
                />
              </li>
            ))}
          </ul>
        </HeroCarousel>

        <section
          className="destinations section wrap"
          id="destinations"
          aria-labelledby="destination-heading"
        >
          <div className="section-heading centered">
            <h2 id="destination-heading">POPULAR DESTINATIONS</h2>
            <p>
              Discover Vietnam, from heritage streets to the coast and beyond.
            </p>
          </div>
          {search && (
            <output className="search-summary">
              <span>
                {search.destination
                  ? `Trip ideas for ${search.destination}`
                  : 'Explore all three destinations'}
                {search.date
                  ? ` · ${new Date(search.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                  : ''}
                {search.budget ? ` · Budget: ${search.budget}` : ''}
                <small>
                  Dates and budget are preferences; availability and prices are
                  not confirmed.
                </small>
              </span>
              <button
                onClick={() => {
                  setSearch(null);
                  setDestination('');
                }}
              >
                Clear search <X size={14} />
              </button>
            </output>
          )}
          <div
            className={`destination-grid ${matchingTrips.length === 1 ? 'single-result' : ''}`}
          >
            {matchingTrips.map((item) => {
              return (
                <article
                  key={item.name}
                  className={`destination-card ${item.name === (compact ? 'Da Nang' : featuredDestination) || matchingTrips.length === 1 ? 'active' : ''}`}
                  onPointerEnter={(event) => {
                    if (
                      !compact &&
                      event.pointerType === 'mouse' &&
                      window.matchMedia('(hover: hover) and (pointer: fine)')
                        .matches
                    ) {
                      setFeaturedDestination(item.name);
                    }
                  }}
                  onFocusCapture={() => {
                    if (!compact) setFeaturedDestination(item.name);
                  }}
                >
                  <button
                    className="destination-image-button"
                    onClick={() => openTrip(item)}
                    aria-label={`Explore ${item.name}`}
                  >
                    <Image
                      sizes="(max-width: 640px) 90vw, (max-width: 1024px) 50vw, 580px"
                      width={1200}
                      height={800}
                      src={`/images/${item.image}`}
                      alt={item.imageAlt}
                      loading="lazy"
                    />
                  </button>
                  <div className="destination-details">
                    <h3>{item.name}</h3>
                    <p className="package-count">
                      <MapPin size={14} />
                      20 Packages
                    </p>
                    <div className="destination-extra">
                      <p>{item.description}</p>
                      <div className="card-actions">
                        <Button
                          className="white-button"
                          onClick={() => openTrip(item)}
                        >
                          Book Now
                        </Button>
                        <Button
                          className="outline-button"
                          onClick={() => openTrip(item)}
                        >
                          Learn More
                        </Button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="benefits" aria-label="Why travel with KHUVÉ">
          <div className="wrap benefits-grid">
            {[
              {
                icon: Smile,
                title: 'Customer Delight',
                copy: 'We deliver the best service and experience for our customers.',
              },
              {
                icon: Trees,
                title: 'Authentic Adventure',
                copy: 'We deliver the real adventure experience for our dear customers.',
              },
              {
                icon: Flag,
                title: 'Expert Guides',
                copy: 'We deliver only expert tour guides for our dear customers.',
              },
              {
                icon: Clock3,
                title: 'Time Flexibility',
                copy: 'We welcome time flexibility of traveling for our dear customers.',
              },
            ].map(({ icon: Icon, title, copy }) => (
              <div className="benefit" key={title}>
                <div className="benefit-icon">
                  <Icon strokeWidth={1.4} />
                </div>
                <h3>{title}</h3>
                <p>{copy}</p>
              </div>
            ))}
          </div>
        </section>

        <section
          className="packages section wrap"
          id="packages"
          aria-labelledby="package-heading"
        >
          <div className="section-heading split-heading">
            <div>
              <h2 id="package-heading">SPECIAL PACKAGES</h2>
              <p>Get special travel packages made tailored for your needs.</p>
            </div>
            <a href="#destinations" className="text-link">
              See More Packages
            </a>
          </div>
          <div className="package-layout">
            <button className="culture-card" onClick={() => openTrip(culture)}>
              <Image
                sizes="(max-width: 640px) 90vw, 580px"
                width={1200}
                height={800}
                src={`/images/${culture.image}`}
                alt={culture.imageAlt}
                loading="lazy"
              />
              <span className="photo-scrim" />
              <span className="package-number">01</span>
              <span className="culture-title">
                Hoi An & Hue
                <br />
                Heritage
                <br />
                Journey
              </span>
              <span className="culture-arrow">
                <ArrowRight size={20} />
              </span>
            </button>
            <article className="paradise-card">
              <div className="paradise-image">
                <Image
                  sizes="(max-width: 640px) 90vw, 500px"
                  width={1200}
                  height={800}
                  src={`/images/${paradise.image}`}
                  alt={paradise.imageAlt}
                  loading="lazy"
                />
              </div>
              <div className="paradise-info">
                <h3>
                  PHU QUOC
                  <br />
                  ISLAND ESCAPE
                </h3>
                <div>
                  <p>{paradise.description}</p>
                  <Button
                    className="blue-button"
                    onClick={() => openTrip(paradise)}
                  >
                    Book Now
                  </Button>
                </div>
              </div>
            </article>
          </div>
        </section>

        <section
          className="quality wrap"
          id="about"
          aria-labelledby="quality-heading"
        >
          <Image
            sizes="100vw"
            width={1200}
            height={800}
            src="/images/sa-pa.jpg"
            alt="Green rice terraces and mountain scenery in Sa Pa, Vietnam"
            loading="lazy"
          />
          <div className="quality-shade" />
          <div className="quality-top">
            <h2 id="quality-heading">ONLY THE BEST QUALITY FOR YOU</h2>
            <p>
              You deserve the ultimate best quality
              <br />
              for your memorable experiences.
            </p>
          </div>
          <p className="quality-note">
            Take a look at our numbers for our
            <br />
            credibility. Let’s have an adventure!
          </p>
          <div className="stats">
            {[
              ['20+', 'years of experience'],
              ['100+', 'Vietnam trip ideas'],
              ['10+', 'tour & travel awards'],
              ['2,237,216', 'delighted clients'],
            ].map(([value, label]) => (
              <div key={label}>
                <strong>{value}</strong>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </section>

        <section
          className="testimonials section wrap"
          aria-labelledby="testimonials-heading"
          hidden
        >
          <div className="testimonial-heading">
            <div className="section-heading">
              <h2 id="testimonials-heading">TESTIMONIALS</h2>
              <p>What our clients love about us.</p>
            </div>
            <div className="review-controls">
              <Button
                variant="ghost"
                aria-label="Previous testimonial"
                onClick={() =>
                  setReview(
                    (current) =>
                      (current + reviews.length - 1) % reviews.length,
                  )
                }
              >
                <ChevronDown className="up-chevron" />
              </Button>
              <Button
                variant="ghost"
                aria-label="Next testimonial"
                onClick={() =>
                  setReview((current) => (current + 1) % reviews.length)
                }
              >
                <ChevronDown />
              </Button>
              <span className="sr-only" aria-live="polite">
                Review {review + 1} of {reviews.length}
              </span>
            </div>
          </div>
          <div className="quote-decoration" aria-hidden="true" />
          <div className="review-card">
            {reviews.map((item, index) => (
              <figure
                key={item.name}
                className="review-slide"
                data-active={review === index}
                aria-hidden={review !== index}
                inert={review !== index}
              >
                <blockquote>{item.text}</blockquote>
                <figcaption>
                  <Image
                    sizes="56px"
                    width={1200}
                    height={800}
                    src={`/images/${item.image}`}
                    alt=""
                    loading="lazy"
                  />
                  <span>
                    <strong>{item.name}</strong>
                    <small>Client from {item.country}</small>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="film" aria-label="Discover Vietnam with KHUVÉ">
          <Image
            sizes="100vw"
            width={1200}
            height={800}
            src="/images/hoi-an.jpg"
            alt="Traditional boats and yellow riverside houses in Hoi An, Vietnam"
            loading="lazy"
          />
          <button
            type="button"
            className="film-play"
            aria-label="Open travel highlights"
            onClick={() => {
              setStory(true);
              setStorySlide(0);
            }}
          >
            <span className="film-play-icon" aria-hidden="true">
              <Camera />
            </span>
            <span>Travel highlights</span>
          </button>
        </section>

        <section
          className="achievements section wrap"
          aria-labelledby="achievements-heading"
        >
          <div className="section-heading centered">
            <h2 id="achievements-heading">ACHIEVEMENTS</h2>
            <p>We are recognized for exceptional travel services.</p>
          </div>
          <div className="award-carousel">
            <Button
              variant="ghost"
              className="award-arrow"
              aria-label="Previous award"
              onClick={() => setAward((current) => (current + 2) % 3)}
            >
              <ChevronLeft />
            </Button>
            <div className="award-grid">
              {awards.map(({ name, detail, country, icon: Icon }, index) => (
                <button
                  key={name}
                  onClick={() => setAward(index)}
                  className={`award-card ${award === index ? 'selected' : ''}`}
                  aria-pressed={award === index}
                >
                  <div className="award-icon">
                    <Icon strokeWidth={1.2} />
                  </div>
                  <h3>{name}</h3>
                  <p>
                    {detail}
                    <br />
                    {country}
                  </p>
                </button>
              ))}
            </div>
            <Button
              variant="ghost"
              className="award-arrow"
              aria-label="Next award"
              onClick={() => setAward((current) => (current + 1) % 3)}
            >
              <ChevronRight />
            </Button>
          </div>
        </section>

        <section
          className="faq section"
          id="faq"
          aria-labelledby="faq-heading"
          hidden
        >
          <div className="section-heading centered">
            <h2 id="faq-heading">FREQUENTLY ASKED QUESTIONS</h2>
            <p>What our clients usually asked about our services and tours.</p>
          </div>
          <Accordion className="faq-list" defaultValue={['0']}>
            {faqs.map(([question, answer], index) => (
              <AccordionItem
                className="faq-item"
                value={String(index)}
                key={question}
              >
                <AccordionTrigger>{question}</AccordionTrigger>
                <AccordionContent>
                  <p>{answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        <section
          className="blog section wrap"
          id="blog"
          hidden
          aria-labelledby="blog-heading"
        >
          <div className="section-heading split-heading">
            <div>
              <h2 id="blog-heading">TRAVEL BLOG</h2>
              <p>Insights, tips, and stories to inspire your travels.</p>
            </div>
            <a className="text-link" href="#articles">
              See More Articles
            </a>
          </div>
          <div className="blog-grid" id="articles">
            {articles.map((post, index) => (
              <article
                key={post.title}
                className={
                  index === 0 ? 'blog-card blog-featured' : 'blog-card'
                }
              >
                <button
                  className="blog-image"
                  onClick={() => openArticle(index)}
                  aria-label={`Read ${post.title}`}
                >
                  <Image
                    sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 380px"
                    width={1200}
                    height={800}
                    src={`/images/${post.image}`}
                    alt={post.imageAlt}
                    loading="lazy"
                  />
                </button>
                <p className="category">{post.category}</p>
                <h3>
                  <button onClick={() => openArticle(index)}>
                    {post.title}
                  </button>
                </h3>
                {index === 0 && (
                  <div className="article-author">
                    <Image
                      sizes="40px"
                      width={1200}
                      height={800}
                      src="/images/angus.webp"
                      alt=""
                      loading="lazy"
                    />
                    <span>
                      Angus Smith<small>August 15, 2025</small>
                    </span>
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>

        <section
          className="newsletter"
          id="contact"
          aria-labelledby="newsletter-heading"
        >
          <Image
            sizes="100vw"
            width={1200}
            height={800}
            src="/images/ha-long.jpg"
            alt=""
            loading="lazy"
          />
          <div className="newsletter-wash" />
          <div className="newsletter-content wrap">
            <h2 id="newsletter-heading">START YOUR ADVENTURE</h2>
            <p>
              Find more of Vietnam with local travel stories, coastal escapes,
              and fresh trip ideas.
              <br className="desktop-break" /> Let your next adventure start
              here.
            </p>
            <form
              className="newsletter-form"
              onSubmit={(event) => {
                event.preventDefault();
                setNewsletterMessage(
                  'Newsletter signup is coming soon. Please check back for travel updates.',
                );
              }}
            >
              <label className="sr-only" htmlFor="newsletter-email">
                Email address
              </label>
              <Input
                type="email"
                id="newsletter-email"
                placeholder="Enter your email address here ..."
                required
                aria-describedby={
                  newsletterMessage ? 'newsletter-message' : undefined
                }
              />
              <Button type="submit" className="dark-button">
                Subscribe
              </Button>
            </form>
            <output className="newsletter-message" id="newsletter-message">
              {newsletterMessage}
            </output>
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <div className="wrap">
          <div className="footer-main">
            <Brand />
            <nav aria-label="Footer navigation">
              <a href="#destinations">Destinations</a>
              <a href="#packages">Tours</a>
              <a href="#about">About</a>
              <a href="#contact">Contact</a>
            </nav>
            <div className="social-links" hidden>
              <button
                aria-label="Facebook information"
                onClick={() => openInfo('social')}
              >
                <span className="facebook-mark">f</span>
              </button>
              <button
                aria-label="X social information"
                onClick={() => openInfo('social')}
              >
                <span className="x-mark">𝕏</span>
              </button>
              <button
                aria-label="Instagram information"
                onClick={() => openInfo('social')}
              >
                <Camera />
              </button>
            </div>
          </div>
          <div className="footer-bottom">
            <p>Copyright © 2026 KHUVÉ. All rights reserved.</p>
            <div>
              <button onClick={() => openInfo('privacy')}>
                Privacy Policy
              </button>
              <span>|</span>
              <button onClick={() => openInfo('terms')}>
                Terms &amp; Condition
              </button>
            </div>
          </div>
        </div>
      </footer>

      <Dialog open={tripOpen} onOpenChange={setTripOpen}>
        <DialogContent className="content-modal trip-modal">
          {trip && (
            <>
              <Image
                sizes="(max-width: 640px) 90vw, 650px"
                width={1200}
                height={800}
                className="modal-cover"
                src={`/images/${trip.image}`}
                alt={trip.imageAlt}
              />
              <p className="category">Your next adventure · {trip.days}</p>
              <DialogTitle>{trip.name}</DialogTitle>
              <DialogDescription>{trip.description}</DialogDescription>
              <ol className="itinerary">
                {trip.route.map((stop, index) => (
                  <li key={stop}>
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    {stop}
                  </li>
                ))}
              </ol>
              <p className="modal-note">
                A suggested itinerary to inspire your trip. Online booking is
                coming soon; no reservation or payment is made here.
              </p>
              <Button className="blue-button" onClick={downloadPlan}>
                {saved ? <Check size={18} /> : <Download size={18} />}{' '}
                {saved ? 'Trip plan saved' : 'Save trip plan'}
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={articleOpen} onOpenChange={setArticleOpen}>
        <DialogContent className="content-modal article-modal">
          {article !== null && (
            <>
              <Image
                sizes="(max-width: 640px) 90vw, 650px"
                width={1200}
                height={800}
                className="modal-cover"
                src={`/images/${articles[article].image}`}
                alt={articles[article].imageAlt}
              />
              <p className="category">{articles[article].category}</p>
              <DialogTitle>{articles[article].title}</DialogTitle>
              <DialogDescription>Travel notes from KHUVÉ</DialogDescription>
              <div className="article-body">
                {articles[article].body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={story} onOpenChange={setStory}>
        <DialogContent className="content-modal story-modal">
          <DialogTitle>Vietnam is waiting to be explored</DialogTitle>
          <DialogDescription>
            From Hoi An’s lantern streets to the islands of Ha Long Bay.
          </DialogDescription>
          <div className="story-photo">
            {storyPhotos.map(([image, alt, caption], index) => (
              <figure
                key={image}
                className="story-slide"
                data-active={storySlide === index}
                aria-hidden={storySlide !== index}
                inert={storySlide !== index}
              >
                <Image
                  sizes="(max-width: 640px) 90vw, 900px"
                  width={1200}
                  height={800}
                  src={`/images/${image}`}
                  alt={alt}
                />
                <figcaption>{caption}</figcaption>
              </figure>
            ))}
          </div>
          <div className="story-controls">
            <Button
              variant="ghost"
              onClick={() =>
                setStorySlide(
                  (current) =>
                    (current + storyPhotos.length - 1) % storyPhotos.length,
                )
              }
              aria-label="Previous highlight"
            >
              <ChevronLeft />
            </Button>
            <span>
              {storySlide + 1} / {storyPhotos.length}
            </span>
            <Button
              variant="ghost"
              onClick={() =>
                setStorySlide((current) => (current + 1) % storyPhotos.length)
              }
              aria-label="Next highlight"
            >
              <ChevronRight />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={infoOpen} onOpenChange={setInfoOpen}>
        <DialogContent className="content-modal info-modal">
          <div className="info-icon">
            <Compass />
          </div>
          <DialogTitle>
            {info === 'privacy'
              ? 'Your privacy'
              : info === 'terms'
                ? 'Travel planning terms'
                : 'Stay in the loop'}
          </DialogTitle>
          <DialogDescription>
            {info === 'privacy'
              ? 'This preview does not send form entries to a server or create an account. Saved trip plans are downloaded directly to your device. A full privacy policy will be provided when online booking becomes available.'
              : info === 'terms'
                ? 'This page is a travel website preview. The packages are suggested itineraries, and displayed awards and testimonials follow the supplied design. Availability, bookings, payments, and newsletter subscriptions are not active.'
                : 'Our social channels will be linked here when the travel service launches. In the meantime, explore our travel stories for inspiration.'}
          </DialogDescription>
          <Button
            className="blue-button"
            onClick={() => {
              setInfoOpen(false);
              scrollToSection(info === 'social' ? 'blog' : 'destinations');
            }}
          >
            Explore {info === 'social' ? 'travel stories' : 'destinations'}{' '}
            <ArrowRight size={16} />
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
