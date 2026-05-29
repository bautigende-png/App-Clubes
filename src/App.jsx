import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ProtectedRoute } from './router/ProtectedRoute'

import Login from './pages/auth/Login'
import Registro from './pages/auth/Registro'

import DirectivaLayout from './pages/directiva/DirectivaLayout'
import DashboardDirectiva from './pages/directiva/DashboardDirectiva'
import Finanzas from './pages/directiva/Finanzas'
import Inventario from './pages/directiva/Inventario'
import Sponsors from './pages/directiva/Sponsors'
import Cuotas from './pages/directiva/Cuotas'

import TecnicoLayout from './pages/tecnico/TecnicoLayout'
import DashboardTecnico from './pages/tecnico/DashboardTecnico'
import Entrenamientos from './pages/tecnico/Entrenamientos'
import Partidos from './pages/tecnico/Partidos'
import JugadoresReporte from './pages/tecnico/JugadoresReporte'

import JugadorLayout from './pages/jugador/JugadorLayout'
import Perfil from './pages/jugador/Perfil'
import Pagos from './pages/jugador/Pagos'
import Estadisticas from './pages/jugador/Estadisticas'
import PartidosJugador from './pages/jugador/PartidosJugador'

function RoleRedirect() {
  const { role, loading } = useAuth()
  if (loading) return null
  if (role === 'directiva') return <Navigate to="/directiva/dashboard" replace />
  if (role === 'tecnico') return <Navigate to="/tecnico/dashboard" replace />
  if (role === 'jugador') return <Navigate to="/jugador/perfil" replace />
  return <Navigate to="/login" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster theme="dark" position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/" element={<ProtectedRoute><RoleRedirect /></ProtectedRoute>} />

          {/* Comisión Directiva */}
          <Route
            path="/directiva"
            element={<ProtectedRoute allowedRoles={['directiva']}><DirectivaLayout /></ProtectedRoute>}
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardDirectiva />} />
            <Route path="finanzas" element={<Finanzas />} />
            <Route path="inventario" element={<Inventario />} />
            <Route path="sponsors" element={<Sponsors />} />
            <Route path="cuotas" element={<Cuotas />} />
          </Route>

          {/* Cuerpo Técnico */}
          <Route
            path="/tecnico"
            element={<ProtectedRoute allowedRoles={['tecnico']}><TecnicoLayout /></ProtectedRoute>}
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardTecnico />} />
            <Route path="entrenamientos" element={<Entrenamientos />} />
            <Route path="partidos" element={<Partidos />} />
            <Route path="jugadores" element={<JugadoresReporte />} />
          </Route>

          {/* Jugador */}
          <Route
            path="/jugador"
            element={<ProtectedRoute allowedRoles={['jugador']}><JugadorLayout /></ProtectedRoute>}
          >
            <Route index element={<Navigate to="perfil" replace />} />
            <Route path="perfil" element={<Perfil />} />
            <Route path="pagos" element={<Pagos />} />
            <Route path="estadisticas" element={<Estadisticas />} />
            <Route path="partidos" element={<PartidosJugador />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
