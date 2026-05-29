-- ============================================================
-- SCHEMA NEON — Club de Fútbol Amateur
-- Ejecutar en: Neon Console > SQL Editor
-- ============================================================

-- Usuarios (auth propia, sin Supabase)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Perfiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  nombre TEXT,
  apellido TEXT,
  role TEXT CHECK (role IN ('directiva', 'tecnico', 'jugador')),
  avatar_url TEXT,
  numero_camiseta INT,
  posicion TEXT,
  fecha_nacimiento DATE,
  telefono TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Transacciones financieras
CREATE TABLE IF NOT EXISTS transacciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT CHECK (tipo IN ('ingreso', 'egreso')),
  categoria TEXT,
  descripcion TEXT,
  monto NUMERIC(10,2),
  fecha DATE,
  notas TEXT,
  comprobante_url TEXT,
  creado_por UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Inventario
CREATE TABLE IF NOT EXISTS inventario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT,
  categoria TEXT,
  cantidad_actual INT DEFAULT 0,
  cantidad_minima INT DEFAULT 0,
  descripcion TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Movimientos de inventario
CREATE TABLE IF NOT EXISTS movimientos_inventario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES inventario(id) ON DELETE CASCADE,
  tipo TEXT CHECK (tipo IN ('entrada', 'salida')),
  cantidad INT,
  motivo TEXT,
  fecha DATE,
  creado_por UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Sponsors
CREATE TABLE IF NOT EXISTS sponsors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT,
  contacto_nombre TEXT,
  contacto_tel TEXT,
  contacto_email TEXT,
  logo_url TEXT,
  estado TEXT CHECK (estado IN ('activo', 'inactivo', 'negociación')),
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Acuerdos con sponsors
CREATE TABLE IF NOT EXISTS acuerdos_sponsor (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id UUID REFERENCES sponsors(id) ON DELETE CASCADE,
  descripcion TEXT,
  monto_total NUMERIC(10,2),
  monto_por_cuota NUMERIC(10,2),
  frecuencia TEXT,
  fecha_inicio DATE,
  fecha_fin DATE,
  estado TEXT CHECK (estado IN ('vigente', 'vencido', 'cancelado')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Cobros de sponsors
CREATE TABLE IF NOT EXISTS cobros_sponsor (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  acuerdo_id UUID REFERENCES acuerdos_sponsor(id) ON DELETE CASCADE,
  monto NUMERIC(10,2),
  fecha_esperada DATE,
  fecha_cobro DATE,
  estado TEXT CHECK (estado IN ('pendiente', 'cobrado', 'vencido')),
  remito_url TEXT,
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Cuotas de jugadores
CREATE TABLE IF NOT EXISTS cuotas_jugadores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jugador_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  mes INT CHECK (mes BETWEEN 1 AND 12),
  anio INT,
  monto NUMERIC(10,2),
  fecha_pago DATE,
  estado TEXT CHECK (estado IN ('pagado', 'pendiente', 'vencido')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (jugador_id, mes, anio)
);

-- Entrenamientos
CREATE TABLE IF NOT EXISTS entrenamientos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha DATE,
  horario TEXT,
  lugar TEXT,
  notas TEXT,
  creado_por UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Asistencia a entrenamientos
CREATE TABLE IF NOT EXISTS asistencia_entrenamiento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entrenamiento_id UUID REFERENCES entrenamientos(id) ON DELETE CASCADE,
  jugador_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  asistio BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (entrenamiento_id, jugador_id)
);

-- Partidos
CREATE TABLE IF NOT EXISTS partidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rival TEXT,
  fecha DATE,
  hora TEXT,
  lugar TEXT,
  es_local BOOLEAN DEFAULT true,
  resultado_propio INT,
  resultado_rival INT,
  tipo TEXT CHECK (tipo IN ('amistoso', 'liga', 'copa', 'torneo')),
  notas TEXT,
  creado_por UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Participación en partidos
CREATE TABLE IF NOT EXISTS participacion_partido (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partido_id UUID REFERENCES partidos(id) ON DELETE CASCADE,
  jugador_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  minutos_jugados INT DEFAULT 0,
  puntuacion NUMERIC(3,1),
  puntos_fuertes TEXT,
  puntos_debiles TEXT,
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (partido_id, jugador_id)
);

-- ============================================================
-- USUARIOS DE PRUEBA
-- Contraseña de todos: 123456
-- Hash generado con bcrypt (10 rounds)
-- ============================================================

INSERT INTO users (id, email, password_hash) VALUES
  ('aaaaaaaa-0000-0000-0000-000000000001', 'directiva@club.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
  ('bbbbbbbb-0000-0000-0000-000000000002', 'tecnico@club.com',   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
  ('cccccccc-0000-0000-0000-000000000003', 'jugador@club.com',   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
  ('dddddddd-0000-0000-0000-000000000004', 'jugador2@club.com',  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
  ('eeeeeeee-0000-0000-0000-000000000005', 'jugador3@club.com',  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi')
ON CONFLICT (id) DO NOTHING;

INSERT INTO profiles (id, nombre, apellido, role, telefono) VALUES
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Carlos',   'Presidente', 'directiva', '11-1111-1111'),
  ('bbbbbbbb-0000-0000-0000-000000000002', 'Marcelo',  'DT',         'tecnico',   '11-2222-2222')
ON CONFLICT (id) DO NOTHING;

INSERT INTO profiles (id, nombre, apellido, role, numero_camiseta, posicion, fecha_nacimiento, telefono) VALUES
  ('cccccccc-0000-0000-0000-000000000003', 'Lucas',   'García',    'jugador', 10, 'Mediocampista', '2000-03-15', '11-3333-3333'),
  ('dddddddd-0000-0000-0000-000000000004', 'Matías',  'Rodríguez', 'jugador',  9, 'Delantero',     '1998-07-22', '11-4444-4444'),
  ('eeeeeeee-0000-0000-0000-000000000005', 'Nicolás', 'López',     'jugador',  1, 'Arquero',        '2001-11-05', '11-5555-5555')
ON CONFLICT (id) DO NOTHING;
