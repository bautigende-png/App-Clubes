import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../lib/api'
import { Button } from '../../components/Button'
import { Input, Select } from '../../components/Input'
import { Shield, Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

const posiciones = ['Arquero', 'Defensor', 'Lateral', 'Mediocampista', 'Enganche', 'Extremo', 'Delantero', 'Otro']

export default function Registro() {
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const [step, setStep] = useState(1)
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    nombre: '', apellido: '', email: '', password: '', confirm: '',
    telefono: '', posicion: '', numero_camiseta: '', fecha_nacimiento: '',
  })
  const [errors, setErrors] = useState({})

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
    setErrors(e => ({ ...e, [field]: '' }))
  }

  function validateStep1() {
    const e = {}
    if (!form.nombre.trim()) e.nombre = 'Requerido'
    if (!form.apellido.trim()) e.apellido = 'Requerido'
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email inválido'
    if (form.password.length < 6) e.password = 'Mínimo 6 caracteres'
    if (form.password !== form.confirm) e.confirm = 'Las contraseñas no coinciden'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validateStep1()) return

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
      })

      // Auto-login con el token recibido
      localStorage.setItem('club_token', data.token)
      setSuccess(true)
      setTimeout(() => navigate('/jugador/perfil'), 2000)
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
          <h1 className="text-2xl font-bold text-white">¡Registro exitoso!</h1>
          <p className="text-slate-400">Redirigiendo a tu perfil...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/10 rounded-2xl mb-4">
            <Shield size={32} className="text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Crear cuenta</h1>
          <p className="text-slate-400 text-sm mt-1">Registrate como jugador del club</p>
        </div>

        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Datos personales */}
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-medium mb-3">Datos personales</p>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Nombre *"
                  placeholder="Juan"
                  value={form.nombre}
                  onChange={e => set('nombre', e.target.value)}
                  error={errors.nombre}
                />
                <Input
                  label="Apellido *"
                  placeholder="Pérez"
                  value={form.apellido}
                  onChange={e => set('apellido', e.target.value)}
                  error={errors.apellido}
                />
              </div>
            </div>

            <Input
              label="Email *"
              type="email"
              placeholder="tu@email.com"
              value={form.email}
              onChange={e => set('email', e.target.value)}
              error={errors.email}
              autoComplete="email"
            />

            <Input
              label="Teléfono"
              type="tel"
              placeholder="+54 9 11 1234-5678"
              value={form.telefono}
              onChange={e => set('telefono', e.target.value)}
            />

            <Input
              label="Fecha de nacimiento"
              type="date"
              value={form.fecha_nacimiento}
              onChange={e => set('fecha_nacimiento', e.target.value)}
            />

            {/* Datos del jugador */}
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-medium mb-3 pt-1 border-t border-slate-700">Datos del jugador</p>
              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="Posición"
                  value={form.posicion}
                  onChange={e => set('posicion', e.target.value)}
                >
                  <option value="">Sin definir</option>
                  {posiciones.map(p => <option key={p} value={p}>{p}</option>)}
                </Select>
                <Input
                  label="N° camiseta"
                  type="number"
                  min="1" max="99"
                  placeholder="10"
                  value={form.numero_camiseta}
                  onChange={e => set('numero_camiseta', e.target.value)}
                />
              </div>
            </div>

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
                      className={`w-full bg-slate-900 border rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-1 pr-10 ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-600 focus:border-green-500 focus:ring-green-500'}`}
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
                    className={`w-full bg-slate-900 border rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-1 ${errors.confirm ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-600 focus:border-green-500 focus:ring-green-500'}`}
                  />
                  {errors.confirm && <p className="text-xs text-red-400">{errors.confirm}</p>}
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full justify-center py-2.5 mt-2" loading={loading}>
              Crear cuenta
            </Button>
          </form>
        </div>

        <p className="text-center text-slate-500 text-sm mt-5">
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" className="text-green-400 hover:underline">Iniciá sesión</Link>
        </p>
      </div>
    </div>
  )
}
