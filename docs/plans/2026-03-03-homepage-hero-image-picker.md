# Homepage Hero Image Picker — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Allow merchants to visually select which product images appear as the left/right hero images on the homepage, via a Medusa Admin widget.

**Architecture:** Product metadata stores image indices (`hero_left_index`, `hero_right_index`). An Admin widget on the product detail sidebar provides a visual picker. The storefront reads these metadata fields to select images, falling back to current behavior when unset.

**Tech Stack:** Medusa v2 Admin SDK (widget), @medusajs/ui (component library), Next.js 15 (storefront), React 18 (admin)

---

### Task 1: Add metadata to storefront product queries

**Files:**
- Modify: `orchid-plum-storefront/src/app/[countryCode]/(main)/page.tsx:39,52`

**Step 1: Add `+metadata` to both `listProducts` field queries**

In `page.tsx`, the `fields` parameter in both `listProducts` calls needs `+metadata` appended so product metadata is included in the API response.

Line 39 — collection branch:
```typescript
          fields: "*variants.calculated_price,+images,+metadata",
```

Line 52 — fallback branch:
```typescript
        fields: "*variants.calculated_price,+images,+metadata",
```

**Step 2: Verify the storefront still loads**

Run:
```bash
cd orchid-plum-storefront && npm run build
```
Expected: Build succeeds with no errors.

**Step 3: Commit**

```bash
git add orchid-plum-storefront/src/app/\[countryCode\]/\(main\)/page.tsx
git commit -m "feat: include product metadata in homepage queries"
```

---

### Task 2: Update hero image selection logic

**Files:**
- Modify: `orchid-plum-storefront/src/modules/home/components/hero/index.tsx:19-21,34,47-49`

**Step 1: Replace image selection logic**

Replace lines 19-21:
```typescript
        const images = product.images || []
        const thumbnail = product.thumbnail || images[0]?.url || null
        const secondImage = images.length > 1 ? images[1].url : null
```

With:
```typescript
        const images = product.images || []
        const meta = (product.metadata || {}) as Record<string, unknown>
        const leftIndex = typeof meta.hero_left_index === "number" ? meta.hero_left_index : null
        const rightIndex = typeof meta.hero_right_index === "number" ? meta.hero_right_index : null

        const leftImage =
          (leftIndex !== null && images[leftIndex]?.url) ||
          product.thumbnail ||
          images[0]?.url ||
          null
        const rightImage =
          (rightIndex !== null && images[rightIndex]?.url) ||
          (images.length > 1 ? images[1].url : null)
```

**Step 2: Update JSX references**

Replace `thumbnail` with `leftImage` and `secondImage` with `rightImage` in the JSX:

Line 34 — Left Image `src`:
```typescript
                  {leftImage && (
                    <Image
                      src={leftImage}
```

Lines 47-49 — Right Image `src`:
```typescript
                  {(rightImage || leftImage) && (
                    <Image
                      src={rightImage || leftImage!}
```

**Step 3: Verify build**

Run:
```bash
cd orchid-plum-storefront && npm run build
```
Expected: Build succeeds.

**Step 4: Commit**

```bash
git add orchid-plum-storefront/src/modules/home/components/hero/index.tsx
git commit -m "feat: support metadata-driven hero image selection"
```

---

### Task 3: Create Admin hero image picker widget

**Files:**
- Create: `orchid-plum/src/admin/widgets/hero-image-picker.tsx`

**Step 1: Create the widget file**

Create `orchid-plum/src/admin/widgets/hero-image-picker.tsx`:

```tsx
import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Badge } from "@medusajs/ui"
import { useEffect, useState } from "react"

type ProductImage = {
  id: string
  url: string
}

type ProductData = {
  id: string
  images: ProductImage[]
  thumbnail: string | null
  metadata: Record<string, unknown> | null
}

const HeroImagePicker = () => {
  const [product, setProduct] = useState<ProductData | null>(null)
  const [leftIndex, setLeftIndex] = useState<number | null>(null)
  const [rightIndex, setRightIndex] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)

  // Extract product ID from URL: /app/products/:id
  const productId = window.location.pathname.split("/products/")[1]?.split("/")[0]

  useEffect(() => {
    if (!productId) return
    fetch(`/admin/products/${productId}?fields=images,metadata,thumbnail`, {
      credentials: "include",
    })
      .then((r) => r.json())
      .then((data) => {
        const p = data.product as ProductData
        setProduct(p)
        const meta = p.metadata || {}
        if (typeof meta.hero_left_index === "number") {
          setLeftIndex(meta.hero_left_index)
        }
        if (typeof meta.hero_right_index === "number") {
          setRightIndex(meta.hero_right_index)
        }
      })
  }, [productId])

  const saveSelection = async (newLeft: number | null, newRight: number | null) => {
    if (!productId) return
    setSaving(true)
    try {
      await fetch(`/admin/products/${productId}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          metadata: {
            hero_left_index: newLeft,
            hero_right_index: newRight,
          },
        }),
      })
    } finally {
      setSaving(false)
    }
  }

  const handleClick = (index: number) => {
    let newLeft = leftIndex
    let newRight = rightIndex

    if (leftIndex === index) {
      // Deselect left
      newLeft = null
    } else if (rightIndex === index) {
      // Deselect right
      newRight = null
    } else if (leftIndex === null) {
      // Set as left
      newLeft = index
    } else if (rightIndex === null) {
      // Set as right
      newRight = index
    } else {
      // Both set — replace left
      newLeft = index
    }

    setLeftIndex(newLeft)
    setRightIndex(newRight)
    saveSelection(newLeft, newRight)
  }

  if (!product || !product.images?.length) {
    return null
  }

  return (
    <Container className="p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">Homepage Display</Heading>
        {saving && (
          <span className="text-ui-fg-muted text-xs">Saving...</span>
        )}
      </div>
      <div className="px-6 pb-2">
        <p className="text-ui-fg-subtle text-xs">
          Click to select Left (L) and Right (R) images for the homepage hero.
        </p>
      </div>
      <div className="grid grid-cols-3 gap-2 px-6 pb-6">
        {product.images.map((image, index) => {
          const isLeft = leftIndex === index
          const isRight = rightIndex === index

          return (
            <button
              key={image.id}
              onClick={() => handleClick(index)}
              className={`relative aspect-square overflow-hidden rounded-md border-2 transition-colors ${
                isLeft
                  ? "border-blue-500"
                  : isRight
                    ? "border-green-500"
                    : "border-ui-border-base hover:border-ui-border-strong"
              }`}
            >
              <img
                src={image.url}
                alt={`Image ${index + 1}`}
                className="h-full w-full object-cover"
              />
              {isLeft && (
                <div className="absolute top-1 left-1">
                  <Badge color="blue" size="2xsmall">L</Badge>
                </div>
              )}
              {isRight && (
                <div className="absolute top-1 left-1">
                  <Badge color="green" size="2xsmall">R</Badge>
                </div>
              )}
            </button>
          )
        })}
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.side.after",
})

export default HeroImagePicker
```

**Step 2: Verify the backend builds with the widget**

Run:
```bash
cd orchid-plum && npm run build
```
Expected: Build succeeds.

**Step 3: Commit**

```bash
git add orchid-plum/src/admin/widgets/hero-image-picker.tsx
git commit -m "feat: add hero image picker admin widget"
```

---

### Task 4: Manual verification

**Step 1: Start both servers**

Run from project root:
```bash
./dev.sh
```

**Step 2: Verify Admin widget**

1. Open `http://localhost:9000/app` and log in
2. Navigate to any product detail page
3. Scroll down in the sidebar — the "Homepage Display" widget should appear
4. Click images to select Left (L) and Right (R)
5. Verify the badges and borders appear correctly
6. Refresh the page — selections should persist

**Step 3: Verify storefront**

1. Open `http://localhost:8000`
2. The homepage should show products with the selected left/right images
3. Products without metadata selections should display the same as before (thumbnail + second image)
