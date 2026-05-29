-- ============================================================
-- SCHEMA: Club de Fútbol Amateur — Supabase
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

-- Profiles (extiende auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  nombre text,
  apellido text,
  role text check (role in ('directiva', 'tecnico', 'jugador')),
  avatar_url text,
  numero_camiseta int,
  posicion text,
  fecha_nacimiento date,
  telefono text,
  created_at timestamptz default now()
);

-- Trigger: crear profile automáticamente al registrar usuario
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer
as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Transacciones financieras
create table if not exists public.transacciones (
  id uuid primary key default gen_random_uuid(),
  tipo text check (tipo in ('ingreso', 'egreso')),
  categoria text,
  descripcion text,
  monto numeric(10,2),
  fecha date,
  comprobante_url text,
  creado_por uuid references profiles(id),
  created_at timestamptz default now()
);

-- Inventario
create table if not exists public.inventario (
  id uuid primary key default gen_random_uuid(),
  nombre text,
  categoria text,
  cantidad_actual int default 0,
  cantidad_minima int default 0,
  descripcion text,
  created_at timestamptz default now()
);

-- Movimientos de inventario
create table if not exists public.movimientos_inventario (
  id uuid primary key default gen_random_uuid(),
  item_id uuid references inventario(id) on delete cascade,
  tipo text check (tipo in ('entrada', 'salida')),
  cantidad int,
  motivo text,
  fecha date,
  creado_por uuid references profiles(id),
  created_at timestamptz default now()
);

-- Sponsors
create table if not exists public.sponsors (
  id uuid primary key default gen_random_uuid(),
  nombre text,
  contacto_nombre text,
  contacto_tel text,
  contacto_email text,
  logo_url text,
  estado text check (estado in ('activo', 'inactivo', 'negociación')),
  notas text,
  created_at timestamptz default now()
);

-- Acuerdos con sponsors
create table if not exists public.acuerdos_sponsor (
  id uuid primary key default gen_random_uuid(),
  sponsor_id uuid references sponsors(id) on delete cascade,
  descripcion text,
  monto_total numeric(10,2),
  monto_por_cuota numeric(10,2),
  frecuencia text,
  fecha_inicio date,
  fecha_fin date,
  estado text check (estado in ('vigente', 'vencido', 'cancelado')),
  created_at timestamptz default now()
);

-- Cobros de sponsors
create table if not exists public.cobros_sponsor (
  id uuid primary key default gen_random_uuid(),
  acuerdo_id uuid references acuerdos_sponsor(id) on delete cascade,
  monto numeric(10,2),
  fecha_esperada date,
  fecha_cobro date,
  estado text check (estado in ('pendiente', 'cobrado', 'vencido')),
  remito_url text,
  notas text,
  created_at timestamptz default now()
);

-- Cuotas de jugadores
create table if not exists public.cuotas_jugadores (
  id uuid primary key default gen_random_uuid(),
  jugador_id uuid references profiles(id) on delete cascade,
  mes int check (mes between 1 and 12),
  anio int,
  monto numeric(10,2),
  fecha_pago date,
  estado text check (estado in ('pagado', 'pendiente', 'vencido')),
  created_at timestamptz default now(),
  unique (jugador_id, mes, anio)
);

-- Entrenamientos
create table if not exists public.entrenamientos (
  id uuid primary key default gen_random_uuid(),
  fecha date,
  horario text,
  lugar text,
  notas text,
  creado_por uuid references profiles(id),
  created_at timestamptz default now()
);

-- Asistencia a entrenamientos
create table if not exists public.asistencia_entrenamiento (
  id uuid primary key default gen_random_uuid(),
  entrenamiento_id uuid references entrenamientos(id) on delete cascade,
  jugador_id uuid references profiles(id) on delete cascade,
  asistio boolean default false,
  created_at timestamptz default now(),
  unique (entrenamiento_id, jugador_id)
);

-- Partidos
create table if not exists public.partidos (
  id uuid primary key default gen_random_uuid(),
  rival text,
  fecha date,
  hora text,
  lugar text,
  es_local boolean default true,
  resultado_propio int,
  resultado_rival int,
  tipo text check (tipo in ('amistoso', 'liga', 'copa', 'torneo')),
  notas text,
  creado_por uuid references profiles(id),
  created_at timestamptz default now()
);

-- Participación en partidos
create table if not exists public.participacion_partido (
  id uuid primary key default gen_random_uuid(),
  partido_id uuid references partidos(id) on delete cascade,
  jugador_id uuid references profiles(id) on delete cascade,
  minutos_jugados int default 0,
  puntuacion numeric(3,1),
  puntos_fuertes text,
  puntos_debiles text,
  notas text,
  created_at timestamptz default now(),
  unique (partido_id, jugador_id)
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles enable row level security;
alter table public.transacciones enable row level security;
alter table public.inventario enable row level security;
alter table public.movimientos_inventario enable row level security;
alter table public.sponsors enable row level security;
alter table public.acuerdos_sponsor enable row level security;
alter table public.cobros_sponsor enable row level security;
alter table public.cuotas_jugadores enable row level security;
alter table public.entrenamientos enable row level security;
alter table public.asistencia_entrenamiento enable row level security;
alter table public.partidos enable row level security;
alter table public.participacion_partido enable row level security;

-- Helper: obtener rol del usuario autenticado
create or replace function public.get_user_role()
returns text language sql security definer
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- PROFILES
create policy "Users read own profile" on profiles for select using (auth.uid() = id);
create policy "Directiva read all profiles" on profiles for select using (get_user_role() in ('directiva', 'tecnico'));
create policy "Users update own profile" on profiles for update using (auth.uid() = id);

-- TRANSACCIONES (solo directiva)
create policy "Directiva full access transacciones" on transacciones
  for all using (get_user_role() = 'directiva');

-- INVENTARIO (solo directiva)
create policy "Directiva full access inventario" on inventario
  for all using (get_user_role() = 'directiva');

create policy "Directiva full access movimientos" on movimientos_inventario
  for all using (get_user_role() = 'directiva');

-- SPONSORS (solo directiva)
create policy "Directiva full access sponsors" on sponsors
  for all using (get_user_role() = 'directiva');

create policy "Directiva full access acuerdos" on acuerdos_sponsor
  for all using (get_user_role() = 'directiva');

create policy "Directiva full access cobros" on cobros_sponsor
  for all using (get_user_role() = 'directiva');

-- CUOTAS (directiva: todo; jugador: solo las propias)
create policy "Directiva full access cuotas" on cuotas_jugadores
  for all using (get_user_role() = 'directiva');

create policy "Jugador read own cuotas" on cuotas_jugadores
  for select using (jugador_id = auth.uid());

-- ENTRENAMIENTOS (tecnico: todo; jugador y directiva: lectura)
create policy "Tecnico full access entrenamientos" on entrenamientos
  for all using (get_user_role() = 'tecnico');

create policy "Others read entrenamientos" on entrenamientos
  for select using (get_user_role() in ('directiva', 'jugador'));

-- ASISTENCIA (tecnico: todo; jugador: solo la propia)
create policy "Tecnico full access asistencia" on asistencia_entrenamiento
  for all using (get_user_role() = 'tecnico');

create policy "Jugador read own asistencia" on asistencia_entrenamiento
  for select using (jugador_id = auth.uid());

-- PARTIDOS (tecnico: todo; directiva y jugador: lectura)
create policy "Tecnico full access partidos" on partidos
  for all using (get_user_role() = 'tecnico');

create policy "Others read partidos" on partidos
  for select using (get_user_role() in ('directiva', 'jugador'));

-- PARTICIPACION (tecnico: todo; jugador: solo la propia)
create policy "Tecnico full access participacion" on participacion_partido
  for all using (get_user_role() = 'tecnico');

create policy "Jugador read own participacion" on participacion_partido
  for select using (jugador_id = auth.uid());

-- ============================================================
-- DATOS DE EJEMPLO (opcional)
-- ============================================================

-- Para crear usuarios de prueba, hacerlo desde Supabase Auth > Users
-- y luego actualizar el perfil manualmente:
--
-- update public.profiles set
--   nombre = 'Admin',
--   apellido = 'Club',
--   role = 'directiva'
-- where id = '<uuid-del-usuario>';
