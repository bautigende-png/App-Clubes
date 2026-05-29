import { Router } from 'express'
import sql from '../db.js'
import { requireAuth, requireRole } from '../auth.js'

const router = Router()
const onlyJugador = [requireAuth, requireRole('jugador')]

// GET /api/jugador/cuotas
router.get('/cuotas', ...onlyJugador, async (req, res) => {
  const rows = await sql`
    SELECT * FROM cuotas_jugadores WHERE jugador_id = ${req.user.id}
    ORDER BY anio DESC, mes DESC
  `
  res.json(rows)
})

// GET /api/jugador/estadisticas
router.get('/estadisticas', ...onlyJugador, async (req, res) => {
  const [asistencias, participaciones] = await Promise.all([
    sql`SELECT asistio, entrenamiento_id FROM asistencia_entrenamiento WHERE jugador_id = ${req.user.id}`,
    sql`SELECT pp.*, p.fecha, p.rival FROM participacion_partido pp JOIN partidos p ON p.id = pp.partido_id WHERE pp.jugador_id = ${req.user.id} ORDER BY p.fecha DESC`,
  ])
  res.json({ asistencias, participaciones })
})

export default router
