import { createContext, useContext, useEffect, useState } from 'react'
import { api } from '../lib/api'

const AuthContext = createContext(null)
const TOKEN_KEY = 'club_token'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) { setLoading(false); return }

    api.get('/api/auth/me')
      .then(data => {
        setUser({ id: data.id, email: data.email })
        setProfile(data)
      })
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setLoading(false))
  }, [])

  async function signIn(email, password) {
    try {
      const data = await api.post('/api/auth/login', { email, password })
      localStorage.setItem(TOKEN_KEY, data.token)
      setUser(data.user)
      setProfile(data.profile)
      return { error: null }
    } catch (err) {
      return { error: { message: err.message } }
    }
  }

  async function signOut() {
    localStorage.removeItem(TOKEN_KEY)
    setUser(null)
    setProfile(null)
  }

  async function updateProfile(fields) {
    const updated = await api.put('/api/auth/profile', fields)
    setProfile(prev => ({ ...prev, ...updated }))
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
