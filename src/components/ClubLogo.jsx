import { Shield } from 'lucide-react'
import { useClub } from '../context/ClubContext'

/**
 * Muestra el escudo del club si está configurado,
 * o un ícono de Shield con el color primario del club.
 */
export function ClubLogo({ size = 32, className = '' }) {
  const { settings } = useClub()

  if (settings?.logo_url) {
    return (
      <img
        src={settings.logo_url}
        alt="Escudo del club"
        style={{ width: size, height: size }}
        className={`object-contain ${className}`}
      />
    )
  }

  return (
    <Shield
      size={size}
      className={`club-text ${className}`}
    />
  )
}

/** Badge redondo con el logo, ideal para headers */
export function ClubLogoBadge({ size = 48 }) {
  const { settings } = useClub()

  return (
    <div
      className="rounded-2xl flex items-center justify-center club-bg-soft"
      style={{ width: size + 16, height: size + 16 }}
    >
      <ClubLogo size={size} />
    </div>
  )
}
