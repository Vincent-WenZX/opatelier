import { useParams, Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Bookmark, ChevronLeft, Plus, Minus, Check, ShoppingBag } from 'lucide-react'
import products from '../data/products'
import { useCart } from '../context/CartContext'

function Accordion({ title, items, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="border-t border-border">
      <button
        className="flex w-full items-center justify-between py-5 text-left"
        onClick={() => setOpen(!open)}
      >
        <span className="font-serif text-[15px] font-medium tracking-[0.5px] text-ink">
          {title}
        </span>
        {open ? (
          <Minus size={16} strokeWidth={1.5} className="text-muted" />
        ) : (
          <Plus size={16} strokeWidth={1.5} className="text-muted" />
        )}
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          <ul className="space-y-2.5 pb-6">
            {items.map((item, i) => (
              <li key={i} className="text-[13px] font-light leading-relaxed tracking-[0.3px] text-muted">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default function ProductDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const product = products.find((p) => p.slug === slug)
  const [activeImage, setActiveImage] = useState('lifestyle')
  const [bookmarked, setBookmarked] = useState(false)
  const [selectedSize, setSelectedSize] = useState(null)
  const [addedFeedback, setAddedFeedback] = useState(false)
  const { addItem } = useCart()

  if (!product) {
    return (
      <main className="flex h-screen items-center justify-center pt-16">
        <div className="text-center">
          <p className="font-serif text-2xl text-ink">Product not found</p>
          <Link to="/" className="mt-4 inline-block text-sm tracking-[1px] text-gold hover:underline">
            Return Home
          </Link>
        </div>
      </main>
    )
  }

  const currentImg = activeImage === 'lifestyle' ? product.images.lifestyle : product.images.product
  const isContain = currentImg.fit === 'contain'
  const surfaceBg = '#FAFAFA'
  const sizes = product.sizes || []

  const handleAddToCart = () => {
    if (!selectedSize) return
    addItem(product, selectedSize)
    setAddedFeedback(true)
    setTimeout(() => setAddedFeedback(false), 2000)
  }

  return (
    <main className="pt-16">
      <div
        className="flex flex-col lg:flex-row min-h-[calc(100vh-64px)]"
        style={{ background: surfaceBg }}
      >
        {/* Left: Image */}
        <div className="relative w-full lg:w-[58%] xl:w-[60%]">
          <div
            className="relative h-[60vh] sm:h-[70vh] lg:h-full min-h-[400px]"
            style={{ background: currentImg.bg || '#F2F2F2' }}
          >
            <img
              src={currentImg.src}
              alt={product.name}
              className="h-full w-full transition-opacity duration-300"
              style={{
                objectFit: isContain ? 'contain' : 'cover',
                objectPosition: currentImg.position || 'center',
                padding: isContain ? 'clamp(16px, 4vw, 48px)' : 0,
              }}
            />

            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 lg:p-10">
              <div className="max-w-xs">
                <p
                  className="text-[13px] font-light leading-relaxed tracking-[0.3px]"
                  style={{
                    color: isContain ? 'var(--color-ink)' : 'rgba(26,26,26,0.8)',
                    textShadow: isContain ? 'none' : '0 1px 3px rgba(255,255,255,0.6)',
                  }}
                >
                  {product.description}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Product info */}
        <div className="w-full lg:w-[42%] xl:w-[40%] bg-surface">
          <div className="px-6 sm:px-10 lg:px-12 xl:px-16 py-10 lg:py-14">
            <Link
              to="/"
              className="mb-10 inline-flex items-center gap-1.5 text-[11px] tracking-[2px] uppercase text-muted transition-colors hover:text-gold"
            >
              <ChevronLeft size={14} strokeWidth={1.5} />
              Back
            </Link>

            <div className="mb-2">
              <div className="flex items-baseline justify-between gap-4">
                <h1 className="font-serif text-[22px] font-medium tracking-[0.5px] text-ink lg:text-[26px]">
                  {product.name}
                </h1>
                <span className="font-serif text-[20px] tracking-[1px] text-ink lg:text-[22px] shrink-0">
                  ${product.price}
                </span>
              </div>
              <p className="mt-1.5 text-[13px] font-light tracking-[0.5px] text-muted">
                {product.material}
              </p>
            </div>

            {/* Image thumbnails */}
            <div className="mt-8 flex gap-3">
              {['lifestyle', 'product'].map((type) => {
                const img = product.images[type]
                return (
                  <button
                    key={type}
                    onClick={() => setActiveImage(type)}
                    className={`relative h-16 w-16 overflow-hidden transition-opacity ${
                      activeImage === type ? 'opacity-100 ring-1 ring-ink' : 'opacity-60 hover:opacity-90'
                    }`}
                    style={{ background: img.bg || '#F2F2F2' }}
                  >
                    <img
                      src={img.src}
                      alt={`${type} view`}
                      className="h-full w-full"
                      style={{
                        objectFit: img.fit === 'contain' ? 'contain' : 'cover',
                        objectPosition: img.position || 'center',
                        padding: img.fit === 'contain' ? '4px' : 0,
                      }}
                    />
                  </button>
                )
              })}
            </div>

            {/* Size selector */}
            {sizes.length > 0 && (
              <div className="mt-8">
                <p className="text-[11px] font-normal tracking-[2px] uppercase text-muted">
                  Select Size
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`flex h-10 min-w-[44px] items-center justify-center px-3 text-[12px] tracking-[0.5px] transition-colors ${
                        selectedSize === size
                          ? 'bg-ink text-white'
                          : 'border border-border text-ink hover:border-gold'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="mt-8 flex items-center gap-3">
              <button
                onClick={() => setBookmarked(!bookmarked)}
                className="flex h-12 w-12 shrink-0 items-center justify-center border border-border transition-colors hover:border-gold"
                aria-label="Bookmark"
              >
                <Bookmark
                  size={18}
                  strokeWidth={1.5}
                  className={bookmarked ? 'fill-gold text-gold' : 'text-ink'}
                />
              </button>
              <button className="flex h-12 flex-1 items-center justify-center border border-border text-[11.5px] tracking-[2px] uppercase text-ink transition-colors hover:border-gold hover:text-gold">
                Customize
              </button>
              <button
                onClick={handleAddToCart}
                disabled={!selectedSize}
                className={`flex h-12 flex-1 items-center justify-center gap-2 text-[11.5px] tracking-[2px] uppercase transition-colors ${
                  addedFeedback
                    ? 'bg-gold text-white'
                    : selectedSize
                    ? 'bg-ink text-white hover:bg-plum'
                    : 'bg-ink/40 text-white/70 cursor-not-allowed'
                }`}
              >
                {addedFeedback ? (
                  <>
                    <Check size={16} strokeWidth={2} />
                    Added
                  </>
                ) : (
                  <>
                    <ShoppingBag size={16} strokeWidth={1.5} />
                    Add to Bag
                  </>
                )}
              </button>
            </div>

            {!selectedSize && sizes.length > 0 && (
              <p className="mt-2 text-[11px] font-light tracking-[0.5px] text-muted">
                Please select a size to add to bag
              </p>
            )}

            <div className="mt-5 flex items-center gap-2">
              <Check size={14} strokeWidth={2} className="text-gold" />
              <span className="text-[12px] font-light tracking-[0.5px] text-muted">
                Complimentary delivery in 3–5 business days
              </span>
            </div>

            {/* Accordions */}
            <div className="mt-10">
              {Object.entries(product.details).map(([title, items], i) => (
                <Accordion key={title} title={title} items={items} defaultOpen={i === 0} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* You may also like — placeholder */}
      <section className="border-t border-border">
        <div className="px-5 sm:px-8 lg:px-12 pt-16 pb-6">
          <h2 className="font-serif text-lg font-medium tracking-[1px] text-ink">
            You May Also Like
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 px-5 sm:px-8 lg:px-12 pb-14">
          {['Cognac Penny Loafer', 'Black Cap-Toe Oxford', 'Ivory Dress Shirt'].map((name) => (
            <div key={name}>
              <div className="aspect-[3/4] flex flex-col items-center justify-center border border-border/40" style={{ background: 'linear-gradient(145deg, #f0eeeb, #e8e4e0)' }}>
                <svg viewBox="0 0 24 24" className="h-8 w-8 stroke-[#c0b5b0] stroke-1 fill-none opacity-40">
                  <rect x="3" y="3" width="18" height="18" rx="1"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>
                </svg>
                <span className="mt-3 font-serif text-[10px] tracking-[0.2em] uppercase text-[#b8a8a3]">Coming Soon</span>
              </div>
              <div className="mt-4">
                <span className="font-serif text-[15px] font-medium tracking-[0.5px] text-ink/40">{name}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
