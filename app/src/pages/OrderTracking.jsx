import { useParams, Link } from 'react-router-dom'
import { useState } from 'react'
import { Check, Package, Truck, MapPin, ChevronLeft, Search } from 'lucide-react'
import { useCart } from '../context/CartContext'

const STEP_ICONS = [Package, Package, Truck, Truck, MapPin]

function TrackingTimeline({ steps }) {
  return (
    <div className="relative">
      {steps.map((step, i) => {
        const Icon = STEP_ICONS[i] || Package
        const isLast = i === steps.length - 1
        const date = new Date(step.date)

        return (
          <div key={i} className="relative flex gap-5">
            {/* Timeline line + dot */}
            <div className="flex flex-col items-center">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center ${
                  step.done
                    ? 'bg-gold text-white'
                    : 'border border-border bg-surface text-muted'
                }`}
              >
                {step.done ? (
                  <Check size={16} strokeWidth={2} />
                ) : (
                  <Icon size={16} strokeWidth={1.5} />
                )}
              </div>
              {!isLast && (
                <div
                  className={`w-px flex-1 min-h-[40px] ${
                    step.done ? 'bg-gold' : 'bg-border'
                  }`}
                />
              )}
            </div>

            {/* Content */}
            <div className={`pb-8 ${isLast ? 'pb-0' : ''}`}>
              <p
                className={`text-[14px] tracking-[0.3px] ${
                  step.done ? 'font-medium text-ink' : 'font-light text-muted'
                }`}
              >
                {step.status}
              </p>
              <p className="mt-0.5 text-[12px] font-light tracking-[0.5px] text-muted">
                {date.toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}{' '}
                {step.done &&
                  `at ${date.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                  })}`}
              </p>
              {step.done && i === 0 && (
                <p className="mt-1 text-[12px] font-light text-gold">
                  Order confirmed and being prepared
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function TrackingLookup() {
  const [trackingInput, setTrackingInput] = useState('')

  return (
    <main className="pt-16">
      <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center px-5">
        <Package size={48} strokeWidth={1} className="text-muted" />
        <h1 className="mt-6 font-serif text-2xl font-medium tracking-[1px] text-ink lg:text-3xl">
          Track Your Order
        </h1>
        <p className="mt-3 text-center text-[13px] font-light tracking-[0.5px] text-muted">
          Enter your order number to view shipment status
        </p>

        <div className="mt-8 flex w-full max-w-md">
          <input
            value={trackingInput}
            onChange={(e) => setTrackingInput(e.target.value)}
            placeholder="Order number (e.g. OP-M1ABC2)"
            className="h-12 flex-1 border border-r-0 border-border bg-transparent px-4 text-[13px] font-light tracking-[0.3px] text-ink outline-none placeholder:text-muted/50 focus:border-gold"
          />
          <button className="flex h-12 w-12 shrink-0 items-center justify-center bg-ink text-white transition-colors hover:bg-plum">
            <Search size={18} strokeWidth={1.5} />
          </button>
        </div>

        <p className="mt-4 text-[12px] font-light text-muted">
          Demo: place an order to see tracking info
        </p>
      </div>
    </main>
  )
}

export default function OrderTracking() {
  const { orderId } = useParams()
  const { lastOrder } = useCart()

  if (!orderId) {
    return <TrackingLookup />
  }

  if (!lastOrder || lastOrder.id !== orderId) {
    return (
      <main className="pt-16">
        <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center px-5">
          <h1 className="font-serif text-2xl font-medium tracking-[1px] text-ink">
            Order not found
          </h1>
          <p className="mt-2 text-[13px] font-light text-muted">
            We couldn&apos;t find an order with that number
          </p>
          <Link
            to="/tracking"
            className="mt-6 border border-ink px-8 py-3 text-[11px] tracking-[2px] uppercase text-ink transition-colors hover:bg-ink hover:text-white"
          >
            Try Again
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
      <div className="px-5 sm:px-8 lg:px-12 pt-8 pb-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-[11px] tracking-[2px] uppercase text-muted transition-colors hover:text-gold"
        >
          <ChevronLeft size={14} strokeWidth={1.5} />
          Back to Home
        </Link>
      </div>

      <div className="px-5 sm:px-8 lg:px-12 pb-16">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
          {/* Left: Timeline */}
          <div className="flex-1 max-w-lg">
            <h1 className="font-serif text-2xl font-medium tracking-[1px] text-ink lg:text-3xl">
              Order Status
            </h1>
            <div className="mt-2 flex items-baseline gap-3">
              <p className="text-[13px] font-light tracking-[0.5px] text-muted">
                {order.id}
              </p>
              <span className="h-3 w-px bg-gold-light" />
              <p className="text-[13px] font-light tracking-[0.5px] text-muted">
                Tracking: {order.tracking.number}
              </p>
            </div>

            <div className="mt-10">
              <TrackingTimeline steps={order.tracking.steps} />
            </div>

            <div className="mt-8 border border-border bg-off-white p-5">
              <p className="text-[11px] font-normal tracking-[2px] uppercase text-muted">
                Estimated Delivery
              </p>
              <p className="mt-1 font-serif text-lg font-medium text-ink">
                {deliveryDate}
              </p>
              <p className="mt-1 text-[12px] font-light text-muted">
                Complimentary shipping via express courier
              </p>
            </div>
          </div>

          {/* Right: Order details */}
          <div className="w-full shrink-0 lg:w-80 xl:w-96">
            <div className="sticky top-24 border border-border bg-off-white p-6 sm:p-8">
              <h3 className="text-[11px] font-normal tracking-[2px] uppercase text-muted">
                Order Details
              </h3>

              <div className="mt-5 space-y-4">
                <div>
                  <p className="text-[11px] font-normal tracking-[1.5px] uppercase text-muted">Ship To</p>
                  <p className="mt-1 text-[13px] font-light leading-relaxed text-ink">
                    {order.shippingInfo.firstName} {order.shippingInfo.lastName}<br />
                    {order.shippingInfo.address}<br />
                    {order.shippingInfo.city}, {order.shippingInfo.state} {order.shippingInfo.zip}
                  </p>
                </div>
              </div>

              <div className="mt-6 border-t border-border pt-5">
                <p className="text-[11px] font-normal tracking-[2px] uppercase text-muted">Items</p>
                <div className="mt-3 space-y-3">
                  {order.items.map((item) => (
                    <div key={item.key} className="flex gap-3">
                      <div
                        className="h-14 w-12 shrink-0 overflow-hidden"
                        style={{ background: item.product.images.product.bg || '#F2F2F2' }}
                      >
                        <img
                          src={item.product.images.product.src}
                          alt={item.product.name}
                          className="h-full w-full"
                          style={{
                            objectFit: item.product.images.product.fit === 'contain' ? 'contain' : 'cover',
                            padding: item.product.images.product.fit === 'contain' ? '3px' : 0,
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-[12px] font-medium text-ink">{item.product.name}</p>
                        <p className="text-[11px] font-light text-muted">
                          Size {item.size} · Qty {item.quantity}
                        </p>
                      </div>
                      <span className="text-[13px] text-ink">${item.product.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 border-t border-border pt-4">
                <div className="flex justify-between text-[12px]">
                  <span className="font-light text-muted">Shipping</span>
                  <span className="text-gold">Free</span>
                </div>
                <div className="mt-2 flex justify-between">
                  <span className="font-serif text-[15px] font-medium text-ink">Total</span>
                  <span className="font-serif text-[17px] tracking-[1px] text-ink">${order.total}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
