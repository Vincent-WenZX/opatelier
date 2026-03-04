import { HttpTypes } from "@medusajs/types"
import { getProductPrice } from "@lib/util/get-product-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Image from "next/image"
import FadeIn from "@modules/common/components/fade-in"

type ProductShowcaseProps = {
  products: HttpTypes.StoreProduct[]
}

const ProductShowcase = ({ products }: ProductShowcaseProps) => {
  if (!products?.length) {
    return null
  }

  // Use the first product as the Hero Product (e.g., the Oxford Shoe)
  const heroProduct = products[0]
  const remainingProducts = products.slice(1)
  const heroPrice = getProductPrice({ product: heroProduct })?.cheapestPrice
  const heroThumbnail = heroProduct.thumbnail || heroProduct.images?.[0]?.url

  return (
    <div className="flex flex-col bg-brand-light">

      {/* 1. INITIAL HERO VIEWPORT - 50/50 SPLIT (Apple Style) */}
      <div className="relative w-full min-h-screen flex flex-col md:flex-row overflow-hidden">

        {/* Left: Content & Animation Area (50%) */}
        <div className="w-full md:w-1/2 flex flex-col justify-center px-8 md:pl-16 lg:pl-24 py-20 md:py-0 z-10 bg-brand-light">

          <div className="max-w-xl">
            <FadeIn direction="up" delay={0.6}>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-brand-text leading-[1.1] mb-6">
                {heroProduct.title}
              </h1>
            </FadeIn>

            <FadeIn direction="up" delay={0.8}>
              <p className="text-brand-muted text-lg md:text-xl mb-10 leading-relaxed font-light">
                {heroProduct.subtitle || "The epitome of modern craftsmanship. Step into elegance with our latest arrivals designed for the modern gentleman."}
              </p>

              <LocalizedClientLink
                href={`/products/${heroProduct.handle}`}
                className="group relative inline-flex items-center gap-4 text-brand-text hover:text-brand-accent transition-all duration-300 uppercase tracking-widest text-sm pb-2"
              >
                <span>Discover the Craft</span>
                <span className="font-semibold text-brand-muted group-hover:text-brand-accent transition-colors">
                  {heroPrice?.calculated_price || ""}
                </span>
                <span className="absolute bottom-0 left-0 w-full h-[1px] bg-brand-accent -translate-x-[101%] group-hover:translate-x-0 transition-transform duration-500 ease-out" />
              </LocalizedClientLink>
            </FadeIn>
          </div>

        </div>

        {/* Right: Massive Hero Image Area (50%) */}
        <div className="w-full md:w-1/2 h-[60vh] md:h-screen relative flex items-center justify-center p-8 lg:p-16 bg-[#f8f8f8]">
          <FadeIn
            direction="left"
            delay={0.4}
            className="relative w-full h-full max-h-[85vh] flex items-center justify-center group"
          >
            {heroThumbnail && (
              <Image
                src={heroThumbnail}
                alt={heroProduct.title || "Featured Product"}
                fill
                className="object-contain drop-shadow-2xl transition-transform duration-[2000ms] ease-out group-hover:scale-[1.02]"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            )}
          </FadeIn>
        </div>
      </div>

      {/* 2. COLLECTION GRID */}
      <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-24">
        <FadeIn direction="up">
          <h2 className="text-3xl font-serif text-brand-text mb-12 text-center">
            The Essentials
          </h2>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
          {remainingProducts.map((product, index) => {
            const { cheapestPrice } = getProductPrice({ product })
            const thumbnail = product.thumbnail || product.images?.[0]?.url

            return (
              <FadeIn
                key={product.id}
                direction="up"
                delay={index * 0.1}
                className="group"
              >
                <LocalizedClientLink href={`/products/${product.handle}`} className="block">
                  <div className="relative w-full aspect-[3/4] overflow-hidden bg-[#f8f8f8] mb-6">
                    {thumbnail && (
                      <Image
                        src={thumbnail}
                        alt={product.title || "Product image"}
                        fill
                        className="object-contain p-4 transition-transform duration-1000 ease-out group-hover:scale-[1.02]"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    )}
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <h3 className="text-lg font-serif text-brand-text hover:text-brand-accent transition-colors">
                      {product.title}
                    </h3>
                    {product.subtitle && (
                      <p className="text-xs text-brand-muted mt-2 uppercase tracking-[0.15em]">
                        {product.subtitle}
                      </p>
                    )}
                    <p className="text-sm tracking-wide text-brand-text mt-3 font-medium">
                      {cheapestPrice?.calculated_price || ""}
                    </p>
                  </div>
                </LocalizedClientLink>
              </FadeIn>
            )
          })}
        </div>
      </div>

    </div>
  )
}

export default ProductShowcase
