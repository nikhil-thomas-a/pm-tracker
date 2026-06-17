import { useState } from 'react'
import { useApp } from '../../context/AppContext'

const PRESET_COLORS = ['#71717a', '#f59e0b', '#6366f1', '#14b8a6', '#ef4444', '#f97316', '#8b5cf6', '#ec4899', '#3b82f6', '#22c55e']

export default function SettingsPage() {
  const { state, dispatch } = useApp()
  const [label, setLabel] = useState('')
  const [color, setColor] = useState('#6366f1')
  const [scope, setScope] = useState<'global' | 'project'>('global')

  const statuses = [...state.statuses].sort((a, b) => a.order - b.order)

  function addStatus(e: React.FormEvent) {
    e.preventDefault()
    if (!label.trim()) return
    dispatch({ type: 'ADD_STATUS', label: label.trim(), color, scope })
    setLabel('')
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-lg mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-base font-semibold text-white">Settings</h1>
          <button
            onClick={() => dispatch({ type: 'TOGGLE_SETTINGS' })}
            className="text-xs text-zinc-500 hover:text-zinc-300"
          >
            ← Back
          </button>
        </div>

        <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-3">Statuses</h2>

        <div className="bg-zinc-800 rounded-lg border border-zinc-700 divide-y divide-zinc-700 mb-4">
          {statuses.map(status => (
            <div key={status.id} className="flex items-center gap-3 px-4 py-3">
              <div className="w-3 h-3 rounded-full shrink-0" style={{ background: status.color }} />
              <span className="text-sm text-zinc-200 flex-1">{status.label}</span>
              <span className="text-[10px] text-zinc-600">{status.scope}</span>
              {!status.isDefault && (
                <button
                  onClick={() => {
                    const inUse = state.items.some(i => i.statusId === status.id)
                    if (inUse) {
                      dispatch({ type: 'SET_TOAST', toast: { message: 'Cannot delete — status is in use', type: 'error' } })
                      return
                    }
                    dispatch({ type: 'DELETE_STATUS', id: status.id })
                  }}
                  className="text-zinc-600 hover:text-red-400 text-[11px]"
                >
                  Delete
                </button>
              )}
              {status.isDefault && <span className="text-[10px] text-zinc-700">🔒</span>}
            </div>
          ))}
        </div>

        <form onSubmit={addStatus} className="bg-zinc-800 rounded-lg border border-zinc-700 p-4">
          <p className="text-xs font-medium text-zinc-400 mb-3">Add custom status</p>
          <div className="flex gap-2 mb-3">
            <input
              value={label}
              onChange={e => setLabel(e.target.value)}
              placeholder="Status label"
              className="flex-1 text-xs bg-zinc-700 text-zinc-100 border border-zinc-600 rounded px-2 py-1.5 outline-none focus:border-teal-500"
            />
            <input
              type="color"
              value={color}
              onChange={e => setColor(e.target.value)}
              className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
            />
          </div>
          <div className="flex gap-1 mb-3 flex-wrap">
            {PRESET_COLORS.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-5 h-5 rounded-full border-2 transition-all ${color === c ? 'border-white scale-110' : 'border-transparent'}`}
                style={{ background: c }}
              />
            ))}
          </div>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs text-zinc-500">Scope:</span>
            {(['global', 'project'] as const).map(s => (
              <label key={s} className="flex items-center gap-1 text-xs text-zinc-300 cursor-pointer">
                <input type="radio" value={s} checked={scope === s} onChange={() => setScope(s)} className="accent-teal-500" />
                {s === 'global' ? 'Global (all projects)' : 'Current project'}
              </label>
            ))}
          </div>
          <button type="submit" className="bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold px-3 py-1.5 rounded transition-colors">
            Add status
          </button>
        </form>
      </div>
    </div>
  )
}
