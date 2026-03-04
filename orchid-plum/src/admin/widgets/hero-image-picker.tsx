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
