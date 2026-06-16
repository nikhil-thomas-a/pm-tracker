import { useApp } from '../../context/AppContext'

export default function Toast() {
  const { state } = useApp()
  const { toast } = state

  if (!toast) return null

  return (
    <div
      className={`fixed bottom-4 right-4 px-4 py-2 rounded-lg text-sm font-medium shadow-lg z-50 transition-all ${
        toast.type === 'success' ? 'bg-teal-600 text-white' : 'bg-red-600 text-white'
      }`}
    >
      {toast.message}
    </div>
  )
}
