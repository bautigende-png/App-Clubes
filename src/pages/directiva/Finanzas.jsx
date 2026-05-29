import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { Modal } from '../../components/Modal'
import { Input, Select, Textarea } from '../../components/Input'
import { Badge } from '../../components/Badge'
import { Table, Tr, Td } from '../../components/Table'
import { EmptyState } from '../../components/EmptyState'
import { formatCurrency, formatDate } from '../../lib/utils'
import { Plus, DollarSign, TrendingUp, TrendingDown, Download, Filter } from 'lucide-react'
import { toast } from 'sonner'

const categorias = ['cuota', 'sponsor', 'venta', 'utilería', 'arbitraje', 'traslado', 'otros']
const tipoBadge = { ingreso: 'green', egreso: 'red' }

export default function Finanzas() {
  const [transacciones, setTransacciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [newModal, setNewModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [filters, setFilters] = useState({ tipo: '', categoria: '', fechaDesde: '', fechaHasta: '' })
  const [form, setForm] = useState({ tipo: 'ingreso', categoria: 'otros', descripcion: '', monto: '', fecha: new Date().toISOString().split('T')[0], notas: '' })

  useEffect(() => { load() }, [])

  function load() {
    api.get('/api/directiva/transacciones').then(setTransacciones).finally(() => setLoading(false))
  }

  const filtered = transacciones.filter(t => {
    if (filters.tipo && t.tipo !== filters.tipo) return false
    if (filters.categoria && t.categoria !== filters.categoria) return false
    if (filters.fechaDesde && t.fecha < filters.fechaDesde) return false
    if (filters.fechaHasta && t.fecha > filters.fechaHasta) return false
    return true
  })

  const totalIngresos = filtered.filter(t => t.tipo === 'ingreso').reduce((s, t) => s + Number(t.monto || 0), 0)
  const totalEgresos  = filtered.filter(t => t.tipo === 'egreso').reduce((s, t)  => s + Number(t.monto || 0), 0)

  async function create() {
    if (!form.monto || !form.fecha) { toast.error('Monto y fecha son requeridos'); return }
    setSaving(true)
    try {
      await api.post('/api/directiva/transacciones', { ...form, monto: parseFloat(form.monto) })
      toast.success('Transacción registrada')
      setNewModal(false)
      setForm({ tipo: 'ingreso', categoria: 'otros', descripcion: '', monto: '', fecha: new Date().toISOString().split('T')[0], notas: '' })
      load()
    } catch { toast.error('Error al guardar') }
    setSaving(false)
  }

  function exportCSV() {
    const rows = [['Fecha','Tipo','Categoría','Descripción','Monto'], ...filtered.map(t => [t.fecha, t.tipo, t.categoria, t.descripcion || '', t.monto])]
    const a = document.createElement('a')
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(rows.map(r => r.join(',')).join('\n'))
    a.download = 'finanzas.csv'
    a.click()
  }

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Finanzas — Caja</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportCSV}><Download size={14} /> CSV</Button>
          <Button onClick={() => setNewModal(true)}><Plus size={16} /> Nueva</Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="text-center"><TrendingUp size={20} className="text-green-400 mx-auto mb-1" /><p className="text-xs text-slate-400">Ingresos</p><p className="text-xl font-bold text-green-400">{formatCurrency(totalIngresos)}</p></Card>
        <Card className="text-center"><TrendingDown size={20} className="text-red-400 mx-auto mb-1" /><p className="text-xs text-slate-400">Egresos</p><p className="text-xl font-bold text-red-400">{formatCurrency(totalEgresos)}</p></Card>
        <Card className="text-center"><DollarSign size={20} className={`mx-auto mb-1 ${totalIngresos - totalEgresos >= 0 ? 'text-green-400' : 'text-red-400'}`} /><p className="text-xs text-slate-400">Balance</p><p className={`text-xl font-bold ${totalIngresos - totalEgresos >= 0 ? 'text-green-400' : 'text-red-400'}`}>{formatCurrency(totalIngresos - totalEgresos)}</p></Card>
      </div>

      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3 text-sm text-slate-400"><Filter size={14} />Filtros</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Select value={filters.tipo} onChange={e => setFilters(f => ({...f, tipo: e.target.value}))}>
            <option value="">Todos los tipos</option>
            <option value="ingreso">Ingresos</option>
            <option value="egreso">Egresos</option>
          </Select>
          <Select value={filters.categoria} onChange={e => setFilters(f => ({...f, categoria: e.target.value}))}>
            <option value="">Todas las categorías</option>
            {categorias.map(c => <option key={c} value={c}>{c}</option>)}
          </Select>
          <Input type="date" value={filters.fechaDesde} onChange={e => setFilters(f => ({...f, fechaDesde: e.target.value}))} />
          <Input type="date" value={filters.fechaHasta} onChange={e => setFilters(f => ({...f, fechaHasta: e.target.value}))} />
        </div>
      </Card>

      {loading ? <p className="text-slate-400 py-8 text-center">Cargando...</p> :
       filtered.length === 0 ? <EmptyState icon={DollarSign} title="Sin transacciones" /> : (
        <Table headers={['Fecha', 'Tipo', 'Categoría', 'Descripción', 'Monto']}>
          {filtered.map(t => (
            <Tr key={t.id}>
              <Td>{formatDate(t.fecha)}</Td>
              <Td><Badge variant={tipoBadge[t.tipo]}>{t.tipo}</Badge></Td>
              <Td className="capitalize">{t.categoria}</Td>
              <Td>{t.descripcion || '-'}</Td>
              <Td className={`font-semibold ${t.tipo === 'ingreso' ? 'text-green-400' : 'text-red-400'}`}>
                {t.tipo === 'ingreso' ? '+' : '-'}{formatCurrency(t.monto)}
              </Td>
            </Tr>
          ))}
        </Table>
      )}

      <Modal open={newModal} onClose={() => setNewModal(false)} title="Nueva transacción">
        <div className="space-y-4">
          <Select label="Tipo *" value={form.tipo} onChange={e => setForm(f => ({...f, tipo: e.target.value}))}>
            <option value="ingreso">Ingreso</option><option value="egreso">Egreso</option>
          </Select>
          <Select label="Categoría" value={form.categoria} onChange={e => setForm(f => ({...f, categoria: e.target.value}))}>
            {categorias.map(c => <option key={c} value={c}>{c}</option>)}
          </Select>
          <Input label="Descripción" value={form.descripcion} onChange={e => setForm(f => ({...f, descripcion: e.target.value}))} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Monto (ARS) *" type="number" min="0" step="0.01" value={form.monto} onChange={e => setForm(f => ({...f, monto: e.target.value}))} />
            <Input label="Fecha *" type="date" value={form.fecha} onChange={e => setForm(f => ({...f, fecha: e.target.value}))} />
          </div>
          <Textarea label="Notas" rows={2} value={form.notas} onChange={e => setForm(f => ({...f, notas: e.target.value}))} />
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setNewModal(false)}>Cancelar</Button>
            <Button className="flex-1" loading={saving} onClick={create}>Registrar</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
