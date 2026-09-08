# Motion notes

Motion follows [Emil Kowalski's skills](https://github.com/emilkowalski/skills), including `emil-design-eng`, `animate`, and `apple-design`.

| Interaction | Purpose and frequency | Implementation |
| --- | --- | --- |
| Hero copy | First-visit entrance; establish the page hierarchy | Web Animations API; opacity and translate, 600–760 ms, 70 ms stagger |
| Sections and cards | One-time scroll reveal; guide attention through the landing page | IntersectionObserver and CSS; opacity and translate, 600 ms, 45 ms stagger |
| Press and hover | Frequent input feedback | CSS; 120 ms press scale, 160 ms hover, fine-pointer hover only |
| Destination filter | Connect selection changes while preserving rapid input | One spring-driven highlight; stiffness 650, damping 50, mass 1; position and velocity carried across changes |
| Destination results | Soften layout changes without delaying filtering | FLIP translation and opacity with WAAPI, 240 ms |
| Dialogs | Show and dismiss a temporary layer | Native dialog; opacity, translate, scale, 240 ms in and 160 ms out |
| Mobile navigation | Open from the menu button | CSS origin at top right; 240 ms in, 160 ms out; closed links are inert |
| FAQ | Expand to the actual answer height | Native details; 220 ms in and 160 ms out when auto-size interpolation is supported |
| Gallery and form feedback | Show a changed photo or confirmed local action | WAAPI, 200 ms gallery and 180 ms feedback |

The main easing is `cubic-bezier(0.23, 1, 0.32, 1)`. The filter uses a small spring controller that stops requesting frames when settled. The browser handles normal scrolling; no scroll hijacking, parallax, or looping motion is used.

Keyboard actions and reduced-motion settings skip positional motion. A preference change during an animation reveals all content and cancels active motion. Content remains visible without JavaScript. Dialogs keep native focus, Escape, and modal behavior; closed surfaces are inert while their visual exit finishes. Unsupported auto-size or discrete transitions fall back to the native state change.

Checks: normal and reduced-motion paths; rapid filter changes; dialog close/reopen and focus restoration; mobile navigation; FAQ; gallery; all existing forms; no-JS content; 320, 390, 768, and 1440 px layouts.
