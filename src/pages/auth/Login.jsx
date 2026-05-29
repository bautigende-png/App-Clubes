import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import { Shield, Eye, EyeOff } from 'lucide-react'

const TEST_USERS = [
  { email: 'directiva@club.com', label: 'Comisión Directiva', color: 'text-green-400', bg: 'hover:bg-green-500/10 border-green-500/20' },
  { email: 'tecnico@club.com',   label: 'Cuerpo Técnico',     color: 'text-blue-400',  bg: 'hover:bg-blue-500/10 border-blue-500/20' },
  { email: 'jugador@club.com',   label: 'Jugador',            color: 'text-purple-400', bg: 'hover:bg-purple-500/10 border-purple-500/20' },
]

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) { setError('Email o contraseña incorrectos'); return }
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/10 rounded-2xl mb-4">
            <Shield size={32} className="text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Club Manager</h1>
          <p className="text-slate-400 text-sm mt-1">Ingresá con tu cuenta</p>
        </div>

        {/* Acceso rápido */}
        <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 mb-4">
          <p className="text-xs text-slate-500 mb-3">Acceso rápido (contraseña: 123456)</p>
          <div className="space-y-2">
            {TEST_USERS.map(u => (
              <button
                key={u.email}
                onClick={() => { setEmail(u.email); setPassword('123456'); setError('') }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border bg-transparent transition-colors cursor-pointer ${u.bg} ${email === u.email ? 'ring-1 ring-current' : 'opacity-70'}`}
              >
                <span className={`text-sm font-medium ${u.color}`}>{u.label}</span>
                <span className="text-xs text-slate-500">{u.email}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <div className="flex flex-col gap-1">
              <label className="text-sm text-slate-300">Contraseña</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 pr-10"
                />
                <button type="button" onClick={() => setShowPass(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            {error && <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 text-sm text-red-400">{error}</div>}
            <Button type="submit" className="w-full justify-center py-2.5" loading={loading}>Iniciar sesión</Button>
          </form>
        </div>
        <p className="text-center text-slate-500 text-sm mt-5">
          ¿Sos jugador y no tenés cuenta?{' '}
          <Link to="/registro" className="text-green-400 hover:underline">Registrate acá</Link>
        </p>
      </div>
    </div>
  )
}
