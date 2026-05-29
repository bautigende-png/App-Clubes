import { Router } from 'express'
import bcrypt from 'bcryptjs'
import sql from '../db.js'
import { signToken, requireAuth } from '../auth.js'

const router = Router()

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Datos incompletos' })

  const [user] = await sql`
    SELECT u.id, u.email, u.password_hash,
           p.nombre, p.apellido, p.role, p.avatar_url,
           p.numero_camiseta, p.posicion, p.fecha_nacimiento, p.telefono
    FROM users u
    JOIN profiles p ON p.id = u.id
    WHERE u.email = ${email}
  `

  if (!user) return res.status(401).json({ error: 'Credenciales inválidas' })

  const valid = await bcrypt.compare(password, user.password_hash)
  if (!valid) return res.status(401).json({ error: 'Credenciales inválidas' })

  const token = signToken({ id: user.id, email: user.email, role: user.role })

  const { password_hash, ...profile } = user
  res.json({ token, user: { id: user.id, email: user.email }, profile })
})

// POST /api/auth/register (solo jugadores, ruta pública)
router.post('/register', async (req, res) => {
  const { nombre, apellido, email, password, telefono, posicion, numero_camiseta, fecha_nacimiento } = req.body
  if (!nombre || !apellido || !email || !password)
    return res.status(400).json({ error: 'Nombre, apellido, email y contraseña son requeridos' })
  if (password.length < 6)
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' })

  const [existing] = await sql`SELECT id FROM users WHERE email = ${email}`
  if (existing) return res.status(409).json({ error: 'Ese email ya está registrado' })

  const hash = await bcrypt.hash(password, 10)
  const [newUser] = await sql`
    INSERT INTO users (email, password_hash) VALUES (${email}, ${hash}) RETURNING id, email
  `
  await sql`
    INSERT INTO profiles (id, nombre, apellido, role, telefono, posicion, numero_camiseta, fecha_nacimiento)
    VALUES (${newUser.id}, ${nombre}, ${apellido}, 'jugador',
            ${telefono ?? null}, ${posicion ?? null},
            ${numero_camiseta ? parseInt(numero_camiseta) : null},
            ${fecha_nacimiento ?? null})
  `

  const token = signToken({ id: newUser.id, email: newUser.email, role: 'jugador' })
  const profile = { id: newUser.id, email: newUser.email, nombre, apellido, role: 'jugador', telefono: telefono ?? null, posicion: posicion ?? null, numero_camiseta: numero_camiseta ?? null, fecha_nacimiento: fecha_nacimiento ?? null }
  res.status(201).json({ token, user: { id: newUser.id, email: newUser.email }, profile })
})

// GET /api/auth/me
router.get('/me', requireAuth, async (req, res) => {
  const [profile] = await sql`
    SELECT p.*, u.email
    FROM profiles p
    JOIN users u ON u.id = p.id
    WHERE p.id = ${req.user.id}
  `
  if (!profile) return res.status(404).json({ error: 'Perfil no encontrado' })
  res.json(profile)
})

// PUT /api/auth/profile
router.put('/profile', requireAuth, async (req, res) => {
  const { telefono, avatar_url } = req.body
  const [updated] = await sql`
    UPDATE profiles SET
      telefono = ${telefono ?? null},
      avatar_url = ${avatar_url ?? null}
    WHERE id = ${req.user.id}
    RETURNING *
  `
  res.json(updated)
})

export default router
