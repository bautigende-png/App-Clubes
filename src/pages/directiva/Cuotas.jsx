import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { Modal } from '../../components/Modal'
import { Input, Select } from '../../components/Input'
import { Badge } from '../../components/Badge'
import { EmptyState } from '../../components/EmptyState'
import { Table, Tr, Td } from '../../components/Table'
import { formatCurrency, formatDate, monthName, getCurrentMonthYear } from '../../lib/utils'
import { Users, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

const estadoBadge = { pagado: 'green', pendiente: 'yellow', vencido: 'red' }

export default function Cuotas() {
  const [jugadores, setJugadores] = useState([])
  const [cuotas, setCuotas] = useState([])
  const [loading, setLoading] = useState(true)
  const [editModal, setEditModal] = useState(null)
  const [saving, setSaving] = useState(false)
  const [editForm, setEditForm] = useState({ estado: 'pagado', fecha_pago: new Date().toISOString().split('T')[0], monto: '' })

  const { mes: mesActual, anio: anioActual } = getCurrentMonthYear()
  const [filtroMes, setFiltroMes] = useState(mesActual)
  const [filtroAnio, setFiltroAnio] = useState(anioActual)

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    const [j, c] = await Promise.all([api.get('/api/directiva/jugadores'), api.get('/api/directiva/cuotas')])
    setJugadores(j)
    setCuotas(c)
    setLoading(false)
  }

  function getCuota(jugadorId, mes, anio) {
    return cuotas.find(c => c.jugador_id === jugadorId && c.mes === mes && c.anio === anio) || null
  }

  async function saveEdit() {
    setSaving(true)
    try {
      await api.post('/api/directiva/cuotas', { jugador_id: editModal.jugador.id, mes: editModal.mes, anio: editModal.anio, estado: editForm.estado, fecha_pago: editForm.estado === 'pagado' ? editForm.fecha_pago : null, monto: editForm.monto ? parseFloat(editForm.monto) : null })
      toast.success('Cuota actualizada')
      setEditModal(null)
      loadAll()
    } catch { toast.error('Error al guardar') }
    setSaving(false)
  }

  function openEdit(jugador, mes, anio) {
    const c = getCuota(jugador.id, mes, anio)
    setEditForm({ estado: c?.estado || 'pendiente', fecha_pago: c?.fecha_pago || new Date().toISOString().split('T')[0], monto: c?.monto || '' })
    setEditModal({ jugador, mes, anio })
  }

  const deudores = jugadores.filter(j => {
    let mesesDeuda = 0
    for (let i = 0; i < 6; i++) {
      let m = mesActual - i, a = anioActual
      if (m <= 0) { m += 12; a -= 1 }
      const c = getCuota(j.id, m, a)
      if (!c || c.estado !== 'pagado') mesesDeuda++
    }
    return mesesDeuda >= 2
  })

  const cuotasFiltradas = jugadores.map(j => ({ jugador: j, cuota: getCuota(j.id, filtroMes, filtroAnio) }))

  if (loading) return <div className="p-6 text-slate-400">Cargando...</div>

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <h1 className="text-2xl font-bold text-white">Cuotas de Jugadores</h1>

      {deudores.length > 0 && (
        <Card className="border-red-500/30">
          <h2 className="text-sm font-semibold text-red-400 uppercase tracking-wider mb-3 flex items-center gap-2"><AlertTriangle size={14} />Deudores (2+ meses)</h2>
          <div className="flex flex-wrap gap-2">
            {deudores.map(j => <div key={j.id} className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-1.5 text-sm text-white">{j.nombre} {j.apellido}</div>)}
          </div>
        </Card>
      )}

      <div className="flex items-center gap-3">
        <Select value={filtroMes} onChange={e => setFiltroMes(parseInt(e.target.value))}>
          {Array.from({length: 12}, (_, i) => <option key={i+1} value={i+1}>{monthName(i+1)}</option>)}
        </Select>
        <Select value={filtroAnio} onChange={e => setFiltroAnio(parseInt(e.target.value))}>
          {[anioActual - 1, anioActual, anioActual + 1].map(a => <option key={a} value={a}>{a}</option>)}
        </Select>
        <Badge variant="slate">{cuotasFiltradas.filter(c => c.cuota?.estado === 'pagado').length}/{jugadores.length} pagados</Badge>
      </div>

      {jugadores.length === 0 ? <EmptyState icon={Users} title="Sin jugadores" /> : (
        <Table headers={['Jugador', 'Estado', 'Monto', 'Fecha pago', 'Acción']}>
          {cuotasFiltradas.map(({ jugador, cuota }) => (
            <Tr key={jugador.id}>
              <Td><p className="font-medium text-white">{jugador.nombre} {jugador.apellido}</p></Td>
              <Td>{cuota ? <Badge variant={estadoBadge[cuota.estado]}>{cuota.estado}</Badge> : <Badge variant="slate">Sin registro</Badge>}</Td>
              <Td>{cuota?.monto ? formatCurrency(cuota.monto) : '-'}</Td>
              <Td>{cuota?.fecha_pago ? formatDate(cuota.fecha_pago) : '-'}</Td>
              <Td>
                <Button variant="ghost" size="sm" onClick={() => openEdit(jugador, filtroMes, filtroAnio)}>
                  {cuota?.estado === 'pagado' ? 'Editar' : <><CheckCircle2 size={14} /> Registrar</>}
                </Button>
              </Td>
            </Tr>
          ))}
        </Table>
      )}

      <Modal open={!!editModal} onClose={() => setEditModal(null)} title={editModal ? `Cuota — ${editModal.jugador.nombre} ${editModal.jugador.apellido} · ${monthName(editModal.mes)} ${editModal.anio}` : ''} size="sm">
        <div className="space-y-4">
          <Select label="Estado" value={editForm.estado} onChange={e => setEditForm(f => ({...f, estado: e.target.value}))}>
            <option value="pagado">Pagado</option><option value="pendiente">Pendiente</option><option value="vencido">Vencido</option>
          </Select>
          {editForm.estado === 'pagado' && <Input label="Fecha de pago" type="date" value={editForm.fecha_pago} onChange={e => setEditForm(f => ({...f, fecha_pago: e.target.value}))} />}
          <Input label="Monto (ARS)" type="number" value={editForm.monto} onChange={e => setEditForm(f => ({...f, monto: e.target.value}))} />
          <div className="flex gap-3 pt-2"><Button variant="secondary" className="flex-1" onClick={() => setEditModal(null)}>Cancelar</Button><Button className="flex-1" loading={saving} onClick={saveEdit}>Guardar</Button></div>
        </div>
      </Modal>
    </div>
  )
}
