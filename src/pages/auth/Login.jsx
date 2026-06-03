import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useClub } from '../../context/ClubContext'
import { ClubLogo } from '../../components/ClubLogo'
import { Input } from '../../components/Input'
import { Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const { signIn }       = useAuth()
  const { settings }     = useClub()
  const navigate         = useNavigate()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

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
    <div
      className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 relative overflow-hidden"
      style={{
        paddingTop: 'max(1rem, env(safe-area-inset-top))',
        paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
      }}
    >

      {/* Glow principal detrás del logo */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[520px] h-[520px] -translate-y-1/2 rounded-full blur-3xl opacity-[0.18] pointer-events-none"
        style={{ backgroundColor: 'var(--club-primary)' }}
      />
      {/* Glow secundario esquina inferior derecha */}
      <div
        className="absolute bottom-0 right-0 w-72 h-72 translate-x-1/3 translate-y-1/3 rounded-full blur-3xl opacity-[0.10] pointer-events-none"
        style={{ backgroundColor: 'var(--club-primary)' }}
      />
      {/* Glow esquina inferior izquierda */}
      <div
        className="absolute bottom-0 left-0 w-48 h-48 -translate-x-1/3 translate-y-1/3 rounded-full blur-3xl opacity-[0.06] pointer-events-none"
        style={{ backgroundColor: 'var(--club-primary)' }}
      />

      <div className="w-full max-w-sm relative z-10">

        {/* Logo + nombre del club */}
        <div className="flex flex-col items-center mb-8 gap-4">

          {/* Badge con glow */}
          <div className="relative">
            <div
              className="absolute inset-0 rounded-3xl blur-xl opacity-60"
              style={{ backgroundColor: 'var(--club-primary)' }}
            />
            <div
              className="relative rounded-3xl flex items-center justify-center club-bg-soft"
              style={{
                width: 100,
                height: 100,
                border: '1px solid rgba(var(--club-primary-rgb), 0.3)',
              }}
            >
              <ClubLogo size={66} />
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-white tracking-tight">
              {settings?.nombre_club || 'Club Manager'}
            </h1>
            <p className="text-slate-400 text-sm mt-1">Iniciá sesión con tu cuenta</p>
          </div>
        </div>

        {/* Card del formulario */}
        <div
          className="rounded-2xl overflow-hidden shadow-2xl"
          style={{
            backgroundColor: 'rgb(30 41 59 / 0.92)',
            border: '1px solid rgba(var(--club-primary-rgb), 0.22)',
            backdropFilter: 'blur(12px)',
          }}
        >
          {/* Franja de color del club en el tope del card */}
          <div className="h-1 w-full" style={{ backgroundColor: 'var(--club-primary)' }} />

          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
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
                    autoComplete="current-password"
                    className="club-ring w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:border-transparent pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 text-sm text-red-400">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="club-btn w-full rounded-lg py-2.5 font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2 mt-1"
              >
                {loading && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
                Iniciar sesión
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-slate-500 text-sm mt-5">
          ¿No tenés cuenta?{' '}
          <Link to="/registro" className="club-text hover:underline font-medium">Registrate</Link>
        </p>
      </div>
    </div>
  )
}
