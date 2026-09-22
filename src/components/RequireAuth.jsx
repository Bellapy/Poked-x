import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// O login é a porta de entrada obrigatória do sistema: nenhuma rota de produto
// renderiza sem sessão. Guarda a rota pretendida para voltar a ela após entrar.
export default function RequireAuth({ children, adminOnly = false }) {
  const { user } = useAuth()
  const location = useLocation()

  // Conta bloqueada ou removida pelo admin não pode seguir usando uma sessão
  // que já estava aberta.
  if (!user || user.status === 'blocked') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />

  return children
}
