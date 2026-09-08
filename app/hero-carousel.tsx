'use client';

import Image from 'next/image';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import slides from '@/data/hero-slides.json';

const HOLD_MS = 6000;
const count = slides.length;
// Duplicate the endpoints so the last-to-first roll follows the same path.
const frames = [slides[count - 1], ...slides, slides[0]];
const realPosition = (position: number) =>
  ((((position - 1) % count) + count) % count) + 1;

export function HeroCarousel({
  header,
  children,
}: {
  header: ReactNode;
  children: ReactNode;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const imageTrackRef = useRef<HTMLDivElement>(null);
  const positionRef = useRef(1);
  const queuedStep = useRef(0);
  const [position, setPosition] = useState(1);
  const [instant, setInstant] = useState(false);
  const [moving, setMoving] = useState(false);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [inView, setInView] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [loaded, setLoaded] = useState<string[]>([]);
  const activeIndex = realPosition(position) - 1;
  const nextIndex = (activeIndex + 1) % count;
  const playing = !paused && !reducedMotion;

  const moveTo = useCallback((target: number, skipMotion = false) => {
    if (skipMotion) target = realPosition(target);
    if (target === positionRef.current) return;
    positionRef.current = target;
    setInstant(skipMotion);
    setMoving(!skipMotion);
    setPosition(target);
  }, []);

  function step(direction: number, keyboard: boolean) {
    setPaused(true);
    // Keep repeated boundary clicks; finish the invisible loop reset first.
    if (
      !keyboard &&
      !reducedMotion &&
      (position === 0 || position === count + 1)
    ) {
      queuedStep.current += direction;
      return;
    }
    moveTo(positionRef.current + direction, keyboard || reducedMotion);
  }

  const finishRoll = useCallback(() => {
    setMoving(false);
    const current = positionRef.current;
    if (current === 0 || current === count + 1) {
      moveTo(realPosition(current), true);
    }
  }, [moveTo]);

  useEffect(() => {
    if (!moving) return;
    let current = true;
    // Keyboard mode can skip or cancel the CSS transition. Both still finish
    // the move; a newer position cancels this completion through cleanup.
    const animations = imageTrackRef.current?.getAnimations() ?? [];
    void Promise.allSettled(
      animations.map((animation) => animation.finished),
    ).then(() => {
      if (current && positionRef.current === position) finishRoll();
    });
    return () => {
      current = false;
    };
  }, [moving, position, finishRoll]);

  useEffect(() => {
    const ready = Array.from(
      sectionRef.current?.querySelectorAll<HTMLImageElement>('.hero-image') ??
        [],
    )
      .filter((image) => image.complete && image.naturalWidth > 0)
      .map((image) => image.dataset.slideId!);
    setLoaded((current) => [...new Set([...current, ...ready])]);
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => {
      setReducedMotion(preference.matches);
      if (preference.matches) {
        setPaused(true);
        setMoving(false);
        setInstant(true);
        const current = realPosition(positionRef.current);
        positionRef.current = current;
        setPosition(current);
      }
    };
    const updateVisibility = () => setPageVisible(!document.hidden);
    updatePreference();
    updateVisibility();
    preference.addEventListener('change', updatePreference);
    document.addEventListener('visibilitychange', updateVisibility);
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.2 },
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => {
      preference.removeEventListener('change', updatePreference);
      document.removeEventListener('visibilitychange', updateVisibility);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!instant) return;
    let secondFrame = 0;
    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => setInstant(false));
    });
    return () => {
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
    };
  }, [instant]);

  useEffect(() => {
    if (moving || instant || queuedStep.current === 0) return;
    const target = realPosition(positionRef.current + queuedStep.current);
    queuedStep.current = 0;
    moveTo(target, reducedMotion);
  }, [instant, moving, moveTo, reducedMotion]);

  useEffect(() => {
    if (!playing || !inView || !pageVisible || hovered || moving || instant)
      return;
    // A slow image must never leave the hero blank during autoplay.
    if (!loaded.includes(slides[nextIndex].id)) return;
    const timer = window.setTimeout(
      () => moveTo(positionRef.current + 1),
      HOLD_MS,
    );
    return () => window.clearTimeout(timer);
  }, [
    playing,
    inView,
    pageVisible,
    hovered,
    moving,
    instant,
    loaded,
    nextIndex,
    moveTo,
  ]);

  const trackStyle = { transform: `translateY(${-position * 100}%)` };
  const frameStyle = (index: number) => ({
    transform: `translateY(${index * 100}%)`,
  });

  return (
    <section
      className="hero hero-carousel"
      id="home"
      ref={sectionRef}
      aria-labelledby="hero-heading"
      aria-roledescription="carousel"
      data-instant={instant || reducedMotion}
      data-playing={playing}
      onFocusCapture={(event) => {
        if (
          !(event.target instanceof Element) ||
          !event.target.closest('.hero-playback')
        ) {
          setPaused(true);
        }
      }}
    >
      <div className="hero-image-window">
        <div
          className="hero-roll-track hero-image-track"
          ref={imageTrackRef}
          style={trackStyle}
        >
          {frames.map((slide, index) => (
            <div
              key={`${slide.id}-${index}`}
              className="hero-image-slide"
              style={frameStyle(index)}
              aria-hidden={index !== position}
            >
              <Image
                className="hero-image"
                src={slide.image}
                data-slide-id={slide.id}
                alt={slide.imageAlt}
                fill
                sizes="100vw"
                preload={index === 1}
                loading={index === 1 ? undefined : 'eager'}
                style={
                  {
                    '--hero-image-position': slide.objectPosition,
                    '--hero-image-mobile-position': slide.mobileObjectPosition,
                  } as CSSProperties
                }
                onLoad={() =>
                  setLoaded((ready) =>
                    ready.includes(slide.id) ? ready : [...ready, slide.id],
                  )
                }
              />
            </div>
          ))}
        </div>
      </div>
      <div className="hero-shade" />
      {header}
      <div className="hero-content wrap">
        <p className="hero-eyebrow">YOUR VIETNAM JOURNEY STARTS HERE</p>
        <h1 id="hero-heading" className="hero-title-window">
          <span className="hero-roll-track hero-copy-track" style={trackStyle}>
            {frames.map((slide, index) => (
              <span
                key={`${slide.id}-${index}`}
                className="hero-title-slide"
                style={frameStyle(index)}
                aria-hidden={index !== position}
              >
                {slide.title}
              </span>
            ))}
          </span>
        </h1>
        <p className="hero-description hero-description-window" hidden>
          <span className="hero-roll-track hero-copy-track" style={trackStyle}>
            {frames.map((slide, index) => (
              <span
                key={`${slide.id}-${index}`}
                className="hero-description-slide"
                style={frameStyle(index)}
                aria-hidden={index !== position}
              >
                <span>
                  {slide.description}
                  <br className="desktop-break" /> {slide.tagline}
                </span>
              </span>
            ))}
          </span>
        </p>
        {children}
        <div
          className="hero-carousel-controls"
          onPointerEnter={(event) => {
            if (event.pointerType === 'mouse') setHovered(true);
          }}
          onPointerLeave={() => setHovered(false)}
        >
          <button
            type="button"
            aria-label="Previous destination"
            disabled={
              !loaded.includes(slides[(activeIndex - 1 + count) % count].id)
            }
            onClick={(event) => step(-1, event.detail === 0)}
          >
            <ChevronLeft aria-hidden="true" />
          </button>
          <div className="hero-slide-picker">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                aria-label={`Show ${slide.name}`}
                aria-current={index === activeIndex ? 'true' : undefined}
                disabled={!loaded.includes(slide.id)}
                onClick={(event) => {
                  setPaused(true);
                  queuedStep.current = 0;
                  moveTo(index + 1, event.detail === 0 || reducedMotion);
                }}
              >
                <span />
              </button>
            ))}
          </div>
          <button
            type="button"
            aria-label="Next destination"
            disabled={!loaded.includes(slides[nextIndex].id)}
            onClick={(event) => step(1, event.detail === 0)}
          >
            <ChevronRight aria-hidden="true" />
          </button>
          {!reducedMotion && (
            <button
              className="hero-playback"
              type="button"
              aria-label={playing ? 'Pause slideshow' : 'Play slideshow'}
              onClick={() => setPaused((current) => !current)}
            >
              {playing ? (
                <Pause aria-hidden="true" />
              ) : (
                <Play aria-hidden="true" />
              )}
            </button>
          )}
          <output className="sr-only" aria-live={playing ? 'off' : 'polite'}>
            {slides[activeIndex].name}, {activeIndex + 1} of {count}
          </output>
        </div>
      </div>
    </section>
  );
}
