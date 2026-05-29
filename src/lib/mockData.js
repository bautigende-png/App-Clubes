// Usuarios mock para pruebas locales sin Supabase
export const MOCK_USERS = [
  {
    id: 'aaaaaaaa-0000-0000-0000-000000000001',
    email: 'directiva@club.com',
    password: '123456',
    profile: {
      id: 'aaaaaaaa-0000-0000-0000-000000000001',
      nombre: 'Carlos',
      apellido: 'Presidente',
      role: 'directiva',
      telefono: '11-1111-1111',
      avatar_url: null,
      numero_camiseta: null,
      posicion: null,
      fecha_nacimiento: null,
    },
  },
  {
    id: 'bbbbbbbb-0000-0000-0000-000000000002',
    email: 'tecnico@club.com',
    password: '123456',
    profile: {
      id: 'bbbbbbbb-0000-0000-0000-000000000002',
      nombre: 'Marcelo',
      apellido: 'DT',
      role: 'tecnico',
      telefono: '11-2222-2222',
      avatar_url: null,
      numero_camiseta: null,
      posicion: null,
      fecha_nacimiento: null,
    },
  },
  {
    id: 'cccccccc-0000-0000-0000-000000000003',
    email: 'jugador@club.com',
    password: '123456',
    profile: {
      id: 'cccccccc-0000-0000-0000-000000000003',
      nombre: 'Lucas',
      apellido: 'García',
      role: 'jugador',
      telefono: '11-3333-3333',
      avatar_url: null,
      numero_camiseta: 10,
      posicion: 'Mediocampista',
      fecha_nacimiento: '2000-03-15',
    },
  },
  {
    id: 'dddddddd-0000-0000-0000-000000000004',
    email: 'jugador2@club.com',
    password: '123456',
    profile: {
      id: 'dddddddd-0000-0000-0000-000000000004',
      nombre: 'Matías',
      apellido: 'Rodríguez',
      role: 'jugador',
      telefono: '11-4444-4444',
      avatar_url: null,
      numero_camiseta: 9,
      posicion: 'Delantero',
      fecha_nacimiento: '1998-07-22',
    },
  },
  {
    id: 'eeeeeeee-0000-0000-0000-000000000005',
    email: 'jugador3@club.com',
    password: '123456',
    profile: {
      id: 'eeeeeeee-0000-0000-0000-000000000005',
      nombre: 'Nicolás',
      apellido: 'López',
      role: 'jugador',
      telefono: '11-5555-5555',
      avatar_url: null,
      numero_camiseta: 1,
      posicion: 'Arquero',
      fecha_nacimiento: '2001-11-05',
    },
  },
]

const STORAGE_KEY = 'club_mock_user'

export const mockAuth = {
  getSession() {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null
    return JSON.parse(stored)
  },

  signIn(email, password) {
    const found = MOCK_USERS.find(u => u.email === email && u.password === password)
    if (!found) return { error: { message: 'Credenciales inválidas' } }
    const session = { user: { id: found.id, email: found.email }, profile: found.profile }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    return { data: session, error: null }
  },

  signOut() {
    localStorage.removeItem(STORAGE_KEY)
  },
}
