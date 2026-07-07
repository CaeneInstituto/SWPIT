import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

const links = [
  { label: 'Inicio',        href: '/#inicio',    isRoute: false },
  { label: 'Destinos',      href: '/#destinos',  isRoute: false },
  { label: 'Quiénes somos', href: '/quienes-somos', isRoute: true },
  { label: 'Testimonios',   href: '/#testimonios', isRoute: false },
  { label: 'Contáctanos',   href: '/contactanos',  isRoute: true },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { setCartOpen, totalItems } = useCart()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-1 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img
            src="/logo.png"
            alt="Peru In Travel"
            className="h-16 w-40 object-contain object-left"
          />
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
          {links.map((l) => (
            <li key={l.label}>
              {l.isRoute ? (
                <Link to={l.href} className="hover:text-brand-teal transition-colors">
                  {l.label}
                </Link>
              ) : (
                <a href={l.href} className="hover:text-brand-teal transition-colors">
                  {l.label}
                </a>
              )}
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          {/* Cart Icon */}
          <button
            onClick={() => setCartOpen(true)}
            className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Abrir carrito"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>

          <Link
            to="/contactanos"
            className="bg-brand-gradient text-white text-sm font-semibold px-5 py-2 rounded-full hover:opacity-90 transition-opacity shadow-md"
          >
            Reservar ahora
          </Link>
        </div>

        {/* Hamburger */}
        <button
          className="md:hidden p-2 rounded-md text-gray-700"
          onClick={() => setOpen(!open)}
          aria-label="Abrir menú"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {open
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t px-4 pb-4">
          <ul className="flex flex-col gap-3 pt-3 text-sm font-medium text-gray-600">
            {links.map((l) => (
              <li key={l.label}>
                {l.isRoute ? (
                  <Link
                    to={l.href}
                    className="block hover:text-brand-teal transition-colors"
                    onClick={() => setOpen(false)}
                  >
                    {l.label}
                  </Link>
                ) : (
                  <a
                    href={l.href}
                    className="block hover:text-brand-teal transition-colors"
                    onClick={() => setOpen(false)}
                  >
                    {l.label}
                  </a>
                )}
              </li>
            ))}
            <li>
              <button
                onClick={() => {
                  setCartOpen(true)
                  setOpen(false)
                }}
                className="w-full text-left hover:text-brand-teal transition-colors flex items-center justify-between"
              >
                Carrito
                {totalItems > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>
            </li>
            <li>
              <Link
                to="/contactanos"
                className="inline-block bg-brand-gradient text-white text-sm font-semibold px-5 py-2 rounded-full"
                onClick={() => setOpen(false)}
              >
                Reservar ahora
              </Link>
            </li>
          </ul>
        </div>
      )}
    </nav>
  )
}
