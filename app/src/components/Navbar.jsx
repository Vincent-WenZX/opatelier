import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, User, ShoppingBag, X, Menu } from 'lucide-react'
import { useCart } from '../context/CartContext'
import products from '../data/products'

const NAV_LINKS = [
  { label: 'Men', to: '/collection/men' },
  { label: 'New Arrivals', to: '/collection/new-arrivals' },
  { label: 'Craftsmanship', to: '/craftsmanship' },
]

function SearchOverlay({ open, onClose }) {
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      setQuery('')
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const results = query.trim().length > 0
    ? products.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.material.toLowerCase().includes(query.toLowerCase()) ||
        p.type?.toLowerCase().includes(query.toLowerCase())
      )
    : []

  const handleSelect = (slug) => {
    onClose()
    navigate(`/product/${slug}`)
  }

  return (
    <div
      className={`fixed inset-0 z-[200] transition-opacity duration-300 ${
        open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />

      {/* Search panel */}
      <div
        className={`absolute inset-x-0 top-0 bg-surface transition-transform duration-400 ease-out ${
          open ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="flex h-16 items-center gap-4 px-5 sm:px-8 lg:px-12 border-b border-border">
          <Search size={18} strokeWidth={1.5} className="shrink-0 text-muted" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products..."
            className="h-full flex-1 bg-transparent text-[15px] font-light tracking-[0.3px] text-ink outline-none placeholder:text-muted/50"
          />
          <button
            onClick={onClose}
            className="shrink-0 p-1 text-muted transition-colors hover:text-ink"
            aria-label="Close search"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        {/* Results */}
        {query.trim().length > 0 && (
          <div className="max-h-[60vh] overflow-y-auto px-5 sm:px-8 lg:px-12 py-4">
            {results.length === 0 ? (
              <p className="py-8 text-center text-[13px] font-light text-muted">
                No results for &ldquo;{query}&rdquo;
              </p>
            ) : (
              <div className="space-y-1">
                {results.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleSelect(product.slug)}
                    className="flex w-full items-center gap-4 px-2 py-3 text-left transition-colors hover:bg-off-white"
                  >
                    <div
                      className="h-12 w-10 shrink-0 overflow-hidden"
                      style={{ background: product.images.product.bg || '#F2F2F2' }}
                    >
                      <img
                        src={product.images.product.src}
                        alt={product.name}
                        className="h-full w-full"
                        style={{
                          objectFit: product.images.product.fit === 'contain' ? 'contain' : 'cover',
                          padding: product.images.product.fit === 'contain' ? '3px' : 0,
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-[13px] font-medium tracking-[0.3px] text-ink">
                        {product.name}
                      </p>
                      <p className="text-[11px] font-light tracking-[0.5px] text-muted">
                        {product.material}
                      </p>
                    </div>
                    <span className="shrink-0 font-serif text-[14px] tracking-[0.5px] text-ink">
                      ${product.price}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const { itemCount } = useCart()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!searchOpen) {
      document.body.style.overflow = mobileOpen ? 'hidden' : ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen, searchOpen])

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between px-5 sm:px-8 lg:px-12 backdrop-blur-xl transition-shadow duration-400 ${
          scrolled ? 'shadow-[0_1px_8px_rgba(0,0,0,0.06)]' : ''
        }`}
        style={{ background: 'rgba(250,250,250,0.92)' }}
      >
        <Link to="/" className="flex shrink-0 items-center" onClick={() => setMobileOpen(false)}>
          <img src="/images/logo_nav.png" alt="Orchid & Plum" className="h-11 w-auto" />
        </Link>

        <nav className="hidden md:flex items-center gap-10">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className="group relative text-[11.5px] font-normal tracking-[2px] uppercase text-ink"
            >
              {link.label}
              <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-gold transition-all duration-400 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-5">
          <button
            onClick={() => setSearchOpen(true)}
            className="text-ink transition-colors duration-300 hover:text-gold"
            aria-label="Search"
          >
            <Search size={19} strokeWidth={1.5} />
          </button>
          <Link
            to="/account"
            className="text-ink transition-colors duration-300 hover:text-gold"
            aria-label="Account"
          >
            <User size={19} strokeWidth={1.5} />
          </Link>
          <Link
            to="/cart"
            className="relative text-ink transition-colors duration-300 hover:text-gold"
            aria-label="Shopping Bag"
          >
            <ShoppingBag size={19} strokeWidth={1.5} />
            {itemCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center bg-gold text-[9px] font-medium text-white">
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            )}
          </Link>
          <button
            className="flex flex-col justify-center gap-[5px] md:hidden p-1"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? (
              <X size={22} strokeWidth={1.5} />
            ) : (
              <Menu size={22} strokeWidth={1.5} />
            )}
          </button>
        </div>
      </header>

      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 top-16 z-40 flex flex-col items-center justify-center gap-9 backdrop-blur-2xl transition-opacity duration-400 md:hidden ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        style={{ background: 'rgba(250,250,250,0.98)' }}
      >
        {NAV_LINKS.map((link) => (
          <Link
            key={link.label}
            to={link.to}
            className="group relative font-serif text-2xl tracking-[4px] uppercase text-plum"
            onClick={() => setMobileOpen(false)}
          >
            {link.label}
            <span className="absolute bottom-0 left-1/2 h-px w-0 bg-gold transition-all duration-400 group-hover:w-full group-hover:left-0" />
          </Link>
        ))}
      </div>

      {/* Search overlay */}
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
