import { createContext, useContext, useState, useCallback } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState([])
  const [lastOrder, setLastOrder] = useState(null)

  const addItem = useCallback((product, size, quantity = 1) => {
    setItems((prev) => {
      const key = `${product.id}-${size}`
      const existing = prev.find((item) => item.key === key)
      if (existing) {
        return prev.map((item) =>
          item.key === key ? { ...item, quantity: item.quantity + quantity } : item
        )
      }
      return [...prev, { key, product, size, quantity }]
    })
  }, [])

  const removeItem = useCallback((key) => {
    setItems((prev) => prev.filter((item) => item.key !== key))
  }, [])

  const updateQuantity = useCallback((key, quantity) => {
    if (quantity < 1) return
    setItems((prev) =>
      prev.map((item) => (item.key === key ? { ...item, quantity } : item))
    )
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

  const placeOrder = useCallback((shippingInfo) => {
    const order = {
      id: `OP-${Date.now().toString(36).toUpperCase()}`,
      items: [...items],
      subtotal,
      shipping: 0,
      total: subtotal,
      shippingInfo,
      date: new Date().toISOString(),
      estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      tracking: {
        number: `1Z${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        steps: [
          { status: 'Order Placed', date: new Date().toISOString(), done: true },
          { status: 'Processing', date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), done: false },
          { status: 'Shipped', date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), done: false },
          { status: 'Out for Delivery', date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(), done: false },
          { status: 'Delivered', date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), done: false },
        ],
      },
    }
    setLastOrder(order)
    setItems([])
    return order
  }, [items, subtotal])

  return (
    <CartContext.Provider
      value={{ items, itemCount, subtotal, addItem, removeItem, updateQuantity, clearCart, placeOrder, lastOrder }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
