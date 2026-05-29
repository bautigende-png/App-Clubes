import { useEffect, useState, useCallback } from 'react'
import { api } from '../../lib/api'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { Modal } from '../../components/Modal'
import { Input, Select } from '../../components/Input'
import { Badge } from '../../components/Badge'
import { EmptyState } from '../../components/EmptyState'
import { Skeleton } from '../../components/Skeleton'
import { formatCurrency, formatDate, monthName, getCurrentMonthYear } from '../../lib/utils'
import { Users, AlertTriangle, CheckCircle2, Clock, Plus, CalendarPlus, Filter, X } from 'lucide-react'
import { toast } from 'sonner'

const estadoBadge = { pagado: 'green', pendiente: 'yellow', vencido: 'red' }
const estadoIcon  = { pagado: CheckCircle2, pendiente: Clock, vencido: AlertTriangle }

export default function Cuotas() {
  const [jugadores, setJugadores] = useState([])
  const [cuotas, setCuotas] = useState([])
  const [notif, setNotif] = useState(null)
  const [loading, setLoading] = useState(true)

  // Filtros
  const { mes: mesActual, anio: anioActual } = getCurrentMonthYear()
  const [filtroMes, setFiltroMes] = useState(mesActual)
  const [filtroAnio, setFiltroAnio] = useState(anioActual)
  const [filtroEstado, setFiltroEstado] = useState('todos')

  // Modals
  const [abrirMesModal, setAbrirMesModal] = useState(false)
  const [editModal, setEditModal] = useState(null)
  const [saving, setSaving] = useState(false)

  // Form abrir mes
  const [abrirForm, setAbrirForm] = useState({ mes: mesActual, anio: anioActual, monto: '' })

  // Form editar cuota
  const [editForm, setEditForm] = useState({ estado: 'pagado', fecha_pago: '', monto: '' })

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    const [j, c, n] = await Promise.all([
      api.get('/api/directiva/jugadores'),
      api.get('/api/directiva/cuotas'),
      api.get('/api/directiva/notificaciones'),
    ])
    setJugadores(j)
    setCuotas(c)
    setNotif(n)
    setLoading(false)
  }

  function getCuota(jugadorId, mes, anio) {
    return cuotas.find(c => c.jugador_id === jugadorId && c.mes === mes && c.anio === anio) || null
  }

  // Marcar pagado rápido (sin modal)
  async function marcarPagado(jugador, mes, anio, monto) {
    const today = new Date().toISOString().split('T')[0]
    try {
      const row = await api.post('/api/directiva/cuotas', {
        jugador_id: jugador.id, mes, anio,
        estado: 'pagado', fecha_pago: today,
        monto: monto || null,
      })
      setCuotas(prev => {
        const filtered = prev.filter(c => !(c.jugador_id === jugador.id && c.mes === mes && c.anio === anio))
        return [...filtered, row]
      })
      toast.success(`${jugador.nombre} marcado como pagado`)
      // Refrescar notificaciones
      api.get('/api/directiva/notificaciones').then(setNotif)
    } catch { toast.error('Error al actualizar') }
  }

  function openEdit(jugador, mes, anio) {
    const c = getCuota(jugador.id, mes, anio)
    setEditForm({
      estado: c?.estado || 'pendiente',
      fecha_pago: c?.fecha_pago || new Date().toISOString().split('T')[0],
      monto: c?.monto || '',
    })
    setEditModal({ jugador, mes, anio })
  }

  async function saveEdit() {
    setSaving(true)
    try {
      const row = await api.post('/api/directiva/cuotas', {
        jugador_id: editModal.jugador.id,
        mes: editModal.mes, anio: editModal.anio,
        estado: editForm.estado,
        fecha_pago: editForm.estado === 'pagado' ? editForm.fecha_pago : null,
        monto: editForm.monto ? parseFloat(editForm.monto) : null,
      })
      setCuotas(prev => {
        const filtered = prev.filter(c => !(c.jugador_id === editModal.jugador.id && c.mes === editModal.mes && c.anio === editModal.anio))
        return [...filtered, row]
      })
      toast.success('Cuota actualizada')
      setEditModal(null)
      api.get('/api/directiva/notificaciones').then(setNotif)
    } catch { toast.error('Error al guardar') }
    setSaving(false)
  }

  async function abrirMes() {
    if (!abrirForm.monto) { toast.error('El monto es requerido'); return }
    setSaving(true)
    try {
      const result = await api.post('/api/directiva/cuotas/abrir-mes', {
        mes: parseInt(abrirForm.mes),
        anio: parseInt(abrirForm.anio),
        monto: parseFloat(abrirForm.monto),
      })
      toast.success(`${result.creados} cuotas creadas${result.existentes > 0 ? `, ${result.existentes} ya existían` : ''}`)
      setAbrirMesModal(false)
      setFiltroMes(parseInt(abrirForm.mes))
      setFiltroAnio(parseInt(abrirForm.anio))
      const c = await api.get('/api/directiva/cuotas')
      setCuotas(c)
      api.get('/api/directiva/notificaciones').then(setNotif)
    } catch { toast.error('Error') }
    setSaving(false)
  }

  // Filtrado
  const filas = jugadores
    .map(j => ({ jugador: j, cuota: getCuota(j.id, filtroMes, filtroAnio) }))
    .filter(({ cuota }) => {
      if (filtroEstado === 'todos') return true
      if (filtroEstado === 'sin_pagar') return !cuota || cuota.estado !== 'pagado'
      return cuota?.estado === filtroEstado
    })

  const pagados   = filas.filter(r => r.cuota?.estado === 'pagado').length
  const pendientes = filas.filter(r => !r.cuota || r.cuota.estado === 'pendiente').length
  const vencidos  = filas.filter(r => r.cuota?.estado === 'vencido').length

  if (loading) return (
    <div className="p-6 space-y-4">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-3 gap-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  )

  return (
    <div className="p-4 lg:p-6 space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Cuotas</h1>
          {notif && notif.deudores > 0 && (
            <p className="text-sm text-red-400 flex items-center gap-1 mt-0.5">
              <AlertTriangle size={13} />
              {notif.deudores} jugadores con 2+ meses de deuda
            </p>
          )}
        </div>
        <Button onClick={() => setAbrirMesModal(true)}>
          <CalendarPlus size={16} /> Abrir mes
        </Button>
      </div>

      {/* Alertas */}
      {notif && (notif.cuotasPendientes > 0 || notif.cobrosVencidos > 0) && (
        <div className="grid sm:grid-cols-2 gap-3">
          {notif.cuotasPendientes > 0 && (
            <Card className="border-yellow-500/30 flex items-center gap-3 py-3">
              <Clock size={18} className="text-yellow-400 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-white">{notif.cuotasPendientes} cuotas sin pagar</p>
                <p className="text-xs text-slate-400">Meses anteriores al actual</p>
              </div>
            </Card>
          )}
          {notif.cobrosVencidos > 0 && (
            <Card className="border-red-500/30 flex items-center gap-3 py-3">
              <AlertTriangle size={18} className="text-red-400 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-white">{notif.cobrosVencidos} cobros de sponsors vencidos</p>
                <p className="text-xs text-slate-400">Revisar sección Sponsors</p>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Resumen del mes */}
      <div className="grid grid-cols-3 gap-3">
        <button onClick={() => setFiltroEstado(filtroEstado === 'pagado' ? 'todos' : 'pagado')}
          className={`rounded-xl p-3 text-center border transition-colors ${filtroEstado === 'pagado' ? 'bg-green-500/20 border-green-500/50' : 'bg-slate-800 border-slate-700 hover:border-slate-600'}`}>
          <p className="text-2xl font-bold text-green-400">{pagados}</p>
          <p className="text-xs text-slate-400">Pagados</p>
        </button>
        <button onClick={() => setFiltroEstado(filtroEstado === 'sin_pagar' ? 'todos' : 'sin_pagar')}
          className={`rounded-xl p-3 text-center border transition-colors ${filtroEstado === 'sin_pagar' ? 'bg-yellow-500/20 border-yellow-500/50' : 'bg-slate-800 border-slate-700 hover:border-slate-600'}`}>
          <p className="text-2xl font-bold text-yellow-400">{pendientes}</p>
          <p className="text-xs text-slate-400">Pendientes</p>
        </button>
        <button onClick={() => setFiltroEstado(filtroEstado === 'vencido' ? 'todos' : 'vencido')}
          className={`rounded-xl p-3 text-center border transition-colors ${filtroEstado === 'vencido' ? 'bg-red-500/20 border-red-500/50' : 'bg-slate-800 border-slate-700 hover:border-slate-600'}`}>
          <p className="text-2xl font-bold text-red-400">{vencidos}</p>
          <p className="text-xs text-slate-400">Vencidos</p>
        </button>
      </div>

      {/* Filtros mes/año */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter size={14} className="text-slate-500" />
        <Select value={filtroMes} onChange={e => setFiltroMes(parseInt(e.target.value))} className="w-36">
          {Array.from({length: 12}, (_, i) => <option key={i+1} value={i+1}>{monthName(i+1)}</option>)}
        </Select>
        <Select value={filtroAnio} onChange={e => setFiltroAnio(parseInt(e.target.value))} className="w-24">
          {[anioActual - 1, anioActual, anioActual + 1].map(a => <option key={a} value={a}>{a}</option>)}
        </Select>
        {filtroEstado !== 'todos' && (
          <button onClick={() => setFiltroEstado('todos')} className="flex items-center gap-1 text-xs text-slate-400 hover:text-white bg-slate-700 rounded-lg px-2 py-1">
            <X size={11} /> Limpiar filtro
          </button>
        )}
        <span className="text-xs text-slate-500 ml-auto">{pagados}/{jugadores.length} pagaron</span>
      </div>

      {/* Tabla inline */}
      {jugadores.length === 0 ? (
        <EmptyState icon={Users} title="Sin jugadores registrados" />
      ) : (
        <div className="rounded-xl border border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-900/50">
                  <th className="text-left px-4 py-3 text-slate-400 font-medium">Jugador</th>
                  <th className="text-left px-4 py-3 text-slate-400 font-medium">Estado</th>
                  <th className="text-left px-4 py-3 text-slate-400 font-medium hidden sm:table-cell">Monto</th>
                  <th className="text-left px-4 py-3 text-slate-400 font-medium hidden md:table-cell">Fecha pago</th>
                  <th className="text-right px-4 py-3 text-slate-400 font-medium">Acción</th>
                </tr>
              </thead>
              <tbody>
                {filas.map(({ jugador, cuota }) => {
                  const Icon = cuota ? (estadoIcon[cuota.estado] || Clock) : Clock
                  return (
                    <tr key={jugador.id} className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white shrink-0">
                            {jugador.nombre?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-white text-sm">{jugador.nombre} {jugador.apellido}</p>
                            {jugador.posicion && <p className="text-xs text-slate-500">{jugador.posicion}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {cuota ? (
                          <Badge variant={estadoBadge[cuota.estado]}>
                            {cuota.estado}
                          </Badge>
                        ) : (
                          <Badge variant="slate">Sin registro</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-300 hidden sm:table-cell">
                        {cuota?.monto ? formatCurrency(cuota.monto) : '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs hidden md:table-cell">
                        {cuota?.fecha_pago ? formatDate(cuota.fecha_pago) : '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {(!cuota || cuota.estado !== 'pagado') && (
                            <button
                              onClick={() => marcarPagado(jugador, filtroMes, filtroAnio, cuota?.monto)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-green-500/15 text-green-400 hover:bg-green-500/25 text-xs font-medium transition-colors"
                            >
                              <CheckCircle2 size={12} /> Pagó
                            </button>
                          )}
                          <button
                            onClick={() => openEdit(jugador, filtroMes, filtroAnio)}
                            className="px-2.5 py-1 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 text-xs transition-colors"
                          >
                            Editar
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal abrir mes */}
      <Modal open={abrirMesModal} onClose={() => setAbrirMesModal(false)} title="Abrir mes para todos los jugadores" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-slate-400">
            Crea una cuota <span className="text-yellow-400 font-medium">pendiente</span> para cada jugador del club en el mes seleccionado. Los que ya tengan registro no se modifican.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Select label="Mes" value={abrirForm.mes} onChange={e => setAbrirForm(f => ({...f, mes: parseInt(e.target.value)}))}>
              {Array.from({length: 12}, (_, i) => <option key={i+1} value={i+1}>{monthName(i+1)}</option>)}
            </Select>
            <Select label="Año" value={abrirForm.anio} onChange={e => setAbrirForm(f => ({...f, anio: parseInt(e.target.value)}))}>
              {[anioActual - 1, anioActual, anioActual + 1].map(a => <option key={a} value={a}>{a}</option>)}
            </Select>
          </div>
          <Input
            label="Monto por cuota (ARS) *"
            type="number" min="0" step="100"
            placeholder="Ej: 5000"
            value={abrirForm.monto}
            onChange={e => setAbrirForm(f => ({...f, monto: e.target.value}))}
          />
          <div className="bg-slate-700/30 rounded-lg px-3 py-2 text-xs text-slate-400">
            Se crearán <span className="text-white font-semibold">{jugadores.length}</span> registros para{' '}
            <span className="text-white font-semibold">{monthName(abrirForm.mes)} {abrirForm.anio}</span>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setAbrirMesModal(false)}>Cancelar</Button>
            <Button className="flex-1" loading={saving} onClick={abrirMes}>
              <CalendarPlus size={14} /> Abrir mes
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal editar cuota individual */}
      <Modal
        open={!!editModal}
        onClose={() => setEditModal(null)}
        title={editModal ? `${editModal.jugador.nombre} ${editModal.jugador.apellido} — ${monthName(editModal.mes)} ${editModal.anio}` : ''}
        size="sm"
      >
        <div className="space-y-4">
          <Select label="Estado" value={editForm.estado} onChange={e => setEditForm(f => ({...f, estado: e.target.value}))}>
            <option value="pagado">Pagado</option>
            <option value="pendiente">Pendiente</option>
            <option value="vencido">Vencido</option>
          </Select>
          {editForm.estado === 'pagado' && (
            <Input label="Fecha de pago" type="date" value={editForm.fecha_pago} onChange={e => setEditForm(f => ({...f, fecha_pago: e.target.value}))} />
          )}
          <Input label="Monto (ARS)" type="number" placeholder="0" value={editForm.monto} onChange={e => setEditForm(f => ({...f, monto: e.target.value}))} />
          <div className="flex gap-3 pt-1">
            <Button variant="secondary" className="flex-1" onClick={() => setEditModal(null)}>Cancelar</Button>
            <Button className="flex-1" loading={saving} onClick={saveEdit}>Guardar</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
