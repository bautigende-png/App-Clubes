import { Router } from 'express'
import sql from '../db.js'
import { requireAuth, requireRole } from '../auth.js'

const router = Router()

router.get('/', async (_req, res) => {
  const [settings] = await sql`SELECT * FROM club_settings WHERE id = 1`
  res.json(settings || {})
})

router.put('/', requireAuth, requireRole('directiva'), async (req, res) => {
  const { nombre_club, color_primario, color_secundario, logo_url, tarifa_completa, tarifa_media } = req.body
  const [updated] = await sql`
    UPDATE club_settings SET
      nombre_club      = ${nombre_club ?? 'Mi Club'},
      color_primario   = ${color_primario ?? '#22c55e'},
      color_secundario = ${color_secundario ?? '#3b82f6'},
      logo_url         = ${logo_url ?? null},
      tarifa_completa  = ${tarifa_completa != null ? parseFloat(tarifa_completa) : 5000},
      tarifa_media     = ${tarifa_media != null ? parseFloat(tarifa_media) : 2500},
      updated_at       = now()
    WHERE id = 1
    RETURNING *
  `
  res.json(updated)
})

export default router
