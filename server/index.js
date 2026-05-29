import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { existsSync } from 'fs'
import authRoutes from './routes/auth.js'
import directivaRoutes from './routes/directiva.js'
import tecnicoRoutes from './routes/tecnico.js'
import jugadorRoutes from './routes/jugador.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const isProd = process.env.NODE_ENV === 'production'
const PORT = process.env.PORT || 3002

const app = express()

// En dev permitimos el origen de Vite; en prod misma origen
if (!isProd) {
  app.use(cors({ origin: 'http://localhost:5173' }))
} else {
  app.use(cors())
}

app.use(express.json())

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/directiva', directivaRoutes)
app.use('/api/tecnico', tecnicoRoutes)
app.use('/api/jugador', jugadorRoutes)
app.get('/api/health', (_req, res) => res.json({ ok: true }))

// En producción servir el build de Vite
const distPath = join(__dirname, '..', 'dist')
if (isProd && existsSync(distPath)) {
  app.use(express.static(distPath))
  // SPA fallback: cualquier ruta no-API devuelve index.html
  app.get('*', (_req, res) => res.sendFile(join(distPath, 'index.html')))
}

app.listen(PORT, () => {
  console.log(`Server → http://localhost:${PORT} [${isProd ? 'production' : 'development'}]`)
})
