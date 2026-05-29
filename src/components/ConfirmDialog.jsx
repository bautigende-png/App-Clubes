import { AlertTriangle } from 'lucide-react'
import { Modal } from './Modal'
import { Button } from './Button'

export function ConfirmDialog({ open, onClose, onConfirm, title, message, loading }) {
  return (
    <Modal open={open} onClose={onClose} title="Confirmar acción" size="sm">
      <div className="flex flex-col items-center gap-4 py-2">
        <div className="bg-red-400/10 rounded-full p-4">
          <AlertTriangle className="text-red-400" size={28} />
        </div>
        <div className="text-center">
          <p className="text-white font-semibold">{title}</p>
          <p className="text-slate-400 text-sm mt-1">{message}</p>
        </div>
        <div className="flex gap-3 w-full">
          <Button variant="secondary" className="flex-1" onClick={onClose}>Cancelar</Button>
          <Button variant="danger" className="flex-1" onClick={onConfirm} loading={loading}>Confirmar</Button>
        </div>
      </div>
    </Modal>
  )
}
