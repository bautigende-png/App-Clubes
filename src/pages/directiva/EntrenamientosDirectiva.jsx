import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { Modal } from '../../components/Modal'
import { Input } from '../../components/Input'
import { Badge } from '../../components/Badge'
import { EmptyState } from '../../components/EmptyState'
import { Skeleton } from '../../components/Skeleton'
import { formatCurrency, formatDate } from '../../lib/utils'
import { Dumbbell, Users, DollarSign, TrendingDown, Pencil, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

export default function EntrenamientosDirectiva() {
  const [entrenamientos, setEntrenamientos] = useState([])
  const [loading, setLoading]               = useState(true)
  const [costoModal, setCostoModal]         = useState(null) // entrenamiento seleccionado
  const [costoInput, setCostoInput]         = useState('')
  const [saving, setSaving]                 = useState(false)

  useEffect(() => { load() }, [])

  function load() {
    api.get('/api/directiva/entrenamientos').then(setEntrenamientos).finally(() => setLoading(false))
  }

  function openCosto(e) {
    setCostoModal(e)
    setCostoInput(e.costo != null ? String(e.costo) : '')
  }

  async function saveCosto() {
    if (costoInput !== '' && (isNaN(parseFloat(costoInput)) || parseFloat(costoInput) < 0)) {
      toast.error('Ingresá un monto válido')
      return
    }
    setSaving(true)
    try {
      const updated = await api.put(`/api/directiva/entrenamientos/${costoModal.id}/costo`, {
        costo: costoInput !== '' ? parseFloat(costoInput) : null,
      })
      setEntrenamientos(prev => prev.map(e => e.id === updated.id ? { ...e, ...updated } : e))
      toast.success(costoInput !== '' ? 'Costo registrado como egreso' : 'Costo eliminado')
      setCostoModal(null)
    } catch (err) {
      toast.error(err.message || 'Error al guardar')
    }
    setSaving(false)
  }

  const totalCosto = entrenamientos.reduce((s, e) => s + Number(e.costo || 0), 0)
  const conCosto   = entrenamientos.filter(e => e.costo != null).length
  const sinCosto   = entrenamientos.filter(e => e.costo == null).length

  if (loading) return (
    <div className="p-4 lg:p-6 space-y-4">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-3 gap-3">{[1,2,3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
      <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
    </div>
  )

  return (
    <div className="p-4 lg:p-6 space-y-5">

      <div>
        <h1 className="text-2xl font-bold text-white">Entrenamientos</h1>
        <p className="text-sm text-slate-400 mt-0.5">Costos fijos de cada entrenamiento → se registran como egresos automáticamente</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="text-center py-3">
          <TrendingDown size={18} className="text-red-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-red-400">{formatCurrency(totalCosto)}</p>
          <p className="text-xs text-slate-500">Total registrado</p>
        </Card>
        <Card className="text-center py-3">
          <CheckCircle2 size={18} className="text-green-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-white">{conCosto}</p>
          <p className="text-xs text-slate-500">Con costo</p>
        </Card>
        <Card className="text-center py-3">
          <Dumbbell size={18} className="text-slate-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-white">{sinCosto}</p>
          <p className="text-xs text-slate-500">Sin costo</p>
        </Card>
      </div>

      {/* Lista */}
      {entrenamientos.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          title="Sin entrenamientos"
          description="El cuerpo técnico crea los entrenamientos desde su sección."
        />
      ) : (
        <div className="space-y-2">
          {entrenamientos.map(e => (
            <div
              key={e.id}
              className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                  <Dumbbell size={18} className="text-blue-400" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-white text-sm">{formatDate(e.fecha)}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    {e.horario && <span className="text-xs text-slate-500">{e.horario}</span>}
                    {e.lugar   && <span className="text-xs text-slate-500">· {e.lugar}</span>}
                    {e.asistentes != null && (
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        · <Users size={10} /> {e.asistentes} presentes
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {e.costo != null ? (
                  <div className="text-right">
                    <p className="text-sm font-bold text-red-400">{formatCurrency(e.costo)}</p>
                    <Badge variant="red" className="text-xs">egreso</Badge>
                  </div>
                ) : (
                  <span className="text-xs text-slate-600">Sin costo</span>
                )}
                <button
                  onClick={() => openCosto(e)}
                  className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
                  title="Editar costo"
                >
                  <Pencil size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal costo */}
      <Modal
        open={!!costoModal}
        onClose={() => setCostoModal(null)}
        title={`Costo — Entrenamiento ${costoModal ? formatDate(costoModal.fecha) : ''}`}
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-400">
            Al guardar un monto se registra automáticamente como un <span className="text-red-400 font-medium">egreso</span> en Finanzas.
            Si lo dejás vacío se elimina el egreso vinculado.
          </p>

          <div className="bg-slate-700/30 rounded-xl p-3 space-y-1 text-sm">
            <div className="flex justify-between text-slate-400">
              <span>Fecha</span>
              <span className="text-white">{costoModal ? formatDate(costoModal.fecha) : '-'}</span>
            </div>
            {costoModal?.horario && (
              <div className="flex justify-between text-slate-400">
                <span>Horario</span>
                <span className="text-white">{costoModal.horario}</span>
              </div>
            )}
            {costoModal?.asistentes != null && (
              <div className="flex justify-between text-slate-400">
                <span>Asistentes</span>
                <span className="text-white">{costoModal.asistentes} jugadores</span>
              </div>
            )}
          </div>

          <Input
            label="Costo del entrenamiento (ARS)"
            type="number"
            min="0"
            step="100"
            placeholder="Ej: 15000"
            value={costoInput}
            onChange={e => setCostoInput(e.target.value)}
            autoFocus
          />

          {costoInput && !isNaN(parseFloat(costoInput)) && parseFloat(costoInput) > 0 && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-sm">
              <DollarSign size={14} className="text-red-400 shrink-0" />
              <p className="text-red-300">
                Se registrará <span className="font-bold">{formatCurrency(parseFloat(costoInput))}</span> como egreso en Finanzas
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <Button variant="secondary" className="flex-1" onClick={() => setCostoModal(null)}>
              Cancelar
            </Button>
            <Button className="flex-1" loading={saving} onClick={saveCosto}>
              Guardar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
