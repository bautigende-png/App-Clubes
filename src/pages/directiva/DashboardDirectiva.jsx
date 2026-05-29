import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { Card, StatCard } from '../../components/Card'
import { Badge } from '../../components/Badge'
import { Skeleton } from '../../components/Skeleton'
import { formatCurrency, formatDate, monthName } from '../../lib/utils'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { DollarSign, TrendingUp, TrendingDown, Package, AlertTriangle, Handshake } from 'lucide-react'

export default function DashboardDirectiva() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/directiva/dashboard').then(raw => {
      const { txMes, txAnio, sponsorsActivos, cobrosP, invAlertas, cuotasPend, ultTx, mes, anio } = raw

      const ingresosMes = txMes.filter(t => t.tipo === 'ingreso').reduce((s, t) => s + Number(t.monto || 0), 0)
      const egresosMes  = txMes.filter(t => t.tipo === 'egreso').reduce((s, t)  => s + Number(t.monto || 0), 0)

      const mesesData = {}
      for (let m = 1; m <= mes; m++) mesesData[m] = { mes: monthName(m).slice(0, 3), ingresos: 0, egresos: 0 }
      for (const t of txAnio) {
        const m = new Date(t.fecha + 'T00:00').getMonth() + 1
        if (mesesData[m]) {
          if (t.tipo === 'ingreso') mesesData[m].ingresos += Number(t.monto || 0)
          else mesesData[m].egresos += Number(t.monto || 0)
        }
      }

      setData({
        ingresosMes, egresosMes, balanceMes: ingresosMes - egresosMes,
        chartData: Object.values(mesesData),
        sponsorsActivos: sponsorsActivos.length,
        montoSponsors: sponsorsActivos.reduce((s, a) => s + Number(a.monto_total || 0), 0),
        cobrosVencidos: cobrosP.length,
        invAlertas,
        cuotasPend: cuotasPend.length,
        ultTx, mes, anio,
      })
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="p-6 space-y-4">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[1,2,3,4].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
    </div>
  )

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <h1 className="text-2xl font-bold text-white">Dashboard — {data && monthName(data.mes)} {data?.anio}</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Ingresos del mes" value={formatCurrency(data.ingresosMes)} icon={TrendingUp} color="green" />
        <StatCard label="Egresos del mes" value={formatCurrency(data.egresosMes)} icon={TrendingDown} color="red" />
        <StatCard label="Balance del mes" value={formatCurrency(data.balanceMes)} icon={DollarSign} color={data.balanceMes >= 0 ? 'green' : 'red'} />
        <StatCard label="Cuotas pendientes" value={data.cuotasPend} icon={Package} color="yellow" sub="mes actual" />
      </div>

      <Card>
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Ingresos vs Egresos {data.anio}</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data.chartData} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis dataKey="mes" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} formatter={v => formatCurrency(v)} />
            <Bar dataKey="ingresos" fill="#22c55e" radius={[4,4,0,0]} name="Ingresos" />
            <Bar dataKey="egresos" fill="#ef4444" radius={[4,4,0,0]} name="Egresos" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2"><Handshake size={14} className="text-green-400" />Sponsors activos</h2>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-bold text-white">{data.sponsorsActivos}</p>
              <p className="text-slate-400 text-sm">acuerdos vigentes</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-green-400">{formatCurrency(data.montoSponsors)}</p>
              <p className="text-xs text-slate-500">monto total</p>
            </div>
          </div>
          {data.cobrosVencidos > 0 && (
            <div className="mt-3 flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
              <AlertTriangle size={14} className="text-red-400" />
              <p className="text-sm text-red-400">{data.cobrosVencidos} cobros pendientes este mes</p>
            </div>
          )}
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2"><DollarSign size={14} className="text-green-400" />Últimas transacciones</h2>
          {data.ultTx.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-4">Sin transacciones</p>
          ) : (
            <div className="space-y-2">
              {data.ultTx.map(t => (
                <div key={t.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white">{t.descripcion || t.categoria}</p>
                    <p className="text-xs text-slate-500">{formatDate(t.fecha)}</p>
                  </div>
                  <span className={`font-semibold text-sm ${t.tipo === 'ingreso' ? 'text-green-400' : 'text-red-400'}`}>
                    {t.tipo === 'ingreso' ? '+' : '-'}{formatCurrency(t.monto)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {data.invAlertas.length > 0 && (
        <Card className="border-yellow-500/30">
          <h2 className="text-sm font-semibold text-yellow-400 uppercase tracking-wider mb-3 flex items-center gap-2"><AlertTriangle size={14} />Alertas de inventario</h2>
          <div className="space-y-2">
            {data.invAlertas.map(item => (
              <div key={item.id} className="flex items-center justify-between py-1.5">
                <p className="text-sm text-white">{item.nombre}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Min: {item.cantidad_minima}</span>
                  <Badge variant={item.cantidad_actual === 0 ? 'red' : 'yellow'}>
                    {item.cantidad_actual === 0 ? 'Sin stock' : `${item.cantidad_actual} und.`}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
