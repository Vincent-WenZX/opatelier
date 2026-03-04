# ORCHID & PLUM Brand Unification — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace all "Medusa Store" references with "ORCHID & PLUM" branding and add logo images across the entire storefront.

**Architecture:** Create a centralized brand constants file, copy logo assets to `public/`, then update all components and pages to reference the constant and logo image. No TDD — this is purely a text/asset replacement task with no logic changes.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS

---

### Task 1: Create brand constants and copy logo assets

**Files:**
- Create: `orchid-plum-storefront/src/lib/constants.ts`
- Copy: `logos/logo_icon.png` → `orchid-plum-storefront/public/logo_icon.png`
- Copy: `logos/logo.png` → `orchid-plum-storefront/public/logo.png`

**Step 1: Copy logo assets to public directory**

```bash
cp logos/logo_icon.png orchid-plum-storefront/public/logo_icon.png
cp logos/logo.png orchid-plum-storefront/public/logo.png
```

**Step 2: Create constants file**

Create `orchid-plum-storefront/src/lib/constants.ts`:

```typescript
export const SITE_NAME = "ORCHID & PLUM"
```

**Step 3: Commit**

```bash
git add orchid-plum-storefront/public/logo_icon.png orchid-plum-storefront/public/logo.png orchid-plum-storefront/src/lib/constants.ts
git commit -m "feat: add brand constants and logo assets"
```

---

### Task 2: Update navigation with logo image

**Files:**
- Modify: `orchid-plum-storefront/src/modules/layout/templates/nav/index.tsx`

**Step 1: Add Image import and logo to nav**

Add `Image` from `next/image` and `SITE_NAME` from `@lib/constants`. Replace the text-only brand span with an `<Image>` of `logo_icon.png` (height 36px) followed by the `SITE_NAME` text.

Replace lines 1-6 imports with:
```tsx
import { Suspense } from "react"
import Image from "next/image"

import { listCollections } from "@lib/data/collections"
import { SITE_NAME } from "@lib/constants"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
```

Replace lines 22-26 (the brand link content) with:
```tsx
              <Image
                src="/logo_icon.png"
                alt={SITE_NAME}
                width={40}
                height={36}
                className="h-9 w-auto"
              />
              <span className="text-xs tracking-[0.3em] font-serif uppercase">
                {SITE_NAME}
              </span>
```

**Step 2: Verify dev server renders correctly**

```bash
cd orchid-plum-storefront && npm run dev
```

Open http://localhost:8000 — verify logo icon + "ORCHID & PLUM" text appear in nav.

**Step 3: Commit**

```bash
git add orchid-plum-storefront/src/modules/layout/templates/nav/index.tsx
git commit -m "feat: add logo image to navigation bar"
```

---

### Task 3: Update footer — rebrand and remove Medusa references

**Files:**
- Modify: `orchid-plum-storefront/src/modules/layout/templates/footer/index.tsx`

**Step 1: Replace footer branding**

1. Remove the `MedusaCTA` import (line 6: `import MedusaCTA from ...`)
2. Add `import { SITE_NAME } from "@lib/constants"`
3. Line 23: Replace `Medusa Store` with `{SITE_NAME}`
4. Delete the entire "Medusa" links section (lines 111-145) — the `<div>` containing "Medusa" heading, GitHub, Documentation, Source code links
5. Line 150: Replace `© {new Date().getFullYear()} Medusa Store. All rights reserved.` with `© {new Date().getFullYear()} {SITE_NAME}. All rights reserved.`
6. Line 152: Remove `<MedusaCTA />` entirely

**Step 2: Verify footer renders**

Check http://localhost:8000 — footer should show "ORCHID & PLUM" brand, no Medusa links, no "Powered by" CTA.

**Step 3: Commit**

```bash
git add orchid-plum-storefront/src/modules/layout/templates/footer/index.tsx
git commit -m "feat: rebrand footer to ORCHID & PLUM, remove Medusa references"
```

---

### Task 4: Update checkout layout

**Files:**
- Modify: `orchid-plum-storefront/src/app/[countryCode]/(checkout)/layout.tsx`

**Step 1: Replace checkout header**

1. Remove `MedusaCTA` import (line 3)
2. Add `import Image from "next/image"` and `import { SITE_NAME } from "@lib/constants"`
3. Replace line 32 `Medusa Store` with:
```tsx
            <Image
              src="/logo_icon.png"
              alt={SITE_NAME}
              width={28}
              height={24}
              className="h-6 w-auto"
            />
            {SITE_NAME}
```
4. Remove the MedusaCTA div at the bottom (lines 38-40):
```tsx
      <div className="py-4 w-full flex items-center justify-center">
        <MedusaCTA />
      </div>
```

**Step 2: Commit**

```bash
git add orchid-plum-storefront/src/app/[countryCode]/(checkout)/layout.tsx
git commit -m "feat: rebrand checkout header to ORCHID & PLUM"
```

---

### Task 5: Update side menu copyright

**Files:**
- Modify: `orchid-plum-storefront/src/modules/layout/components/side-menu/index.tsx`

**Step 1: Replace copyright text**

1. Add `import { SITE_NAME } from "@lib/constants"` at imports
2. Lines 129-130: Replace `Medusa Store` with `{SITE_NAME}`:
```tsx
                      <Text className="flex justify-between txt-compact-small">
                        © {new Date().getFullYear()} {SITE_NAME}. All rights
                        reserved.
                      </Text>
```

**Step 2: Commit**

```bash
git add orchid-plum-storefront/src/modules/layout/components/side-menu/index.tsx
git commit -m "feat: rebrand side menu copyright to ORCHID & PLUM"
```

---

### Task 6: Update registration page

**Files:**
- Modify: `orchid-plum-storefront/src/modules/account/components/register/index.tsx`

**Step 1: Replace all Medusa Store references**

1. Add `import { SITE_NAME } from "@lib/constants"` at imports
2. Line 24: `Become a Medusa Store Member` → `Become an {SITE_NAME} Member`
3. Lines 27-28: `Create your Medusa Store Member profile, and get access to an enhanced shopping experience.` → `Create your {SITE_NAME} profile, and get access to an enhanced shopping experience.`
4. Line 72: `By creating an account, you agree to Medusa Store&apos;s{" "}` → `By creating an account, you agree to {SITE_NAME}&apos;s{" "}`

**Step 2: Commit**

```bash
git add orchid-plum-storefront/src/modules/account/components/register/index.tsx
git commit -m "feat: rebrand registration page to ORCHID & PLUM"
```

---

### Task 7: Update SEO metadata across all pages

**Files:**
- Modify: `orchid-plum-storefront/src/app/[countryCode]/(main)/page.tsx`
- Modify: `orchid-plum-storefront/src/app/[countryCode]/(main)/products/[handle]/page.tsx`
- Modify: `orchid-plum-storefront/src/app/[countryCode]/(main)/collections/[handle]/page.tsx`
- Modify: `orchid-plum-storefront/src/app/[countryCode]/(main)/categories/[...category]/page.tsx`
- Modify: `orchid-plum-storefront/src/app/[countryCode]/(main)/account/@dashboard/profile/page.tsx`
- Modify: `orchid-plum-storefront/src/app/[countryCode]/(main)/account/@login/page.tsx`

**Step 1: Homepage**

In `page.tsx` (homepage), add `import { SITE_NAME } from "@lib/constants"` and change:
- Line 9: `title: "Orchid & Plum"` → `title: SITE_NAME`

**Step 2: Product page**

In `products/[handle]/page.tsx`, add `import { SITE_NAME } from "@lib/constants"` and change:
- Line 91: `` `${product.title} | Medusa Store` `` → `` `${product.title} | ${SITE_NAME}` ``
- Line 94: `` `${product.title} | Medusa Store` `` → `` `${product.title} | ${SITE_NAME}` ``

**Step 3: Collection page**

In `collections/[handle]/page.tsx`, add `import { SITE_NAME } from "@lib/constants"` and change:
- Line 66: `` `${collection.title} | Medusa Store` `` → `` `${collection.title} | ${SITE_NAME}` ``

**Step 4: Category page**

In `categories/[...category]/page.tsx`, add `import { SITE_NAME } from "@lib/constants"` and change:
- Line 54: `productCategory.name + " | Medusa Store"` → `` `${productCategory.name} | ${SITE_NAME}` ``
- Line 59: `` `${title} | Medusa Store` `` → `title` (it already has " | ORCHID & PLUM" from line 54)

**Step 5: Profile page**

In `account/@dashboard/profile/page.tsx`, change:
- Line 15: `"View and edit your Medusa Store profile."` → `"View and edit your ORCHID & PLUM profile."`

**Step 6: Login page**

In `account/@login/page.tsx`, change:
- Line 7: `"Sign in to your Medusa Store account."` → `"Sign in to your ORCHID & PLUM account."`

**Step 7: Commit**

```bash
git add orchid-plum-storefront/src/app/
git commit -m "feat: update all SEO metadata to ORCHID & PLUM"
```

---

### Task 8: Replace social sharing images

**Files:**
- Replace: `orchid-plum-storefront/src/app/opengraph-image.jpg`
- Replace: `orchid-plum-storefront/src/app/twitter-image.jpg`

**Step 1: Convert and copy logo for social sharing**

The `logos/logo.png` (flower branch + text) is the best source for social sharing. Next.js auto-detects `opengraph-image` and `twitter-image` by extension, so we replace the `.jpg` files with the `.png`:

```bash
# Remove old jpg files
rm orchid-plum-storefront/src/app/opengraph-image.jpg orchid-plum-storefront/src/app/twitter-image.jpg
# Copy logo.png as both social images
cp logos/logo.png orchid-plum-storefront/src/app/opengraph-image.png
cp logos/logo.png orchid-plum-storefront/src/app/twitter-image.png
```

Note: Next.js supports `.png` for these files, so the extension change is fine.

**Step 2: Commit**

```bash
git add orchid-plum-storefront/src/app/opengraph-image.png orchid-plum-storefront/src/app/twitter-image.png
git add orchid-plum-storefront/src/app/opengraph-image.jpg orchid-plum-storefront/src/app/twitter-image.jpg
git commit -m "feat: replace social sharing images with ORCHID & PLUM logo"
```

---

### Task 9: Final verification

**Step 1: Run lint**

```bash
cd orchid-plum-storefront && npm run lint
```

Expected: No errors.

**Step 2: Run build**

```bash
cd orchid-plum-storefront && npm run build
```

Expected: Build succeeds.

**Step 3: Grep for remaining "Medusa Store" references**

```bash
grep -r "Medusa Store" orchid-plum-storefront/src/ --include="*.tsx" --include="*.ts"
```

Expected: No results (all replaced).

**Step 4: Visual check in dev**

Start `npm run dev` and verify:
- Homepage: logo icon + "ORCHID & PLUM" in nav
- Footer: "ORCHID & PLUM" brand, correct copyright, no Medusa links
- Checkout: logo + "ORCHID & PLUM" in header
- Account > Register: "ORCHID & PLUM Member"
- Mobile menu: correct copyright
- Page titles in browser tab: "xxx | ORCHID & PLUM"
