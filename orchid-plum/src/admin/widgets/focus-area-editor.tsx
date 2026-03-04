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
