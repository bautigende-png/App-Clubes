import { useEffect, useState } from 'react'
import { api } from '../lib/api'

export function useNotificaciones() {
  const [data, setData] = useState({ deudores: 0, cuotasPendientes: 0, cobrosVencidos: 0 })

  useEffect(() => {
    api.get('/api/directiva/notificaciones')
      .then(setData)
      .catch(() => {})

    // Refresca cada 5 minutos
    const interval = setInterval(() => {
      api.get('/api/directiva/notificaciones').then(setData).catch(() => {})
    }, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  return data
}
