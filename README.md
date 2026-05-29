# Club Manager — Sistema de Gestión Club de Fútbol Amateur

App web para gestión integral de un club de fútbol amateur con tres roles: Comisión Directiva, Cuerpo Técnico y Jugadores.

## Stack

- React 18 + Vite + TailwindCSS v4
- Supabase (auth, PostgreSQL, storage)
- React Router v6
- Recharts, Lucide React, Sonner

## Setup

### 1. Crear proyecto en Supabase

1. Ir a [supabase.com](https://supabase.com) y crear un proyecto nuevo
2. En **SQL Editor**, ejecutar todo el contenido de `supabase/seed.sql`

### 2. Configurar variables de entorno

```bash
cp .env.example .env.local
```

Editar `.env.local` con los datos de tu proyecto Supabase:
- `VITE_SUPABASE_URL` → Settings > API > Project URL
- `VITE_SUPABASE_ANON_KEY` → Settings > API > anon public key

### 3. Instalar y correr

```bash
npm install
npm run dev
```

### 4. Crear usuarios de prueba

En Supabase Dashboard → Authentication → Users → "Add user":

1. Crear usuario con email/password
2. Ir a Table Editor → profiles → encontrar el registro del usuario
3. Completar `nombre`, `apellido` y asignar el `role`:
   - `directiva` → Comisión Directiva
   - `tecnico` → Cuerpo Técnico
   - `jugador` → Jugadores

## Roles y accesos

| Módulo | Directiva | Técnico | Jugador |
|--------|-----------|---------|---------|
| Dashboard propio | ✅ | ✅ | — |
| Finanzas / Caja | ✅ | ❌ | ❌ |
| Inventario | ✅ | ❌ | ❌ |
| Sponsors | ✅ | ❌ | ❌ |
| Cuotas | ✅ | ❌ | Solo propias |
| Entrenamientos | Solo lectura | ✅ | ❌ |
| Asistencia | ❌ | ✅ | Solo propia |
| Partidos | Solo lectura | ✅ | Solo propios |
| Mi perfil | — | — | ✅ |
| Mis estadísticas | — | — | ✅ |

## Estructura del proyecto

```
src/
  components/       # Button, Modal, Table, Card, Badge, etc.
  pages/
    auth/           # Login
    directiva/      # Dashboard, Finanzas, Inventario, Sponsors, Cuotas
    tecnico/        # Dashboard, Entrenamientos, Partidos, Jugadores
    jugador/        # Perfil, Pagos, Estadísticas, Partidos
  lib/              # supabase.js, utils.js
  context/          # AuthContext
  router/           # ProtectedRoute
```
