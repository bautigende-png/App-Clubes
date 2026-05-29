import { Router } from 'express'
import sql from '../db.js'
import { requireAuth, requireRole } from '../auth.js'

const router = Router()
const onlyDirectiva = [requireAuth, requireRole('directiva')]

// ─── DASHBOARD ───────────────────────────────────────────────

router.get('/dashboard', ...onlyDirectiva, async (req, res) => {
  const now = new Date()
  const mes = now.getMonth() + 1
  const anio = now.getFullYear()
  const firstDay = `${anio}-${String(mes).padStart(2, '0')}-01`
  const lastDay = new Date(anio, mes, 0).toISOString().split('T')[0]
  const startOfYear = `${anio}-01-01`

  const [txMes, txAnio, sponsorsActivos, cobrosP, invAlertas, cuotasPend, ultTx] = await Promise.all([
    sql`SELECT tipo, monto FROM transacciones WHERE fecha BETWEEN ${firstDay} AND ${lastDay}`,
    sql`SELECT tipo, monto, fecha FROM transacciones WHERE fecha >= ${startOfYear}`,
    sql`SELECT monto_total FROM acuerdos_sponsor WHERE estado = 'vigente'`,
    sql`SELECT id FROM cobros_sponsor WHERE estado = 'pendiente' AND fecha_esperada <= ${lastDay}`,
    sql`SELECT * FROM inventario WHERE cantidad_actual < cantidad_minima`,
    sql`SELECT jugador_id FROM cuotas_jugadores WHERE mes = ${mes} AND anio = ${anio} AND estado != 'pagado'`,
    sql`SELECT * FROM transacciones ORDER BY fecha DESC, created_at DESC LIMIT 5`,
  ])

  res.json({ txMes, txAnio, sponsorsActivos, cobrosP, invAlertas, cuotasPend, ultTx, mes, anio })
})

// ─── TRANSACCIONES ────────────────────────────────────────────

router.get('/transacciones', ...onlyDirectiva, async (req, res) => {
  const rows = await sql`SELECT * FROM transacciones ORDER BY fecha DESC, created_at DESC`
  res.json(rows)
})

router.post('/transacciones', ...onlyDirectiva, async (req, res) => {
  const { tipo, categoria, descripcion, monto, fecha, notas } = req.body
  const [row] = await sql`
    INSERT INTO transacciones (tipo, categoria, descripcion, monto, fecha, notas, creado_por)
    VALUES (${tipo}, ${categoria}, ${descripcion ?? null}, ${monto}, ${fecha}, ${notas ?? null}, ${req.user.id})
    RETURNING *
  `
  res.json(row)
})

// ─── INVENTARIO ───────────────────────────────────────────────

router.get('/inventario', ...onlyDirectiva, async (req, res) => {
  const rows = await sql`SELECT * FROM inventario ORDER BY nombre`
  res.json(rows)
})

router.post('/inventario', ...onlyDirectiva, async (req, res) => {
  const { nombre, categoria, cantidad_actual, cantidad_minima, descripcion } = req.body
  const [row] = await sql`
    INSERT INTO inventario (nombre, categoria, cantidad_actual, cantidad_minima, descripcion)
    VALUES (${nombre}, ${categoria}, ${cantidad_actual ?? 0}, ${cantidad_minima ?? 0}, ${descripcion ?? null})
    RETURNING *
  `
  res.json(row)
})

router.get('/inventario/:id/movimientos', ...onlyDirectiva, async (req, res) => {
  const rows = await sql`
    SELECT * FROM movimientos_inventario WHERE item_id = ${req.params.id} ORDER BY fecha DESC
  `
  res.json(rows)
})

router.post('/movimientos', ...onlyDirectiva, async (req, res) => {
  const { item_id, tipo, cantidad, motivo, fecha } = req.body
  const delta = tipo === 'entrada' ? cantidad : -cantidad

  const [item] = await sql`SELECT cantidad_actual FROM inventario WHERE id = ${item_id}`
  const nuevo = item.cantidad_actual + delta
  if (nuevo < 0) return res.status(400).json({ error: 'Stock insuficiente' })

  const [mov] = await sql`
    INSERT INTO movimientos_inventario (item_id, tipo, cantidad, motivo, fecha, creado_por)
    VALUES (${item_id}, ${tipo}, ${cantidad}, ${motivo ?? null}, ${fecha}, ${req.user.id})
    RETURNING *
  `
  await sql`UPDATE inventario SET cantidad_actual = ${nuevo} WHERE id = ${item_id}`
  res.json(mov)
})

// ─── SPONSORS ─────────────────────────────────────────────────

router.get('/sponsors', ...onlyDirectiva, async (req, res) => {
  const rows = await sql`SELECT * FROM sponsors ORDER BY nombre`
  res.json(rows)
})

router.post('/sponsors', ...onlyDirectiva, async (req, res) => {
  const { nombre, contacto_nombre, contacto_tel, contacto_email, estado, notas } = req.body
  const [row] = await sql`
    INSERT INTO sponsors (nombre, contacto_nombre, contacto_tel, contacto_email, estado, notas)
    VALUES (${nombre}, ${contacto_nombre ?? null}, ${contacto_tel ?? null}, ${contacto_email ?? null}, ${estado}, ${notas ?? null})
    RETURNING *
  `
  res.json(row)
})

router.get('/sponsors/:id/detalle', ...onlyDirectiva, async (req, res) => {
  const [sponsor] = await sql`SELECT * FROM sponsors WHERE id = ${req.params.id}`
  const acuerdos = await sql`SELECT * FROM acuerdos_sponsor WHERE sponsor_id = ${req.params.id} ORDER BY fecha_inicio DESC`
  const acuerdoIds = acuerdos.map(a => a.id)
  const cobros = acuerdoIds.length
    ? await sql`SELECT c.*, a.descripcion as acuerdo_desc FROM cobros_sponsor c JOIN acuerdos_sponsor a ON a.id = c.acuerdo_id WHERE c.acuerdo_id = ANY(${acuerdoIds}) ORDER BY c.fecha_esperada`
    : []
  res.json({ sponsor, acuerdos, cobros })
})

router.post('/acuerdos', ...onlyDirectiva, async (req, res) => {
  const { sponsor_id, descripcion, monto_total, monto_por_cuota, frecuencia, fecha_inicio, fecha_fin, estado } = req.body
  const [row] = await sql`
    INSERT INTO acuerdos_sponsor (sponsor_id, descripcion, monto_total, monto_por_cuota, frecuencia, fecha_inicio, fecha_fin, estado)
    VALUES (${sponsor_id}, ${descripcion}, ${monto_total ?? null}, ${monto_por_cuota ?? null}, ${frecuencia}, ${fecha_inicio}, ${fecha_fin ?? null}, ${estado})
    RETURNING *
  `
  res.json(row)
})

router.put('/cobros/:id', ...onlyDirectiva, async (req, res) => {
  const { estado, fecha_cobro, notas } = req.body
  const [row] = await sql`
    UPDATE cobros_sponsor SET estado = ${estado}, fecha_cobro = ${fecha_cobro ?? null}, notas = ${notas ?? null}
    WHERE id = ${req.params.id} RETURNING *
  `
  res.json(row)
})

// ─── CUOTAS ───────────────────────────────────────────────────

router.get('/cuotas', ...onlyDirectiva, async (req, res) => {
  const rows = await sql`SELECT * FROM cuotas_jugadores`
  res.json(rows)
})

router.post('/cuotas', ...onlyDirectiva, async (req, res) => {
  const { jugador_id, mes, anio, estado, fecha_pago, monto } = req.body
  const [row] = await sql`
    INSERT INTO cuotas_jugadores (jugador_id, mes, anio, estado, fecha_pago, monto)
    VALUES (${jugador_id}, ${mes}, ${anio}, ${estado}, ${fecha_pago ?? null}, ${monto ?? null})
    ON CONFLICT (jugador_id, mes, anio) DO UPDATE SET
      estado = EXCLUDED.estado,
      fecha_pago = EXCLUDED.fecha_pago,
      monto = EXCLUDED.monto
    RETURNING *
  `
  res.json(row)
})

// ─── JUGADORES (lectura para directiva) ──────────────────────

router.get('/jugadores', ...onlyDirectiva, async (req, res) => {
  const rows = await sql`SELECT id, nombre, apellido, posicion, numero_camiseta FROM profiles WHERE role = 'jugador' ORDER BY apellido`
  res.json(rows)
})

export default router
