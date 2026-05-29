import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { Card } from '../../components/Card'
import { Badge } from '../../components/Badge'
import { Skeleton } from '../../components/Skeleton'
import { formatCurrency, formatDate, monthName, getCurrentMonthYear } from '../../lib/utils'
import { CheckCircle2, Clock, AlertCircle, CreditCard } from 'lucide-react'

const estadoBadge = {
  pagado:   { variant: 'green',  icon: CheckCircle2, label: 'Pagado' },
  pendiente:{ variant: 'yellow', icon: Clock,        label: 'Pendiente' },
  vencido:  { variant: 'red',    icon: AlertCircle,  label: 'Vencido' },
}

export default function Pagos() {
  const [cuotas, setCuotas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/jugador/cuotas')
      .then(setCuotas)
      .finally(() => setLoading(false))
  }, [])

  const { mes, anio } = getCurrentMonthYear()
  const cuotaActual = cuotas.find(c => c.mes === mes && c.anio === anio)
  const deuda = cuotas.filter(c => c.estado !== 'pagado').reduce((s, c) => s + Number(c.monto || 0), 0)

  if (loading) {
    return (
      <div className="p-4 space-y-4 max-w-lg mx-auto">
        <Skeleton className="h-7 w-32 mt-2" />
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto">
      <h1 className="text-xl font-bold text-white pt-2">Mis Pagos</h1>

      <Card className={`border ${
        !cuotaActual ? 'border-slate-600' :
        cuotaActual.estado === 'pagado' ? 'border-green-500/40 bg-green-500/5' :
        cuotaActual.estado === 'vencido' ? 'border-red-500/40 bg-red-500/5' :
        'border-yellow-500/40 bg-yellow-500/5'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider">Cuota actual</p>
            <p className="text-lg font-bold text-white mt-0.5">{monthName(mes)} {anio}</p>
            {cuotaActual?.monto && <p className="text-slate-400 text-sm">{formatCurrency(cuotaActual.monto)}</p>}
          </div>
          <div className="flex flex-col items-end gap-2">
            {cuotaActual ? (
              <>
                <Badge variant={estadoBadge[cuotaActual.estado]?.variant}>{estadoBadge[cuotaActual.estado]?.label}</Badge>
                {cuotaActual.fecha_pago && <p className="text-xs text-slate-500">Pagó: {formatDate(cuotaActual.fecha_pago)}</p>}
              </>
            ) : (
              <Badge variant="slate">Sin registro</Badge>
            )}
          </div>
        </div>
      </Card>

      {deuda > 0 && (
        <Card className="border border-red-500/30 bg-red-500/5 flex items-center gap-3">
          <AlertCircle className="text-red-400 shrink-0" size={20} />
          <div>
            <p className="text-sm font-medium text-white">Deuda total</p>
            <p className="text-lg font-bold text-red-400">{formatCurrency(deuda)}</p>
          </div>
        </Card>
      )}

      <Card className="p-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-700">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <CreditCard size={16} className="text-slate-400" />
            Historial (últimos 12 meses)
          </h2>
        </div>
        {cuotas.length === 0 ? (
          <p className="text-center py-10 text-slate-500 text-sm">Sin registros de cuotas</p>
        ) : (
          <div className="divide-y divide-slate-700/50">
            {cuotas.slice(0, 12).map(c => {
              const badge = estadoBadge[c.estado] || estadoBadge.pendiente
              return (
                <div key={c.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-white">{monthName(c.mes)} {c.anio}</p>
                    {c.fecha_pago && <p className="text-xs text-slate-500">Pagado el {formatDate(c.fecha_pago)}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    {c.monto && <span className="text-sm text-slate-400">{formatCurrency(c.monto)}</span>}
                    <Badge variant={badge.variant}>{badge.label}</Badge>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}
