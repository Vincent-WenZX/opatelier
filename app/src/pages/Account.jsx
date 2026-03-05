import { Link } from 'react-router-dom'
import { ChevronLeft, MapPin, Phone, Mail, Package, CreditCard, Heart } from 'lucide-react'

const PROFILE = {
  name: 'Yuquan "Larry" Li',
  title: 'Founder & Creative Director',
  email: 'larry.li@orchidandplum.com',
  phone: '+1 (212) 555-0188',
  address: '88 Prince Street, SoHo, New York, NY 10012',
  memberSince: 'January 2024',
  tier: 'Orchid Circle',
}

const ORDERS = [
  { id: 'OP-20240089', date: 'Feb 18, 2025', item: 'Dark Brown Oxford', size: '9.5', price: 489, status: 'Delivered' },
  { id: 'OP-20240061', date: 'Dec 12, 2024', item: 'Charcoal Wool Trousers', size: '32', price: 395, status: 'Delivered' },
]

const WISHLIST = [
  { name: 'Cognac Penny Loafer', material: 'Horween Shell Cordovan', price: 425 },
  { name: 'Ivory Dress Shirt', material: 'Sea Island Cotton', price: 245 },
]

const ADDRESSES = [
  { label: 'Home', address: '88 Prince Street, SoHo, New York, NY 10012', default: true },
  { label: 'Office', address: '401 Park Avenue South, Floor 12, New York, NY 10016', default: false },
]

export default function Account() {
  return (
    <main className="pt-16">
      {/* Header */}
      <div className="border-b border-border bg-surface px-5 sm:px-8 lg:px-12 pt-12 pb-10">
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-1.5 text-[11px] tracking-[2px] uppercase text-muted transition-colors hover:text-gold"
        >
          <ChevronLeft size={14} strokeWidth={1.5} />
          Back
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <div>
            <p className="text-[11px] tracking-[2px] uppercase text-gold mb-2">{PROFILE.tier}</p>
            <h1 className="font-serif text-3xl font-medium tracking-[1px] text-ink lg:text-4xl">
              {PROFILE.name}
            </h1>
            <p className="mt-2 text-[13px] font-light tracking-[0.5px] text-muted">
              {PROFILE.title}
            </p>
          </div>
          <p className="text-[11px] font-light tracking-[1px] text-muted">
            Member since {PROFILE.memberSince}
          </p>
        </div>
      </div>

      <div className="px-5 sm:px-8 lg:px-12 py-10 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-14">

          {/* Left column — Contact & Addresses */}
          <div className="space-y-10">
            {/* Contact */}
            <section>
              <h2 className="text-[11px] tracking-[2px] uppercase text-muted mb-5">Contact</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail size={15} strokeWidth={1.5} className="text-muted mt-0.5 shrink-0" />
                  <span className="text-[13px] font-light tracking-[0.3px] text-ink">{PROFILE.email}</span>
                </div>
                <div className="flex items-start gap-3">
                  <Phone size={15} strokeWidth={1.5} className="text-muted mt-0.5 shrink-0" />
                  <span className="text-[13px] font-light tracking-[0.3px] text-ink">{PROFILE.phone}</span>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin size={15} strokeWidth={1.5} className="text-muted mt-0.5 shrink-0" />
                  <span className="text-[13px] font-light tracking-[0.3px] text-ink">{PROFILE.address}</span>
                </div>
              </div>
            </section>

            {/* Addresses */}
            <section>
              <h2 className="text-[11px] tracking-[2px] uppercase text-muted mb-5">Saved Addresses</h2>
              <div className="space-y-4">
                {ADDRESSES.map((addr) => (
                  <div key={addr.label} className="border border-border p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[12px] font-medium tracking-[0.5px] text-ink">{addr.label}</span>
                      {addr.default && (
                        <span className="px-2 py-0.5 text-[9px] tracking-[1px] uppercase bg-gold/10 text-gold">Default</span>
                      )}
                    </div>
                    <p className="text-[12px] font-light tracking-[0.3px] text-muted leading-relaxed">{addr.address}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Payment */}
            <section>
              <h2 className="text-[11px] tracking-[2px] uppercase text-muted mb-5">Payment</h2>
              <div className="flex items-center gap-3 border border-border p-4">
                <CreditCard size={18} strokeWidth={1.5} className="text-muted shrink-0" />
                <div>
                  <p className="text-[12px] font-medium tracking-[0.5px] text-ink">Visa ending in 4829</p>
                  <p className="text-[11px] font-light tracking-[0.3px] text-muted">Expires 08/27</p>
                </div>
              </div>
            </section>
          </div>

          {/* Center + Right — Orders & Wishlist */}
          <div className="lg:col-span-2 space-y-10">
            {/* Orders */}
            <section>
              <div className="flex items-center gap-2 mb-5">
                <Package size={15} strokeWidth={1.5} className="text-muted" />
                <h2 className="text-[11px] tracking-[2px] uppercase text-muted">Order History</h2>
              </div>
              <div className="border border-border divide-y divide-border">
                {ORDERS.map((order) => (
                  <div key={order.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-[13px] font-medium tracking-[0.3px] text-ink">{order.item}</span>
                        <span className="text-[11px] font-light text-muted">Size {order.size}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] font-light tracking-[0.5px] text-muted">{order.id}</span>
                        <span className="h-0.5 w-0.5 rounded-full bg-muted/50" />
                        <span className="text-[11px] font-light tracking-[0.5px] text-muted">{order.date}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-5">
                      <span className="font-serif text-[15px] tracking-[0.5px] text-ink">${order.price}</span>
                      <span className="px-3 py-1 text-[10px] tracking-[1px] uppercase border border-border text-muted">
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Wishlist */}
            <section>
              <div className="flex items-center gap-2 mb-5">
                <Heart size={15} strokeWidth={1.5} className="text-muted" />
                <h2 className="text-[11px] tracking-[2px] uppercase text-muted">Wishlist</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {WISHLIST.map((item) => (
                  <div key={item.name} className="border border-border p-5">
                    <div className="aspect-[4/3] mb-4 flex items-center justify-center" style={{ background: 'linear-gradient(145deg, #f0eeeb, #e8e4e0)' }}>
                      <svg viewBox="0 0 24 24" className="h-7 w-7 stroke-[#c0b5b0] stroke-1 fill-none opacity-40">
                        <rect x="3" y="3" width="18" height="18" rx="1"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>
                      </svg>
                    </div>
                    <h3 className="font-serif text-[14px] font-medium tracking-[0.5px] text-ink">{item.name}</h3>
                    <p className="mt-1 text-[11px] font-light tracking-[0.8px] text-muted">{item.material}</p>
                    <p className="mt-2 font-serif text-[14px] tracking-[0.5px] text-ink">${item.price}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
