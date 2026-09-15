import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Profile() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">{user.name}</h1>
      <p className="text-pokedex-blue mb-6">{user.balance} PokeCoins</p>
      <p className="text-white/50">Coleção, anúncios e histórico — em construção.</p>
    </div>
  )
}
