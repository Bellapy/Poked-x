import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Admin() {
  const { user } = useAuth()
  if (!user || user.role !== 'admin') return <Navigate to="/" replace />

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Administração</h1>
      <p className="text-white/50">Gerenciar usuários e cartas — em construção.</p>
    </div>
  )
}
