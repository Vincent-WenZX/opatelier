import { Suspense } from "react"

import Image from "next/image"
import { SITE_NAME } from "@lib/constants"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import SideMenu from "@modules/layout/components/side-menu"

const navLinks = [
  { title: "Store", href: "/store" },
  { title: "Men", href: "/store/men" },
  { title: "New Arrivals", href: "/store/new-arrivals" },
  { title: "Craftsmanship", href: "/craftsmanship" },
]

export default async function Nav() {
  return (
    <div className="sticky top-0 inset-x-0 z-50 group">
      <div className="absolute inset-0 bg-brand-light/80 backdrop-blur-md border-b border-brand-dark transition-all duration-300 group-hover:bg-brand-light/95" />
      <header className="relative h-24 mx-auto duration-300">
        <nav className="flex items-center justify-between w-full h-full px-8 text-brand-text">
          {/* Left: Mobile Menu & Logo */}
          <div className="flex items-center flex-1 basis-0">
            <div className="small:hidden mr-4">
              <SideMenu regions={null} locales={null} currentLocale={null} />
            </div>
            <LocalizedClientLink
              href="/"
              className="flex items-center gap-3 group/logo"
              data-testid="nav-store-link"
            >
              <Image
                src="/logo_icon.png"
                alt={SITE_NAME}
                width={40}
                height={36}
                className="h-10 w-auto group-hover/logo:opacity-80 transition-opacity duration-300"
              />
              <span className="text-sm tracking-[0.25em] font-serif uppercase group-hover/logo:text-brand-accent transition-colors duration-300">
                {SITE_NAME}
              </span>
            </LocalizedClientLink>
          </div>

          {/* Center: Collection Links (Desktop) */}
          <div className="hidden small:flex items-center gap-x-12">
            {navLinks.map((link) => (
              <LocalizedClientLink
                key={link.title}
                href={link.href}
                className="relative text-xs tracking-[0.15em] uppercase font-medium text-brand-muted hover:text-brand-text transition-colors duration-300 overflow-hidden group/link py-2"
              >
                {link.title}
                <span className="absolute bottom-0 left-0 w-full h-[1px] bg-brand-accent -translate-x-[101%] group-hover/link:translate-x-0 transition-transform duration-300 ease-out" />
              </LocalizedClientLink>
            ))}
          </div>

          {/* Right: Cart */}
          <div className="flex items-center gap-x-6 flex-1 basis-0 justify-end">
            <Suspense
              fallback={
                <LocalizedClientLink
                  className="hover:text-brand-accent transition-colors duration-300"
                  href="/cart"
                  data-testid="nav-cart-link"
                >
                  <span className="text-xs tracking-widest uppercase font-medium">Cart (0)</span>
                </LocalizedClientLink>
              }
            >
              <div className="hover:text-brand-accent transition-colors duration-300 flex items-center">
                <CartButton />
              </div>
            </Suspense>
          </div>
        </nav>
      </header>
    </div>
  )
}
