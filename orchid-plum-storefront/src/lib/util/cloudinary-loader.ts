import type { ImageLoaderProps } from "next/image"

const CLOUDINARY_HOSTNAME = "res.cloudinary.com"

export default function cloudinaryLoader({
  src,
  width,
  quality,
}: ImageLoaderProps): string {
  if (!src.includes(CLOUDINARY_HOSTNAME)) {
    return `${src}?w=${width}&q=${quality || 75}`
  }

  const transforms = `f_auto,q_${quality || "auto"},w_${width}`

  // Cloudinary URL format: .../upload/{transforms}/{public_id}
  const uploadIndex = src.indexOf("/upload/")
  if (uploadIndex === -1) {
    return src
  }

  const before = src.slice(0, uploadIndex + "/upload/".length)
  const after = src.slice(uploadIndex + "/upload/".length)

  return `${before}${transforms}/${after}`
}
