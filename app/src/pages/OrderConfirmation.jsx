import { Link } from 'react-router-dom'
import { Check, Package, ArrowRight } from 'lucide-react'
import { useCart } from '../context/CartContext'

export default function OrderConfirmation() {
  const { lastOrder } = useCart()

  if (!lastOrder) {
    return (
      <main className="pt-16">
        <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center px-5">
          <h1 className="font-serif text-2xl font-medium tracking-[1px] text-ink">
            No recent order
          </h1>
          <Link
            to="/"
            className="mt-6 border border-ink px-8 py-3 text-[11px] tracking-[2px] uppercase text-ink transition-colors hover:bg-ink hover:text-white"
          >
            Return Home
          </Link>
        </div>
      </main>
    )
  }

  const order = lastOrder
  const deliveryDate = new Date(order.estimatedDelivery).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <main className="pt-16">
      <div className="flex min-h-[calc(100vh-64px)] flex-col items-center px-5 pt-16 sm:pt-24">
        {/* Success icon */}
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-off-white">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold">
            <Check size={20} strokeWidth={2.5} className="text-white" />
          </div>
        </div>

        <h1 className="mt-6 font-serif text-3xl font-medium tracking-[1px] text-ink lg:text-4xl">
          Thank You
        </h1>
        <p className="mt-3 text-center text-[14px] font-light leading-relaxed tracking-[0.3px] text-muted">
          Your order has been placed successfully
        </p>

        {/* Order details card */}
        <div className="mt-10 w-full max-w-md border border-border bg-off-white p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-normal tracking-[2px] uppercase text-muted">Order Number</p>
              <p className="mt-1 font-serif text-lg font-medium tracking-[0.5px] text-ink">{order.id}</p>
            </div>
            <Package size={24} strokeWidth={1.2} className="text-gold" />
          </div>

          <div className="mt-6 space-y-4 border-t border-border pt-5">
            <div>
              <p className="text-[11px] font-normal tracking-[2px] uppercase text-muted">Shipping To</p>
              <p className="mt-1 text-[13px] font-light leading-relaxed text-ink">
                {order.shippingInfo.firstName} {order.shippingInfo.lastName}<br />
                {order.shippingInfo.address}{order.shippingInfo.apartment ? `, ${order.shippingInfo.apartment}` : ''}<br />
                {order.shippingInfo.city}, {order.shippingInfo.state} {order.shippingInfo.zip}
              </p>
            </div>

            <div>
              <p className="text-[11px] font-normal tracking-[2px] uppercase text-muted">Estimated Delivery</p>
              <p className="mt-1 text-[13px] font-light text-ink">{deliveryDate}</p>
            </div>

            <div>
              <p className="text-[11px] font-normal tracking-[2px] uppercase text-muted">Tracking Number</p>
              <p className="mt-1 text-[13px] font-light text-ink">{order.tracking.number}</p>
            </div>
          </div>

          {/* Items */}
          <div className="mt-6 border-t border-border pt-5">
            <p className="text-[11px] font-normal tracking-[2px] uppercase text-muted">Items</p>
            <div className="mt-3 space-y-3">
              {order.items.map((item) => (
                <div key={item.key} className="flex justify-between text-[13px]">
                  <span className="font-light text-ink">
                    {item.product.name} <span className="text-muted">x{item.quantity}</span>
                  </span>
                  <span className="text-ink">${item.product.price * item.quantity}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-between border-t border-border pt-3">
              <span className="font-serif text-[15px] font-medium text-ink">Total</span>
              <span className="font-serif text-[17px] tracking-[1px] text-ink">${order.total}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col items-center gap-3 pb-16 sm:flex-row">
          <Link
            to={`/tracking/${order.id}`}
            className="flex h-11 items-center gap-2 bg-ink px-8 text-[11px] tracking-[2px] uppercase text-white transition-colors hover:bg-plum"
          >
            Track Order
            <ArrowRight size={14} strokeWidth={1.5} />
          </Link>
          <Link
            to="/collection"
            className="flex h-11 items-center px-8 text-[11px] tracking-[1.5px] uppercase text-muted transition-colors hover:text-gold"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </main>
  )
}
