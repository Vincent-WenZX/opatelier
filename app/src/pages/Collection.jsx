import { useParams, Link } from 'react-router-dom'
import { useState } from 'react'
import products from '../data/products'

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'men', label: 'Men' },
  { key: 'new-arrivals', label: 'New Arrivals' },
]

const TYPES = [
  { key: 'all', label: 'All' },
  { key: 'shoes', label: 'Shoes' },
  { key: 'suits', label: 'Suits & Blazers' },
  { key: 'shirts', label: 'Shirts' },
]

export default function Collection() {
  const { category } = useParams()
  const [typeFilter, setTypeFilter] = useState('all')
  const [sortBy, setSortBy] = useState('featured')

  const activeCategory = category || 'all'

  let filtered = products.filter((p) => {
    if (activeCategory !== 'all' && activeCategory !== 'new-arrivals') {
      if (p.category !== activeCategory) return false
    }
    if (typeFilter !== 'all' && p.type !== typeFilter) return false
    return true
  })

  if (sortBy === 'price-asc') filtered.sort((a, b) => a.price - b.price)
  if (sortBy === 'price-desc') filtered.sort((a, b) => b.price - a.price)
  if (sortBy === 'name') filtered.sort((a, b) => a.name.localeCompare(b.name))

  const categoryTitle = CATEGORIES.find((c) => c.key === activeCategory)?.label || 'Collection'

  return (
    <main className="pt-16">
      {/* Header */}
      <div className="border-b border-border bg-surface px-5 sm:px-8 lg:px-12 pt-12 pb-8">
        <h1 className="font-serif text-3xl font-medium tracking-[1px] text-ink lg:text-4xl">
          {activeCategory === 'all' ? 'The Collection' : categoryTitle}
        </h1>
        <p className="mt-3 max-w-lg text-[13px] font-light leading-relaxed tracking-[0.3px] text-muted">
          Handcrafted pieces in the finest materials — designed to endure, styled to inspire.
        </p>
      </div>

      {/* Filters bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-5 sm:px-8 lg:px-12 py-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* Category pills */}
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.key}
              to={cat.key === 'all' ? '/collection' : `/collection/${cat.key}`}
              className={`px-4 py-1.5 text-[11px] tracking-[1.5px] uppercase transition-colors duration-300 ${
                activeCategory === cat.key
                  ? 'bg-ink text-white'
                  : 'border border-border text-muted hover:border-gold hover:text-gold'
              }`}
            >
              {cat.label}
            </Link>
          ))}

          <span className="mx-2 hidden h-4 w-px bg-border sm:block" />

          {/* Type pills */}
          {TYPES.map((type) => (
            <button
              key={type.key}
              onClick={() => setTypeFilter(type.key)}
              className={`px-4 py-1.5 text-[11px] tracking-[1.5px] uppercase transition-colors duration-300 ${
                typeFilter === type.key
                  ? 'bg-ink text-white'
                  : 'border border-border text-muted hover:border-gold hover:text-gold'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="appearance-none border border-border bg-transparent px-4 py-1.5 text-[11px] tracking-[1.5px] uppercase text-muted outline-none cursor-pointer hover:border-gold focus:border-gold"
        >
          <option value="featured">Featured</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="name">Name</option>
        </select>
      </div>

      {/* Product Grid */}
      <div className="px-5 sm:px-8 lg:px-12 py-10 lg:py-14">
        {filtered.length === 0 ? (
          <div className="py-20 text-center">
            <p className="font-serif text-xl text-ink">No products found</p>
            <p className="mt-2 text-[13px] font-light text-muted">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

function ProductCard({ product }) {
  const [hovered, setHovered] = useState(false)
  const primary = product.images.product
  const secondary = product.images.lifestyle

  if (product.placeholder) {
    return (
      <div className="group block">
        <div className="relative aspect-[3/4] overflow-hidden border border-border/40" style={{ background: 'linear-gradient(145deg, #f0eeeb, #e8e4e0)' }}>
          <div className="flex h-full flex-col items-center justify-center gap-3">
            <svg viewBox="0 0 24 24" className="h-8 w-8 stroke-[#c0b5b0] stroke-1 fill-none opacity-50">
              <rect x="3" y="3" width="18" height="18" rx="1"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>
            </svg>
            <span className="font-serif text-[10px] tracking-[0.2em] uppercase text-[#b8a8a3]">Coming Soon</span>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="font-serif text-[16px] font-medium tracking-[0.5px] text-ink/40">
              {product.name}
            </h3>
            <span className="shrink-0 font-serif text-[16px] tracking-[0.5px] text-ink/40">
              ${product.price}
            </span>
          </div>
          <p className="mt-1 text-[12px] font-light tracking-[0.8px] text-muted/50">
            {product.material}
          </p>
        </div>
      </div>
    )
  }

  return (
    <Link
      to={`/product/${product.slug}`}
      className="group block"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="relative aspect-[3/4] overflow-hidden"
        style={{ background: primary.bg || '#F2F2F2' }}
      >
        {/* Primary image */}
        <img
          src={primary.src}
          alt={product.name}
          className="absolute inset-0 h-full w-full transition-all duration-[900ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
          style={{
            objectFit: primary.fit === 'contain' ? 'contain' : 'cover',
            objectPosition: primary.position || 'center',
            padding: primary.fit === 'contain' ? '24px' : 0,
            opacity: hovered ? 0 : 1,
            transform: hovered ? 'scale(1.03)' : 'scale(1)',
          }}
        />
        {/* Secondary (lifestyle) image — crossfade in */}
        <img
          src={secondary.src}
          alt={product.name}
          className="absolute inset-0 h-full w-full transition-all duration-[900ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
          style={{
            objectFit: secondary.fit === 'contain' ? 'contain' : 'cover',
            objectPosition: secondary.position || 'center',
            padding: secondary.fit === 'contain' ? '24px' : 0,
            opacity: hovered ? 1 : 0,
            transform: hovered ? 'scale(1)' : 'scale(0.97)',
          }}
        />
      </div>
      <div className="mt-4">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-serif text-[16px] font-medium tracking-[0.5px] text-ink">
            {product.name}
          </h3>
          <span className="shrink-0 font-serif text-[16px] tracking-[0.5px] text-ink">
            ${product.price}
          </span>
        </div>
        <p className="mt-1 text-[12px] font-light tracking-[0.8px] text-muted">
          {product.material}
        </p>
      </div>
    </Link>
  )
}
