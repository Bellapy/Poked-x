import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-black/40 backdrop-blur">
      <Link to="/" className="text-xl font-bold tracking-wide text-pokedex-red">
        Pokedéx
      </Link>

      <div className="flex items-center gap-4 text-sm">
        <Link to="/">Home</Link>
        <Link to="/carrinho">Carrinho</Link>
        {user ? (
          <>
            <Link to="/perfil">Perfil</Link>
            {user.role === 'admin' && <Link to="/admin">Admin</Link>}
            <span className="text-pokedex-blue">{user.balance} PokeCoins</span>
            <button onClick={logout} className="text-white/60 hover:text-white">
              Sair
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Entrar</Link>
            <Link to="/registro">Registrar</Link>
          </>
        )}
      </div>
    </nav>
  )
}
