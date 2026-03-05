import { Link } from 'react-router-dom'

const LINKS = {
  Shop: [
    { label: 'Men', to: '/collection/men' },
    { label: 'New Arrivals', to: '/collection/new-arrivals' },
    { label: 'All Products', to: '/collection' },
  ],
  Company: [
    { label: 'Our Story', to: '#' },
    { label: 'Craftsmanship', to: '#' },
    { label: 'Sustainability', to: '#' },
    { label: 'Careers', to: '#' },
  ],
  Support: [
    { label: 'Contact Us', to: '#' },
    { label: 'Shipping & Returns', to: '#' },
    { label: 'Size Guide', to: '#' },
    { label: 'Order Tracking', to: '/tracking' },
  ],
}

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="px-5 sm:px-8 lg:px-12 py-16 lg:py-20">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="inline-block">
              <img src="/images/logo_nav.png" alt="Orchid & Plum" className="h-10 w-auto" />
            </Link>
            <p className="mt-5 max-w-xs text-[13px] font-light leading-relaxed tracking-[0.3px] text-muted">
              Refined footwear and tailoring, handcrafted from the finest materials. Each piece reflects a commitment to timeless elegance.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-[11px] font-normal tracking-[2.5px] uppercase text-ink">
                {title}
              </h4>
              <ul className="mt-5 space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-[13px] font-light tracking-[0.5px] text-muted transition-colors duration-300 hover:text-gold"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-border pt-8 sm:flex-row sm:items-center">
          <p className="text-[11px] font-light tracking-[1px] text-muted">
            &copy; {new Date().getFullYear()} Orchid & Plum. All rights reserved.
          </p>
          <div className="flex gap-6">
            {['Privacy Policy', 'Terms of Service'].map((text) => (
              <a
                key={text}
                href="#"
                className="text-[11px] font-light tracking-[1px] text-muted transition-colors hover:text-gold"
              >
                {text}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
