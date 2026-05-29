import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function ProtectedRoute({ children, allowedRoles }) {
  const { user, role, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-green-500" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  if (allowedRoles && !allowedRoles.includes(role)) {
    if (role === 'directiva') return <Navigate to="/directiva" replace />
    if (role === 'tecnico') return <Navigate to="/tecnico" replace />
    if (role === 'jugador') return <Navigate to="/jugador" replace />
    return <Navigate to="/login" replace />
  }

  return children
}
