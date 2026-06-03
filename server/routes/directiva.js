import { Router } from 'express'
import sql from '../db.js'
import { requireAuth, requireRole } from '../auth.js'

const router = Router()
const onlyDirectiva = [requireAuth, requireRole('directiva')]

// Convierte cualquier valor fecha de Neon (Date object o string) a "YYYY-MM-DD"
function toDateStr(val) {
  if (!val) return null
  if (val instanceof Date) return val.toISOString().slice(0, 10)
  return String(val).slice(0, 10)
}

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
  const rows = await sql`SELECT * FROM cuotas_jugadores ORDER BY anio DESC, mes DESC`
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

// POST /api/directiva/cuotas/abrir-mes — crea cuota pendiente para TODOS los jugadores
router.post('/cuotas/abrir-mes', ...onlyDirectiva, async (req, res) => {
  const { mes, anio, monto } = req.body
  if (!mes || !anio || !monto) return res.status(400).json({ error: 'mes, anio y monto son requeridos' })

  const jugadores = await sql`SELECT id FROM profiles WHERE role = 'jugador'`
  let creados = 0, existentes = 0

  for (const j of jugadores) {
    const [existing] = await sql`SELECT id FROM cuotas_jugadores WHERE jugador_id = ${j.id} AND mes = ${mes} AND anio = ${anio}`
    if (existing) { existentes++; continue }
    await sql`
      INSERT INTO cuotas_jugadores (jugador_id, mes, anio, estado, monto)
      VALUES (${j.id}, ${mes}, ${anio}, 'pendiente', ${monto})
    `
    creados++
  }
  res.json({ creados, existentes, total: jugadores.length })
})

// ─── JUGADORES ────────────────────────────────────────────────

router.get('/jugadores', ...onlyDirectiva, async (req, res) => {
  const rows = await sql`SELECT id, nombre, apellido, posicion, numero_camiseta, telefono, fecha_nacimiento FROM profiles WHERE role = 'jugador' ORDER BY apellido`
  res.json(rows)
})

router.get('/jugadores/:id', ...onlyDirectiva, async (req, res) => {
  const [jugador] = await sql`SELECT * FROM profiles WHERE id = ${req.params.id}`
  if (!jugador) return res.status(404).json({ error: 'Jugador no encontrado' })

  const cuotas = await sql`
    SELECT * FROM cuotas_jugadores WHERE jugador_id = ${req.params.id}
    ORDER BY anio DESC, mes DESC
  `
  const partidos = await sql`
    SELECT pp.minutos_jugados, pp.puntuacion, p.fecha, p.rival, p.resultado_propio, p.resultado_rival, p.tipo
    FROM participacion_partido pp
    JOIN partidos p ON p.id = pp.partido_id
    WHERE pp.jugador_id = ${req.params.id}
    ORDER BY p.fecha DESC
    LIMIT 20
  `
  const asistencias = await sql`SELECT asistio FROM asistencia_entrenamiento WHERE jugador_id = ${req.params.id}`
  const pctAsistencia = asistencias.length
    ? Math.round((asistencias.filter(a => a.asistio).length / asistencias.length) * 100)
    : null

  res.json({ jugador, cuotas, partidos, pctAsistencia })
})

// ─── NOTIFICACIONES ───────────────────────────────────────────

router.get('/notificaciones', ...onlyDirectiva, async (req, res) => {
  const now = new Date()
  const mes = now.getMonth() + 1
  const anio = now.getFullYear()

  // Jugadores con cuotas vencidas o pendientes del mes actual
  const cuotasPendientes = await sql`
    SELECT COUNT(DISTINCT jugador_id)::int as count
    FROM cuotas_jugadores
    WHERE estado IN ('pendiente', 'vencido')
    AND (anio < ${anio} OR (anio = ${anio} AND mes <= ${mes}))
  `
  // Jugadores con 2+ meses sin pagar
  const deudores = await sql`
    SELECT jugador_id, COUNT(*)::int as meses
    FROM cuotas_jugadores
    WHERE estado IN ('pendiente', 'vencido')
    GROUP BY jugador_id
    HAVING COUNT(*) >= 2
  `
  // Cobros de sponsors vencidos
  const cobrosVencidos = await sql`
    SELECT COUNT(*)::int as count FROM cobros_sponsor WHERE estado = 'pendiente' AND fecha_esperada < CURRENT_DATE
  `
  res.json({
    cuotasPendientes: cuotasPendientes[0]?.count || 0,
    deudores: deudores.length,
    cobrosVencidos: cobrosVencidos[0]?.count || 0,
  })
})

// ─── PARTIDOS (directiva puede ver y editar resultados) ───────

router.get('/partidos', ...onlyDirectiva, async (req, res) => {
  const rows = await sql`SELECT * FROM partidos ORDER BY fecha DESC`
  res.json(rows)
})

router.put('/partidos/:id', ...onlyDirectiva, async (req, res) => {
  const { resultado_propio, resultado_rival, notas, rival, fecha, hora, lugar, tipo, es_local, costo_total } = req.body
  const id = req.params.id
  const monto = costo_total != null && costo_total !== '' ? parseFloat(costo_total) : null

  const [row] = await sql`
    UPDATE partidos SET
      rival            = ${rival ?? null},
      fecha            = ${fecha ?? null},
      hora             = ${hora ?? null},
      lugar            = ${lugar ?? null},
      tipo             = ${tipo ?? null},
      es_local         = ${es_local ?? true},
      resultado_propio = ${resultado_propio ?? null},
      resultado_rival  = ${resultado_rival ?? null},
      notas            = ${notas ?? null},
      costo_total      = ${monto}
    WHERE id = ${id} RETURNING *
  `

  // Sincronizar transacción de egreso para el partido
  if (monto != null && monto > 0) {
    const fechaTx = toDateStr(row.fecha) || new Date().toISOString().split('T')[0]
    const descripcion = `Partido vs ${row.rival} (${fechaTx})`
    const [existing] = await sql`
      SELECT id FROM transacciones WHERE origen = 'partido' AND origen_id = ${id}
    `
    if (existing) {
      await sql`
        UPDATE transacciones SET monto = ${monto}, fecha = ${fechaTx}, descripcion = ${descripcion}
        WHERE id = ${existing.id}
      `
    } else {
      await sql`
        INSERT INTO transacciones (tipo, categoria, descripcion, monto, fecha, origen, origen_id, creado_por)
        VALUES ('egreso', 'arbitraje', ${descripcion}, ${monto}, ${fechaTx}, 'partido', ${id}, ${req.user.id})
      `
    }
  } else if (monto == null) {
    await sql`DELETE FROM transacciones WHERE origen = 'partido' AND origen_id = ${id}`
  }

  res.json(row)
})

// GET cobros de un partido
router.get('/partidos/:id/cobros', ...onlyDirectiva, async (req, res) => {
  const cobros = await sql`
    SELECT cb.*, p.nombre, p.apellido, p.posicion, p.numero_camiseta
    FROM cobros_partido cb
    JOIN profiles p ON p.id = cb.jugador_id
    WHERE cb.partido_id = ${req.params.id}
    ORDER BY p.apellido
  `
  res.json(cobros)
})

// POST generar cobros automáticos para un partido
router.post('/partidos/:id/cobros/generar', ...onlyDirectiva, async (req, res) => {
  const { costo_total } = req.body
  const partidoId = req.params.id

  // Obtener tarifas configuradas
  const [settings] = await sql`SELECT tarifa_completa, tarifa_media FROM club_settings WHERE id = 1`
  const tarifaCompleta = parseFloat(settings?.tarifa_completa ?? 5000)
  const tarifaMedia    = parseFloat(settings?.tarifa_media ?? 2500)

  // Obtener participaciones con categoria_pago
  const participaciones = await sql`
    SELECT pp.jugador_id, pp.categoria_pago, pp.minutos_jugados
    FROM participacion_partido pp
    WHERE pp.partido_id = ${partidoId} AND pp.minutos_jugados > 0
  `

  if (participaciones.length === 0)
    return res.status(400).json({ error: 'No hay jugadores en la planilla del partido' })

  let montos
  if (costo_total) {
    // Distribución proporcional del costo total
    const total = parseFloat(costo_total)
    const pesoTotal = participaciones.reduce((s, p) => {
      const cat = p.categoria_pago || 'completo'
      return s + (cat === 'completo' ? 1 : cat === 'medio' ? 0.5 : 0)
    }, 0)
    montos = participaciones.map(p => {
      const cat = p.categoria_pago || 'completo'
      const peso = cat === 'completo' ? 1 : cat === 'medio' ? 0.5 : 0
      return { jugador_id: p.jugador_id, categoria: cat, monto: pesoTotal > 0 ? Math.round((total * peso) / pesoTotal) : 0 }
    })
  } else {
    // Tarifas fijas de configuración
    montos = participaciones.map(p => {
      const cat = p.categoria_pago || 'completo'
      return { jugador_id: p.jugador_id, categoria: cat, monto: cat === 'completo' ? tarifaCompleta : cat === 'medio' ? tarifaMedia : 0 }
    })
  }

  // Upsert cobros (no sobrescribe los ya pagados)
  for (const m of montos) {
    if (m.categoria === 'libre') continue
    await sql`
      INSERT INTO cobros_partido (partido_id, jugador_id, categoria, monto, estado)
      VALUES (${partidoId}, ${m.jugador_id}, ${m.categoria}, ${m.monto}, 'pendiente')
      ON CONFLICT (partido_id, jugador_id) DO UPDATE SET
        categoria = EXCLUDED.categoria,
        monto = EXCLUDED.monto
      WHERE cobros_partido.estado = 'pendiente'
    `
  }

  // Si se pasó costo_total, actualizarlo en el partido
  if (costo_total) {
    await sql`UPDATE partidos SET costo_total = ${parseFloat(costo_total)} WHERE id = ${partidoId}`
  }

  const cobros = await sql`
    SELECT cb.*, p.nombre, p.apellido FROM cobros_partido cb
    JOIN profiles p ON p.id = cb.jugador_id WHERE cb.partido_id = ${partidoId} ORDER BY p.apellido
  `
  res.json({ cobros, tarifaCompleta, tarifaMedia })
})

// PUT marcar cobro como pagado / pendiente
router.put('/cobros-partido/:id', ...onlyDirectiva, async (req, res) => {
  const { estado, fecha_pago } = req.body
  const [row] = await sql`
    UPDATE cobros_partido SET
      estado = ${estado},
      fecha_pago = ${estado === 'pagado' ? (fecha_pago || new Date().toISOString().split('T')[0]) : null}
    WHERE id = ${req.params.id} RETURNING *
  `
  res.json(row)
})

// ─── ENTRENAMIENTOS (vista directiva) ─────────────────────────

router.get('/entrenamientos', ...onlyDirectiva, async (req, res) => {
  const rows = await sql`
    SELECT e.*,
      COUNT(a.id) FILTER (WHERE a.asistio = true)::int AS asistentes
    FROM entrenamientos e
    LEFT JOIN asistencia_entrenamiento a ON a.entrenamiento_id = e.id
    GROUP BY e.id
    ORDER BY e.fecha DESC
  `
  res.json(rows)
})

// PUT /api/directiva/entrenamientos/:id/costo — establece el costo y sincroniza la transacción
router.put('/entrenamientos/:id/costo', ...onlyDirectiva, async (req, res) => {
  const { costo } = req.body
  const id = req.params.id
  const monto = costo != null && costo !== '' ? parseFloat(costo) : null

  // Actualizar costo en el entrenamiento
  const [ent] = await sql`
    UPDATE entrenamientos SET costo = ${monto} WHERE id = ${id} RETURNING *
  `
  if (!ent) return res.status(404).json({ error: 'Entrenamiento no encontrado' })

  if (monto != null && monto > 0) {
    const fecha = toDateStr(ent.fecha) || new Date().toISOString().split('T')[0]
    const descripcion = `Entrenamiento ${fecha}`
    // Upsert: si ya existe una transacción vinculada a este entrenamiento, actualizarla
    const [existing] = await sql`
      SELECT id FROM transacciones WHERE origen = 'entrenamiento' AND origen_id = ${id}
    `
    if (existing) {
      await sql`
        UPDATE transacciones SET monto = ${monto}, fecha = ${fecha}, descripcion = ${descripcion}
        WHERE id = ${existing.id}
      `
    } else {
      await sql`
        INSERT INTO transacciones (tipo, categoria, descripcion, monto, fecha, origen, origen_id, creado_por)
        VALUES ('egreso', 'entrenamiento', ${descripcion}, ${monto}, ${fecha}, 'entrenamiento', ${id}, ${req.user.id})
      `
    }
  } else {
    // Si se borró el costo, eliminar la transacción vinculada
    await sql`DELETE FROM transacciones WHERE origen = 'entrenamiento' AND origen_id = ${id}`
  }

  res.json(ent)
})

export default router
