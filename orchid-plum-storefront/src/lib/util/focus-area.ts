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
 * Given a product's metadata and an image ID,
 * returns an object-position CSS value that centers the focus area.
 * Falls back to "center" if no focus area exists.
 */
export function getFocusPosition(
  imageId: string | undefined,
  metadata: Record<string, unknown> | null | undefined
): string {
  if (!imageId || !metadata) return "center"

  const areas = metadata.image_focus_areas as ImageFocusAreas | undefined
  if (!areas) return "center"

  const area = areas[imageId]
  if (!area) return "center"

  const { x, y, w, h } = area
  if (
    typeof x !== "number" ||
    typeof y !== "number" ||
    typeof w !== "number" ||
    typeof h !== "number"
  ) {
    return "center"
  }

  const centerX = x + w / 2
  const centerY = y + h / 2
  return `${centerX.toFixed(1)}% ${centerY.toFixed(1)}%`
}

/**
 * For thumbnail URLs (no image ID available),
 * find the focus area by matching the URL against image entries,
 * then return the object-position CSS value.
 */
export function getFocusPositionByUrl(
  imageUrl: string,
  images: Array<{ id: string; url: string }> | null | undefined,
  metadata: Record<string, unknown> | null | undefined
): string {
  if (!images || !metadata) return "center"

  const match = images.find((img) => img.url === imageUrl)
  if (!match) return "center"

  return getFocusPosition(match.id, metadata)
}
