import { createContext, useContext, useEffect, useState } from 'react'
import { api } from '../lib/api'

const AuthContext = createContext(null)
const TOKEN_KEY   = 'club_token'
const PROFILE_KEY = 'club_profile'

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) { setLoading(false); return }

    // Restore cached profile instantly — app opens without spinner
    try {
      const cached = JSON.parse(localStorage.getItem(PROFILE_KEY) || 'null')
      if (cached) {
        setUser({ id: cached.id, email: cached.email })
        setProfile(cached)
        setLoading(false)
      }
    } catch {
      localStorage.removeItem(PROFILE_KEY)
    }

    // Silent background verification
    api.get('/api/auth/me')
      .then(data => {
        setUser({ id: data.id, email: data.email })
        setProfile(data)
        localStorage.setItem(PROFILE_KEY, JSON.stringify(data))
      })
      .catch(err => {
        // Only log out on actual auth failures, not network errors
        const authFailed = err.message === 'No autenticado' || err.message === 'Token inválido'
        if (authFailed) {
          localStorage.removeItem(TOKEN_KEY)
          localStorage.removeItem(PROFILE_KEY)
          setUser(null)
          setProfile(null)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  async function signIn(email, password) {
    try {
      const data = await api.post('/api/auth/login', { email, password })
      localStorage.setItem(TOKEN_KEY, data.token)
      localStorage.setItem(PROFILE_KEY, JSON.stringify(data.profile))
      setUser(data.user)
      setProfile(data.profile)
      return { error: null }
    } catch (err) {
      return { error: { message: err.message } }
    }
  }

  async function signOut() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(PROFILE_KEY)
    setUser(null)
    setProfile(null)
  }

  async function updateProfile(fields) {
    const updated = await api.put('/api/auth/profile', fields)
    const merged = { ...profile, ...updated }
    setProfile(merged)
    localStorage.setItem(PROFILE_KEY, JSON.stringify(merged))
    return updated
  }

  const role = profile?.role ?? null

  return (
    <AuthContext.Provider value={{ user, profile, role, loading, signIn, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
