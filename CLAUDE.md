# SGS project site

Next.js app exported as a static site to GitHub Pages. `main` deploys on
push (`.github/workflows/deploy.yml`); nothing else deploys. The homepage
is the redesigned page (`app/page.tsx` renders `app/lab/_combined/`). Its
videos are not in git: the workflow unpacks them from the `media-v1`
GitHub release into `public/media/library/`, and the Download buttons link
to that release (`scripts/lab/release_media.sh` uploads them). The live
site is the homepage and `/terms/`: the workflow leaves out `/lab/` (the
design studies), which stay on the Cloudflare preview and local builds.

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
`npx prettier --check app/lab scripts/lab docs`, `npm run build`.

Setup for macOS and Ubuntu, and how to run the site locally and on a
phone: `docs/REDESIGN.md`, "Set up a development environment".
