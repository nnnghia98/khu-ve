'use client';

import Image from 'next/image';
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type SubmitEvent,
} from 'react';
import { createV2Motion } from './create-motion';
import {
  getTripPlanSnapshot,
  parseTripPlan,
  saveTripPlan,
  subscribeTripPlan,
  type TripPlan,
} from './trip-plan';
import {
  articles,
  categories,
  destinations,
  extraDestinations,
  gallery,
  places,
  type Destination,
} from './content';

type DialogName = 'trip' | 'gallery' | 'article';
type Search = { destination: string; price: string } | null;

function Icon({ name }: { name: string }) {
  return (
    <svg aria-hidden="true">
      <use href={`#v2-i-${name}`} />
    </svg>
  );
}

function DestinationCard({
  destination,
  onOpen,
}: {
  destination: Destination;
  onOpen: (destination: Destination) => void;
}) {
  return (
    <button
      type="button"
      className={`v2-destination-card${destination.featured ? ' v2-is-featured' : ''}`}
      data-country={destination.name}
      data-price={destination.price}
      onClick={() => onOpen(destination)}
    >
      <Image
        unoptimized
        src={`/v2-assets/${destination.image}`}
        width={1260}
        height={840}
        alt={destination.alt}
        loading="lazy"
      />
      <span className="v2-destination-content">
        <span>
          <strong>{destination.label || destination.name}</strong>
          <small>
            <Icon name="pin" />
            {destination.packages} Packages
          </small>
        </span>
        <span className="v2-card-arrow">
          <Icon name="chevron" />
        </span>
      </span>
    </button>
  );
}

function saveLocal(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function formText(data: FormData, name: string, fallback = '') {
  const value = data.get(name);
  return typeof value === 'string' ? value : fallback;
}

export default function V2Page() {
  const scope = useRef<HTMLDivElement>(null);
  const motion = useRef<ReturnType<typeof createV2Motion> | null>(null);
  const beforeCards = useRef<Map<HTMLElement, DOMRect> | undefined>(undefined);
  const searchForm = useRef<HTMLFormElement>(null);
  const tripDialog = useRef<HTMLDialogElement>(null);
  const galleryDialog = useRef<HTMLDialogElement>(null);
  const articleDialog = useRef<HTMLDialogElement>(null);
  const bookingDestination = useRef<HTMLInputElement>(null);
  const lightboxImage = useRef<HTMLImageElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const bookingMessage = useRef<HTMLOutputElement>(null);
  const newsletterMessage = useRef<HTMLOutputElement>(null);
  const galleryDirection = useRef(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState<Search>(null);
  const [more, setMore] = useState(false);
  const [activeDialog, setActiveDialog] = useState<DialogName | null>(null);
  const [tripDestination, setTripDestination] = useState('Da Nang');
  const [tripDate, setTripDate] = useState('2026-10-23');
  const [tripPackageId, setTripPackageId] = useState('');
  const [tripTravelers, setTripTravelers] = useState('2');
  const [tripEmail, setTripEmail] = useState('');
  const savedPlan = parseTripPlan(
    useSyncExternalStore(subscribeTripPlan, getTripPlanSnapshot, () => null),
  );
  const [minDate, setMinDate] = useState('');
  const [tripMessage, setTripMessage] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState('');
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [articleIndex, setArticleIndex] = useState(0);

  useEffect(() => {
    if (!scope.current) return;
    const controller = createV2Motion(scope.current);
    motion.current = controller;
    const mobileQuery = matchMedia('(max-width: 700px)');
    const updateMobile = () => setMobile(mobileQuery.matches);
    updateMobile();
    setMinDate(new Date().toISOString().slice(0, 10));
    mobileQuery.addEventListener('change', updateMobile);
    return () => {
      controller.destroy();
      motion.current = null;
      mobileQuery.removeEventListener('change', updateMobile);
    };
  }, []);

  useEffect(() => {
    const root = scope.current;
    const dismissMenu = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && menuOpen && !activeDialog) {
        setMenuOpen(false);
        menuButton.current?.focus();
      }
    };
    root?.addEventListener('keydown', dismissMenu);
    return () => root?.removeEventListener('keydown', dismissMenu);
  }, [menuOpen, activeDialog]);

  useEffect(() => {
    const dialogs = [
      tripDialog.current,
      galleryDialog.current,
      articleDialog.current,
    ];
    // Native dialogs provide Escape and focus management; backdrop clicks dismiss them too.
    const dismissBackdrop = (event: globalThis.MouseEvent) => {
      const dialog = event.currentTarget as HTMLDialogElement;
      if (event.target !== dialog) return;
      const bounds = dialog.getBoundingClientRect();
      if (
        event.clientX < bounds.left ||
        event.clientX > bounds.right ||
        event.clientY < bounds.top ||
        event.clientY > bounds.bottom
      ) {
        setActiveDialog(null);
      }
    };
    const navigateGallery = (event: KeyboardEvent) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      const direction = event.key === 'ArrowLeft' ? -1 : 1;
      galleryDirection.current = direction;
      setGalleryIndex(
        (index) => (index + direction + gallery.length) % gallery.length,
      );
    };
    for (const dialog of dialogs)
      dialog?.addEventListener('click', dismissBackdrop);
    const lightbox = galleryDialog.current;
    lightbox?.addEventListener('keydown', navigateGallery);
    return () => {
      for (const dialog of dialogs)
        dialog?.removeEventListener('click', dismissBackdrop);
      lightbox?.removeEventListener('keydown', navigateGallery);
    };
  }, []);

  useLayoutEffect(() => {
    if (beforeCards.current) motion.current?.updateCards(beforeCards.current);
    beforeCards.current = undefined;
  }, [category, search, more]);

  useLayoutEffect(() => {
    const dialogs = {
      trip: tripDialog.current,
      gallery: galleryDialog.current,
      article: articleDialog.current,
    };
    for (const [name, dialog] of Object.entries(dialogs)) {
      if (!dialog) continue;
      if (name === activeDialog) {
        dialog.inert = false;
        if (!dialog.open) dialog.showModal();
        dialog.scrollTop = 0;
        if (name === 'trip')
          bookingDestination.current?.focus({ preventScroll: true });
      } else if (dialog.open) {
        dialog.inert = true;
        dialog.close();
      }
    }
  }, [activeDialog]);

  useEffect(() => {
    motion.current?.feedback(bookingMessage.current);
  }, [tripMessage]);
  useEffect(() => {
    motion.current?.feedback(newsletterMessage.current);
  }, [newsletterStatus]);
  useLayoutEffect(() => {
    if (galleryDirection.current && lightboxImage.current)
      motion.current?.galleryChange(
        lightboxImage.current,
        galleryDirection.current,
      );
    galleryDirection.current = 0;
  }, [galleryIndex]);

  const allDestinations = more
    ? [...destinations, ...extraDestinations]
    : destinations;
  const visibleDestinations = allDestinations.filter((destination) => {
    if (category !== 'all' && !destination.categories.includes(category))
      return false;
    if (!search) return true;
    if (search.destination !== 'all' && destination.name !== search.destination)
      return false;
    if (search.price === 'all') return true;
    const [min, max] = search.price.split('-').map(Number);
    return destination.price >= min && destination.price <= max;
  });
  const hasSearch = Boolean(
    search && (search.destination !== 'all' || search.price !== 'all'),
  );
  const prepareCards = () => {
    beforeCards.current = motion.current?.captureCards();
  };
  const chooseCategory = (value: string) => {
    prepareCards();
    setCategory(value);
  };
  const submitSearch = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    prepareCards();
    setSearch({
      destination: formText(data, 'destination', 'all'),
      price: formText(data, 'price', 'all'),
    });
    document.getElementById('v2-destinations')?.scrollIntoView({
      behavior: motion.current?.instant() ? 'instant' : 'smooth',
      block: 'start',
    });
  };
  const clearSearch = () => {
    prepareCards();
    setSearch(null);
    setCategory('all');
    for (const select of searchForm.current?.querySelectorAll('select') || [])
      select.value = 'all';
  };
  const openTrip = (destination: Destination | string) => {
    setTripDestination(
      typeof destination === 'string'
        ? destination
        : destination.label || destination.name,
    );
    setTripPackageId(typeof destination === 'string' ? '' : destination.id);
    setTripDate(formText(new FormData(searchForm.current!), 'date'));
    setTripTravelers('2');
    setTripEmail('');
    setTripMessage('');
    setActiveDialog('trip');
  };
  const openSavedTrip = () => {
    if (!savedPlan) return;
    setTripDestination(savedPlan.destination);
    setTripPackageId(savedPlan.packageId);
    setTripDate(savedPlan.date);
    setTripTravelers(savedPlan.travelers);
    setTripEmail(savedPlan.email);
    setTripMessage('Your saved plan is ready to review or edit.');
    setActiveDialog('trip');
  };
  const closeDialog = () => setActiveDialog(null);
  const openGallery = (index: number) => {
    galleryDirection.current = 0;
    setGalleryIndex(index);
    setActiveDialog('gallery');
  };
  const moveGallery = (direction: number) => {
    galleryDirection.current = direction;
    setGalleryIndex(
      (index) => (index + direction + gallery.length) % gallery.length,
    );
  };
  const openArticle = (index: number) => {
    setArticleIndex(index);
    setActiveDialog('article');
  };
  const saveTrip = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const plan: TripPlan = {
      destination: tripDestination,
      packageId: tripPackageId,
      date: tripDate,
      travelers: tripTravelers,
      email: tripEmail,
      savedAt: new Date().toISOString(),
    };
    const saved = saveTripPlan(plan);
    setTripMessage(
      saved
        ? 'Trip plan saved on this device. No payment or booking was made.'
        : 'This browser could not save your plan. No booking was made.',
    );
  };
  const subscribe = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const email = formText(new FormData(event.currentTarget), 'email').trim();
    setNewsletterStatus(
      saveLocal('vacasky-v2-newsletter-email', email)
        ? 'Email saved on this device. Newsletter delivery is not connected yet.'
        : 'This browser could not save your email.',
    );
  };
  const article = articles[articleIndex];
  const galleryPhoto = gallery[galleryIndex];

  return (
    <div className="v2-page" ref={scope}>
      <a className="v2-skip-link" href="#v2-destinations">
        Skip to destinations
      </a>
      <svg
        className="v2-icon-library"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <symbol id="v2-i-chevron" viewBox="0 0 24 24">
          <path d="m8 4 8 8-8 8" />
        </symbol>
        <symbol id="v2-i-down" viewBox="0 0 24 24">
          <path d="m5 9 7 7 7-7" />
        </symbol>
        <symbol id="v2-i-pin" viewBox="0 0 24 24">
          <path d="M19 10c0 5-7 12-7 12S5 15 5 10a7 7 0 1 1 14 0Z" />
          <circle cx="12" cy="10" r="2.5" />
        </symbol>
        <symbol id="v2-i-smile" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="19" />
          <path d="M13 24h22a11 11 0 0 1-22 0ZM16 17c1-2 3-2 5 0m6 0c1-2 3-2 5 0" />
        </symbol>
        <symbol id="v2-i-mountain" viewBox="0 0 48 48">
          <path d="M4 32 20 6l8 13 5-9 12 21M15 15l5 3 5-3M12 42V28m-5 8 5-8 5 8m-6-4-6 8m7-8 6 8m12 2V27m-5 8 5-8 5 8m-5-3-6 8m6-8 6 8M20 6l5-3" />
        </symbol>
        <symbol id="v2-i-flag" viewBox="0 0 48 48">
          <path d="m11 43-7-34m2 2c8-8 17 4 26-4l5 20c-9 8-17-4-26 4m9-22 5 19M32 9l9-1 4 18-9 3" />
        </symbol>
        <symbol id="v2-i-clock" viewBox="0 0 48 48">
          <path d="M26 5a19 19 0 0 1 17 20M40 35l-9 10-6-6M15 8A19 19 0 0 0 18 42M7 6v12h12M25 11v14H14" />
        </symbol>
        <symbol id="v2-i-route" viewBox="0 0 48 48">
          <path d="M34 15H15a7 7 0 0 0 0 14h18a7 7 0 0 1 0 14H17M37 4a5 5 0 0 1 5 5c0 5-5 11-5 11s-5-6-5-11a5 5 0 0 1 5-5ZM10 33a5 5 0 0 1 5 5c0 5-5 10-5 10S5 43 5 38a5 5 0 0 1 5-5Z" />
        </symbol>
        <symbol id="v2-i-calendar" viewBox="0 0 48 48">
          <path d="M23 43H9a5 5 0 0 1-5-5V12a5 5 0 0 1 5-5h28a5 5 0 0 1 5 5v16M14 3v9M32 3v9M4 18h38m-17 20 7 6 12-14" />
          <path d="M13 25h1m8 0h1m8 0h1m-19 8h1m8 0h1" strokeWidth="3" />
        </symbol>
        <symbol id="v2-i-suitcase" viewBox="0 0 48 48">
          <rect x="10" y="13" width="28" height="31" rx="2" />
          <path d="M19 13V4h10v9M15 13v31m18-31v31M15 44v3m18-3v3" />
        </symbol>
        <symbol id="v2-i-plane" viewBox="0 0 48 48">
          <path d="M43 5c-3-3-6-1-9 2l-9 10L8 12l-5 5 17 8-9 11-7-1-3 4 10 4 4 5 4-3-1-7 11-9 8 17 5-5-5-17 8-10c3-3 4-6 1-9Z" />
        </symbol>
        <symbol id="v2-i-instagram" viewBox="0 0 24 24">
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <path d="M17.5 6.5h.01" strokeWidth="3" />
        </symbol>
        <symbol id="v2-i-close" viewBox="0 0 24 24">
          <path d="m6 6 12 12M6 18 18 6" />
        </symbol>
        <symbol id="v2-i-menu" viewBox="0 0 24 24">
          <path d="M3 6h18M3 12h18M3 18h18" />
        </symbol>
      </svg>

      <section className="v2-hero" id="v2-home" aria-labelledby="v2-hero-title">
        <header className="v2-site-header v2-container">
          <a className="v2-logo" href="#v2-home" aria-label="KHUVÉ home">
            <span className="brand-wordmark">KHUVÉ</span>
          </a>
          <button
            className="v2-menu-toggle"
            ref={menuButton}
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={menuOpen}
            aria-controls="v2-main-nav"
          >
            <svg>
              <use href="#v2-i-menu" />
            </svg>
          </button>
          <nav
            className={`v2-main-nav${menuOpen ? ' v2-is-open' : ''}`}
            inert={mobile && !menuOpen}
            id="v2-main-nav"
            aria-label="Main navigation"
          >
            <a href="#v2-destinations" onClick={() => setMenuOpen(false)}>
              Destinations{' '}
              <svg>
                <use href="#v2-i-down" />
              </svg>
            </a>
            <a href="#v2-offers" onClick={() => setMenuOpen(false)}>
              Tours{' '}
              <svg>
                <use href="#v2-i-down" />
              </svg>
            </a>
            <a href="#v2-about" onClick={() => setMenuOpen(false)}>
              About
            </a>
            <a href="#v2-blog" onClick={() => setMenuOpen(false)}>
              Blog
            </a>
            <a href="#v2-contact" onClick={() => setMenuOpen(false)}>
              Contact
            </a>
          </nav>
        </header>
        <div className="v2-hero-copy v2-container">
          <p className="v2-eyebrow">Discover the beauty of</p>
          <h1 id="v2-hero-title">DA NANG</h1>
          <p className="v2-hero-description">
            From My Khe Beach to the hills of Son Tra, discover Da Nang
            <br className="v2-desktop-break" /> and start your journey through
            Vietnam.
          </p>
        </div>
        <form
          ref={searchForm}
          onSubmit={submitSearch}
          className="v2-trip-search"
          id="v2-trip-search"
        >
          <div className="v2-search-field">
            <label htmlFor="v2-destination">
              Destination{' '}
              <svg>
                <use href="#v2-i-down" />
              </svg>
            </label>
            <select
              id="v2-destination"
              name="destination"
              defaultValue="Da Nang"
            >
              <option value="Da Nang">Da Nang, Vietnam</option>
              <option value="Hoi An">Hoi An</option>
              <option value="Ha Long Bay">Ha Long Bay</option>
              <option value="Sa Pa">Sa Pa</option>
              <option value="all">All Vietnam</option>
            </select>
          </div>
          <div className="v2-search-field">
            <label htmlFor="v2-travel-date">
              Date{' '}
              <svg>
                <use href="#v2-i-down" />
              </svg>
            </label>
            <input
              type="date"
              id="v2-travel-date"
              name="date"
              aria-label="Departure date"
              defaultValue="2026-10-23"
            />
          </div>
          <div className="v2-search-field">
            <label htmlFor="v2-price">
              Price{' '}
              <svg>
                <use href="#v2-i-down" />
              </svg>
            </label>
            <select id="v2-price" name="price" defaultValue="1000-2000">
              <option value="1000-2000">$1,000 - $2,000</option>
              <option value="0-1000">Under $1,000</option>
              <option value="2000-5000">$2,000 - $5,000</option>
              <option value="all">Any budget</option>
            </select>
          </div>
          <button className="v2-button v2-primary" type="submit">
            Search
          </button>
        </form>
      </section>

      <main>
        <section
          className="v2-benefits v2-container"
          aria-label="Why travel with KHUVÉ"
        >
          <article>
            <span className="v2-benefit-icon">
              <svg>
                <use href="#v2-i-smile" />
              </svg>
            </span>
            <h3>Customer Delight</h3>
            <p>
              We deliver the best service
              <br />
              and experience for our customer.
            </p>
          </article>
          <article>
            <span className="v2-benefit-icon v2-featured">
              <svg>
                <use href="#v2-i-mountain" />
              </svg>
            </span>
            <h3>Authentic Adventure</h3>
            <p>
              We deliver the real adventure
              <br />
              experience for our customer.
            </p>
          </article>
          <article>
            <span className="v2-benefit-icon">
              <svg>
                <use href="#v2-i-flag" />
              </svg>
            </span>
            <h3>Expert Guides</h3>
            <p>
              We deliver only expert
              <br />
              tour guides for our customer.
            </p>
          </article>
          <article>
            <span className="v2-benefit-icon">
              <svg>
                <use href="#v2-i-clock" />
              </svg>
            </span>
            <h3>Time Flexibility</h3>
            <p>
              We welcome time flexibility
              <br />
              of traveling for our customer.
            </p>
          </article>
        </section>

        <section
          className="v2-destinations v2-container"
          id="v2-destinations"
          aria-labelledby="v2-destinations-title"
        >
          <div className="v2-section-title">
            <span aria-hidden="true">DESTINATION</span>
            <h2 id="v2-destinations-title">Popular Destinations</h2>
          </div>
          <fieldset
            className="v2-destination-filters"
            aria-label="Filter destinations"
          >
            {categories.map(([key, label]) => (
              <button
                key={key}
                className={category === key ? 'v2-active' : undefined}
                aria-pressed={category === key}
                data-filter={key}
                onClick={() => chooseCategory(key)}
              >
                {label}
              </button>
            ))}
          </fieldset>
          <p
            className="v2-search-summary"
            id="v2-search-summary"
            aria-live="polite"
            hidden={!hasSearch}
          >
            {visibleDestinations.length} destination
            {visibleDestinations.length === 1 ? '' : 's'} match your search.
          </p>
          <div className="v2-destination-grid" id="v2-destination-grid">
            {visibleDestinations.map((destination) => (
              <DestinationCard
                key={destination.id}
                destination={destination}
                onOpen={openTrip}
              />
            ))}
          </div>
          <div
            className="v2-empty-state"
            id="v2-empty-state"
            hidden={visibleDestinations.length > 0}
          >
            <h3>A little change, a new adventure.</h3>
            <p>No trips match that budget. Try another price range.</p>
            <button
              className="v2-button v2-outline"
              id="v2-clear-search"
              onClick={clearSearch}
            >
              See all destinations
            </button>
          </div>
          <div className="v2-center">
            <button
              className="v2-button v2-outline"
              id="v2-load-more"
              onClick={() => {
                prepareCards();
                setMore((value) => !value);
              }}
            >
              {more ? 'Show Fewer Destinations' : 'Load More Destinations'}
            </button>
            {savedPlan && (
              <button
                type="button"
                className="v2-button v2-outline"
                onClick={openSavedTrip}
              >
                Open saved trip plan
              </button>
            )}
          </div>
        </section>

        <section
          className="v2-offers v2-container"
          id="v2-offers"
          aria-label="Special travel offers"
        >
          <article className="v2-offer v2-offer-beach">
            <div>
              <h2>
                ESCAPE TO
                <br />
                PHU QUOC
              </h2>
              <p>Save 20% on your Phu Quoc island getaway!</p>
              <button
                className="v2-button v2-white"
                data-book="Phu Quoc island getaway"
                onClick={() => openTrip('Phu Quoc island getaway')}
              >
                Book Now
              </button>
            </div>
          </article>
          <article className="v2-offer v2-offer-mountain">
            <h2>
              SA PA
              <br />
              AWAITS
            </h2>
            <p>Explore Sa Pa with a FREE hiking excursion!</p>
            <button
              className="v2-button v2-dark"
              data-book="Sa Pa hiking adventure"
              onClick={() => openTrip('Sa Pa hiking adventure')}
            >
              Book Now
            </button>
          </article>
        </section>

        <section
          className="v2-process v2-section-band"
          id="v2-process"
          aria-labelledby="v2-process-title"
        >
          <div className="v2-container">
            <div className="v2-section-title">
              <span aria-hidden="true">PROCESS</span>
              <h2 id="v2-process-title">How It Works</h2>
            </div>
            <div className="v2-process-steps">
              <svg
                className="v2-process-path"
                viewBox="0 0 1100 240"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path d="M110 100C320 330 490 75 710 70S940 245 1000 175" />
              </svg>
              <article className="v2-step v2-step-plan">
                <span className="v2-step-icon">
                  <svg>
                    <use href="#v2-i-route" />
                  </svg>
                </span>
                <h3>Trip Planning</h3>
                <p>
                  We plan on what to do
                  <br />
                  during the trip days.
                </p>
              </article>
              <article className="v2-step v2-step-book">
                <span className="v2-step-icon">
                  <svg>
                    <use href="#v2-i-calendar" />
                  </svg>
                </span>
                <h3>Trip Booking</h3>
                <p>
                  We book the necessary
                  <br />
                  hotel and tickets for your trip.
                </p>
              </article>
              <article className="v2-step v2-step-prepare">
                <span className="v2-step-icon">
                  <svg>
                    <use href="#v2-i-suitcase" />
                  </svg>
                </span>
                <h3>Trip Preparation</h3>
                <p>
                  We prepare all accommodation
                  <br />
                  and trip necessities.
                </p>
              </article>
              <article className="v2-step v2-step-experience">
                <span className="v2-step-icon">
                  <svg>
                    <use href="#v2-i-plane" />
                  </svg>
                </span>
                <h3>Trip Experience</h3>
                <p>
                  We give you the best travel
                  <br />
                  experience with our tour guide.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section
          className="v2-about v2-container"
          id="v2-about"
          aria-labelledby="v2-about-title"
        >
          <div className="v2-about-copy">
            <h2 id="v2-about-title">
              Only The
              <br />
              Best Quality
              <br />
              For You
            </h2>
            <p>
              From Planning to Post-Trip Follow-Up, we have all the best
              services special for you. Take a look at our numbers for our
              credibility.
            </p>
          </div>
          <Image
            unoptimized
            className="v2-about-photo"
            src="/v2-assets/ninh-binh.webp"
            alt="Rowboats and limestone mountains in Ninh Binh, Vietnam"
            loading="lazy"
            width={1260}
            height={681}
          />
          <dl className="v2-statistics">
            <div>
              <dt>20+</dt>
              <dd>years of experience</dd>
            </div>
            <div>
              <dt>100+</dt>
              <dd>destinations in Vietnam</dd>
            </div>
            <div>
              <dt>10+</dt>
              <dd>tour &amp; travel awards</dd>
            </div>
            <div>
              <dt>2,237,376</dt>
              <dd>delighted clients</dd>
            </div>
          </dl>
        </section>

        <section
          hidden
          className="v2-testimonials v2-section-band"
          aria-label="What our travelers say"
        >
          <div className="v2-testimonial-inner v2-container">
            <Image
              unoptimized
              className="v2-avatar v2-floating v2-avatar-one"
              src="/v2-assets/avatar-1.png"
              alt=""
              loading="lazy"
              width={29}
              height={29}
            />
            <Image
              unoptimized
              className="v2-avatar v2-floating v2-avatar-two"
              src="/v2-assets/avatar-2.png"
              alt=""
              loading="lazy"
              width={29}
              height={31}
            />
            <Image
              unoptimized
              className="v2-avatar v2-floating v2-avatar-three"
              src="/v2-assets/avatar-3.png"
              alt=""
              loading="lazy"
              width={30}
              height={28}
            />
            <Image
              unoptimized
              className="v2-avatar v2-floating v2-avatar-four"
              src="/v2-assets/avatar-4.png"
              alt=""
              loading="lazy"
              width={29}
              height={32}
            />
            <figure className="v2-testimonial">
              <span className="v2-quote-mark" aria-hidden="true">
                ”
              </span>
              <blockquote>
                I&apos;ve traveled with KHUVÉ several times, and each time has
                been a unique and unforgettable experience.
                <br className="v2-desktop-break" /> Their team of travel
                specialists are knowledgeable, friendly, and always go the extra
                mile to make sure that everything
                <br className="v2-desktop-break" /> and everyone is taken care
                of. I highly recommend KHUVÉ to anyone looking for a truly
                special travel experience!
              </blockquote>
              <figcaption>
                <Image
                  unoptimized
                  className="v2-avatar v2-main-avatar"
                  src="/v2-assets/sarah.png"
                  alt="Sarah Johnson"
                  loading="lazy"
                  width={320}
                  height={320}
                />
                <strong>Sarah Johnson</strong>
                <span>Traveler from Hanoi, Vietnam</span>
              </figcaption>
            </figure>
          </div>
        </section>

        <section
          className="v2-gallery v2-container"
          id="v2-gallery"
          aria-labelledby="v2-gallery-title"
        >
          <div className="v2-section-title">
            <span aria-hidden="true">GALLERY</span>
            <h2 id="v2-gallery-title">Our Adventures</h2>
          </div>
          <div className="v2-gallery-grid">
            <button
              className="v2-gallery-tile v2-gallery-castle"
              data-gallery="0"
              onClick={() => openGallery(0)}
              aria-label="View imperial architecture in Hue, Vietnam"
            >
              <Image
                unoptimized
                src="/v2-assets/hue.webp"
                alt="An ornate imperial gate in Hue, Vietnam"
                loading="lazy"
                width={1260}
                height={681}
              />
            </button>
            <button
              className="v2-gallery-tile v2-gallery-snow"
              data-gallery="1"
              onClick={() => openGallery(1)}
              aria-label="View a mountain trail in Sa Pa, Vietnam"
            >
              <Image
                unoptimized
                src="/v2-assets/sa-pa-trek.webp"
                alt="A hiker on a green mountain trail in Sa Pa, Vietnam"
                loading="lazy"
                width={900}
                height={600}
              />
            </button>
            <button
              className="v2-gallery-tile v2-gallery-couple"
              data-gallery="2"
              onClick={() => openGallery(2)}
              aria-label="View a riverside journey in Hoi An, Vietnam"
            >
              <Image
                unoptimized
                src="/v2-assets/hoi-an.webp"
                alt="A boat journey along the river in Hoi An, Vietnam"
                loading="lazy"
                width={1260}
                height={681}
              />
            </button>
            <button
              className="v2-gallery-tile v2-gallery-hotel"
              data-gallery="3"
              onClick={() => openGallery(3)}
              aria-label="View My Khe Beach in Da Nang, Vietnam"
            >
              <Image
                unoptimized
                src="/v2-assets/da-nang-beach.webp"
                alt="A basket boat on My Khe Beach in Da Nang, Vietnam"
                loading="lazy"
                width={900}
                height={600}
              />
            </button>
            <button
              className="v2-gallery-tile v2-gallery-coast"
              data-gallery="4"
              onClick={() => openGallery(4)}
              aria-label="View limestone islands in Ha Long Bay, Vietnam"
            >
              <Image
                unoptimized
                src="/v2-assets/ha-long.webp"
                alt="A rowboat beneath a limestone arch in Ha Long Bay, Vietnam"
                loading="lazy"
                width={1260}
                height={681}
              />
            </button>
          </div>
          <div className="v2-center">
            <a
              className="v2-button v2-outline v2-instagram-button"
              href="#v2-destinations"
            >
              Explore KHUVÉ
            </a>
          </div>
        </section>

        <section
          className="v2-vacation v2-container"
          aria-labelledby="v2-vacation-title"
        >
          <div className="v2-vacation-banner">
            <div className="v2-vacation-copy">
              <p className="v2-eyebrow">Book your dream vacation</p>
              <h2 id="v2-vacation-title">TODAY</h2>
              <p>
                Let us help you create unforgettable memories with
                <br className="v2-desktop-break" /> our special tours of Phu
                Quoc, Vietnam.
              </p>
              <button
                className="v2-button v2-dark"
                data-book="Phu Quoc, Vietnam"
                onClick={() => openTrip('Phu Quoc, Vietnam')}
              >
                Book Now
              </button>
            </div>
            <span className="v2-vacation-location">
              <svg>
                <use href="#v2-i-pin" />
              </svg>
              Phu Quoc, Vietnam
            </span>
          </div>
        </section>

        <section
          className="v2-blog v2-container"
          id="v2-blog"
          aria-labelledby="v2-blog-title"
        >
          <div className="v2-section-title">
            <span aria-hidden="true">BLOG</span>
            <h2 id="v2-blog-title">KHUVÉ News &amp; Updates</h2>
          </div>
          <div className="v2-blog-grid">
            <button
              className="v2-blog-card v2-blog-main"
              data-article="0"
              onClick={() => openArticle(0)}
            >
              <Image
                unoptimized
                src="/v2-assets/ninh-binh.webp"
                alt="Limestone mountains and rowboats in Ninh Binh, Vietnam"
                loading="lazy"
                width={1260}
                height={681}
              />
              <span className="v2-blog-content">
                <span className="v2-article-category">Travel</span>
                <strong>
                  10 Must-See
                  <br />
                  Places
                  <br />
                  in Vietnam
                </strong>
                <span className="v2-author">
                  <Image
                    unoptimized
                    src="/v2-assets/angus.png"
                    alt=""
                    loading="lazy"
                    width={979}
                    height={917}
                  />
                  <span>
                    Angus Smith<small>August 15, 2025</small>
                  </span>
                </span>
              </span>
              <span className="v2-article-arrow">
                <svg>
                  <use href="#v2-i-chevron" />
                </svg>
              </span>
            </button>
            <button
              className="v2-blog-card v2-blog-small"
              data-article="1"
              onClick={() => openArticle(1)}
            >
              <Image
                unoptimized
                src="/v2-assets/sa-pa-trek.webp"
                alt="A hiking trail through the mountains of Sa Pa, Vietnam"
                loading="lazy"
                width={900}
                height={600}
              />
              <span className="v2-blog-content">
                <span className="v2-article-category">Guide</span>
                <strong>
                  Our Beginner’s
                  <br />
                  Guide to Hiking
                  <br />
                  in Sa Pa
                </strong>
              </span>
            </button>
            <button
              className="v2-blog-card v2-blog-small"
              data-article="2"
              onClick={() => openArticle(2)}
            >
              <Image
                unoptimized
                src="/v2-assets/hanoi.webp"
                alt="Turtle Tower reflected in Hoan Kiem Lake in Hanoi, Vietnam"
                loading="lazy"
                width={1260}
                height={681}
              />
              <span className="v2-blog-content">
                <span className="v2-article-category">Inspiration</span>
                <strong>
                  Solo Travel
                  <br />
                  in Hanoi: A Journey
                  <br />
                  of Your Own
                </strong>
              </span>
            </button>
          </div>
        </section>

        <section
          hidden
          className="v2-faq v2-section-band"
          aria-labelledby="v2-faq-title"
        >
          <div className="v2-faq-inner v2-container">
            <div className="v2-faq-list">
              <details name="vacasky-v2-faq" open>
                <summary>
                  What type of travel packages does KHUVÉ offer?
                  <span>
                    <svg>
                      <use href="#v2-i-down" />
                    </svg>
                  </span>
                </summary>
                <p>
                  KHUVÉ offers a wide range of travel packages to destinations
                  across Vietnam, including customized tours, group tours,
                  luxury travel, adventure travel, and more. Our travel
                  specialists work with you to create an itinerary that meets
                  your specific needs and preferences.
                </p>
              </details>
              <details name="vacasky-v2-faq">
                <summary>
                  How do I book a trip with KHUVÉ?
                  <span>
                    <svg>
                      <use href="#v2-i-down" />
                    </svg>
                  </span>
                </summary>
                <p>
                  Choose a destination and select Book Now to start your trip
                  plan. Add your preferred dates and group size, then save your
                  plan. A saved plan is a starting point and does not confirm a
                  booking.
                </p>
              </details>
              <details name="vacasky-v2-faq">
                <summary>
                  What is the payment process for KHUVÉ?
                  <span>
                    <svg>
                      <use href="#v2-i-down" />
                    </svg>
                  </span>
                </summary>
                <p>
                  Payment options and deposit details are confirmed with your
                  final itinerary. You can explore destinations and save a trip
                  plan here without making a payment.
                </p>
              </details>
              <details name="vacasky-v2-faq">
                <summary>
                  How to cancel my booking in KHUVÉ?
                  <span>
                    <svg>
                      <use href="#v2-i-down" />
                    </svg>
                  </span>
                </summary>
                <p>
                  For a confirmed booking, contact your travel specialist using
                  the details in your booking confirmation. Cancellation terms
                  depend on your tour, hotel, and departure date.
                </p>
              </details>
            </div>
            <div className="v2-faq-copy">
              <h2 id="v2-faq-title">
                Frequently <br />
                Asked <br />
                Questions
              </h2>
              <p>
                What our clients usually asked about
                <br />
                our services and tours.
              </p>
              <span className="v2-dot-pattern" aria-hidden="true"></span>
            </div>
          </div>
        </section>

        <section
          className="v2-partners v2-container"
          aria-label="Our travel partners"
        >
          <Image
            unoptimized
            src="/v2-assets/partner-1.png"
            alt="Tours By Locals"
            loading="lazy"
            width={98}
            height={96}
          />
          <Image
            unoptimized
            src="/v2-assets/partner-2.png"
            alt="Josun Hotels and Resorts"
            loading="lazy"
            width={147}
            height={82}
          />
          <Image
            unoptimized
            src="/v2-assets/partner-3.png"
            alt="TrekkSoft"
            loading="lazy"
            width={180}
            height={38}
          />
          <Image
            unoptimized
            src="/v2-assets/partner-4.png"
            alt="Responsible Travel"
            loading="lazy"
            width={181}
            height={68}
          />
          <Image
            unoptimized
            src="/v2-assets/partner-5.png"
            alt="Wikivoyage"
            loading="lazy"
            width={109}
            height={108}
          />
        </section>

        <section
          className="v2-newsletter v2-container"
          id="v2-contact"
          aria-labelledby="v2-newsletter-title"
        >
          <div className="v2-section-title">
            <span aria-hidden="true">NEWSLETTER</span>
            <h2 id="v2-newsletter-title">Subscribe to our newsletter</h2>
          </div>
          <p>
            Sign up for our newsletter and receive exclusive travel deals,
            insider tips, and destination
            <br className="v2-desktop-break" /> inspiration. Don&apos;t miss out
            on the adventure - join our mailing list today!
          </p>
          <form id="v2-newsletter-form" onSubmit={subscribe}>
            <label className="v2-sr-only" htmlFor="v2-newsletter-email">
              Email address
            </label>
            <input
              id="v2-newsletter-email"
              name="email"
              type="email"
              required
              placeholder="Enter your email address here ..."
              autoComplete="email"
            />
            <button className="v2-button v2-primary">Subscribe</button>
          </form>
          <output
            className="v2-form-message"
            id="v2-newsletter-message"
            ref={newsletterMessage}
          >
            {newsletterStatus}
          </output>
        </section>
      </main>

      <footer className="v2-footer v2-container">
        <a className="v2-logo" href="#v2-home" aria-label="KHUVÉ home">
          <span className="brand-wordmark">KHUVÉ</span>
        </a>
        <nav aria-label="Footer navigation">
          <a href="#v2-destinations">Destinations</a>
          <a href="#v2-offers">Tours</a>
          <a href="#v2-about">About</a>
          <a href="#v2-blog">Blog</a>
          <a href="#v2-contact">Contact</a>
        </nav>
        <div className="v2-social-links">
          <a
            href="https://www.facebook.com/"
            aria-label="Facebook"
            target="_blank"
            rel="noopener noreferrer"
            className="v2-social-facebook"
          >
            f
          </a>
          <a
            href="https://twitter.com/"
            aria-label="Twitter"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M21 6a8 8 0 0 1-2 1c1-1 1-1 2-3l-3 1c-3-3-7 0-6 3-4 0-7-2-9-4-1 2-1 4 1 6L2 9c0 3 2 4 4 5H4c1 2 2 3 4 3-2 2-4 2-6 2 11 6 19-3 18-12Z" />
            </svg>
          </a>
          <span className="v2-social-name" aria-label="KHUVÉ social profile">
            KHUVÉ
          </span>
        </div>
      </footer>

      <dialog
        id="v2-trip-dialog"
        className="v2-modal"
        ref={tripDialog}
        inert={activeDialog !== 'trip'}
        aria-labelledby="v2-trip-title"
        onCancel={(event) => {
          event.preventDefault();
          closeDialog();
        }}
      >
        <button
          className="v2-modal-close"
          onClick={closeDialog}
          aria-label="Close trip planner"
        >
          <Icon name="close" />
        </button>
        <p className="v2-eyebrow">Your next chapter</p>
        <h2 id="v2-trip-title">Plan your adventure</h2>
        <p className="v2-modal-intro">
          A great trip starts with a little inspiration.
        </p>
        <form id="v2-booking-form" onSubmit={saveTrip}>
          <label>
            Destination
            <input
              id="v2-booking-destination"
              ref={bookingDestination}
              name="destination"
              required
              value={tripDestination}
              onChange={(event) => {
                setTripDestination(event.target.value);
                setTripPackageId('');
              }}
            />
          </label>
          <div className="v2-form-row">
            <label>
              Departure date
              <input
                type="date"
                id="v2-booking-date"
                name="date"
                required
                min={minDate}
                value={tripDate}
                onChange={(event) => setTripDate(event.target.value)}
              />
            </label>
            <label>
              Travelers
              <input
                type="number"
                name="travelers"
                min="1"
                max="20"
                value={tripTravelers}
                onChange={(event) => setTripTravelers(event.target.value)}
                required
              />
            </label>
          </div>
          <label>
            Email address
            <input
              type="email"
              name="email"
              autoComplete="email"
              placeholder="you@example.com"
              required
              value={tripEmail}
              onChange={(event) => setTripEmail(event.target.value)}
            />
          </label>
          <button className="v2-button v2-primary" type="submit">
            Save my trip plan
          </button>
          <p className="v2-small-note">
            Save your plan on this device. No payment or booking is made.
          </p>
          <output id="v2-booking-message" ref={bookingMessage}>
            {tripMessage}
          </output>
        </form>
      </dialog>
      <dialog
        id="v2-gallery-dialog"
        className="v2-lightbox"
        ref={galleryDialog}
        inert={activeDialog !== 'gallery'}
        aria-label="Vietnam travel photo gallery"
        onCancel={(event) => {
          event.preventDefault();
          closeDialog();
        }}
      >
        <button
          className="v2-modal-close"
          onClick={closeDialog}
          aria-label="Close photo"
        >
          <Icon name="close" />
        </button>
        <button
          className="v2-lightbox-prev"
          onClick={() => moveGallery(-1)}
          aria-label="Previous photo"
        >
          <Icon name="chevron" />
        </button>
        <figure>
          <Image
            unoptimized
            id="v2-lightbox-image"
            ref={lightboxImage}
            src={`/v2-assets/${galleryPhoto.image}`}
            width={1260}
            height={840}
            alt={galleryPhoto.alt}
          />
          <figcaption id="v2-lightbox-caption">{galleryPhoto.alt}</figcaption>
        </figure>
        <button
          className="v2-lightbox-next"
          onClick={() => moveGallery(1)}
          aria-label="Next photo"
        >
          <Icon name="chevron" />
        </button>
      </dialog>
      <dialog
        id="v2-article-dialog"
        className="v2-modal v2-article-modal"
        ref={articleDialog}
        inert={activeDialog !== 'article'}
        aria-labelledby="v2-article-title"
        onCancel={(event) => {
          event.preventDefault();
          closeDialog();
        }}
      >
        <button
          className="v2-modal-close"
          onClick={closeDialog}
          aria-label="Close article"
        >
          <Icon name="close" />
        </button>
        <Image
          unoptimized
          id="v2-article-image"
          src={`/v2-assets/${article.image}`}
          width={1260}
          height={840}
          alt={article.alt}
        />
        <div id="v2-article-content">
          <p className="v2-eyebrow">KHUVÉ journal</p>
          <h2 id="v2-article-title">{article.title}</h2>
          <p>{article.copy}</p>
          {articleIndex === 0 && (
            <ol>
              {places.map((place) => (
                <li key={place}>{place}</li>
              ))}
            </ol>
          )}
          <h3>Plan with room to wander</h3>
          <p>
            Pick one or two highlights for the day, check local conditions, and
            leave time to enjoy the places between them.
          </p>
        </div>
      </dialog>
    </div>
  );
}
