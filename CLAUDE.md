# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This is an e-commerce platform with two independent applications:

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
npm run seed             # Seed database with demo data
npm run test:unit        # Unit tests (src/**/__tests__/**/*.unit.spec.ts)
npm run test:integration:http     # HTTP integration tests
npm run test:integration:modules  # Module integration tests
```

Run a single test file:

```bash
cd orchid-plum
npx jest --runInBand --forceExit path/to/test.spec.ts
```

### Storefront (`orchid-plum-storefront/`)

```bash
npm run dev              # Start dev server (port 8000, Turbopack)
npm run build            # Production build
npm run lint             # ESLint (next lint)
npm run analyze          # Bundle analysis (ANALYZE=true)
```

## Architecture

### Backend

**Medusa v2 modular architecture** — all customizations live in `orchid-plum/src/`:

- **`api/`** — File-based API routing. Routes at `api/{admin|store}/[path]/route.ts` export HTTP method handlers (GET, POST, etc.). Access Medusa container via `req.scope`.
- **`modules/`** — Custom business logic modules registered in `medusa-config.ts`. Currently contains `cloudinary-file/` — a custom file provider implementing `AbstractFileProviderService` for Cloudinary uploads/downloads.
- **`workflows/`** — Multi-step business process orchestration using `@medusajs/framework/workflows-sdk`.
- **`subscribers/`** — Event listeners for Medusa core events (e.g., `product.created`).
- **`jobs/`** — Scheduled background tasks with cron-based config.
- **`scripts/seed.ts`** — Database seeding (store config, regions, products, shipping, inventory).
- **`admin/`** — Admin dashboard React widget extensions (Vite-based, separate tsconfig).

**Config:** `medusa-config.ts` defines database, CORS, auth secrets, and module registration (Cloudinary file provider).

**Database:** PostgreSQL 17, db name `orchid-plum`, user `wzx`, localhost:5432.

**Testing:** Jest + SWC. Tests run in-band with forceExit. Setup in `integration-tests/setup.js`. Test type selected via `TEST_TYPE` env var (`unit`, `integration:http`, `integration:modules`).

### Storefront

**Next.js App Router** with all routes scoped under `[countryCode]/` for multi-region support.

- **`src/app/[countryCode]/`** — Route groups: `(main)/` for store pages, `(checkout)/` for checkout flow. Account uses parallel routes (`@dashboard/`, `@login/`).
- **`src/lib/data/`** — Server Actions (`"use server"`) for all Medusa API calls (cart, products, customers, orders, regions). Uses `sdk.client.fetch()` with cache tags, and `revalidateTag()` for cache invalidation on mutations.
- **`src/lib/config.ts`** — Medusa SDK client initialization with locale header interceptor.
- **`src/lib/constants.tsx`** — Global constants including `SITE_NAME`, payment provider mappings, and currency helpers.
- **`src/modules/`** — Feature-based UI components (account, cart, checkout, products, layout, etc.).
- **`src/middleware.ts`** — Detects country from URL or Vercel header, redirects to `/{countryCode}/` routes, caches region map hourly.
- **`src/lib/util/cloudinary-loader.ts`** — Custom Next.js image loader that inserts transforms (auto quality, width) into Cloudinary URLs.

**TypeScript path aliases:** `@lib/*` → `src/lib/*`, `@modules/*` → `src/modules/*`

**Styling:** Tailwind CSS with `@medusajs/ui-preset`. Inter (body via `--font-inter`) + Playfair Display (headings via `--font-playfair`). Custom typography classes in `styles/globals.css` (`.text-xsmall-regular`, `.content-container`, etc.). Custom breakpoints: `2xsmall`, `xsmall`, `small`, `medium`, `large`, `xlarge`, `2xlarge`.

**Data flow:** Server Components fetch data via server actions → pass as props to client components. Client components (`"use client"`) only where interactivity is needed (cart dropdown, product actions, modals).

**State:** React Context for modals (`src/lib/context/modal-context.tsx`). Cart ID in `_medusa_cart_id` cookie, auth token in `_medusa_jwt` cookie, region cache in `_medusa_cache_id` cookie.

## Code Style

Storefront uses Prettier with: no semicolons, double quotes, 2-space indent, trailing commas (ES5), `arrowParens: "always"`. ESLint extends `next/core-web-vitals`.

## Environment Variables

Backend uses `.env` (see `.env.template`). Key vars: `DATABASE_URL`, `STORE_CORS`, `ADMIN_CORS`, `AUTH_CORS`, `CLOUDINARY_*`.

Storefront uses `.env.local`. Key vars: `MEDUSA_BACKEND_URL`, `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`, `NEXT_PUBLIC_DEFAULT_REGION`, `NEXT_PUBLIC_STRIPE_KEY`.
