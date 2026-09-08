# KHUVÉ — Vietnam travel

The full local landing page, migrated to Next.js App Router, React, TypeScript, and Tailwind CSS. The Da Nang hero, Vietnam content, local photos and fonts, UI components, and animations are preserved. No Sites account, API key, or sign-in is needed.

Both page versions use KHUVÉ branding. Testimonials and FAQ are hidden while their content remains in the source.

## Page versions

- `/`: the existing Next.js landing page.
- `/v2`: the landing page from this chat, with the original section layout, Da Nang hero, Vietnam photos, and motion. Open [version 2](http://127.0.0.1:8888/v2) while the local server is running.

Version 2 is a native React page. Its styles and motion stay inside `.v2-page`, and its assets live in `public/v2-assets/`. Both pages share the local fonts from `app/layout.tsx`. No extra package or server is needed.

## Run locally

Use Node.js 22.13 or newer and Yarn 1.22.21. With nvm, run `nvm install` and `nvm use` first.

```sh
yarn install --frozen-lockfile
yarn dev
```

Open [http://127.0.0.1:8888](http://127.0.0.1:8888). Changes update as you save. Dependencies are already installed in this prepared folder; use `yarn install --frozen-lockfile` for a fresh checkout.

The server listens on all network interfaces. After `yarn dev`, use the `Network` URL printed in the terminal (for example, `http://192.168.1.10:8888`) to open the page from another device on the same Wi-Fi. This is a local network address, not a public internet URL.

Run these commands from `khu-ve`. Stop a server with Ctrl+C in its terminal.

## Build and check

```sh
yarn build
yarn lint
yarn typecheck
```

The build checks TypeScript and writes the production app to `.next/`. To run it locally after building:

```sh
yarn start
```

This uses port 8888. Stop the development server before using `yarn start` on the same port. Use `yarn dev --port 8889` if you choose another port. No script publishes the site.

Lint checks the page, motion hook, shared utilities, and Next.js/PostCSS config. The full UI kit is preserved and checked by TypeScript during build.

## Where to edit

- `app/page.tsx`: page sections, copy, trip data, and interactions.
- `.brand-wordmark` in `app/globals.css`: live KHUVÉ text in the header and footer, with responsive sizes and colors.
- `public/fonts/fjord-bc.woff`: Fjord BC, loaded locally by `app/layout.tsx` for the wordmark. Source: `https://bcassetcdn.com/fonts/fjord-bc-vtwo.woff`, as used by the Design.com editor.
- `public/favicon.svg`: matching K site icon.
- `app/hero-carousel.tsx`: synchronized hero slideshow and playback controls.
- `app/travel-search.css`: compact hero search bar, field states, and mobile layout.
- `data/hero-slides.json`: six hero destinations, local image paths, descriptions, crop positions, and image sources. Array order controls the slideshow; Da Nang starts first.
- `data/travel-partners.json`: homepage partner names, logo paths, image sizes, and source URLs. Array order controls the logo order.
- `public/partners/`: local partner logos, shown in white over the hero.
- `app/v2/page.tsx`: version 2 sections, search, dialogs, gallery, and forms.
- `app/v2/content.ts`: version 2 destinations, gallery photos, and articles.
- `app/v2/v2.css`: scoped version 2 layout, responsive styles, and transitions.
- `app/v2/create-motion.ts`: version 2 reveals, spring filter indicator, card movement, and motion cleanup.
- `public/v2-assets/`: version 2 local images and source manifest.
- `app/layout.tsx`: document layout, title, description, and local font setup.
- `app/globals.css`: layout, colors, and responsive styles.
- `app/motion.css`: animation, card hover zoom, and glass surfaces.
- `app/use-landing-motion.ts`: scroll reveals and motion preferences.
- `public/images/` and `public/fonts/`: all original local assets.
- `components/ui/`: reusable Base UI and shadcn components.
- `next.config.ts` and `postcss.config.mjs`: framework and CSS configuration.

Images use `next/image`; fonts use `next/font/local`. All source files are inside this project, with no links to the previous folder.

## Included

- Da Nang coast hero, Vietnam trip search, destination cards, service benefits, and special packages.
- Quality banner, testimonial controls, travel highlights, awards, FAQ, and travel articles.
- Newsletter layout, footer, mobile menu, keyboard focus states, and reduced-motion support.
- Local fonts and optimized local images.
- Downloadable suggested trip plans.

## Preview scope

This is a frontend implementation with no sign-in requirement. Real bookings, payments, newsletter subscriptions, and social accounts are not connected. The relevant controls explain this without claiming a successful booking or signup. The video control opens a photo highlights viewer because no video file was supplied.

Dates and budgets in search are trip preferences; only destination selection filters the sample catalog. Awards, counts, and testimonials are sample content for this design and are not verified business claims.

On `/v2`, search filters by destination and price, and category buttons filter the same results. “Load More Destinations” adds four sample packages. Trip plans and newsletter emails save only in this browser, using separate `vacasky-v2-*` storage keys. The photo gallery, article dialogs, and FAQ work locally. Reduced motion and keyboard use skip decorative movement.

## Image sources

The `/` page photos are stored locally in `public/images/`. They are free photos under the [Unsplash License](https://unsplash.com/license). Filenames, photographers, and original pages:

- `da-nang.jpg` — Thach Tran: [Da Nang coastline](https://unsplash.com/photos/an-aerial-view-of-a-beach-and-a-city-w_0Dk0_JN3A).
- `hoi-an.jpg` — Juup Schram: [Hoi An riverside](https://unsplash.com/photos/boats-on-a-canal-in-front-of-old-buildings-1_nEuW-prkA).
- `ha-long.jpg` — Marina Lobato: [Ha Long Bay](https://unsplash.com/photos/boats-on-turquoise-ha-long-bay-kG7pOXbBfNs).
- `phu-quoc.jpg` — Vivu Vietnam: [Sao Beach, Phu Quoc](https://unsplash.com/photos/a-beach-with-palm-trees-and-a-boat-in-the-water-IVJVh1v1PVs).
- `sa-pa.jpg` — Vivu Vietnam: [Sa Pa rice terraces](https://unsplash.com/photos/a-lush-green-hillside-covered-in-lots-of-green-grass-98g7OAwlWy0).
- `hanoi.jpg` — Harrisun S: [Turtle Tower, Hanoi](https://unsplash.com/photos/turtle-tower-on-an-island-in-hoan-kiem-lake-hanoi-EGXezZS3aGQ).

Avatar crops remain from the user-provided reference. Earlier unused scenery assets remain available in the folder, but are not displayed.

The `/v2` photos are copied from the earlier page and stored in `public/v2-assets/`. Their original Vietnam Tourism image and page URLs are recorded in `public/v2-assets/assets-manifest.json`.

Typography: Oswald and Poppins, from Google Fonts.

Destination copy is based on the official Vietnam Tourism guides for [Da Nang](https://vietnam.travel/node/31), [Hoi An](https://vietnam.travel/node/99), [Ha Long](https://vietnam.travel/node/57), and [Hue](https://vietnam.travel/places-to-go/central-vietnam/hue).

## Motion and Apple-style details

The homepage hero rolls its photo, title, and description together over 850 ms using Emil's `--ease-in-out` curve. Each slide stays for 6 seconds. Controls can pause, resume, or choose a destination. Focus and manual navigation pause autoplay; hidden tabs and an offscreen hero suspend it. Reduced motion keeps the hero still and makes manual changes instant. The search form and partner logos remain in place.

The second pass applies [Emil Kowalski's animation guidance](https://github.com/emilkowalski/skills/tree/main/skills/animate) and [Apple design principles](https://github.com/emilkowalski/skills/tree/main/skills/apple-design).

- Floating glass navigation with a solid fallback, mobile disclosure, Escape dismissal, and hidden-menu focus protection.
- A one-time hero entrance and below-fold reveals. Reduced motion keeps content visible and removes movement.
- 120 ms press feedback, 180 ms review/highlight crossfades, 220 ms measured FAQ disclosure, and 240 ms modal transitions.
- Modal content remains mounted through exit; frequent keyboard actions update immediately.
- Destination cards expand in 280 ms with a gentle image zoom on mouse hover; keyboard focus changes the featured card immediately. Mobile keeps a fixed layout. Reduced motion/transparency/contrast alternatives are included.
- CSS and IntersectionObserver only; no new motion dependency, scroll loop, parallax, or autoplay.

Motion styles are in `app/motion.css`; preference and reveal lifecycle handling is in `app/use-landing-motion.ts`.
