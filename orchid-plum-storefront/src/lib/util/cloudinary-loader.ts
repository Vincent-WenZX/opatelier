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

  // Guard against corrupted metadata (out-of-range values or zero dimensions)
  if (w <= 0 || h <= 0) {
    return { cleanSrc: restored, crop: null }
  }

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
