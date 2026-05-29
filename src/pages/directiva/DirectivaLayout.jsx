import { Outlet } from 'react-router-dom'
import { LayoutDashboard, DollarSign, Package, Handshake, Users } from 'lucide-react'
import { Sidebar, SidebarLayout } from '../../components/Sidebar'

const links = [
  { to: '/directiva/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/directiva/finanzas', icon: DollarSign, label: 'Finanzas' },
  { to: '/directiva/inventario', icon: Package, label: 'Inventario' },
  { to: '/directiva/sponsors', icon: Handshake, label: 'Sponsors' },
  { to: '/directiva/cuotas', icon: Users, label: 'Cuotas' },
]

export default function DirectivaLayout() {
  return (
    <SidebarLayout
      sidebar={<Sidebar links={links} title="Comisión Directiva" color="green" />}
    >
      <Outlet />
    </SidebarLayout>
  )
}
