import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

const LINKS = [
  { to: '/', label: 'Mercado' },
  { to: '/carrinho', label: 'Carrinho' },
  { to: '/perfil', label: 'Perfil' },
]

function NavLink({ to, children }) {
  return (
    <Link
      to={to}
      className="group relative py-1 text-[15px] font-light tracking-wide text-ink-muted transition-colors duration-300 hover:text-ink"
    >
      {children}
      {/* Underline que cresce do centro no hover. */}
      <span className="pointer-events-none absolute -bottom-0.5 left-0 h-px w-full origin-center scale-x-0 bg-gradient-to-r from-glow-common via-magenta to-glow-ultra-b transition-transform duration-300 ease-out group-hover:scale-x-100" />
    </Link>
  )
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const { items } = useCart()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="sticky top-0 z-50"
    >
      <nav className="glass mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-6 px-8 py-5">
        <Link to="/" className="shrink-0">
          <span className="text-gradient font-display text-3xl font-bold tracking-tight">
            Pokedéx
          </span>
        </Link>

        <div className="flex flex-wrap items-center gap-10">
          {LINKS.map((link) => (
            <NavLink key={link.to} to={link.to}>
              {link.label}
              {link.to === '/carrinho' && items.length > 0 && (
                <span className="ml-1 font-mono-tabular text-xs text-glow-ultra-a">
                  {items.length}
                </span>
              )}
            </NavLink>
          ))}
          {user.role === 'admin' && <NavLink to="/admin">Admin</NavLink>}

          <span className="font-mono-tabular text-sm text-glow-rare">{user.balance} PC</span>

          <button
            onClick={handleLogout}
            className="text-[15px] font-light text-ink-muted transition-colors duration-300 hover:text-ink"
          >
            Sair
          </button>
        </div>
      </nav>
    </motion.header>
  )
}
