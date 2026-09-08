type V2MotionController = {
  instant: () => boolean;
  captureCards: () => Map<HTMLElement, DOMRect>;
  updateCards: (previous?: Map<HTMLElement, DOMRect>) => void;
  galleryChange: (image: HTMLImageElement, direction?: number) => void;
  feedback: (element: HTMLElement | null) => void;
  destroy: () => void;
};

const EASE_OUT = 'cubic-bezier(0.23, 1, 0.32, 1)';

export function createV2Motion(scope: HTMLElement): V2MotionController {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const animations = new Map<HTMLElement, Animation>();
  const revealElements = new Set<HTMLElement>();
  const galleryVersions = new WeakMap<HTMLImageElement, number>();
  const originalInput = scope.getAttribute('data-input');
  let destroyed = false;
  let revealObserver: IntersectionObserver | null = null;
  let resizeObserver: ResizeObserver | null = null;
  let indicatorFrame = 0;
  let galleryVersion = 0;
  let indicator: HTMLSpanElement | null = null;

  const instant = () =>
    destroyed || reduced.matches || scope.dataset.input === 'keyboard';

  const stopAnimations = () => {
    animations.forEach((animation) => animation.cancel());
    animations.clear();
  };

  const play = (
    element: HTMLElement,
    frames: Keyframe[],
    options: KeyframeAnimationOptions = {},
  ) => {
    animations.get(element)?.cancel();
    animations.delete(element);
    if (instant() || typeof element.animate !== 'function') return;

    const animation = element.animate(frames, {
      duration: 240,
      easing: EASE_OUT,
      ...options,
    });
    animations.set(element, animation);
    const release = () => {
      if (animations.get(element) === animation) animations.delete(element);
    };
    void animation.finished.then(release, release);
  };

  const reveal = (element: HTMLElement | null, immediately = false) => {
    if (!element) return;
    if (immediately || instant()) {
      element.classList.remove('v2-reveal-pending', 'v2-reveal-in');
      element.style.removeProperty('--reveal-delay');
    } else {
      element.classList.add('v2-reveal-in');
    }
    revealObserver?.unobserve(element);
  };

  const filters = scope.querySelector<HTMLElement>('.v2-destination-filters');
  const position = { x: 0, y: 0, width: 0, height: 0 };
  const velocity = { x: 0, y: 0, width: 0, height: 0 };
  let target = { ...position };
  let lastTime = 0;

  const renderIndicator = () => {
    if (!indicator) return;
    indicator.style.transform =
      `translate3d(${position.x}px,${position.y}px,0) ` +
      `scale(${position.width / 100},${position.height / 100})`;
  };

  const tickIndicator = (now: number) => {
    if (destroyed) return;
    let time = Math.min((now - lastTime) / 1000, 0.032);
    lastTime = now;
    while (time > 0) {
      const dt = Math.min(time, 1 / 120);
      (Object.keys(position) as Array<keyof typeof position>).forEach((key) => {
        velocity[key] +=
          (650 * (target[key] - position[key]) - 50 * velocity[key]) * dt;
        position[key] += velocity[key] * dt;
      });
      time -= dt;
    }

    const settled = (
      Object.keys(position) as Array<keyof typeof position>
    ).every(
      (key) =>
        Math.abs(target[key] - position[key]) < 0.1 &&
        Math.abs(velocity[key]) < 1,
    );
    if (settled) {
      Object.assign(position, target);
      (Object.keys(velocity) as Array<keyof typeof velocity>).forEach((key) => {
        velocity[key] = 0;
      });
    }
    renderIndicator();
    indicatorFrame = settled ? 0 : requestAnimationFrame(tickIndicator);
  };

  const settleIndicator = (immediately = false) => {
    if (!filters || !indicator || destroyed) return;
    const selected =
      filters.querySelector<HTMLButtonElement>('button.v2-active');
    if (!selected) return;
    target = {
      x: selected.offsetLeft,
      y: selected.offsetTop,
      width: selected.offsetWidth,
      height: selected.offsetHeight,
    };
    if (immediately || instant() || !position.width) {
      cancelAnimationFrame(indicatorFrame);
      indicatorFrame = 0;
      Object.assign(position, target);
      (Object.keys(velocity) as Array<keyof typeof velocity>).forEach((key) => {
        velocity[key] = 0;
      });
      renderIndicator();
    } else if (!indicatorFrame) {
      lastTime = performance.now();
      indicatorFrame = requestAnimationFrame(tickIndicator);
    }
  };

  const showAll = () => {
    scope
      .querySelectorAll<HTMLElement>('.v2-reveal-pending')
      .forEach((element) => reveal(element, true));
    stopAnimations();
    settleIndicator(true);
  };

  const eventIsInScope = (event: Event) => event.composedPath().includes(scope);

  const onPointerDown = (event: PointerEvent) => {
    if (eventIsInScope(event)) scope.dataset.input = 'pointer';
  };
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    if (!eventIsInScope(event) && !scope.contains(document.activeElement))
      return;
    scope.dataset.input = 'keyboard';
    showAll();
  };
  const onTransitionEnd = (event: TransitionEvent) => {
    const element = event.target;
    if (
      event.propertyName === 'opacity' &&
      element instanceof HTMLElement &&
      scope.contains(element) &&
      element.classList.contains('v2-reveal-in')
    ) {
      reveal(element, true);
    }
  };
  const onReducedChange = () => {
    if (reduced.matches) showAll();
  };
  const onVisibilityChange = () => {
    if (document.hidden) showAll();
  };
  const onFocusIn = (event: FocusEvent) => {
    if (!eventIsInScope(event)) return;
    const targetElement = event.target;
    if (!(targetElement instanceof Element)) return;
    reveal(targetElement.closest<HTMLElement>('.v2-reveal-pending'), true);
  };

  document.addEventListener('pointerdown', onPointerDown, {
    capture: true,
    passive: true,
  });
  document.addEventListener('keydown', onKeyDown, true);
  scope.addEventListener('transitionend', onTransitionEnd);
  reduced.addEventListener('change', onReducedChange);
  document.addEventListener('visibilitychange', onVisibilityChange);
  scope.addEventListener('focusin', onFocusIn);

  if ('IntersectionObserver' in window && !reduced.matches) {
    revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.target instanceof HTMLElement) {
            reveal(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -24px 0px' },
    );
    const groups = [
      '.v2-benefits article',
      '.v2-section-title',
      '.v2-destination-card',
      '.v2-offers .v2-offer',
      '.v2-process-steps .v2-step',
      '.v2-about-copy',
      '.v2-about-photo',
      '.v2-statistics div',
      '.v2-testimonial',
      '.v2-gallery-tile',
      '.v2-vacation-banner',
      '.v2-blog-card',
      '.v2-faq-copy',
      '.v2-newsletter > p',
      '.v2-newsletter form',
    ];
    groups.forEach((selector) => {
      scope
        .querySelectorAll<HTMLElement>(selector)
        .forEach((element, index) => {
          if (element.getBoundingClientRect().top < innerHeight && scrollY > 0)
            return;
          element.style.setProperty('--reveal-delay', `${(index % 4) * 45}ms`);
          element.classList.add('v2-reveal-pending');
          revealElements.add(element);
          revealObserver?.observe(element);
        });
    });
    scope.classList.add('v2-motion-ready');
  }

  if (!location.hash && scrollY < 30 && !reduced.matches) {
    scope
      .querySelectorAll<HTMLElement>('.v2-hero-copy > *')
      .forEach((element, index) => {
        play(
          element,
          [
            { opacity: 0, translate: `0 ${index === 1 ? 28 : 14}px` },
            { opacity: 1, translate: '0 0' },
          ],
          {
            duration: index === 1 ? 760 : 600,
            delay: index * 70,
            fill: 'backwards',
          },
        );
      });
  }

  if (filters) {
    indicator = document.createElement('span');
    indicator.className = 'v2-filter-indicator';
    indicator.setAttribute('aria-hidden', 'true');
    filters.prepend(indicator);
    filters.classList.add('v2-has-indicator');
    settleIndicator(true);

    if ('ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(() => settleIndicator(true));
      resizeObserver.observe(filters);
    }
    void document.fonts?.ready.then(() => {
      if (!destroyed) settleIndicator(true);
    });
  }

  const captureCards = () => {
    const result = new Map<HTMLElement, DOMRect>();
    scope
      .querySelectorAll<HTMLElement>('.v2-destination-card:not([hidden])')
      .forEach((card) => result.set(card, card.getBoundingClientRect()));
    return result;
  };

  const updateCards = (previous = new Map<HTMLElement, DOMRect>()) => {
    if (destroyed) return;
    const cards = Array.from(
      scope.querySelectorAll<HTMLElement>('.v2-destination-card:not([hidden])'),
    );
    cards.forEach((card) => {
      animations.get(card)?.cancel();
      animations.delete(card);
      reveal(card, true);
    });
    cards.forEach((card) => {
      const bounds = card.getBoundingClientRect();
      const old = previous.get(card);
      if (old) {
        const x = old.left - bounds.left;
        const y = old.top - bounds.top;
        if (Math.abs(x) + Math.abs(y) > 1) {
          play(card, [{ translate: `${x}px ${y}px` }, { translate: '0 0' }]);
        }
      } else {
        play(card, [
          { opacity: 0, translate: '0 10px' },
          { opacity: 1, translate: '0 0' },
        ]);
      }
    });
    settleIndicator();
  };

  const galleryChange = (image: HTMLImageElement, direction = 1) => {
    if (destroyed || !scope.contains(image)) return;
    const source = image.src;
    const version = ++galleryVersion;
    galleryVersions.set(image, version);
    void image
      .decode()
      .catch(() => undefined)
      .then(() => {
        if (
          destroyed ||
          galleryVersions.get(image) !== version ||
          image.src !== source ||
          !scope.contains(image) ||
          !image.closest('dialog')?.open
        )
          return;
        play(
          image,
          [
            { opacity: 0.45, translate: `${direction * 12}px 0`, scale: 0.985 },
            { opacity: 1, translate: '0 0', scale: 1 },
          ],
          { duration: 200 },
        );
      });
  };

  const feedback = (element: HTMLElement | null) => {
    if (destroyed || !element?.textContent || !scope.contains(element)) return;
    play(
      element,
      [
        { opacity: 0, translate: '0 5px' },
        { opacity: 1, translate: '0 0' },
      ],
      { duration: 180 },
    );
  };

  const destroy = () => {
    if (destroyed) return;
    destroyed = true;
    document.removeEventListener('pointerdown', onPointerDown, true);
    document.removeEventListener('keydown', onKeyDown, true);
    scope.removeEventListener('transitionend', onTransitionEnd);
    reduced.removeEventListener('change', onReducedChange);
    document.removeEventListener('visibilitychange', onVisibilityChange);
    scope.removeEventListener('focusin', onFocusIn);
    revealObserver?.disconnect();
    resizeObserver?.disconnect();
    cancelAnimationFrame(indicatorFrame);
    indicatorFrame = 0;
    stopAnimations();
    revealElements.forEach((element) => {
      element.classList.remove('v2-reveal-pending', 'v2-reveal-in');
      element.style.removeProperty('--reveal-delay');
    });
    revealElements.clear();
    scope.classList.remove('v2-motion-ready');
    filters?.classList.remove('v2-has-indicator');
    indicator?.remove();
    indicator = null;
    if (originalInput === null) delete scope.dataset.input;
    else scope.setAttribute('data-input', originalInput);
  };

  return {
    instant,
    captureCards,
    updateCards,
    galleryChange,
    feedback,
    destroy,
  };
}
