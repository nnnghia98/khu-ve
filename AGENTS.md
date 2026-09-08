# Project notes

- Use short, plain English below B2 level and bullet points. Explain technical terms in parentheses when first used. Use a lower-tier model for subagents.
- This is the local Next.js App Router project for the KHUVÉ Vietnam page.
- Use Yarn for all package installs and scripts. Do not use npm. Keep `yarn.lock` as the only package lockfile.
- With every change, review and update all affected files in the same task, including `AGENTS.md`, other agent instruction files, `README.md`, config, and related code. Keep instructions and documentation in sync with the actual project.
- Before creating a component, check `components/ui/` and other existing components for one you can reuse. Reuse or extend a suitable component first. Create a new component only when the existing ones do not fit; avoid duplicate components.
- When the user asks to "commit code", review the changes and group them by logical flow, then by scope. Keep each commit focused on one clear purpose, with any required supporting changes. Multiple commits are allowed; commit prerequisite changes before changes that depend on them. Use clear commit messages.
- A request to "commit code" authorizes local commits only. Never push to `main` without the user's explicit permission to push to `main`.
- Keep the Da Nang hero, Vietnam content, local assets, and existing animations.
- No sign-in, Sites dependency, or deployment setup is required.
- `app/layout.tsx` owns metadata, local fonts, and global CSS imports.
- `app/page.tsx` is a client component with the landing page interactions.
- `app/content.ts` owns the homepage travel data and gallery photos.
- Respect user-managed servers. Do not start or stop them unless asked.
- Run `yarn build`, `yarn lint`, and `yarn format:check` after changes.
- The build checks all TypeScript. Lint covers application code, shared hooks, and config. Formatting covers project code and data; the copied UI kit and local assets are outside its scope.
