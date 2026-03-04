# Homepage Hero Image Picker — Design Doc

**Date:** 2026-03-03
**Status:** Approved

## Problem

The homepage `ProductShowcase` component displays each product with a left/right 50/50 image split. Currently, the left image is always the product thumbnail and the right image is always `images[1]`. There is no way to configure which images appear in each position.

## Solution

Add a visual image picker widget to the Medusa Admin product detail page. The widget lets merchants select which product image to use for the left and right positions on the homepage. Selections are stored in product `metadata` and read by the storefront.

## Architecture

### Data Storage

Product `metadata` fields (both optional):
- `hero_left_index`: `number` — index into `product.images` array (0-based)
- `hero_right_index`: `number` — index into `product.images` array (0-based)

When not set, the current default behavior is preserved (left = thumbnail, right = images[1]).

### Admin Widget

**File:** `orchid-plum/src/admin/widgets/hero-image-picker.tsx`

**Injection zone:** `product.details.side.after`

**Behavior:**
1. Extract product ID from the URL (`/app/products/:id`)
2. Fetch product data (images + metadata) via Admin API
3. Render a thumbnail grid of all product images
4. Each image is clickable — click toggles selection as "Left" or "Right"
5. Selected left image gets a blue border + "L" badge; right gets green + "R"
6. On selection change, update product metadata via `POST /admin/products/:id`
7. Uses `@medusajs/ui` components (Container, Heading, Badge, clx) for consistent styling

**API calls:**
- `GET /admin/products/:id?fields=images,metadata,thumbnail` — fetch current state
- `POST /admin/products/:id` with `{ metadata: { hero_left_index, hero_right_index } }` — save selection

### Storefront Change

**File:** `orchid-plum-storefront/src/modules/home/components/hero/index.tsx`

**Change:** Replace hardcoded image selection logic:

```typescript
// Before
const thumbnail = product.thumbnail || images[0]?.url || null
const secondImage = images.length > 1 ? images[1].url : null

// After
const meta = product.metadata || {}
const leftIndex = typeof meta.hero_left_index === "number" ? meta.hero_left_index : null
const rightIndex = typeof meta.hero_right_index === "number" ? meta.hero_right_index : null

const leftImage = (leftIndex !== null && images[leftIndex]?.url) || product.thumbnail || images[0]?.url || null
const rightImage = (rightIndex !== null && images[rightIndex]?.url) || (images.length > 1 ? images[1].url : null)
```

### Homepage Data Fetching

**File:** `orchid-plum-storefront/src/app/[countryCode]/(main)/page.tsx`

**Change:** Add `+metadata` to the `fields` parameter in `listProducts` calls so metadata is included in the response.

## Backward Compatibility

- Products without `hero_left_index` / `hero_right_index` metadata: unchanged behavior
- Index out of bounds (e.g., image deleted after setting): falls back to default behavior
- No backend module or database migration required
