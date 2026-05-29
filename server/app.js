import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.js'
import directivaRoutes from './routes/directiva.js'
import tecnicoRoutes from './routes/tecnico.js'
import jugadorRoutes from './routes/jugador.js'
import settingsRoutes from './routes/settings.js'

const app = express()

app.use(cors())
app.use(express.json({ limit: '5mb' })) // base64 logos can be ~1-2mb

app.use('/api/auth', authRoutes)
app.use('/api/directiva', directivaRoutes)
app.use('/api/tecnico', tecnicoRoutes)
app.use('/api/jugador', jugadorRoutes)
app.use('/api/settings', settingsRoutes)
app.get('/api/health', (_req, res) => res.json({ ok: true }))

export default app
