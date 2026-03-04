# Image Dimensions & Container Ratio Design

**Date:** 2026-03-04
**Status:** Approved

## Context

Products are upper-body garments and shoes. Photos are product-focused (not full-body), shot in 4:3 or 3:4 ratios. Current storefront containers use 9:16 and 29:34 ratios which cause excessive cropping of 4:3/3:4 images.

## Recommended Upload Size

**1600 x 1200px (4:3 landscape) or 1200 x 1600px (3:4 portrait)**

- 1600px long edge covers Retina 2x for max rendered size (800px)
- Cloudinary auto-compresses; typical file ~150-300KB

## Container Changes

| Display Context | Current Ratio | New Ratio | Notes |
|----------------|--------------|-----------|-------|
| Homepage Hero (split) | Fill viewport | **No change** | Keep as-is per requirement |
| Product Detail Gallery | 29:34 (0.85:1) | **3:4** (0.75:1) | Match product photo ratio |
| Store Listing Thumbnail | 9:16 (0.56:1) | **3:4** (0.75:1) | Prevent over-cropping |
| Featured Thumbnail | 11:14 (0.79:1) | **3:4** (0.75:1) | Unify with standard |
| Cart/Order Thumbnail | 1:1 | **No change** | Small size, square is optimal |
| Skeleton Previews | 9:16 / 29:34 | **3:4** | Match actual containers |

## Responsive Behavior

All thumbnail containers use 3:4 ratio across all breakpoints:
- Desktop (>1024px): 3-4 column grid, 3:4 thumbnails
- Tablet (512-1024px): 2 columns, 3:4 thumbnails
- Mobile (<512px): 2 columns, 3:4 thumbnails (naturally fits vertical screens)

## Admin Upload Hint

Add guidance text in the Medusa admin product image area:
"建议尺寸：1600×1200（横版）或 1200×1600（竖版），4:3 或 3:4 比例"

## Files to Modify

### Storefront
1. `src/modules/products/components/thumbnail/index.tsx` — Change aspect ratios
2. `src/modules/products/components/image-gallery/index.tsx` — Change 29:34 to 3:4
3. `src/modules/skeletons/components/skeleton-product-preview/index.tsx` — Change 9:16 to 3:4
4. `src/modules/skeletons/components/skeleton-order-items/index.tsx` — Change 29:34 to 3:4

### Admin
5. `orchid-plum/src/admin/widgets/hero-image-picker.tsx` — Add upload size hint
6. `orchid-plum/src/admin/widgets/focus-area-editor.tsx` — Add upload size hint
