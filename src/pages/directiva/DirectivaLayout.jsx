import { Outlet } from 'react-router-dom'
import { LayoutDashboard, DollarSign, Package, Handshake, Users, Settings, Trophy, UserSquare2, Dumbbell } from 'lucide-react'
import { Sidebar, SidebarLayout } from '../../components/Sidebar'
import { useNotificaciones } from '../../hooks/useNotificaciones'

export default function DirectivaLayout() {
  const { deudores, cuotasPendientes } = useNotificaciones()

  // Primeros 4 aparecen en el bottom nav mobile; el resto va en "Más"
  const links = [
    { to: '/directiva/dashboard',       icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/directiva/cuotas',          icon: Users,           label: 'Cuotas',    badge: cuotasPendientes > 0 ? cuotasPendientes : null, badgeVariant: 'yellow' },
    { to: '/directiva/finanzas',        icon: DollarSign,      label: 'Finanzas' },
    { to: '/directiva/jugadores',       icon: UserSquare2,     label: 'Jugadores', badge: deudores > 0 ? deudores : null, badgeVariant: 'red' },
    { to: '/directiva/partidos',        icon: Trophy,          label: 'Partidos' },
    { to: '/directiva/entrenamientos',  icon: Dumbbell,        label: 'Entrenamientos' },
    { to: '/directiva/inventario',      icon: Package,         label: 'Inventario' },
    { to: '/directiva/sponsors',        icon: Handshake,       label: 'Sponsors' },
    { to: '/directiva/configuracion',   icon: Settings,        label: 'Configuración' },
  ]

  return (
    <SidebarLayout sidebar={<Sidebar links={links} title="Comisión Directiva" color="green" />}>
      <Outlet />
    </SidebarLayout>
  )
}
