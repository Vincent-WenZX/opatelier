import { Link } from 'react-router-dom'
import { Minus, Plus, X, ArrowRight, ShoppingBag } from 'lucide-react'
import { useCart } from '../context/CartContext'

export default function Cart() {
  const { items, itemCount, subtotal, updateQuantity, removeItem } = useCart()

  if (items.length === 0) {
    return (
      <main className="pt-16">
        <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center px-5">
          <ShoppingBag size={48} strokeWidth={1} className="text-muted" />
          <h1 className="mt-6 font-serif text-2xl font-medium tracking-[1px] text-ink">
            Your bag is empty
          </h1>
          <p className="mt-3 text-[13px] font-light tracking-[0.5px] text-muted">
            Explore our collection to find something you love
          </p>
          <Link
            to="/collection"
            className="mt-8 flex items-center gap-2 border border-ink px-8 py-3 text-[11px] tracking-[2px] uppercase text-ink transition-colors hover:bg-ink hover:text-white"
          >
            Shop Now
            <ArrowRight size={14} strokeWidth={1.5} />
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="pt-16">
      <div className="px-5 sm:px-8 lg:px-12 pt-10 pb-6">
        <h1 className="font-serif text-2xl font-medium tracking-[1px] text-ink lg:text-3xl">
          Shopping Bag
        </h1>
        <p className="mt-1 text-[13px] font-light tracking-[0.5px] text-muted">
          {itemCount} {itemCount === 1 ? 'item' : 'items'}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-0 lg:gap-12 px-5 sm:px-8 lg:px-12 pb-16">
        {/* Items */}
        <div className="flex-1">
          <div className="divide-y divide-border border-y border-border">
            {items.map((item) => (
              <div key={item.key} className="flex gap-5 py-6 sm:gap-6">
                <Link
                  to={`/product/${item.product.slug}`}
                  className="h-28 w-24 shrink-0 overflow-hidden sm:h-36 sm:w-28"
                  style={{ background: item.product.images.product.bg || '#F2F2F2' }}
                >
                  <img
                    src={item.product.images.product.src}
                    alt={item.product.name}
                    className="h-full w-full"
                    style={{
                      objectFit: item.product.images.product.fit === 'contain' ? 'contain' : 'cover',
                      objectPosition: item.product.images.product.position || 'center',
                      padding: item.product.images.product.fit === 'contain' ? '8px' : 0,
                    }}
                  />
                </Link>

                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Link
                          to={`/product/${item.product.slug}`}
                          className="font-serif text-[15px] font-medium tracking-[0.5px] text-ink hover:text-gold transition-colors"
                        >
                          {item.product.name}
                        </Link>
                        <p className="mt-0.5 text-[12px] font-light tracking-[0.5px] text-muted">
                          Size: {item.size}
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item.key)}
                        className="shrink-0 p-1 text-muted transition-colors hover:text-ink"
                        aria-label="Remove item"
                      >
                        <X size={16} strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-end justify-between">
                    <div className="flex items-center border border-border">
                      <button
                        onClick={() => updateQuantity(item.key, item.quantity - 1)}
                        className="flex h-8 w-8 items-center justify-center text-muted transition-colors hover:text-ink"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={14} strokeWidth={1.5} />
                      </button>
                      <span className="flex h-8 w-8 items-center justify-center text-[12px] tracking-[1px] text-ink">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.key, item.quantity + 1)}
                        className="flex h-8 w-8 items-center justify-center text-muted transition-colors hover:text-ink"
                        aria-label="Increase quantity"
                      >
                        <Plus size={14} strokeWidth={1.5} />
                      </button>
                    </div>
                    <span className="font-serif text-[16px] tracking-[0.5px] text-ink">
                      ${item.product.price * item.quantity}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="mt-8 w-full lg:mt-0 lg:w-80 xl:w-96 shrink-0">
          <div className="sticky top-24 border border-border bg-off-white p-6 sm:p-8">
            <h2 className="font-serif text-lg font-medium tracking-[0.5px] text-ink">
              Order Summary
            </h2>

            <div className="mt-6 space-y-3">
              <div className="flex justify-between text-[13px]">
                <span className="font-light tracking-[0.5px] text-muted">Subtotal</span>
                <span className="tracking-[0.5px] text-ink">${subtotal}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="font-light tracking-[0.5px] text-muted">Shipping</span>
                <span className="tracking-[0.5px] text-gold">Complimentary</span>
              </div>
            </div>

            <div className="mt-6 border-t border-border pt-4">
              <div className="flex justify-between">
                <span className="font-serif text-[16px] font-medium text-ink">Total</span>
                <span className="font-serif text-[18px] tracking-[1px] text-ink">${subtotal}</span>
              </div>
            </div>

            <Link
              to="/checkout"
              className="mt-8 flex h-12 w-full items-center justify-center gap-2 bg-ink text-[11px] tracking-[2px] uppercase text-white transition-colors hover:bg-plum"
            >
              Proceed to Checkout
              <ArrowRight size={14} strokeWidth={1.5} />
            </Link>

            <Link
              to="/collection"
              className="mt-3 flex h-10 w-full items-center justify-center text-[11px] tracking-[1.5px] uppercase text-muted transition-colors hover:text-gold"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
