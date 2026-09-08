# Project notes

- Use short, plain English. Use a lower-tier model for subagents.
- This is the local Next.js App Router project for the Vacasky Vietnam page.
- Keep the Da Nang hero, Vietnam content, local assets, and existing animations.
- No sign-in, Sites dependency, or deployment setup is required.
- `app/layout.tsx` owns metadata, local fonts, and global CSS imports.
- `app/page.tsx` is a client component with the landing page interactions.
- `app/content.ts` owns the homepage travel data and gallery photos.
- Respect user-managed servers. Do not start or stop them unless asked.
- Run `yarn build`, `yarn lint`, and `yarn format:check` after changes.
- The build checks all TypeScript. Lint covers application code, shared hooks, and config. Formatting covers project code and data; the copied UI kit and local assets are outside its scope.
