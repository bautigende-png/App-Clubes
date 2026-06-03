import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ClubProvider } from './context/ClubContext'
import { ProtectedRoute } from './router/ProtectedRoute'

import Login from './pages/auth/Login'
import Registro from './pages/auth/Registro'
import RegistroForm from './pages/auth/RegistroForm'

import DirectivaLayout from './pages/directiva/DirectivaLayout'
import DashboardDirectiva from './pages/directiva/DashboardDirectiva'
import Finanzas from './pages/directiva/Finanzas'
import Inventario from './pages/directiva/Inventario'
import Sponsors from './pages/directiva/Sponsors'
import Cuotas from './pages/directiva/Cuotas'
import Configuracion from './pages/directiva/Configuracion'
import JugadoresDirectiva from './pages/directiva/Jugadores'
import PartidosDirectiva from './pages/directiva/Partidos'
import EntrenamientosDirectiva from './pages/directiva/EntrenamientosDirectiva'

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
      <ClubProvider>
      <BrowserRouter>
        <Toaster theme="dark" position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/registro/jugador" element={<RegistroForm role="jugador" />} />
          <Route path="/registro/tecnico" element={<RegistroForm role="tecnico" />} />
          <Route path="/registro/directiva" element={<RegistroForm role="directiva" />} />
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
            <Route path="jugadores" element={<JugadoresDirectiva />} />
            <Route path="cuotas" element={<Cuotas />} />
            <Route path="partidos" element={<PartidosDirectiva />} />
            <Route path="entrenamientos" element={<EntrenamientosDirectiva />} />
            <Route path="configuracion" element={<Configuracion />} />
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
      </ClubProvider>
    </AuthProvider>
  )
}
