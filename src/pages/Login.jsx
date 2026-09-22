import { motion } from 'framer-motion'
import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  if (user) return <Navigate to="/" replace />

  function handleSubmit(e) {
    e.preventDefault()
    const result = login(email, password)
    if (result.ok) navigate(location.state?.from ?? '/', { replace: true })
    else setError(result.error)
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="glass w-full max-w-md rounded-3xl p-10"
      >
        <span className="text-gradient font-display text-4xl font-bold tracking-tight">
          Pokedéx
        </span>
        <p className="mt-2 text-sm font-light text-ink-muted">
          Entre para acessar o mercado de cartas.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-full border border-arcade-panel-light bg-arcade-panel px-5 py-3 text-sm font-light text-ink placeholder:text-ink-muted"
            required
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-full border border-arcade-panel-light bg-arcade-panel px-5 py-3 text-sm font-light text-ink placeholder:text-ink-muted"
            required
          />
          {error && <p className="text-sm text-glow-common">{error}</p>}
          <button
            type="submit"
            className="rounded-full bg-gradient-to-r from-glow-common via-magenta to-glow-ultra-b px-5 py-3 font-semibold text-white transition-transform duration-300 hover:scale-[1.02]"
          >
            Entrar
          </button>
        </form>

        <p className="mt-6 text-sm font-light text-ink-muted">
          Não tem conta?{' '}
          <Link to="/registro" className="text-ink underline decoration-glow-ultra-a">
            Criar conta
          </Link>
        </p>

        <div className="mt-6 space-y-1 border-t border-arcade-panel-light pt-5 text-xs font-light text-ink-muted">
          <p>Usuários de teste (senha 123456, admin usa admin123):</p>
          <p>rafael@pokedex.com — vendedor (tem estoque e anúncios)</p>
          <p>ilana@pokedex.com — compradora (coleção pequena, sem anúncios)</p>
          <p>admin@pokedex.com — administrador</p>
        </div>
      </motion.div>
    </div>
  )
}
