import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronLeft, Check, Lock } from 'lucide-react'
import { useCart } from '../context/CartContext'

const STEPS = ['Shipping', 'Payment', 'Review']

function Input({ label, ...props }) {
  return (
    <label className="block">
      <span className="text-[11px] font-normal tracking-[1.5px] uppercase text-muted">{label}</span>
      <input
        className="mt-1.5 block h-11 w-full border border-border bg-transparent px-3 text-[14px] font-light tracking-[0.3px] text-ink outline-none transition-colors placeholder:text-muted/50 focus:border-gold"
        {...props}
      />
    </label>
  )
}

function ShippingForm({ data, onChange }) {
  const update = (field) => (e) => onChange({ ...data, [field]: e.target.value })

  return (
    <div className="space-y-5">
      <h2 className="font-serif text-xl font-medium tracking-[0.5px] text-ink">
        Shipping Information
      </h2>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Input label="First Name" placeholder="John" value={data.firstName} onChange={update('firstName')} />
        <Input label="Last Name" placeholder="Doe" value={data.lastName} onChange={update('lastName')} />
      </div>
      <Input label="Email" type="email" placeholder="john@example.com" value={data.email} onChange={update('email')} />
      <Input label="Phone" type="tel" placeholder="+1 (555) 000-0000" value={data.phone} onChange={update('phone')} />
      <Input label="Address" placeholder="123 Main Street" value={data.address} onChange={update('address')} />
      <Input label="Apartment, Suite, etc." placeholder="Apt 4B" value={data.apartment} onChange={update('apartment')} />
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
        <Input label="City" placeholder="New York" value={data.city} onChange={update('city')} />
        <Input label="State" placeholder="NY" value={data.state} onChange={update('state')} />
        <Input label="Zip Code" placeholder="10001" value={data.zip} onChange={update('zip')} />
      </div>
      <Input label="Country" placeholder="United States" value={data.country} onChange={update('country')} />
    </div>
  )
}

function PaymentForm({ data, onChange }) {
  const update = (field) => (e) => onChange({ ...data, [field]: e.target.value })

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <h2 className="font-serif text-xl font-medium tracking-[0.5px] text-ink">
          Payment Details
        </h2>
        <Lock size={14} strokeWidth={1.5} className="text-gold" />
      </div>
      <p className="text-[12px] font-light tracking-[0.3px] text-muted">
        This is a demo — no actual payment will be processed.
      </p>
      <Input label="Name on Card" placeholder="John Doe" value={data.cardName} onChange={update('cardName')} />
      <Input label="Card Number" placeholder="4242 4242 4242 4242" value={data.cardNumber} onChange={update('cardNumber')} />
      <div className="grid grid-cols-2 gap-5">
        <Input label="Expiry" placeholder="MM / YY" value={data.expiry} onChange={update('expiry')} />
        <Input label="CVC" placeholder="123" value={data.cvc} onChange={update('cvc')} />
      </div>
    </div>
  )
}

function ReviewStep({ shipping, items, subtotal }) {
  return (
    <div className="space-y-6">
      <h2 className="font-serif text-xl font-medium tracking-[0.5px] text-ink">
        Review Your Order
      </h2>

      {/* Shipping address */}
      <div>
        <h3 className="text-[11px] font-normal tracking-[2px] uppercase text-muted">Ship To</h3>
        <div className="mt-2 text-[13px] font-light leading-relaxed tracking-[0.3px] text-ink">
          <p>{shipping.firstName} {shipping.lastName}</p>
          <p>{shipping.address}{shipping.apartment ? `, ${shipping.apartment}` : ''}</p>
          <p>{shipping.city}, {shipping.state} {shipping.zip}</p>
          <p>{shipping.country}</p>
        </div>
      </div>

      {/* Items */}
      <div>
        <h3 className="text-[11px] font-normal tracking-[2px] uppercase text-muted">Items</h3>
        <div className="mt-3 divide-y divide-border">
          {items.map((item) => (
            <div key={item.key} className="flex items-center gap-4 py-4">
              <div
                className="h-16 w-14 shrink-0 overflow-hidden"
                style={{ background: item.product.images.product.bg || '#F2F2F2' }}
              >
                <img
                  src={item.product.images.product.src}
                  alt={item.product.name}
                  className="h-full w-full"
                  style={{
                    objectFit: item.product.images.product.fit === 'contain' ? 'contain' : 'cover',
                    padding: item.product.images.product.fit === 'contain' ? '4px' : 0,
                  }}
                />
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-medium tracking-[0.3px] text-ink">{item.product.name}</p>
                <p className="text-[11px] font-light text-muted">Size {item.size} · Qty {item.quantity}</p>
              </div>
              <span className="text-[14px] tracking-[0.5px] text-ink">${item.product.price * item.quantity}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div className="space-y-2 border-t border-border pt-4">
        <div className="flex justify-between text-[13px]">
          <span className="font-light text-muted">Subtotal</span>
          <span className="text-ink">${subtotal}</span>
        </div>
        <div className="flex justify-between text-[13px]">
          <span className="font-light text-muted">Shipping</span>
          <span className="text-gold">Complimentary</span>
        </div>
        <div className="flex justify-between border-t border-border pt-3">
          <span className="font-serif text-[16px] font-medium text-ink">Total</span>
          <span className="font-serif text-[18px] tracking-[1px] text-ink">${subtotal}</span>
        </div>
      </div>
    </div>
  )
}

export default function Checkout() {
  const navigate = useNavigate()
  const { items, subtotal, placeOrder } = useCart()
  const [step, setStep] = useState(0)

  const [shipping, setShipping] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    address: '', apartment: '', city: '', state: '', zip: '', country: '',
  })

  const [payment, setPayment] = useState({
    cardName: '', cardNumber: '', expiry: '', cvc: '',
  })

  if (items.length === 0) {
    return (
      <main className="pt-16">
        <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center px-5">
          <h1 className="font-serif text-2xl font-medium tracking-[1px] text-ink">
            Nothing to check out
          </h1>
          <Link
            to="/collection"
            className="mt-6 border border-ink px-8 py-3 text-[11px] tracking-[2px] uppercase text-ink transition-colors hover:bg-ink hover:text-white"
          >
            Shop Now
          </Link>
        </div>
      </main>
    )
  }

  const handlePlaceOrder = () => {
    const order = placeOrder(shipping)
    navigate(`/order-confirmation/${order.id}`)
  }

  return (
    <main className="pt-16">
      <div className="px-5 sm:px-8 lg:px-12 pt-8 pb-4">
        <Link
          to="/cart"
          className="inline-flex items-center gap-1.5 text-[11px] tracking-[2px] uppercase text-muted transition-colors hover:text-gold"
        >
          <ChevronLeft size={14} strokeWidth={1.5} />
          Back to Bag
        </Link>
      </div>

      {/* Steps indicator */}
      <div className="border-b border-border px-5 sm:px-8 lg:px-12 pb-6">
        <div className="flex items-center gap-0 sm:gap-2">
          {STEPS.map((name, i) => (
            <div key={name} className="flex items-center">
              {i > 0 && <div className="mx-2 h-px w-6 bg-border sm:mx-4 sm:w-10" />}
              <button
                onClick={() => i < step && setStep(i)}
                className={`flex items-center gap-2 ${
                  i < step ? 'cursor-pointer' : i === step ? '' : 'opacity-40'
                }`}
                disabled={i > step}
              >
                <span
                  className={`flex h-6 w-6 items-center justify-center text-[10px] ${
                    i < step
                      ? 'bg-gold text-white'
                      : i === step
                      ? 'border border-ink text-ink'
                      : 'border border-border text-muted'
                  }`}
                >
                  {i < step ? <Check size={12} strokeWidth={2} /> : i + 1}
                </span>
                <span
                  className={`hidden text-[11px] tracking-[1.5px] uppercase sm:block ${
                    i <= step ? 'text-ink' : 'text-muted'
                  }`}
                >
                  {name}
                </span>
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-0 lg:gap-12 px-5 sm:px-8 lg:px-12 py-10">
        {/* Form area */}
        <div className="flex-1 max-w-xl">
          {step === 0 && <ShippingForm data={shipping} onChange={setShipping} />}
          {step === 1 && <PaymentForm data={payment} onChange={setPayment} />}
          {step === 2 && <ReviewStep shipping={shipping} items={items} subtotal={subtotal} />}

          <div className="mt-8 flex gap-3">
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="flex h-12 items-center justify-center border border-border px-6 text-[11px] tracking-[2px] uppercase text-ink transition-colors hover:border-gold hover:text-gold"
              >
                Back
              </button>
            )}
            {step < 2 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="flex h-12 flex-1 items-center justify-center bg-ink text-[11px] tracking-[2px] uppercase text-white transition-colors hover:bg-plum"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handlePlaceOrder}
                className="flex h-12 flex-1 items-center justify-center bg-ink text-[11px] tracking-[2px] uppercase text-white transition-colors hover:bg-plum"
              >
                Place Order
              </button>
            )}
          </div>
        </div>

        {/* Sidebar summary */}
        <div className="mt-10 w-full shrink-0 lg:mt-0 lg:w-72 xl:w-80">
          <div className="sticky top-24 border border-border bg-off-white p-6">
            <h3 className="text-[11px] font-normal tracking-[2px] uppercase text-muted">
              Order Summary
            </h3>
            <div className="mt-4 space-y-3">
              {items.map((item) => (
                <div key={item.key} className="flex justify-between text-[12px]">
                  <span className="font-light text-ink">
                    {item.product.name} <span className="text-muted">x{item.quantity}</span>
                  </span>
                  <span className="text-ink">${item.product.price * item.quantity}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 border-t border-border pt-3">
              <div className="flex justify-between text-[12px]">
                <span className="font-light text-muted">Shipping</span>
                <span className="text-gold">Free</span>
              </div>
            </div>
            <div className="mt-3 border-t border-border pt-3">
              <div className="flex justify-between">
                <span className="font-serif text-[15px] font-medium text-ink">Total</span>
                <span className="font-serif text-[17px] tracking-[1px] text-ink">${subtotal}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
