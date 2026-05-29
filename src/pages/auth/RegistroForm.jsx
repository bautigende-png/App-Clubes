import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../lib/api'
import { Button } from '../../components/Button'
import { Input, Select } from '../../components/Input'
import { Shield, Eye, EyeOff, CheckCircle2, Users, Dumbbell, Trophy, Lock } from 'lucide-react'
import { toast } from 'sonner'

const posiciones = ['Arquero', 'Defensor', 'Lateral', 'Mediocampista', 'Enganche', 'Extremo', 'Delantero', 'Otro']

const config = {
  jugador: {
    label: 'Jugador',
    icon: Trophy,
    color: 'green',
    iconBg: 'bg-green-500/10 text-green-400',
    accent: 'focus:border-green-500 focus:ring-green-500',
    btn: 'bg-green-500 hover:bg-green-600',
    needsCode: false,
    showPlayerFields: true,
  },
  tecnico: {
    label: 'Cuerpo Técnico',
    icon: Dumbbell,
    color: 'blue',
    iconBg: 'bg-blue-500/10 text-blue-400',
    accent: 'focus:border-blue-500 focus:ring-blue-500',
    btn: 'bg-blue-600 hover:bg-blue-700',
    needsCode: true,
    showPlayerFields: false,
  },
  directiva: {
    label: 'Comisión Directiva',
    icon: Users,
    color: 'purple',
    iconBg: 'bg-purple-500/10 text-purple-400',
    accent: 'focus:border-purple-500 focus:ring-purple-500',
    btn: 'bg-purple-600 hover:bg-purple-700',
    needsCode: true,
    showPlayerFields: false,
  },
}

export default function RegistroForm({ role }) {
  const navigate = useNavigate()
  const cfg = config[role]
  const Icon = cfg.icon

  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errors, setErrors] = useState({})

  const [form, setForm] = useState({
    nombre: '', apellido: '', email: '', password: '', confirm: '',
    telefono: '', posicion: '', numero_camiseta: '', fecha_nacimiento: '',
    invite_code: '',
  })

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
    setErrors(e => ({ ...e, [field]: '' }))
  }

  function validate() {
    const e = {}
    if (!form.nombre.trim()) e.nombre = 'Requerido'
    if (!form.apellido.trim()) e.apellido = 'Requerido'
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email inválido'
    if (form.password.length < 6) e.password = 'Mínimo 6 caracteres'
    if (form.password !== form.confirm) e.confirm = 'Las contraseñas no coinciden'
    if (cfg.needsCode && !form.invite_code.trim()) e.invite_code = 'El código es requerido'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const data = await api.post('/api/auth/register', {
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        telefono: form.telefono || null,
        posicion: form.posicion || null,
        numero_camiseta: form.numero_camiseta || null,
        fecha_nacimiento: form.fecha_nacimiento || null,
        role,
        invite_code: form.invite_code || null,
      })
      localStorage.setItem('club_token', data.token)
      setSuccess(true)
      setTimeout(() => {
        if (role === 'jugador') navigate('/jugador/perfil')
        else if (role === 'tecnico') navigate('/tecnico/dashboard')
        else navigate('/directiva/dashboard')
      }, 1800)
    } catch (err) {
      toast.error(err.message || 'Error al registrarse')
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full">
            <CheckCircle2 size={40} className="text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">¡Bienvenido al club!</h1>
          <p className="text-slate-400">Redirigiendo...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-7">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 ${cfg.iconBg}`}>
            <Icon size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white">Registro — {cfg.label}</h1>
          <p className="text-slate-400 text-sm mt-1">Completá tus datos para crear tu cuenta</p>
        </div>

        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Código de acceso (solo técnico y directiva) */}
            {cfg.needsCode && (
              <div className="bg-slate-900/60 border border-slate-600 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
                  <Lock size={14} className="text-slate-400" />
                  Código de acceso
                </div>
                <p className="text-xs text-slate-500">El administrador del club te tiene que proveer este código.</p>
                <input
                  type="text"
                  placeholder="Ingresá el código..."
                  value={form.invite_code}
                  onChange={e => set('invite_code', e.target.value)}
                  className={`w-full bg-slate-800 border rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-1 text-sm tracking-widest ${errors.invite_code ? 'border-red-500' : 'border-slate-600'} ${cfg.accent}`}
                />
                {errors.invite_code && <p className="text-xs text-red-400">{errors.invite_code}</p>}
              </div>
            )}

            {/* Datos personales */}
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-medium mb-3">Datos personales</p>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Nombre *" placeholder="Juan" value={form.nombre} onChange={e => set('nombre', e.target.value)} error={errors.nombre} />
                <Input label="Apellido *" placeholder="Pérez" value={form.apellido} onChange={e => set('apellido', e.target.value)} error={errors.apellido} />
              </div>
            </div>

            <Input label="Email *" type="email" placeholder="tu@email.com" value={form.email} onChange={e => set('email', e.target.value)} error={errors.email} autoComplete="email" />
            <Input label="Teléfono" type="tel" placeholder="+54 9 11 1234-5678" value={form.telefono} onChange={e => set('telefono', e.target.value)} />
            <Input label="Fecha de nacimiento" type="date" value={form.fecha_nacimiento} onChange={e => set('fecha_nacimiento', e.target.value)} />

            {/* Campos específicos de jugador */}
            {cfg.showPlayerFields && (
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-medium mb-3 pt-1 border-t border-slate-700">Datos del jugador</p>
                <div className="grid grid-cols-2 gap-3">
                  <Select label="Posición" value={form.posicion} onChange={e => set('posicion', e.target.value)}>
                    <option value="">Sin definir</option>
                    {posiciones.map(p => <option key={p} value={p}>{p}</option>)}
                  </Select>
                  <Input label="N° camiseta" type="number" min="1" max="99" placeholder="10" value={form.numero_camiseta} onChange={e => set('numero_camiseta', e.target.value)} />
                </div>
              </div>
            )}

            {/* Contraseña */}
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-medium mb-3 pt-1 border-t border-slate-700">Contraseña</p>
              <div className="space-y-3">
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-slate-300">Contraseña * <span className="text-slate-500 font-normal">(mín. 6 caracteres)</span></label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={form.password}
                      onChange={e => set('password', e.target.value)}
                      className={`w-full bg-slate-900 border rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-1 pr-10 ${errors.password ? 'border-red-500' : 'border-slate-600'} ${cfg.accent}`}
                    />
                    <button type="button" onClick={() => setShowPass(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-red-400">{errors.password}</p>}
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-slate-300">Confirmar contraseña *</label>
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={form.confirm}
                    onChange={e => set('confirm', e.target.value)}
                    className={`w-full bg-slate-900 border rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-1 ${errors.confirm ? 'border-red-500' : 'border-slate-600'} ${cfg.accent}`}
                  />
                  {errors.confirm && <p className="text-xs text-red-400">{errors.confirm}</p>}
                </div>
              </div>
            </div>

            <Button type="submit" className={`w-full justify-center py-2.5 mt-1 text-white ${cfg.btn}`} loading={loading}>
              Crear cuenta
            </Button>
          </form>
        </div>

        <div className="flex items-center justify-between mt-5 text-sm text-slate-500">
          <Link to="/registro" className="hover:text-slate-300 transition-colors">← Volver</Link>
          <Link to="/login" className="text-green-400 hover:underline">Ya tengo cuenta</Link>
        </div>
      </div>
    </div>
  )
}
