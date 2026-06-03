import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(amount || 0)
}

function extractYMD(dateStr) {
  if (!dateStr) return null
  // Handles: "2026-06-01", "2026-06-01T00:00:00.000Z", Date objects, etc.
  const s = String(dateStr).slice(0, 10)
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  return m ? { y: m[1], mo: m[2], d: m[3] } : null
}

export function formatDate(dateStr) {
  const p = extractYMD(dateStr)
  if (!p) return '-'
  return `${p.d}/${p.mo}/${p.y}`
}

export function formatDateShort(dateStr) {
  const p = extractYMD(dateStr)
  if (!p) return '-'
  return `${p.d}/${p.mo}`
}

export function monthName(month) {
  const months = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
    'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
  return months[(month - 1)] || '-'
}

export function getCurrentMonthYear() {
  const now = new Date()
  return { mes: now.getMonth() + 1, anio: now.getFullYear() }
}

export function calcAge(fechaNac) {
  const p = extractYMD(fechaNac)
  if (!p) return null
  const d = new Date(`${p.y}-${p.mo}-${p.d}T12:00:00`)
  if (isNaN(d.getTime())) return null
  return Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24 * 365.25))
}
