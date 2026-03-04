# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

E-commerce platform for the "Orchid & Plum" brand (production domain: `opatelier.com`), built on two independent applications:

- **`orchid-plum/`** — Medusa v2 backend (v2.13.1) + embedded Admin dashboard
- **`orchid-plum-storefront/`** — Next.js 15 storefront (App Router, React 19, Turbopack)

## Commands

### Both (from project root)

```bash
./dev.sh                 # Start backend + storefront together (auto-finds free ports)
```

### Backend (`orchid-plum/`)

```bash
npm run dev              # Start dev server (port 9000, admin at /app)
npm run build            # Production build
npm start                # Production server (after build)
npm run seed             # Seed database with demo data
npm run test:unit        # Unit tests (src/**/__tests__/**/*.unit.spec.ts)
npm run test:integration:http     # HTTP integration tests (integration-tests/http/*.spec.ts)
npm run test:integration:modules  # Module integration tests (src/modules/*/__tests__/)
```

Run a single test file:

```bash
cd orchid-plum
npx jest --runInBand --forceExit path/to/test.spec.ts
```

Note: `patch-package` runs on `postinstall` — applies a patch increasing admin file upload limit from 1MB to 10MB (`patches/@medusajs+dashboard+2.13.1.patch`).

### Storefront (`orchid-plum-storefront/`)

```bash
npm run dev              # Start dev server (port 8000, Turbopack)
npm run build            # Production build (TS/ESLint errors do NOT block builds)
npm start                # Production server (port 8000)
npm run lint             # ESLint (next lint)
npm run analyze          # Bundle analysis (ANALYZE=true)
```

## Architecture

### Backend

**Medusa v2 modular architecture** — all customizations live in `orchid-plum/src/`:

- **`api/`** — File-based API routing. Routes at `api/{admin|store}/[path]/route.ts` export HTTP method handlers. Access Medusa container via `req.scope`.
- **`modules/cloudinary-file/`** — Custom file provider implementing `AbstractFileProviderService` for Cloudinary uploads/downloads/streaming. Registered as provider ID `"cloudinary"` for `Modules.FILE`.
- **`subscribers/revalidate-storefront.ts`** — Listens to product/category CRUD events (6 events), debounces by 2s, POSTs to storefront `/api/revalidate` to purge all cached pages. Requires `STOREFRONT_URL` and `REVALIDATE_SECRET` env vars.
- **`admin/`** — Admin dashboard widgets (Vite-based, separate tsconfig targeting ES2020):
  - `hero-image-picker.tsx` — Pick hero images from product gallery, stores `hero_left_index`/`hero_right_index` in product metadata
  - `focus-area-editor.tsx` — Draw-to-select focus areas per image, stores percentage-based coordinates in `metadata.image_focus_areas`
  - `login-branding.tsx` — Custom login page branding
  - `i18n/json/en.json` — Custom brand text overrides for admin UI
- **`scripts/seed.ts`** — Database seeding (store config, regions, products, shipping, inventory).
- **`workflows/`**, **`links/`**, **`jobs/`** — Available extension points, currently empty.

**Config:** `medusa-config.ts` defines database, CORS, auth secrets, module registration. Admin dashboard can be disabled via `DISABLE_ADMIN=true`.

**Database:** PostgreSQL 17, db name `orchid-plum`, user `wzx`, localhost:5432.

**Testing:** Jest + SWC. Tests run in-band with forceExit. Test type selected via `TEST_TYPE` env var. Ignores `.medusa/` build output.

### Storefront

**Next.js App Router** with all routes scoped under `[countryCode]/` for multi-region support.

- **`src/app/[countryCode]/`** — Route groups: `(main)/` for store pages, `(checkout)/` for checkout flow. Account uses parallel routes (`@dashboard/`, `@login/`).
- **`src/app/api/revalidate/route.ts`** — Webhook endpoint that validates `x-revalidate-secret` header and calls `revalidatePath("/", "layout")` to purge all cached pages (triggered by backend subscriber).
- **`src/lib/data/`** — Server Actions (`"use server"`) for all Medusa API calls. Uses `sdk.client.fetch()` with `cache: "no-store"` injected at the SDK level — caching is opt-in via `next: { tags: [...] }` per call. Mutations call `revalidateTag()`.
- **`src/lib/config.ts`** — Medusa SDK client initialization. Intercepts every fetch to inject `x-medusa-locale` header from the `_medusa_locale` cookie.
- **`src/lib/constants.tsx`** — Global constants including `SITE_NAME`, payment provider mappings, and currency helpers.
- **`src/modules/`** — Feature-based UI components (account, cart, checkout, products, layout, etc.).
- **`src/middleware.ts`** — Detects country from URL or Vercel header, redirects to `/{countryCode}/` routes, caches region map hourly.
- **`src/lib/util/cloudinary-loader.ts`** — Custom Next.js image loader. Inserts transforms into Cloudinary URLs; non-Cloudinary images get `?w={width}&q={quality}` appended.
- **`src/lib/util/focus-area.ts`** — Translates focus area rectangles (from admin widget metadata) into CSS `object-position` strings. Used by image gallery and thumbnails.

**Custom Feature: Focus Area System** — Merchants define focus areas per product image via the admin widget. The storefront reads `metadata.image_focus_areas` and applies dynamic `object-position` on product images/thumbnails (both use `objectFit: "contain"`).

**Custom Feature: Hero System** — Homepage hero (`src/modules/home/components/hero/`) is product-data-driven. First product renders as full-width 50/50 split layout; remaining products render in "The Essentials" grid. Hero images selected via `hero_left_index`/`hero_right_index` product metadata.

**FadeIn Component** — `src/modules/common/components/fade-in/` uses Framer Motion with `whileInView` (triggers once). Props: `delay`, `direction` (`"up"|"down"|"left"|"right"|"none"`). Used extensively for animated entries.

**TypeScript path aliases:** `@lib/*` → `src/lib/*`, `@modules/*` → `src/modules/*`, `@pages/*` → `src/pages/*`

**Cookies:** `_medusa_cart_id` (cart), `_medusa_jwt` (auth token), `_medusa_cache_id` (region cache), `_medusa_locale` (language, 1yr expiry).

**State:** React Context for modals (`src/lib/context/modal-context.tsx`).

### Styling

**Tailwind CSS** with `@medusajs/ui-preset` and `tailwindcss-radix` plugin. Dark mode via `darkMode: "class"`.

**Fonts:** Inter (body via `--font-inter`) + Playfair Display (headings via `--font-playfair`). All headings are `font-serif font-normal tracking-tight` by default.

**Brand color palette** (defined in `tailwind.config.js`):
- `brand-light` (#FDFBF7) — default background (soft cream)
- `brand-main` (#F5F2EA) — secondary off-white
- `brand-dark` (#E8E2D2) — borders/dividers
- `brand-text` (#1A1A1A) — primary text (deep charcoal)
- `brand-muted` (#6B6A68) — secondary text
- `brand-accent` (#664930) — interactive accents (leather brown)

Body is `bg-brand-light text-brand-text`. Custom border radius scale: `soft` (2px), `base` (4px), `rounded` (8px), `large` (16px), `circle` (9999px).

Custom breakpoints: `2xsmall`, `xsmall`, `small`, `medium`, `large`, `xlarge`, `2xlarge`. Custom typography classes in `styles/globals.css` (`.text-xsmall-regular`, `.content-container`, etc.).

**Custom animations** in Tailwind config: `ring`, `fade-in-right`, `fade-in-top`, `fade-out-top`, `accordion-slide-up/down`, `enter/leave`, `slide-in`.

## Code Style

Storefront uses Prettier with: no semicolons, double quotes, 2-space indent, trailing commas (ES5), `arrowParens: "always"`. ESLint extends `next/core-web-vitals`.

## Environment Variables

Backend uses `.env` (see `.env.template`). Key vars: `DATABASE_URL`, `STORE_CORS`, `ADMIN_CORS`, `AUTH_CORS`, `CLOUDINARY_*`, `STOREFRONT_URL`, `REVALIDATE_SECRET`, `DISABLE_ADMIN`.

Storefront uses `.env.local`. Key vars: `MEDUSA_BACKEND_URL`, `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`, `NEXT_PUBLIC_DEFAULT_REGION`, `NEXT_PUBLIC_STRIPE_KEY`, `NEXT_PUBLIC_BASE_URL`, `REVALIDATE_SECRET` (must match backend).

**Required at build:** `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` — enforced by `check-env-variables.js` (exits with code 1 if missing).

## Engine Requirements

Node.js >= 20. Package manager: npm 11.6.2 (specified in both package.json files).
