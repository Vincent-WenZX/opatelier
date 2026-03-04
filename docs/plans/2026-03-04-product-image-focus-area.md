# Product Image Focus Area Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Let merchants mark the product bounding box on each image in the admin, then use Cloudinary server-side cropping to ensure products display fully on all devices.

**Architecture:** Focus area coordinates (percentage-based bounding box) are stored per-image in product `metadata.image_focus_areas`. Storefront encodes these coordinates into the image `src` URL as query params. The global Cloudinary loader parses them and prepends a `c_crop` transform to the URL, so Cloudinary crops to the product region before scaling. Admin widget provides a drag-to-draw rectangle UI.

**Tech Stack:** Medusa admin widget (React/Vite), Next.js Image with custom Cloudinary loader, Cloudinary URL transforms, product metadata API.

---

### Task 1: Cloudinary loader — parse focus params and generate crop transform

This is the core engine. A pure function, easy to verify.

**Files:**
- Modify: `orchid-plum-storefront/src/lib/util/cloudinary-loader.ts`

**Step 1: Modify the loader to detect and use focus params**

The loader receives `src` which may contain a query string like `?focus=15,10,70,80,1200,900` (x%, y%, w%, h%, naturalWidth, naturalHeight). It parses these, calculates pixel crop values with 5% padding, and prepends a `c_crop` transform.

```ts
import type { ImageLoaderProps } from "next/image"

const CLOUDINARY_HOSTNAME = "res.cloudinary.com"
const FOCUS_PADDING = 5 // percent padding around marked area

export function parseFocusParams(src: string): {
  cleanSrc: string
  crop: { x: number; y: number; w: number; h: number } | null
} {
  const url = new URL(src, "https://placeholder.com")
  const focusParam = url.searchParams.get("focus")

  if (!focusParam) {
    return { cleanSrc: src, crop: null }
  }

  // Remove focus param from URL
  url.searchParams.delete("focus")
  const cleanSrc = url.pathname + (url.search || "") + (url.hash || "")
  // Restore the original src format (remove placeholder origin)
  const restored = src.startsWith("http")
    ? url.toString()
    : cleanSrc

  const parts = focusParam.split(",").map(Number)
  if (parts.length !== 6 || parts.some(isNaN)) {
    return { cleanSrc: restored, crop: null }
  }

  const [xPct, yPct, wPct, hPct, natW, natH] = parts

  // Add padding, clamped to image bounds
  const px = Math.max(0, xPct - FOCUS_PADDING)
  const py = Math.max(0, yPct - FOCUS_PADDING)
  const pw = Math.min(100 - px, wPct + FOCUS_PADDING * 2)
  const ph = Math.min(100 - py, hPct + FOCUS_PADDING * 2)

  // Convert percentages to pixels
  const x = Math.round((px / 100) * natW)
  const y = Math.round((py / 100) * natH)
  const w = Math.round((pw / 100) * natW)
  const h = Math.round((ph / 100) * natH)

  return { cleanSrc: restored, crop: { x, y, w, h } }
}

export default function cloudinaryLoader({
  src,
  width,
  quality,
}: ImageLoaderProps): string {
  const { cleanSrc, crop } = parseFocusParams(src)

  if (!cleanSrc.includes(CLOUDINARY_HOSTNAME)) {
    return `${cleanSrc}?w=${width}&q=${quality || 75}`
  }

  const fillTransforms = `f_auto,q_${quality || "auto"},w_${width}`
  const cropTransform = crop
    ? `c_crop,x_${crop.x},y_${crop.y},w_${crop.w},h_${crop.h}/`
    : ""

  // Cloudinary URL format: .../upload/{transforms}/{public_id}
  const uploadIndex = cleanSrc.indexOf("/upload/")
  if (uploadIndex === -1) {
    return cleanSrc
  }

  const before = cleanSrc.slice(0, uploadIndex + "/upload/".length)
  const after = cleanSrc.slice(uploadIndex + "/upload/".length)

  return `${before}${cropTransform}${fillTransforms}/${after}`
}
```

**Step 2: Verify manually**

Run: `cd orchid-plum-storefront && npm run build`
Expected: Build succeeds without errors.

Quick console test — the loader should produce:
- Without focus: `.../upload/f_auto,q_auto,w_800/image.jpg`
- With focus `?focus=15,10,70,80,1200,900` (5% padding → px=10%, py=5%, pw=80%, ph=90%):
  - Pixels: x=120, y=45, w=960, h=810
  - `.../upload/c_crop,x_120,y_45,w_960,h_810/f_auto,q_auto,w_800/image.jpg`

**Step 3: Commit**

```bash
git add orchid-plum-storefront/src/lib/util/cloudinary-loader.ts
git commit -m "feat: add focus area crop support to Cloudinary loader"
```

---

### Task 2: Create focus-area utility for building image src with focus params

A shared helper that components use to append focus params to image URLs. This keeps the encoding logic in one place.

**Files:**
- Create: `orchid-plum-storefront/src/lib/util/focus-area.ts`

**Step 1: Write the utility**

```ts
type FocusArea = {
  x: number
  y: number
  w: number
  h: number
  naturalWidth: number
  naturalHeight: number
}

type ImageFocusAreas = Record<string, FocusArea>

/**
 * Given a product's metadata and an image ID + URL,
 * returns the URL with focus params appended (if a focus area exists).
 */
export function applyFocusArea(
  imageUrl: string,
  imageId: string | undefined,
  metadata: Record<string, unknown> | null | undefined
): string {
  if (!imageId || !metadata) return imageUrl

  const areas = metadata.image_focus_areas as ImageFocusAreas | undefined
  if (!areas) return imageUrl

  const area = areas[imageId]
  if (!area) return imageUrl

  const { x, y, w, h, naturalWidth, naturalHeight } = area
  if (
    typeof x !== "number" ||
    typeof y !== "number" ||
    typeof w !== "number" ||
    typeof h !== "number" ||
    typeof naturalWidth !== "number" ||
    typeof naturalHeight !== "number"
  ) {
    return imageUrl
  }

  const sep = imageUrl.includes("?") ? "&" : "?"
  return `${imageUrl}${sep}focus=${x},${y},${w},${h},${naturalWidth},${naturalHeight}`
}

/**
 * For thumbnail URLs (no image ID available),
 * find the focus area by matching the URL against image entries.
 */
export function applyFocusAreaByUrl(
  imageUrl: string,
  images: Array<{ id: string; url: string }> | null | undefined,
  metadata: Record<string, unknown> | null | undefined
): string {
  if (!images || !metadata) return imageUrl

  const match = images.find((img) => img.url === imageUrl)
  if (!match) return imageUrl

  return applyFocusArea(imageUrl, match.id, metadata)
}
```

**Step 2: Commit**

```bash
git add orchid-plum-storefront/src/lib/util/focus-area.ts
git commit -m "feat: add focus-area utility for encoding crop params into image URLs"
```

---

### Task 3: Update `ProductShowcase` (Hero) to use focus areas

**Files:**
- Modify: `orchid-plum-storefront/src/modules/home/components/hero/index.tsx`

**Step 1: Import utility and apply focus params to hero image URLs**

```tsx
import { applyFocusArea } from "@lib/util/focus-area"
```

In the component, after determining `leftImage` and `rightImage` URLs, apply focus areas:

```tsx
// After existing leftImage/rightImage logic, add:
const leftImageId = leftIndex !== null ? images[leftIndex]?.id : images[0]?.id
const rightImageId = rightIndex !== null ? images[rightIndex]?.id : (images.length > 1 ? images[1]?.id : undefined)

const leftSrc = leftImage
  ? applyFocusArea(leftImage, leftImageId, meta as Record<string, unknown>)
  : null
const rightSrc = rightImage
  ? applyFocusArea(rightImage, rightImageId, meta as Record<string, unknown>)
  : null
```

Then use `leftSrc` / `rightSrc` in the `<Image>` tags instead of `leftImage` / `rightImage`. Also change `className="object-cover"` to `className="object-contain"` on hero images so the cropped result shows fully (Cloudinary already crops to the product region, so `object-contain` displays it without further client-side cropping).

**Step 2: Verify manually**

Start dev: `cd orchid-plum-storefront && npm run dev`
Open http://localhost:8000 — hero images should render without errors.
Products without focus area metadata should look identical to before.

**Step 3: Commit**

```bash
git add orchid-plum-storefront/src/modules/home/components/hero/index.tsx
git commit -m "feat: apply focus area cropping to homepage hero images"
```

---

### Task 4: Update `ImageGallery` to use focus areas

**Files:**
- Modify: `orchid-plum-storefront/src/modules/products/components/image-gallery/index.tsx`

**Step 1: Add metadata prop and apply focus params**

The component currently receives only `images`. Add a `metadata` prop:

```tsx
import { applyFocusArea } from "@lib/util/focus-area"

type ImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
  metadata?: Record<string, unknown> | null
}

const ImageGallery = ({ images, metadata }: ImageGalleryProps) => {
  // In the map, change src:
  // Before: src={image.url}
  // After:  src={applyFocusArea(image.url, image.id, metadata)}
}
```

**Step 2: Pass metadata from parent**

Find where `ImageGallery` is rendered (in the product template) and pass `product.metadata` as the new prop.

Check: `orchid-plum-storefront/src/modules/products/templates/index.tsx`

```tsx
<ImageGallery images={images} metadata={product.metadata} />
```

**Step 3: Commit**

```bash
git add orchid-plum-storefront/src/modules/products/components/image-gallery/index.tsx
git add orchid-plum-storefront/src/modules/products/templates/index.tsx
git commit -m "feat: apply focus area cropping to product detail page gallery"
```

---

### Task 5: Update `Thumbnail` to use focus areas

**Files:**
- Modify: `orchid-plum-storefront/src/modules/products/components/thumbnail/index.tsx`

**Step 1: Add metadata prop and apply focus params**

```tsx
import { applyFocusAreaByUrl } from "@lib/util/focus-area"

type ThumbnailProps = {
  thumbnail?: string | null
  images?: any[] | null
  metadata?: Record<string, unknown> | null  // NEW
  size?: "small" | "medium" | "large" | "full" | "square"
  isFeatured?: boolean
  className?: string
  "data-testid"?: string
}
```

In the component body:

```tsx
const initialImage = thumbnail || images?.[0]?.url
const imageSrc = initialImage
  ? applyFocusAreaByUrl(initialImage, images, metadata)
  : undefined
```

Pass `imageSrc` to `ImageOrPlaceholder` instead of `initialImage`.

**Step 2: Pass metadata from callers**

Update `ProductPreview` (main caller for product listings) to pass `product.metadata`:

Check: `orchid-plum-storefront/src/modules/products/components/product-preview/index.tsx`

```tsx
<Thumbnail
  thumbnail={product.thumbnail}
  images={product.images}
  metadata={product.metadata}
  size="full"
/>
```

Note: Cart item and order item callers don't have easy access to full product metadata — skip those for now (they use cart/order item thumbnails which are pre-cropped URLs). This follows YAGNI — revisit if needed.

**Step 3: Commit**

```bash
git add orchid-plum-storefront/src/modules/products/components/thumbnail/index.tsx
git add orchid-plum-storefront/src/modules/products/components/product-preview/index.tsx
git commit -m "feat: apply focus area cropping to product thumbnails"
```

---

### Task 6: Build admin widget — Focus Area Editor

This is the largest task. Build a new admin widget that lets merchants draw a bounding box on each product image.

**Files:**
- Create: `orchid-plum/src/admin/widgets/focus-area-editor.tsx`

**Step 1: Build the widget**

The widget renders in `product.details.side.after` zone. UI:
- Thumbnail grid of all product images
- Each thumbnail shows a small indicator if it has a focus area set
- Click thumbnail → opens inline editor below the grid
- Editor shows the full image with a draggable/resizable rectangle overlay
- "Save" button stores coordinates to product metadata
- "Clear" button removes the focus area for that image

Key implementation details:
- Use `mousedown`/`mousemove`/`mouseup` on the image container to draw the rectangle
- Track state: `{drawing: boolean, startX, startY, currentX, currentY}`
- On mouse up, calculate percentage coordinates from pixel positions relative to the image's `naturalWidth`/`naturalHeight`
- Display the rectangle as an absolutely-positioned div with a border
- Use a semi-transparent overlay outside the rectangle to dim the non-selected area
- Save button POSTs to `/admin/products/:id` with updated `metadata.image_focus_areas`

```tsx
import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Button, Badge } from "@medusajs/ui"
import { useEffect, useState, useRef, useCallback } from "react"

type ProductImage = { id: string; url: string }
type FocusArea = {
  x: number; y: number; w: number; h: number
  naturalWidth: number; naturalHeight: number
}
type FocusAreas = Record<string, FocusArea>
type ProductData = {
  id: string
  images: ProductImage[]
  metadata: Record<string, unknown> | null
}

const FocusAreaEditor = () => {
  const [product, setProduct] = useState<ProductData | null>(null)
  const [focusAreas, setFocusAreas] = useState<FocusAreas>({})
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Drawing state
  const [drawing, setDrawing] = useState(false)
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null)
  const [drawEnd, setDrawEnd] = useState<{ x: number; y: number } | null>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  const productId = window.location.pathname.split("/products/")[1]?.split("/")[0]

  useEffect(() => {
    if (!productId) return
    fetch(`/admin/products/${productId}`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        const p = data.product as ProductData
        setProduct(p)
        const existing = (p.metadata?.image_focus_areas || {}) as FocusAreas
        setFocusAreas(existing)
      })
  }, [productId])

  const selectedImage = product?.images.find((img) => img.id === selectedImageId)
  const currentArea = selectedImageId ? focusAreas[selectedImageId] : null

  const getRelativeCoords = useCallback(
    (e: React.MouseEvent) => {
      const img = imgRef.current
      if (!img) return null
      const rect = img.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      return { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) }
    },
    []
  )

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const coords = getRelativeCoords(e)
      if (!coords) return
      setDrawing(true)
      setDrawStart(coords)
      setDrawEnd(coords)
    },
    [getRelativeCoords]
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!drawing) return
      const coords = getRelativeCoords(e)
      if (coords) setDrawEnd(coords)
    },
    [drawing, getRelativeCoords]
  )

  const handleMouseUp = useCallback(() => {
    if (!drawing || !drawStart || !drawEnd || !selectedImageId || !imgRef.current) {
      setDrawing(false)
      return
    }
    setDrawing(false)

    const x = Math.min(drawStart.x, drawEnd.x)
    const y = Math.min(drawStart.y, drawEnd.y)
    const w = Math.abs(drawEnd.x - drawStart.x)
    const h = Math.abs(drawEnd.y - drawStart.y)

    // Ignore tiny accidental clicks (less than 5% in either dimension)
    if (w < 5 || h < 5) return

    const area: FocusArea = {
      x: Math.round(x * 10) / 10,
      y: Math.round(y * 10) / 10,
      w: Math.round(w * 10) / 10,
      h: Math.round(h * 10) / 10,
      naturalWidth: imgRef.current.naturalWidth,
      naturalHeight: imgRef.current.naturalHeight,
    }
    setFocusAreas((prev) => ({ ...prev, [selectedImageId]: area }))
  }, [drawing, drawStart, drawEnd, selectedImageId])

  const saveFocusAreas = async (areas: FocusAreas) => {
    if (!productId) return
    setSaving(true)
    try {
      await fetch(`/admin/products/${productId}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          metadata: { image_focus_areas: areas },
        }),
      })
    } finally {
      setSaving(false)
    }
  }

  const handleSave = () => saveFocusAreas(focusAreas)

  const handleClear = () => {
    if (!selectedImageId) return
    const next = { ...focusAreas }
    delete next[selectedImageId]
    setFocusAreas(next)
    saveFocusAreas(next)
  }

  // Calculate the visual rectangle for the overlay
  const rectStyle = (() => {
    // Show saved area or in-progress drawing
    if (drawing && drawStart && drawEnd) {
      const x = Math.min(drawStart.x, drawEnd.x)
      const y = Math.min(drawStart.y, drawEnd.y)
      const w = Math.abs(drawEnd.x - drawStart.x)
      const h = Math.abs(drawEnd.y - drawStart.y)
      return { left: `${x}%`, top: `${y}%`, width: `${w}%`, height: `${h}%` }
    }
    if (currentArea) {
      return {
        left: `${currentArea.x}%`,
        top: `${currentArea.y}%`,
        width: `${currentArea.w}%`,
        height: `${currentArea.h}%`,
      }
    }
    return null
  })()

  if (!product || !product.images?.length) return null

  return (
    <Container className="p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">Focus Areas</Heading>
        {saving && <span className="text-ui-fg-muted text-xs">Saving...</span>}
      </div>
      <div className="px-6 pb-2">
        <p className="text-ui-fg-subtle text-xs">
          Click an image, then drag to mark the product area. This ensures the
          product displays fully on all screen sizes.
        </p>
      </div>

      {/* Thumbnail grid */}
      <div className="grid grid-cols-4 gap-2 px-6 pb-4">
        {product.images.map((image) => {
          const hasArea = !!focusAreas[image.id]
          const isSelected = selectedImageId === image.id
          return (
            <button
              key={image.id}
              onClick={() => setSelectedImageId(isSelected ? null : image.id)}
              className={`relative aspect-square overflow-hidden rounded-md border-2 transition-colors ${
                isSelected
                  ? "border-blue-500"
                  : hasArea
                    ? "border-green-500"
                    : "border-ui-border-base hover:border-ui-border-strong"
              }`}
            >
              <img
                src={image.url}
                alt=""
                className="h-full w-full object-cover"
              />
              {hasArea && (
                <div className="absolute top-1 right-1">
                  <Badge color="green" size="2xsmall">✓</Badge>
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Editor area */}
      {selectedImage && (
        <div className="px-6 pb-6">
          <div
            className="relative w-full cursor-crosshair select-none overflow-hidden rounded-md border border-ui-border-base"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => drawing && setDrawing(false)}
          >
            <img
              ref={imgRef}
              src={selectedImage.url}
              alt=""
              className="block w-full"
              draggable={false}
            />
            {/* Dim overlay outside selection */}
            {rectStyle && (
              <>
                {/* Semi-transparent overlay covers the whole image */}
                <div className="absolute inset-0 bg-black/40 pointer-events-none" />
                {/* Clear window for the selected area */}
                <div
                  className="absolute border-2 border-blue-500 pointer-events-none"
                  style={{
                    ...rectStyle,
                    boxShadow: "0 0 0 9999px rgba(0,0,0,0.4)",
                    backgroundColor: "transparent",
                  }}
                />
              </>
            )}
          </div>
          <div className="flex gap-2 mt-3">
            <Button size="small" onClick={handleSave} isLoading={saving}>
              Save
            </Button>
            {currentArea && (
              <Button size="small" variant="secondary" onClick={handleClear}>
                Clear
              </Button>
            )}
          </div>
        </div>
      )}
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.side.after",
})

export default FocusAreaEditor
```

**Step 2: Build and verify**

Run: `cd orchid-plum && npm run build`
Expected: Build succeeds.

Run: `cd orchid-plum && npm run dev`
Navigate to http://localhost:9000/app/products/{any-product-id}
Expected: "Focus Areas" widget appears in the right sidebar below existing widgets. Click an image, drag to draw rectangle, save.

**Step 3: Commit**

```bash
git add orchid-plum/src/admin/widgets/focus-area-editor.tsx
git commit -m "feat: add focus area editor admin widget for product images"
```

---

### Task 7: End-to-end verification

**Step 1: Set a focus area in admin**

1. Start backend: `cd orchid-plum && npm run dev`
2. Start storefront: `cd orchid-plum-storefront && npm run dev`
3. Open http://localhost:9000/app/products/{product-id}
4. In the "Focus Areas" widget, click a product image
5. Draw a rectangle around the product (e.g., the shoe)
6. Click Save

**Step 2: Verify on storefront**

1. Open http://localhost:8000
2. Check the homepage hero — the product should be fully visible within its panel
3. Navigate to the product detail page — gallery images should show the product fully
4. Check the `/store` listing page — thumbnails should show the product fully
5. Resize browser window to mobile width — verify product stays fully visible

**Step 3: Verify fallback**

Check a product that has NO focus areas set. It should render identically to the current behavior (plain `object-cover`, no `c_crop` transform in URL).

**Step 4: Commit any final adjustments**

```bash
git add -A
git commit -m "fix: adjustments from e2e verification of focus area feature"
```

---

## File Summary

| Action | File |
|--------|------|
| Modify | `orchid-plum-storefront/src/lib/util/cloudinary-loader.ts` |
| Create | `orchid-plum-storefront/src/lib/util/focus-area.ts` |
| Modify | `orchid-plum-storefront/src/modules/home/components/hero/index.tsx` |
| Modify | `orchid-plum-storefront/src/modules/products/components/image-gallery/index.tsx` |
| Modify | `orchid-plum-storefront/src/modules/products/templates/index.tsx` |
| Modify | `orchid-plum-storefront/src/modules/products/components/thumbnail/index.tsx` |
| Modify | `orchid-plum-storefront/src/modules/products/components/product-preview/index.tsx` |
| Create | `orchid-plum/src/admin/widgets/focus-area-editor.tsx` |

## Dependency Order

```
Task 1 (loader) → Task 2 (utility) → Tasks 3,4,5 (storefront components, parallel)
                                   → Task 6 (admin widget, parallel with 3-5)
                                   → Task 7 (e2e verification, after all above)
```
