# Product Image Focus Area — Design Document

**Date:** 2026-03-04
**Status:** Approved

## Problem

Product images use `object-cover` on the storefront, which crops images to fill containers. On different screen sizes, the product (e.g., a shoe) gets partially cut off — the toe, heel, or top may be hidden. There is no way to tell the system which part of the image contains the actual product.

## Solution

Allow merchants to mark the **product bounding box** (four corners) on each product image in the admin dashboard. The storefront uses these coordinates to generate Cloudinary URL transforms that crop to the product area, ensuring the product is always fully visible with natural padding from the original image background. No color fill needed — zero color mismatch.

## Data Model

Store per-image focus areas in product `metadata`:

```json
{
  "image_focus_areas": {
    "<image_id>": { "x": 15, "y": 10, "w": 70, "h": 80 }
  }
}
```

- `x`, `y`: top-left corner position (percentage of original image dimensions, 0–100)
- `w`, `h`: area width and height (percentage)
- Percentages are resolution-independent — work regardless of original image size
- Images without a focus area fall back to current `object-cover` behavior

## Admin Widget

**Location:** `product.details.side.after` zone (extend or replace existing `hero-image-picker.tsx`)

### UI Flow

1. Widget shows all product images as a thumbnail grid
2. Click a thumbnail → opens a modal/overlay with the full-size image
3. Drag to draw a rectangle over the product area (the four corners)
4. Live preview panel shows how the crop looks at different aspect ratios (desktop 16:9, tablet 4:3, mobile 9:16)
5. Save → stores percentage coordinates in product metadata via `POST /admin/products/:id`

### Technical Details

- Canvas or DOM-based drag-to-select rectangle
- Convert pixel coordinates to percentages: `x% = (pixelX / imageNaturalWidth) * 100`
- Show visual feedback: semi-transparent overlay outside the selected region
- Support re-editing: load existing coordinates and display the rectangle
- Support clearing: remove focus area for an image

## Cloudinary Integration

**Approach: URL Transform (no server-side Cloudinary API calls needed)**

Chain two transforms in the Cloudinary URL:

1. `c_crop` — crop to the marked product region (with some padding)
2. `c_fill` — scale to the requested container dimensions

Example:
```
Original image: 1200x900
Focus area: x=15%, y=10%, w=70%, h=80%
Pixel values: x=180, y=90, w=840, h=720

Cloudinary URL:
/c_crop,x_180,y_90,w_840,h_720/c_fill,w_800,h_600/product.jpg
```

### Padding

Add ~5% padding around the marked area (clamped to image bounds) so the product doesn't touch the edges:

```
paddedX = max(0, x - 5%)
paddedY = max(0, y - 5%)
paddedW = min(100 - paddedX, w + 10%)
paddedH = min(100 - paddedY, h + 10%)
```

## Storefront Changes

### `cloudinary-loader.ts`

Modify the existing Cloudinary loader to accept focus area data and prepend a `c_crop` transform before the existing transforms:

```ts
// Before (current):
/f_auto,q_auto,w_800/product.jpg

// After (with focus area):
/c_crop,x_180,y_90,w_840,h_720/f_auto,q_auto,w_800/product.jpg
```

### Passing Focus Area Data

The focus area metadata needs to flow from server components to the image loader. Options:

- **Encode in the image URL as a query parameter** (simplest): append `?focus=15,10,70,80` to the src, parse in the loader
- The loader reads the focus params, calculates pixel crop values (needs original image dimensions — can be fetched once or stored in metadata)

### Image Dimensions

To convert percentage-based focus areas to pixel coordinates, we need the original image dimensions. Two options:

1. **Store dimensions in metadata** when the focus area is set (add `naturalWidth` and `naturalHeight` to the stored data)
2. **Use Cloudinary's dimension-agnostic percentage crop** — Cloudinary doesn't natively support percentage-based crop coordinates, so option 1 is preferred

Updated metadata format:

```json
{
  "image_focus_areas": {
    "<image_id>": {
      "x": 15, "y": 10, "w": 70, "h": 80,
      "naturalWidth": 1200, "naturalHeight": 900
    }
  }
}
```

## Application Scope

All product images site-wide:

- **Homepage Hero** — `ProductShowcase` component
- **Product detail page** — image gallery
- **Product listings/grids** — thumbnails and previews
- **Any future image display** — the loader handles it transparently

## Fallback Behavior

- Images without focus area metadata → current `object-cover` behavior (no change)
- Products without any metadata → completely unchanged
- Non-Cloudinary images → skip crop transform, use current behavior

## Migration

- No database migration needed — uses existing product metadata field
- No breaking changes — all changes are additive
- Existing products without focus areas continue to work identically
