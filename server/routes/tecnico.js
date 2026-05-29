import { Router } from 'express'
import sql from '../db.js'
import { requireAuth, requireRole } from '../auth.js'

const router = Router()
const onlyTecnico = [requireAuth, requireRole('tecnico')]

// ─── DASHBOARD ────────────────────────────────────────────────

router.get('/dashboard', ...onlyTecnico, async (req, res) => {
  const today = new Date().toISOString().split('T')[0]
  const [entrenos, proxEntreno, partidos, proxPartido, asistencias, jugadores, participaciones] = await Promise.all([
    sql`SELECT id, fecha FROM entrenamientos ORDER BY fecha DESC LIMIT 5`,
    sql`SELECT * FROM entrenamientos WHERE fecha >= ${today} ORDER BY fecha LIMIT 1`,
    sql`SELECT * FROM partidos ORDER BY fecha DESC LIMIT 5`,
    sql`SELECT * FROM partidos WHERE fecha >= ${today} ORDER BY fecha LIMIT 1`,
    sql`SELECT entrenamiento_id, asistio, jugador_id FROM asistencia_entrenamiento`,
    sql`SELECT id, nombre, apellido FROM profiles WHERE role = 'jugador'`,
    sql`SELECT pp.jugador_id, pp.puntuacion, p.nombre, p.apellido FROM participacion_partido pp JOIN profiles p ON p.id = pp.jugador_id WHERE pp.puntuacion IS NOT NULL`,
  ])
  res.json({ entrenos, proxEntreno: proxEntreno[0] ?? null, partidos, proxPartido: proxPartido[0] ?? null, asistencias, jugadores, participaciones })
})

// ─── ENTRENAMIENTOS ───────────────────────────────────────────

router.get('/entrenamientos', ...onlyTecnico, async (req, res) => {
  const rows = await sql`SELECT * FROM entrenamientos ORDER BY fecha DESC`
  res.json(rows)
})

router.post('/entrenamientos', ...onlyTecnico, async (req, res) => {
  const { fecha, horario, lugar, notas } = req.body
  const [row] = await sql`
    INSERT INTO entrenamientos (fecha, horario, lugar, notas, creado_por)
    VALUES (${fecha}, ${horario ?? null}, ${lugar ?? null}, ${notas ?? null}, ${req.user.id})
    RETURNING *
  `
  res.json(row)
})

router.get('/entrenamientos/:id/asistencia', ...onlyTecnico, async (req, res) => {
  const rows = await sql`SELECT * FROM asistencia_entrenamiento WHERE entrenamiento_id = ${req.params.id}`
  res.json(rows)
})

router.put('/entrenamientos/:id/asistencia', ...onlyTecnico, async (req, res) => {
  const { asistencias } = req.body // [{ jugador_id, asistio }]
  for (const a of asistencias) {
    await sql`
      INSERT INTO asistencia_entrenamiento (entrenamiento_id, jugador_id, asistio)
      VALUES (${req.params.id}, ${a.jugador_id}, ${a.asistio})
      ON CONFLICT (entrenamiento_id, jugador_id) DO UPDATE SET asistio = EXCLUDED.asistio
    `
  }
  res.json({ ok: true })
})

// ─── PARTIDOS ─────────────────────────────────────────────────

router.get('/partidos', ...onlyTecnico, async (req, res) => {
  const rows = await sql`SELECT * FROM partidos ORDER BY fecha DESC`
  res.json(rows)
})

router.post('/partidos', ...onlyTecnico, async (req, res) => {
  const { rival, fecha, hora, lugar, es_local, tipo, resultado_propio, resultado_rival, notas } = req.body
  const [row] = await sql`
    INSERT INTO partidos (rival, fecha, hora, lugar, es_local, tipo, resultado_propio, resultado_rival, notas, creado_por)
    VALUES (${rival}, ${fecha}, ${hora ?? null}, ${lugar ?? null}, ${es_local ?? true}, ${tipo}, ${resultado_propio ?? null}, ${resultado_rival ?? null}, ${notas ?? null}, ${req.user.id})
    RETURNING *
  `
  res.json(row)
})

router.put('/partidos/:id', ...onlyTecnico, async (req, res) => {
  const { resultado_propio, resultado_rival, notas } = req.body
  const [row] = await sql`
    UPDATE partidos SET resultado_propio = ${resultado_propio ?? null}, resultado_rival = ${resultado_rival ?? null}, notas = ${notas ?? null}
    WHERE id = ${req.params.id} RETURNING *
  `
  res.json(row)
})

router.get('/partidos/:id/participaciones', ...onlyTecnico, async (req, res) => {
  const rows = await sql`SELECT * FROM participacion_partido WHERE partido_id = ${req.params.id}`
  res.json(rows)
})

router.put('/partidos/:id/participaciones', ...onlyTecnico, async (req, res) => {
  const { participaciones } = req.body // [{ jugador_id, minutos_jugados, puntuacion, ... }]
  for (const p of participaciones) {
    await sql`
      INSERT INTO participacion_partido (partido_id, jugador_id, minutos_jugados, puntuacion, puntos_fuertes, puntos_debiles, notas)
      VALUES (${req.params.id}, ${p.jugador_id}, ${p.minutos_jugados ?? 0}, ${p.puntuacion ?? null}, ${p.puntos_fuertes ?? null}, ${p.puntos_debiles ?? null}, ${p.notas ?? null})
      ON CONFLICT (partido_id, jugador_id) DO UPDATE SET
        minutos_jugados = EXCLUDED.minutos_jugados,
        puntuacion = EXCLUDED.puntuacion,
        puntos_fuertes = EXCLUDED.puntos_fuertes,
        puntos_debiles = EXCLUDED.puntos_debiles,
        notas = EXCLUDED.notas
    `
  }
  res.json({ ok: true })
})

// ─── JUGADORES ────────────────────────────────────────────────

router.get('/jugadores', ...onlyTecnico, async (req, res) => {
  const rows = await sql`SELECT * FROM profiles WHERE role = 'jugador' ORDER BY apellido`
  res.json(rows)
})

router.get('/jugadores/:id/reporte', ...onlyTecnico, async (req, res) => {
  const id = req.params.id
  const [profile, asistencias, participaciones] = await Promise.all([
    sql`SELECT * FROM profiles WHERE id = ${id}`,
    sql`SELECT * FROM asistencia_entrenamiento WHERE jugador_id = ${id}`,
    sql`SELECT pp.*, p.fecha, p.rival FROM participacion_partido pp JOIN partidos p ON p.id = pp.partido_id WHERE pp.jugador_id = ${id} ORDER BY p.fecha DESC`,
  ])
  res.json({ profile: profile[0], asistencias, participaciones })
})

export default router
