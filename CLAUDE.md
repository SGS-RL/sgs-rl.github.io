# SGS project site

Next.js app exported as a static site to GitHub Pages. `main` deploys on
push (`.github/workflows/deploy.yml`); nothing else deploys.

A redesign is in progress. Read `docs/REDESIGN.md` before changing anything
under `app/lab/`: it has the design direction, decisions, open questions
and the review workflow.

Working rules for the redesign:

- Design studies live under `app/lab/` and are served at `/lab/...`,
  unlisted and `noindex`. Do not link them from the homepage.
- The owner reviews from a phone. End each design round with phone and
  desktop screenshots (`scripts/lab/shoot.mjs`), and look at them yourself
  before sending.
- Copy stays plain and factual: no slogans, no big bold stat numbers.
- Website structure and typography come before video effects.

Checks: `npm run lint`, `npx tsc --noEmit`,
`npx prettier --check app/lab scripts/lab`, `npm run build`.
