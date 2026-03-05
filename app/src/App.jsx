import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { CartProvider } from './context/CartContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import ProductDetail from './pages/ProductDetail'
import Collection from './pages/Collection'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderConfirmation from './pages/OrderConfirmation'
import OrderTracking from './pages/OrderTracking'
import Craftsmanship from './pages/Craftsmanship'
import Account from './pages/Account'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

export default function App() {
  const { pathname } = useLocation()
  const isCraftsmanship = pathname === '/craftsmanship'

  return (
    <CartProvider>
      <div className={`min-h-screen font-sans text-ink ${isCraftsmanship ? '' : 'bg-surface'}`}>
        <ScrollToTop />
        {!isCraftsmanship && <Navbar />}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:slug" element={<ProductDetail />} />
          <Route path="/collection" element={<Collection />} />
          <Route path="/collection/:category" element={<Collection />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
          <Route path="/tracking" element={<OrderTracking />} />
          <Route path="/tracking/:orderId" element={<OrderTracking />} />
          <Route path="/craftsmanship" element={<Craftsmanship />} />
          <Route path="/account" element={<Account />} />
        </Routes>
        {!isCraftsmanship && <Footer />}
      </div>
    </CartProvider>
  )
}
