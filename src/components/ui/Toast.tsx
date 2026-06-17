import { useApp } from '../../context/AppContext'

export default function Toast() {
  const { state } = useApp()
  const { toast } = state

  if (!toast) return null

  return (
    <div
      className={`fixed bottom-4 right-4 px-4 py-2 rounded-lg text-sm font-medium shadow-lg z-50 transition-all ${
        toast.type === 'success' ? 'bg-pm-accent-sub border border-pm-accent text-pm-accent' : 'bg-pm-danger-sub border border-pm-danger text-pm-danger'
      }`}
    >
      {toast.message}
    </div>
  )
}
