import { createContext, useContext, useEffect, useState } from 'react'
import { api } from '../lib/api'

const ClubContext = createContext(null)

const DEFAULTS = {
  nombre_club: 'Club Manager',
  color_primario: '#22c55e',
  color_secundario: '#3b82f6',
  logo_url: null,
}

function applyColors(primario, secundario) {
  const root = document.documentElement
  root.style.setProperty('--club-primary', primario)
  root.style.setProperty('--club-secondary', secundario)

  // Generar variantes claras para bg/border (hex → rgba)
  const toRgb = hex => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `${r}, ${g}, ${b}`
  }
  try {
    root.style.setProperty('--club-primary-rgb', toRgb(primario))
    root.style.setProperty('--club-secondary-rgb', toRgb(secundario))
  } catch {}
}

export function ClubProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULTS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/settings')
      .then(data => {
        const merged = { ...DEFAULTS, ...data }
        setSettings(merged)
        applyColors(merged.color_primario, merged.color_secundario)
      })
      .catch(() => applyColors(DEFAULTS.color_primario, DEFAULTS.color_secundario))
      .finally(() => setLoading(false))
  }, [])

  async function updateSettings(newSettings) {
    const updated = await api.put('/api/settings', newSettings)
    const merged = { ...DEFAULTS, ...updated }
    setSettings(merged)
    applyColors(merged.color_primario, merged.color_secundario)
    return merged
  }

  return (
    <ClubContext.Provider value={{ settings, loading, updateSettings }}>
      {children}
    </ClubContext.Provider>
  )
}

export function useClub() {
  return useContext(ClubContext)
}
