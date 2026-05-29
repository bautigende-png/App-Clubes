import { Router } from 'express'
import sql from '../db.js'
import { requireAuth, requireRole } from '../auth.js'

const router = Router()

// GET público — todos los usuarios necesitan los colores y logo
router.get('/', async (_req, res) => {
  const [settings] = await sql`SELECT * FROM club_settings WHERE id = 1`
  res.json(settings || {})
})

// PUT — solo directiva
router.put('/', requireAuth, requireRole('directiva'), async (req, res) => {
  const { nombre_club, color_primario, color_secundario, logo_url } = req.body
  const [updated] = await sql`
    UPDATE club_settings SET
      nombre_club     = ${nombre_club ?? 'Mi Club'},
      color_primario  = ${color_primario ?? '#22c55e'},
      color_secundario = ${color_secundario ?? '#3b82f6'},
      logo_url        = ${logo_url ?? null},
      updated_at      = now()
    WHERE id = 1
    RETURNING *
  `
  res.json(updated)
})

export default router
