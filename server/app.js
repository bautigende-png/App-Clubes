import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.js'
import directivaRoutes from './routes/directiva.js'
import tecnicoRoutes from './routes/tecnico.js'
import jugadorRoutes from './routes/jugador.js'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/directiva', directivaRoutes)
app.use('/api/tecnico', tecnicoRoutes)
app.use('/api/jugador', jugadorRoutes)
app.get('/api/health', (_req, res) => res.json({ ok: true }))

export default app
