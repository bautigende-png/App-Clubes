-- ============================================================
-- USUARIOS DE PRUEBA — Ejecutar en Supabase SQL Editor
-- ============================================================
-- Credenciales:
--   directiva@club.com  /  123456
--   tecnico@club.com    /  123456
--   jugador@club.com    /  123456
-- ============================================================

do $$
declare
  uid_directiva uuid := 'aaaaaaaa-0000-0000-0000-000000000001';
  uid_tecnico   uuid := 'bbbbbbbb-0000-0000-0000-000000000002';
  uid_jugador1  uuid := 'cccccccc-0000-0000-0000-000000000003';
  uid_jugador2  uuid := 'dddddddd-0000-0000-0000-000000000004';
  uid_jugador3  uuid := 'eeeeeeee-0000-0000-0000-000000000005';
begin

  -- ─── AUTH USERS ────────────────────────────────────────────

  insert into auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data, is_super_admin,
    confirmation_token, recovery_token
  ) values
  (
    uid_directiva, '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', 'directiva@club.com',
    crypt('123456', gen_salt('bf')), now(), now(), now(),
    '{"provider":"email","providers":["email"]}', '{}', false, '', ''
  ),
  (
    uid_tecnico, '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', 'tecnico@club.com',
    crypt('123456', gen_salt('bf')), now(), now(), now(),
    '{"provider":"email","providers":["email"]}', '{}', false, '', ''
  ),
  (
    uid_jugador1, '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', 'jugador@club.com',
    crypt('123456', gen_salt('bf')), now(), now(), now(),
    '{"provider":"email","providers":["email"]}', '{}', false, '', ''
  ),
  (
    uid_jugador2, '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', 'jugador2@club.com',
    crypt('123456', gen_salt('bf')), now(), now(), now(),
    '{"provider":"email","providers":["email"]}', '{}', false, '', ''
  ),
  (
    uid_jugador3, '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', 'jugador3@club.com',
    crypt('123456', gen_salt('bf')), now(), now(), now(),
    '{"provider":"email","providers":["email"]}', '{}', false, '', ''
  )
  on conflict (id) do nothing;

  -- ─── IDENTITIES (requerido para login con email) ───────────

  insert into auth.identities (
    id, user_id, provider_id, provider,
    identity_data, created_at, updated_at, last_sign_in_at
  ) values
  (
    uid_directiva, uid_directiva, 'directiva@club.com', 'email',
    json_build_object('sub', uid_directiva::text, 'email', 'directiva@club.com'),
    now(), now(), now()
  ),
  (
    uid_tecnico, uid_tecnico, 'tecnico@club.com', 'email',
    json_build_object('sub', uid_tecnico::text, 'email', 'tecnico@club.com'),
    now(), now(), now()
  ),
  (
    uid_jugador1, uid_jugador1, 'jugador@club.com', 'email',
    json_build_object('sub', uid_jugador1::text, 'email', 'jugador@club.com'),
    now(), now(), now()
  ),
  (
    uid_jugador2, uid_jugador2, 'jugador2@club.com', 'email',
    json_build_object('sub', uid_jugador2::text, 'email', 'jugador2@club.com'),
    now(), now(), now()
  ),
  (
    uid_jugador3, uid_jugador3, 'jugador3@club.com', 'email',
    json_build_object('sub', uid_jugador3::text, 'email', 'jugador3@club.com'),
    now(), now(), now()
  )
  on conflict (provider, provider_id) do nothing;

  -- ─── PROFILES ──────────────────────────────────────────────

  insert into public.profiles (id, nombre, apellido, role, telefono)
  values
    (uid_directiva, 'Carlos', 'Presidente', 'directiva', '11-1111-1111'),
    (uid_tecnico,   'Marcelo', 'DT', 'tecnico', '11-2222-2222')
  on conflict (id) do update set
    nombre = excluded.nombre,
    apellido = excluded.apellido,
    role = excluded.role;

  insert into public.profiles (
    id, nombre, apellido, role, numero_camiseta, posicion, fecha_nacimiento, telefono
  ) values
    (uid_jugador1, 'Lucas',   'García',    'jugador', 10, 'Mediocampista',  '2000-03-15', '11-3333-3333'),
    (uid_jugador2, 'Matías',  'Rodríguez', 'jugador',  9, 'Delantero',      '1998-07-22', '11-4444-4444'),
    (uid_jugador3, 'Nicolás', 'López',     'jugador',  1, 'Arquero',        '2001-11-05', '11-5555-5555')
  on conflict (id) do update set
    nombre = excluded.nombre,
    apellido = excluded.apellido,
    role = excluded.role,
    numero_camiseta = excluded.numero_camiseta,
    posicion = excluded.posicion,
    fecha_nacimiento = excluded.fecha_nacimiento;

end $$;
