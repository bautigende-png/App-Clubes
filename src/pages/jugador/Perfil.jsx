import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import { calcAge, formatDate } from '../../lib/utils'
import { User, Phone, Calendar, Hash, MapPin } from 'lucide-react'
import { toast } from 'sonner'

export default function Perfil() {
  const { profile, user, updateProfile } = useAuth()
  const [editing, setEditing] = useState(false)
  const [telefono, setTelefono] = useState(profile?.telefono || '')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      await updateProfile({ telefono })
      toast.success('Perfil actualizado')
      setEditing(false)
    } catch {
      toast.error('Error al guardar')
    }
    setSaving(false)
  }

  if (!profile) return null
  const age = calcAge(profile.fecha_nacimiento)

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto">
      <h1 className="text-xl font-bold text-white pt-2">Mi Perfil</h1>

      <Card className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-2xl font-bold shrink-0">
          {profile.nombre?.[0]?.toUpperCase() || '?'}
        </div>
        <div>
          <p className="text-xl font-bold text-white">{profile.nombre} {profile.apellido}</p>
          <p className="text-slate-400 text-sm capitalize">{profile.posicion || 'Sin posición'}</p>
        </div>
      </Card>

      <Card className="space-y-4">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Información</h2>
        <div className="grid grid-cols-2 gap-4">
          <InfoItem icon={Hash} label="Camiseta" value={profile.numero_camiseta ? `#${profile.numero_camiseta}` : '-'} />
          <InfoItem icon={MapPin} label="Posición" value={profile.posicion || '-'} />
          <InfoItem icon={Calendar} label="Fecha nac." value={formatDate(profile.fecha_nacimiento)} />
          <InfoItem icon={User} label="Edad" value={age ? `${age} años` : '-'} />
        </div>
        <div className="pt-2 border-t border-slate-700">
          {editing ? (
            <div className="space-y-3">
              <Input label="Teléfono" value={telefono} onChange={e => setTelefono(e.target.value)} placeholder="+54 9 11 1234-5678" type="tel" />
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => setEditing(false)}>Cancelar</Button>
                <Button size="sm" loading={saving} onClick={handleSave}>Guardar</Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-300">
                <Phone size={16} className="text-slate-500" />
                <span className="text-sm">{profile.telefono || 'Sin teléfono'}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>Editar</Button>
            </div>
          )}
        </div>
      </Card>

      <Card>
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Email</p>
        <p className="text-sm text-slate-300">{user?.email}</p>
      </Card>
    </div>
  )
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2">
      <Icon size={14} className="text-slate-500 mt-0.5 shrink-0" />
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm text-white">{value}</p>
      </div>
    </div>
  )
}
