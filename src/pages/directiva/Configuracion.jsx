import { useState, useRef } from 'react'
import { useClub } from '../../context/ClubContext'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import { Palette, Upload, RotateCcw, Check, Shield, X } from 'lucide-react'
import { toast } from 'sonner'

const PRESETS = [
  { label: 'Verde', primario: '#22c55e', secundario: '#16a34a' },
  { label: 'Azul', primario: '#3b82f6', secundario: '#1d4ed8' },
  { label: 'Rojo', primario: '#ef4444', secundario: '#dc2626' },
  { label: 'Naranja', primario: '#f97316', secundario: '#ea580c' },
  { label: 'Violeta', primario: '#8b5cf6', secundario: '#7c3aed' },
  { label: 'Amarillo', primario: '#eab308', secundario: '#ca8a04' },
  { label: 'Rosa', primario: '#ec4899', secundario: '#db2777' },
  { label: 'Cyan', primario: '#06b6d4', secundario: '#0891b2' },
]

export default function Configuracion() {
  const { settings, updateSettings } = useClub()
  const fileRef = useRef()

  const [form, setForm] = useState({
    nombre_club: settings.nombre_club || 'Mi Club',
    color_primario: settings.color_primario || '#22c55e',
    color_secundario: settings.color_secundario || '#3b82f6',
    logo_url: settings.logo_url || '',
  })
  const [saving, setSaving] = useState(false)
  const [preview, setPreview] = useState(settings.logo_url || '')

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
  }

  function applyPreset(preset) {
    setForm(f => ({ ...f, color_primario: preset.primario, color_secundario: preset.secundario }))
  }

  function handleFileChange(e) {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      toast.error('El archivo no puede superar 2MB')
      return
    }
    const reader = new FileReader()
    reader.onload = ev => {
      setPreview(ev.target.result)
      set('logo_url', ev.target.result)
    }
    reader.readAsDataURL(file)
  }

  function removeLogo() {
    setPreview('')
    set('logo_url', '')
    if (fileRef.current) fileRef.current.value = ''
  }

  async function handleSave() {
    setSaving(true)
    try {
      await updateSettings(form)
      toast.success('Configuración guardada')
    } catch {
      toast.error('Error al guardar')
    }
    setSaving(false)
  }

  function reset() {
    const defaults = { nombre_club: 'Mi Club', color_primario: '#22c55e', color_secundario: '#3b82f6', logo_url: '' }
    setForm(defaults)
    setPreview('')
  }

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-white">Configuración del Club</h1>

      {/* Preview en vivo */}
      <Card>
        <p className="text-xs text-slate-400 uppercase tracking-wider mb-4">Vista previa</p>
        <div
          className="rounded-xl p-5 flex items-center gap-4"
          style={{ backgroundColor: `rgba(${getCssVar('--club-primary-rgb') || '34,197,94'}, 0.1)`, borderColor: form.color_primario, borderWidth: 1 }}
        >
          {preview ? (
            <img src={preview} alt="Escudo" className="w-14 h-14 rounded-xl object-contain bg-white/5 p-1" />
          ) : (
            <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${form.color_primario}20` }}>
              <Shield size={28} style={{ color: form.color_primario }} />
            </div>
          )}
          <div>
            <p className="text-xl font-bold text-white">{form.nombre_club || 'Mi Club'}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: form.color_primario }} />
              <span className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: form.color_secundario }} />
              <span className="text-xs text-slate-400">Colores del club</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Nombre del club */}
      <Card className="space-y-4">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          <Shield size={16} className="text-slate-400" /> Nombre del club
        </h2>
        <Input
          placeholder="Ej: Club Atlético San Martín"
          value={form.nombre_club}
          onChange={e => set('nombre_club', e.target.value)}
        />
      </Card>

      {/* Escudo / Logo */}
      <Card className="space-y-4">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          <Upload size={16} className="text-slate-400" /> Escudo del club
        </h2>

        {preview ? (
          <div className="flex items-center gap-4">
            <img src={preview} alt="Escudo" className="w-20 h-20 rounded-xl object-contain bg-slate-700 p-2" />
            <div className="space-y-2">
              <p className="text-sm text-slate-300">Escudo cargado</p>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => fileRef.current?.click()}>
                  <Upload size={14} /> Cambiar
                </Button>
                <Button variant="danger" size="sm" onClick={removeLogo}>
                  <X size={14} /> Quitar
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full border-2 border-dashed border-slate-600 hover:border-slate-500 rounded-xl p-8 flex flex-col items-center gap-3 transition-colors cursor-pointer"
          >
            <div className="bg-slate-700 rounded-full p-3">
              <Upload size={22} className="text-slate-400" />
            </div>
            <div className="text-center">
              <p className="text-sm text-slate-300 font-medium">Subir escudo o logo</p>
              <p className="text-xs text-slate-500 mt-0.5">PNG, JPG o SVG · Máx. 2MB</p>
            </div>
          </button>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </Card>

      {/* Colores */}
      <Card className="space-y-5">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          <Palette size={16} className="text-slate-400" /> Colores del club
        </h2>

        {/* Presets */}
        <div>
          <p className="text-xs text-slate-400 mb-3">Paletas rápidas</p>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map(p => {
              const active = form.color_primario === p.primario
              return (
                <button
                  key={p.label}
                  onClick={() => applyPreset(p)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm transition-all cursor-pointer ${active ? 'border-white/40 bg-white/10' : 'border-slate-700 hover:border-slate-500'}`}
                >
                  <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: p.primario }} />
                  <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: p.secundario }} />
                  <span className="text-slate-300">{p.label}</span>
                  {active && <Check size={12} className="text-green-400" />}
                </button>
              )
            })}
          </div>
        </div>

        {/* Color picker manual */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm text-slate-300">Color primario</label>
            <div className="flex items-center gap-3 bg-slate-900 border border-slate-600 rounded-lg px-3 py-2">
              <input
                type="color"
                value={form.color_primario}
                onChange={e => set('color_primario', e.target.value)}
                className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
              />
              <span className="text-sm text-slate-300 font-mono">{form.color_primario}</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-slate-300">Color secundario</label>
            <div className="flex items-center gap-3 bg-slate-900 border border-slate-600 rounded-lg px-3 py-2">
              <input
                type="color"
                value={form.color_secundario}
                onChange={e => set('color_secundario', e.target.value)}
                className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
              />
              <span className="text-sm text-slate-300 font-mono">{form.color_secundario}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Acciones */}
      <div className="flex gap-3">
        <Button variant="secondary" onClick={reset}>
          <RotateCcw size={14} /> Restablecer
        </Button>
        <Button onClick={handleSave} loading={saving} className="flex-1 justify-center">
          <Check size={16} /> Guardar cambios
        </Button>
      </div>
    </div>
  )
}

function getCssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}
