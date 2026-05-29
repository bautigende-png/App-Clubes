import { Outlet } from 'react-router-dom'
import { LayoutDashboard, Dumbbell, Trophy, Users } from 'lucide-react'
import { Sidebar, SidebarLayout } from '../../components/Sidebar'

const links = [
  { to: '/tecnico/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/tecnico/entrenamientos', icon: Dumbbell, label: 'Entrenamientos' },
  { to: '/tecnico/partidos', icon: Trophy, label: 'Partidos' },
  { to: '/tecnico/jugadores', icon: Users, label: 'Jugadores' },
]

export default function TecnicoLayout() {
  return (
    <SidebarLayout
      sidebar={<Sidebar links={links} title="Cuerpo Técnico" color="blue" />}
    >
      <Outlet />
    </SidebarLayout>
  )
}
