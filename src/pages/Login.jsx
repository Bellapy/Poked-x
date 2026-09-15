import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const result = login(email, password)
    if (result.ok) navigate('/')
    else setError(result.error)
  }

  return (
    <div className="p-6 max-w-sm mx-auto">
      <h1 className="text-2xl font-bold mb-6">Entrar</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-white/10 rounded px-3 py-2"
          required
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-white/10 rounded px-3 py-2"
          required
        />
        {error && <p className="text-pokedex-red text-sm">{error}</p>}
        <button type="submit" className="bg-pokedex-red rounded px-3 py-2 font-semibold">
          Entrar
        </button>
      </form>
      <p className="text-white/40 text-xs mt-4">
        Usuários de teste: admin@pokedex.com / admin123, ash@pokedex.com / 123456
      </p>
    </div>
  )
}
