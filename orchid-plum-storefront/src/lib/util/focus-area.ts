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
