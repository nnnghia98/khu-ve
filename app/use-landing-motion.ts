'use client';

import { useEffect, useState } from 'react';

/** Animate marketing content once; the server-rendered page always starts visible. */
export function useLandingMotion() {
  const [compact, setCompact] = useState(false);
  const [navScrolled, setNavScrolled] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const compactQuery = window.matchMedia('(max-width: 640px)');
    const reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateCompact = () => setCompact(compactQuery.matches);
    const pointerInput = () => {
      root.dataset.input = 'pointer';
    };
    const keyboardInput = (event: KeyboardEvent) => {
      if (
        [
          'Tab',
          'Enter',
          ' ',
          'Escape',
          'ArrowLeft',
          'ArrowRight',
          'ArrowUp',
          'ArrowDown',
        ].includes(event.key)
      ) {
        root.dataset.input = 'keyboard';
      }
    };
    updateCompact();
    compactQuery.addEventListener('change', updateCompact);
    document.addEventListener('pointerdown', pointerInput, {
      passive: true,
      capture: true,
    });
    document.addEventListener('keydown', keyboardInput, true);

    const targets = Array.from(
      document.querySelectorAll<HTMLElement>(
        '.section-heading, .destination-card, .benefit, .package-layout, .quality, .review-card, .award-carousel, .faq-list, .blog-card, .newsletter-content',
      ),
    );
    let revealObserver: IntersectionObserver | undefined;
    let navObserver: IntersectionObserver | undefined;
    const revealAll = () => {
      if (!reduceQuery.matches) return;
      targets.forEach((target) => {
        target.dataset.reveal = 'visible';
      });
      revealObserver?.disconnect();
    };
    const revealFocused = (event: FocusEvent) => {
      if (!(event.target instanceof Element)) return;
      const target = event.target.closest<HTMLElement>('[data-reveal]');
      if (target) {
        target.dataset.reveal = 'visible';
        revealObserver?.unobserve(target);
      }
    };

    if ('IntersectionObserver' in window) {
      revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            (entry.target as HTMLElement).dataset.reveal = 'visible';
            revealObserver?.unobserve(entry.target);
          });
        },
        { threshold: 0.06, rootMargin: '0px 0px -30px 0px' },
      );
      // Read the initial geometry together, before adding pending styles.
      const positions = targets.map(
        (target) => target.getBoundingClientRect().top,
      );
      targets.forEach((target, index) => {
        const belowFold = positions[index] > window.innerHeight;
        target.dataset.reveal =
          !reduceQuery.matches && belowFold ? 'pending' : 'visible';
        revealObserver?.observe(target);
      });
      const sentinel = document.querySelector('.nav-scroll-sentinel');
      if (sentinel) {
        navObserver = new IntersectionObserver(([entry]) =>
          setNavScrolled(!entry.isIntersecting),
        );
        navObserver.observe(sentinel);
      }
    }
    reduceQuery.addEventListener('change', revealAll);
    document.addEventListener('focusin', revealFocused);
    return () => {
      compactQuery.removeEventListener('change', updateCompact);
      reduceQuery.removeEventListener('change', revealAll);
      document.removeEventListener('pointerdown', pointerInput, true);
      document.removeEventListener('keydown', keyboardInput, true);
      document.removeEventListener('focusin', revealFocused);
      revealObserver?.disconnect();
      navObserver?.disconnect();
      targets.forEach((target) => {
        delete target.dataset.reveal;
      });
      delete root.dataset.input;
    };
  }, []);

  return { compact, navScrolled };
}

export function scrollToSection(id: string) {
  const instant =
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    document.documentElement.dataset.input === 'keyboard';
  document
    .getElementById(id)
    ?.scrollIntoView({ behavior: instant ? 'instant' : 'smooth' });
}
