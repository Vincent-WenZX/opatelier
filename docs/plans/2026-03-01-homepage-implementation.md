# Orchid & Plum Homepage Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign the Next.js Storefront homepage to match the luxury fashion e-commerce aesthetic in `example/homepage_exp.png` — transparent navbar with dynamic collections, and vertically-scrolling full-viewport 50/50 product showcase sections.

**Architecture:** Modify existing Medusa Storefront components in-place. The Nav component gets a complete rewrite for the luxury transparent navbar. The Hero component is replaced with a ProductShowcase that renders each featured product as a full-viewport 50/50 split section. Data flows from Medusa API through existing `listCollections` and `listProducts` server functions.

**Tech Stack:** Next.js 15 (App Router), Tailwind CSS, Medusa.js v2 SDK, Google Fonts (Playfair Display + Inter)

**Reference image:** `example/homepage_exp.png` — Shows transparent navbar with "ORCHID & PLUM" logo left, MEN/WOMEN/NEW ARRIVALS/CRAFTSMANSHIP center, search+cart icons right. Below is a 50/50 product display with product close-up left, styled/scene shot right, and product name + price bar at bottom.

---

### Task 1: Add Luxury Fonts

**Files:**
- Modify: `orchid-plum-storefront/src/app/layout.tsx`
- Modify: `orchid-plum-storefront/tailwind.config.js`

**Step 1: Add Google Fonts to root layout**

Import `Playfair_Display` and `Inter` from `next/font/google` in `src/app/layout.tsx`. Apply Inter as the default body font and expose Playfair Display via a CSS variable for Tailwind.

```tsx
import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import "styles/globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
})

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mode="light">
      <body className={`${inter.variable} ${playfair.variable} font-sans`}>
        <main className="relative">{props.children}</main>
      </body>
    </html>
  )
}
```

**Step 2: Register font families in Tailwind config**

In `tailwind.config.js`, add the font families to `theme.extend.fontFamily`:

```js
fontFamily: {
  sans: [
    "var(--font-inter)",
    "Inter",
    "-apple-system",
    "BlinkMacSystemFont",
    "Segoe UI",
    "Roboto",
    "Helvetica Neue",
    "Ubuntu",
    "sans-serif",
  ],
  serif: [
    "var(--font-playfair)",
    "Playfair Display",
    "Georgia",
    "Times New Roman",
    "serif",
  ],
},
```

**Step 3: Verify fonts load**

Run: `cd orchid-plum-storefront && npm run dev`
Open `http://localhost:8000` — verify the page renders without errors. Inspect body element to confirm `--font-inter` and `--font-playfair` CSS variables are present.

**Step 4: Commit**

```bash
git add orchid-plum-storefront/src/app/layout.tsx orchid-plum-storefront/tailwind.config.js
git commit -m "feat: add Playfair Display and Inter fonts for luxury branding"
```

---

### Task 2: Redesign Navbar

**Files:**
- Modify: `orchid-plum-storefront/src/modules/layout/templates/nav/index.tsx`

**Context:** The current Nav component has a white background with a left hamburger SideMenu, center "Medusa Store" text, and right Account/Cart links. We replace this entirely with a transparent navbar matching the design: logo left, collection links center, search+cart right.

The Nav is a **server component** that fetches collections. It is rendered in `src/app/[countryCode]/(main)/layout.tsx` which wraps ALL pages (not just homepage). Since the transparent style only works on the homepage (other pages have white backgrounds), we use `absolute` positioning so the navbar overlays content, and set text to white. On non-homepage pages the navbar will still overlay but will remain functional.

**Step 1: Rewrite the Nav component**

Replace the entire content of `src/modules/layout/templates/nav/index.tsx`:

```tsx
import { Suspense } from "react"

import { listCollections } from "@lib/data/collections"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"

export default async function Nav() {
  const { collections } = await listCollections({
    fields: "id,handle,title",
  })

  return (
    <div className="absolute top-0 inset-x-0 z-50">
      <header className="relative h-20 mx-auto">
        <nav className="flex items-center justify-between w-full h-full px-8 text-white">
          {/* Left: Logo + Brand Name */}
          <div className="flex items-center gap-3 flex-1 basis-0">
            <LocalizedClientLink
              href="/"
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              data-testid="nav-store-link"
            >
              <span className="text-xs tracking-[0.3em] font-serif uppercase">
                Orchid & Plum
              </span>
            </LocalizedClientLink>
          </div>

          {/* Center: Collection Links */}
          <div className="hidden small:flex items-center gap-x-8">
            {collections?.map((collection) => (
              <LocalizedClientLink
                key={collection.id}
                href={`/collections/${collection.handle}`}
                className="text-xs tracking-[0.2em] uppercase hover:opacity-70 transition-opacity"
              >
                {collection.title}
              </LocalizedClientLink>
            ))}
          </div>

          {/* Right: Search + Cart */}
          <div className="flex items-center gap-x-5 flex-1 basis-0 justify-end">
            {/* Search Icon */}
            <button
              className="hover:opacity-70 transition-opacity"
              aria-label="Search"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                />
              </svg>
            </button>

            {/* Cart Icon */}
            <Suspense
              fallback={
                <LocalizedClientLink
                  className="hover:opacity-70 transition-opacity"
                  href="/cart"
                  data-testid="nav-cart-link"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                    />
                  </svg>
                </LocalizedClientLink>
              }
            >
              <CartButton />
            </Suspense>
          </div>
        </nav>
      </header>
    </div>
  )
}
```

**Important notes for the implementer:**
- The nav uses `absolute` (not `sticky`) so it overlays content without pushing it down. The homepage images fill the viewport and the nav sits on top.
- `text-white` is set on the nav since it overlays dark/image backgrounds. If other pages need dark text, that can be handled later with a prop or page-specific override.
- The `small:` breakpoint (1024px per tailwind config) controls when collection links show.
- `CartButton` is kept as-is — it's a server component that renders `CartDropdown` (a client component). The cart dropdown has its own text colors so it won't be affected by the white text.
- Search button is non-functional for now (just the icon).

**Step 2: Verify navbar renders**

Run: `cd orchid-plum-storefront && npm run dev`
Open `http://localhost:8000` — verify navbar shows at top with white text, "Orchid & Plum" on left, collection links in center, and search+cart icons on right. The navbar should overlay the page content.

**Step 3: Commit**

```bash
git add orchid-plum-storefront/src/modules/layout/templates/nav/index.tsx
git commit -m "feat: redesign navbar with transparent luxury layout and collection links"
```

---

### Task 3: Build Product Showcase Component

**Files:**
- Modify: `orchid-plum-storefront/src/modules/home/components/hero/index.tsx`

**Context:** The Hero component currently shows a generic "Ecommerce Starter Template" banner. We replace it with a `ProductShowcase` component that takes a list of products and renders each as a full-viewport 50/50 section.

Each product section has:
- Left half: product image (or gray placeholder)
- Right half: second product image (or gray placeholder)
- Bottom bar: product name + subtitle on left, price on right

**Step 1: Rewrite hero/index.tsx as ProductShowcase**

Replace the entire content of `src/modules/home/components/hero/index.tsx`:

```tsx
import { HttpTypes } from "@medusajs/types"
import { getProductPrice } from "@lib/util/get-product-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Image from "next/image"

type ProductShowcaseProps = {
  products: HttpTypes.StoreProduct[]
}

const ProductShowcase = ({ products }: ProductShowcaseProps) => {
  if (!products?.length) {
    return null
  }

  return (
    <div>
      {products.map((product) => {
        const { cheapestPrice } = getProductPrice({ product })
        const images = product.images || []
        const thumbnail = product.thumbnail
        const secondImage = images.length > 1 ? images[1].url : null

        return (
          <LocalizedClientLink
            key={product.id}
            href={`/products/${product.handle}`}
            className="block"
          >
            <section className="relative h-screen w-full">
              {/* 50/50 Image Grid */}
              <div className="flex h-[calc(100%-4rem)] small:flex-row flex-col">
                {/* Left Image */}
                <div className="relative w-full small:w-1/2 h-1/2 small:h-full bg-neutral-100">
                  {thumbnail && (
                    <Image
                      src={thumbnail}
                      alt={product.title || ""}
                      fill
                      className="object-cover"
                      sizes="50vw"
                    />
                  )}
                </div>

                {/* Right Image */}
                <div className="relative w-full small:w-1/2 h-1/2 small:h-full bg-neutral-200">
                  {(secondImage || thumbnail) && (
                    <Image
                      src={secondImage || thumbnail!}
                      alt={`${product.title} styled` || ""}
                      fill
                      className="object-cover"
                      sizes="50vw"
                    />
                  )}
                </div>
              </div>

              {/* Product Info Bar */}
              <div className="h-16 flex items-center justify-between px-8 bg-white">
                <div className="flex items-center gap-3">
                  <h2 className="font-serif text-sm tracking-wide text-neutral-900">
                    {product.title}
                  </h2>
                  {product.subtitle && (
                    <>
                      <span className="text-neutral-300">|</span>
                      <p className="text-xs text-neutral-500 tracking-wide">
                        {product.subtitle}
                      </p>
                    </>
                  )}
                </div>
                <div className="text-sm tracking-wide text-neutral-900">
                  {cheapestPrice?.calculated_price || ""}
                </div>
              </div>
            </section>
          </LocalizedClientLink>
        )
      })}
    </div>
  )
}

export default ProductShowcase
```

**Important notes for the implementer:**
- Each product section is `h-screen` (100vh). The images area takes `h-[calc(100%-4rem)]` and the info bar takes `h-16` (4rem), totaling 100vh.
- On mobile (`< 1024px`), the two images stack vertically (each takes half the image area height). On desktop (`small:` breakpoint), they sit side by side at 50% width each.
- Images use Next.js `Image` with `fill` + `object-cover` for responsive fitting. If no images exist, the gray background placeholders show.
- The component wraps each product in a `LocalizedClientLink` so clicking anywhere navigates to the product page.
- `font-serif` on the product title uses Playfair Display (configured in Task 1).
- The `getProductPrice` utility is reused from the existing codebase to format prices correctly.

**Step 2: Verify component compiles**

Run: `cd orchid-plum-storefront && npm run dev`
Check for TypeScript/build errors in the terminal. The page won't show products yet (that's Task 4).

**Step 3: Commit**

```bash
git add orchid-plum-storefront/src/modules/home/components/hero/index.tsx
git commit -m "feat: replace hero with full-viewport 50/50 product showcase"
```

---

### Task 4: Wire Up Homepage

**Files:**
- Modify: `orchid-plum-storefront/src/app/[countryCode]/(main)/page.tsx`

**Context:** The homepage currently renders `<Hero />` (generic banner) and `<FeaturedProducts />` (grid of product cards). We replace both with the new `ProductShowcase` that shows featured products as full-viewport sections.

We fetch products from the first collection (or all collections) and pass them to `ProductShowcase`. The page needs to fetch products with price data using `listProducts` from `@lib/data/products`.

**Step 1: Rewrite the homepage**

Replace the entire content of `src/app/[countryCode]/(main)/page.tsx`:

```tsx
import { Metadata } from "next"

import ProductShowcase from "@modules/home/components/hero"
import { listCollections } from "@lib/data/collections"
import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"

export const metadata: Metadata = {
  title: "Orchid & Plum",
  description: "Luxury footwear and clothing crafted with distinction.",
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params
  const { countryCode } = params

  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  const { collections } = await listCollections({
    fields: "id,handle,title",
  })

  if (!collections?.length) {
    return null
  }

  // Fetch products from all collections for the showcase
  const productPromises = collections.map((collection) =>
    listProducts({
      regionId: region.id,
      queryParams: {
        collection_id: collection.id,
        fields: "*variants.calculated_price,+images",
        limit: 4,
      },
    })
  )

  const results = await Promise.all(productPromises)
  const allProducts = results.flatMap((r) => r.response.products)

  return <ProductShowcase products={allProducts} />
}
```

**Important notes for the implementer:**
- We import `ProductShowcase` from `@modules/home/components/hero` — same path as the old Hero, since we replaced it in-place.
- Products are fetched with `*variants.calculated_price` (needed for price display) and `+images` (needed for the second image in the 50/50 layout).
- We fetch up to 4 products per collection to keep the homepage focused. Adjust the `limit` as needed.
- The old `FeaturedProducts` import is removed entirely — it's no longer used on the homepage (but the component file still exists for potential use on other pages).
- The metadata is updated to "Orchid & Plum" branding.

**Step 2: Verify the homepage renders**

Run: `cd orchid-plum-storefront && npm run dev`
Also ensure the Medusa backend is running: `cd orchid-plum && npm run dev`

Open `http://localhost:8000` — you should see:
- Transparent navbar at top with "Orchid & Plum" and collection links
- Full-viewport product sections scrolling vertically
- Each product has left/right image areas (gray placeholders if no images in DB) and a bottom info bar with name + price
- Clicking a product navigates to its detail page

**Step 3: Commit**

```bash
git add orchid-plum-storefront/src/app/\\[countryCode\\]/\\(main\\)/page.tsx
git commit -m "feat: wire homepage to product showcase with collection data"
```

---

### Task 5: Add Homepage-Specific Styles

**Files:**
- Modify: `orchid-plum-storefront/src/styles/globals.css`

**Context:** Minor CSS refinements may be needed after visual testing. This task adds any custom styles that can't be achieved with Tailwind utilities alone.

**Step 1: Add custom styles if needed**

After visually inspecting the homepage, add any necessary styles to `globals.css`. Likely candidates:

```css
/* Smooth scrolling for product sections */
html {
  scroll-behavior: smooth;
}

/* Hide scrollbar on product showcase for cleaner look */
.product-showcase::-webkit-scrollbar {
  display: none;
}
```

Only add styles that are actually needed after visual inspection. If Tailwind utilities cover everything, skip this step.

**Step 2: Visual QA against reference image**

Compare the running homepage against `example/homepage_exp.png`:
- [ ] Navbar is transparent, overlaying content
- [ ] "Orchid & Plum" text is on the left in serif font
- [ ] Collection links are centered in the nav
- [ ] Search and cart icons are on the right
- [ ] Product sections are full viewport height
- [ ] Left/right 50/50 split is correct
- [ ] Product name and price are in the bottom bar
- [ ] Font styling matches luxury aesthetic
- [ ] Mobile layout stacks images vertically

**Step 3: Commit**

```bash
git add orchid-plum-storefront/src/styles/globals.css
git commit -m "feat: add homepage custom styles and visual polish"
```

---

### Task 6: Next.js Image Domain Configuration

**Files:**
- Modify: `orchid-plum-storefront/next.config.js`

**Context:** If product images are served from the Medusa backend (localhost:9000), Next.js `Image` component needs the domain whitelisted. Without this, images will fail to load with a "hostname not configured" error.

**Step 1: Check and update next.config.js**

Read `orchid-plum-storefront/next.config.js` and ensure the `images` config includes `localhost`:

```js
images: {
  remotePatterns: [
    {
      protocol: "http",
      hostname: "localhost",
    },
    {
      protocol: "https",
      hostname: "medusa-public-images.s3.eu-west-1.amazonaws.com",
    },
    {
      protocol: "https",
      hostname: "medusa-server-testing.s3.amazonaws.com",
    },
  ],
},
```

If `localhost` is already configured, skip this task.

**Step 2: Verify images load**

Restart the dev server and confirm product images (if any exist in the DB) load without errors.

**Step 3: Commit (if changes were made)**

```bash
git add orchid-plum-storefront/next.config.js
git commit -m "feat: add localhost to Next.js image domains for dev"
```

---

## Execution Notes

- **Start the Medusa backend first** (`cd orchid-plum && npm run dev`) before testing the storefront, since the storefront fetches data from the Medusa API.
- **Storefront runs on port 8000** (`cd orchid-plum-storefront && npm run dev`).
- **Seed data products** were loaded during setup — the homepage should have products to display. If the featured collection is empty, products may not appear. Check Medusa Admin at `http://localhost:9000/app` to verify products exist.
- **The `small:` Tailwind breakpoint is 1024px** (defined in `tailwind.config.js`), not the default Tailwind `sm: 640px`.
