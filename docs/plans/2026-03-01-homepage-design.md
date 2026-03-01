# Homepage Design — Orchid & Plum

## Overview

Redesign the Next.js Storefront homepage to match the luxury fashion e-commerce aesthetic shown in `example/homepage_exp.png`. Only the homepage and navbar are modified; all other pages remain unchanged.

## Reference

- Example image: `example/homepage_exp.png`
- Brand: ORCHID & PLUM — luxury shoes and clothing
- Style: Minimal, clean, high-end

## Navbar

**Layout**: Three-section horizontal bar

```
[Logo + Brand Name]    [Nav Links (from collections)]    [Search Icon + Cart Icon]
```

- **Position**: `sticky top-0`, transparent background overlaying content, white text
- **Left**: Brand emblem (text placeholder for now) + "ORCHID & PLUM" in serif/uppercase
- **Center**: Dynamic navigation links pulled from Medusa collections API, uppercase, spaced
- **Right**: Search icon (SVG) + Cart icon (reuse existing CartButton logic)
- **Mobile**: Navigation links hidden, hamburger menu shown
- **Removes**: Current SideMenu popover pattern replaced with direct nav links on desktop

**File**: `src/modules/layout/templates/nav/index.tsx`

## Product Display

Each product occupies a full-viewport-height section with a 50/50 left-right split layout.

```
┌──────────────────┬──────────────────┐
│                  │                  │
│  Product Image   │  Scene/Styling   │
│  (close-up)      │  Image           │
│  50% width       │  50% width       │
│  Gray placeholder│  Gray placeholder│
│                  │                  │
├──────────────────┴──────────────────┤
│ Product Name | Description   Price  │
└─────────────────────────────────────┘
```

- **Height**: `100vh` per product block, vertically scrollable
- **Images**: Gray placeholder (`bg-neutral-100`) — real images added later
- **Left image**: Product thumbnail from Medusa
- **Right image**: Second product image if available, otherwise duplicate thumbnail
- **Info bar**: Bottom of each block — product title + subtitle on left, price on right
- **Data source**: Featured collection products from Medusa API
- **Mobile**: Stack vertically (full-width images, top/bottom instead of left/right)

**Files**:
- `src/modules/home/components/hero/index.tsx` — rewritten as product showcase
- `src/app/[countryCode]/(main)/page.tsx` — updated page structure

## Typography

- **Headings/Brand**: Serif font (Playfair Display via Google Fonts) — luxury feel
- **Body/Nav**: Keep Inter as secondary font
- **Import**: Add fonts in `src/app/layout.tsx` via `next/font/google`

**File**: `src/app/layout.tsx`

## Color Palette

- Background: white / light neutral
- Text: dark (#1a1a1a / near-black)
- Navbar text: white (transparent bg over images)
- Placeholder images: `bg-neutral-100` or `bg-neutral-200`

## Scope — What We Are NOT Doing

- No changes to Store, Cart, Account, Checkout pages
- No footer redesign
- No product detail page changes
- No real product images (placeholders only)
- No animations or transitions beyond basic hover states

## Files to Modify

1. `src/modules/layout/templates/nav/index.tsx` — Navbar redesign
2. `src/modules/home/components/hero/index.tsx` — Product full-screen showcase
3. `src/app/[countryCode]/(main)/page.tsx` — Homepage structure
4. `src/app/layout.tsx` — Font imports
5. `src/styles/globals.css` — Custom styles if needed
