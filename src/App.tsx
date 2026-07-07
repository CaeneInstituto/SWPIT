import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'
import Cart from './components/Cart'
import Home from './pages/Home'
import QuienesSomos from './pages/QuienesSomos'
import Contactanos from './pages/Contactanos'
import TourDetail from './components/TourDetail'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Cart />
          <Routes>
            <Route path="/"                  element={<Home />} />
            <Route path="/quienes-somos"     element={<QuienesSomos />} />
            <Route path="/contactanos"       element={<Contactanos />} />
            <Route path="/tour/:id"          element={<TourDetail />} />
            <Route path="/admin/login"       element={<AdminLogin />} />
            <Route path="/admin/dashboard"   element={<AdminDashboard />} />
            <Route path="*"                  element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  )
}
