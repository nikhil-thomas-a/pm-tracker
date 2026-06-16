import { useApp } from '../../context/AppContext'

export default function SettingsPage() {
  const { dispatch } = useApp()
  return (
    <div className="flex-1 flex items-center justify-center text-zinc-500">
      <div className="text-center">
        <p className="text-sm mb-2">Settings — coming in Task 14</p>
        <button onClick={() => dispatch({ type: 'TOGGLE_SETTINGS' })} className="text-xs text-teal-400 hover:text-teal-300">
          ← Back
        </button>
      </div>
    </div>
  )
}
