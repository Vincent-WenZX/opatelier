import { Suspense } from "react"

import { listCollections } from "@lib/data/collections"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"

export default async function Nav() {
  const { collections } = await listCollections({
    fields: "id,handle,title",
  })

  return (
    <div className="sticky top-0 inset-x-0 z-50 bg-white">
      <header className="relative h-20 mx-auto">
        <nav className="flex items-center justify-between w-full h-full px-8 text-neutral-900">
          {/* Left: Logo + Brand Name */}
          <div className="flex items-center gap-3 flex-1 basis-0">
            <LocalizedClientLink
              href="/"
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              data-testid="nav-store-link"
            >
              <span className="text-xs tracking-[0.3em] font-serif uppercase">
                Orchid & Plum
              </span>
            </LocalizedClientLink>
          </div>

          {/* Center: Collection Links */}
          <div className="hidden small:flex items-center gap-x-8">
            {collections?.map((collection) => (
              <LocalizedClientLink
                key={collection.id}
                href={`/collections/${collection.handle}`}
                className="text-xs tracking-[0.2em] uppercase hover:opacity-70 transition-opacity"
              >
                {collection.title}
              </LocalizedClientLink>
            ))}
          </div>

          {/* Right: Search + Cart */}
          <div className="flex items-center gap-x-5 flex-1 basis-0 justify-end">
            {/* Search Icon */}
            <button
              className="hover:opacity-70 transition-opacity"
              aria-label="Search"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                />
              </svg>
            </button>

            {/* Cart Icon */}
            <Suspense
              fallback={
                <LocalizedClientLink
                  className="hover:opacity-70 transition-opacity"
                  href="/cart"
                  data-testid="nav-cart-link"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                    />
                  </svg>
                </LocalizedClientLink>
              }
            >
              <CartButton />
            </Suspense>
          </div>
        </nav>
      </header>
    </div>
  )
}
