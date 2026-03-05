import { Link } from 'react-router-dom'
import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import products from '../data/products'

function ProductImage({ image, alt }) {
  return (
    <img
      src={image.src}
      alt={alt}
      className="h-full w-full transition-transform duration-[800ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] will-change-transform group-hover:scale-[1.02]"
      style={{
        objectFit: image.fit,
        objectPosition: image.position || 'center',
      }}
    />
  )
}

function ProductHero({ name, material, price, slug, productImg, lifestyleImg, reverse = false }) {
  const [flipped, setFlipped] = useState(false)
  const productBg = productImg.bg || '#FAFAFA'
  const lifestyleBg = lifestyleImg.bg || '#F2F2F2'

  const imgA = reverse ? lifestyleImg : productImg
  const imgB = reverse ? productImg : lifestyleImg
  const bgA = reverse ? lifestyleBg : productBg
  const bgB = reverse ? productBg : lifestyleBg

  const mobileImg = flipped ? imgB : imgA
  const mobileBg = flipped ? bgB : bgA

  return (
    <section>
      <div
        className="relative flex flex-col md:flex-row"
        style={{ height: 'clamp(400px, calc(100vh - 136px), 900px)' }}
      >
        {/* Mobile: single image, tap to toggle */}
        <div
          className="relative flex-1 min-h-0 overflow-hidden md:hidden cursor-pointer"
          style={{ background: mobileBg }}
          onClick={() => setFlipped(!flipped)}
        >
          {/* Both images stacked, crossfade */}
          <img
            src={imgA.src}
            alt={`${name} — A`}
            className="absolute inset-0 h-full w-full transition-opacity duration-700 ease-out"
            style={{
              objectFit: imgA.fit,
              objectPosition: imgA.position || 'center',
              opacity: flipped ? 0 : 1,
            }}
          />
          <img
            src={imgB.src}
            alt={`${name} — B`}
            className="absolute inset-0 h-full w-full transition-opacity duration-700 ease-out"
            style={{
              objectFit: imgB.fit,
              objectPosition: imgB.position || 'center',
              opacity: flipped ? 1 : 0,
            }}
          />
          {/* Tap hint dot */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            <span className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 ${!flipped ? 'bg-ink/60' : 'bg-ink/20'}`} />
            <span className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 ${flipped ? 'bg-ink/60' : 'bg-ink/20'}`} />
          </div>
        </div>

        {/* Desktop: dual panel (unchanged) */}
        <Link
          to={`/product/${slug}`}
          className="group relative flex-1 min-h-0 overflow-hidden hidden md:block"
          style={{ background: bgA }}
        >
          <ProductImage image={imgA} alt={`${name} — ${reverse ? 'Lifestyle' : 'Product'}`} />
        </Link>
        <Link
          to={`/product/${slug}`}
          className="group relative flex-1 min-h-0 overflow-hidden hidden md:block"
          style={{ background: bgB }}
        >
          <ProductImage image={imgB} alt={`${name} — ${reverse ? 'Product' : 'Lifestyle'}`} />
        </Link>
      </div>

      {/* Info bar — desktop: full link, mobile: info + details button */}
      <div className="flex h-[72px] items-center justify-between border-t border-border px-5 sm:px-8 lg:px-12 bg-surface">
        {/* Desktop: entire bar is a link */}
        <Link to={`/product/${slug}`} className="hidden md:flex flex-1 items-center justify-between h-full group">
          <div className="flex items-baseline gap-4">
            <span className="font-serif text-lg font-medium tracking-[0.5px] text-ink">{name}</span>
            <span className="h-3.5 w-px bg-gold-light" />
            <span className="text-[12.5px] font-light tracking-[1px] text-muted">{material}</span>
          </div>
          <span className="font-serif text-xl tracking-[1px] text-ink">${price}</span>
        </Link>

        {/* Mobile: info + details button */}
        <div className="flex md:hidden flex-1 items-center justify-between h-full">
          <div>
            <span className="font-serif text-[15px] font-medium tracking-[0.5px] text-ink block">{name}</span>
            <span className="font-serif text-[14px] tracking-[0.5px] text-muted">${price}</span>
          </div>
          <Link
            to={`/product/${slug}`}
            className="flex items-center gap-1.5 px-4 py-2 text-[10px] tracking-[2px] uppercase border border-border text-ink transition-colors hover:border-gold hover:text-gold"
          >
            Details
            <ArrowRight size={12} strokeWidth={1.5} />
          </Link>
        </div>
      </div>
    </section>
  )
}

const PHOTO_SVG = (
  <svg viewBox="0 0 24 24" className="h-8 w-8 stroke-[#c0b5b0] stroke-1 fill-none opacity-40">
    <rect x="3" y="3" width="18" height="18" rx="1"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>
  </svg>
)

function PlaceholderHero({ name, material, price }) {
  return (
    <section>
      <div
        className="relative flex flex-col md:flex-row"
        style={{ height: 'clamp(400px, calc(100vh - 136px), 900px)' }}
      >
        <div className="flex-1 min-h-0 flex items-center justify-center" style={{ background: 'linear-gradient(145deg, #f0eeeb, #e8e4e0)' }}>
          <div className="flex flex-col items-center gap-3">
            {PHOTO_SVG}
            <span className="font-serif text-[10px] tracking-[0.2em] uppercase text-[#b8a8a3]">Product Photo</span>
          </div>
        </div>
        <div className="hidden md:flex flex-1 min-h-0 items-center justify-center" style={{ background: 'linear-gradient(145deg, #ebe7e3, #e3ddd8)' }}>
          <div className="flex flex-col items-center gap-3">
            {PHOTO_SVG}
            <span className="font-serif text-[10px] tracking-[0.2em] uppercase text-[#b8a8a3]">Lifestyle Photo</span>
          </div>
        </div>
      </div>

      <div className="flex h-[72px] items-center justify-between border-t border-border px-5 sm:px-8 lg:px-12 bg-surface">
        <div className="flex items-baseline gap-4">
          <span className="font-serif text-lg font-medium tracking-[0.5px] text-ink/40">{name}</span>
          <span className="hidden sm:block h-3.5 w-px bg-gold-light/40" />
          <span className="hidden sm:block text-[12.5px] font-light tracking-[1px] text-muted/50">{material}</span>
        </div>
        <span className="font-serif text-xl tracking-[1px] text-ink/40">${price}</span>
      </div>
    </section>
  )
}

const SHOWCASE_ITEMS = [
  {
    name: 'Dark Brown Oxford',
    material: 'Italian Calf Leather · Hand-Stitched',
    price: 489,
    slug: 'dark-brown-oxford',
  },
  {
    name: 'Midnight Suede Loafer',
    material: 'French Suede · Blake Construction',
    price: 425,
    slug: 'cognac-penny-loafer',
    reverse: true,
    placeholder: true,
  },
  {
    name: 'Charcoal Double Monk',
    material: 'Museum Calf · Hand-Burnished Buckle',
    price: 595,
    slug: 'black-cap-toe-oxford',
    placeholder: true,
  },
  {
    name: 'Cognac Wholecut Oxford',
    material: 'Horween Shell Cordovan · Single Piece',
    price: 720,
    slug: 'cognac-penny-loafer',
    reverse: true,
    placeholder: true,
  },
  {
    name: 'Espresso Chelsea Boot',
    material: 'Italian Grain Leather · Goodyear Welted',
    price: 635,
    slug: 'dark-brown-oxford',
    placeholder: true,
  },
  {
    name: 'Slate Grey Derby',
    material: 'Pebble Grain Calf · Storm Welt',
    price: 510,
    slug: 'black-cap-toe-oxford',
    reverse: true,
    placeholder: true,
  },
]

export default function Home() {
  const firstProduct = products[0]

  return (
    <main className="pt-16">
      {SHOWCASE_ITEMS.map((item, i) => {
        if (item.placeholder) {
          return (
            <PlaceholderHero
              key={i}
              name={item.name}
              material={item.material}
              price={item.price}
            />
          )
        }
        const linkedProduct = products.find((p) => p.slug === item.slug) || firstProduct
        return (
          <ProductHero
            key={i}
            name={item.name}
            material={item.material}
            price={item.price}
            slug={item.slug}
            productImg={linkedProduct.images.product}
            lifestyleImg={linkedProduct.images.lifestyle}
            reverse={item.reverse || false}
          />
        )
      })}
    </main>
  )
}
