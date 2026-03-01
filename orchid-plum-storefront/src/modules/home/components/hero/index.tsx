import { HttpTypes } from "@medusajs/types"
import { getProductPrice } from "@lib/util/get-product-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Image from "next/image"

type ProductShowcaseProps = {
  products: HttpTypes.StoreProduct[]
}

const ProductShowcase = ({ products }: ProductShowcaseProps) => {
  if (!products?.length) {
    return null
  }

  return (
    <div>
      {products.map((product) => {
        const { cheapestPrice } = getProductPrice({ product })
        const images = product.images || []
        const thumbnail = product.thumbnail || images[0]?.url || null
        const secondImage = images.length > 1 ? images[1].url : null

        return (
          <LocalizedClientLink
            key={product.id}
            href={`/products/${product.handle}`}
            className="block"
          >
            <section className="relative h-[calc(100vh-5rem)] w-full">
              {/* 50/50 Image Grid */}
              <div className="flex h-[calc(100%-4rem)] small:flex-row flex-col">
                {/* Left Image */}
                <div className="relative w-full small:w-1/2 h-1/2 small:h-full bg-neutral-100">
                  {thumbnail && (
                    <Image
                      src={thumbnail}
                      alt={product.title || ""}
                      fill
                      className="object-cover"
                      sizes="50vw"
                    />
                  )}
                </div>

                {/* Right Image */}
                <div className="relative w-full small:w-1/2 h-1/2 small:h-full bg-neutral-200">
                  {(secondImage || thumbnail) && (
                    <Image
                      src={secondImage || thumbnail!}
                      alt={`${product.title} styled` || ""}
                      fill
                      className="object-cover"
                      sizes="50vw"
                    />
                  )}
                </div>
              </div>

              {/* Product Info Bar */}
              <div className="h-16 flex items-center justify-between px-8 bg-white">
                <div className="flex items-center gap-3">
                  <h2 className="font-serif text-sm tracking-wide text-neutral-900">
                    {product.title}
                  </h2>
                  {product.subtitle && (
                    <>
                      <span className="text-neutral-300">|</span>
                      <p className="text-xs text-neutral-500 tracking-wide">
                        {product.subtitle}
                      </p>
                    </>
                  )}
                </div>
                <div className="text-sm tracking-wide text-neutral-900">
                  {cheapestPrice?.calculated_price || ""}
                </div>
              </div>
            </section>
          </LocalizedClientLink>
        )
      })}
    </div>
  )
}

export default ProductShowcase
