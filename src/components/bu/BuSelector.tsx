import { useState } from 'react'
import { useApp } from '../../context/AppContext'

export default function BuSelector() {
  const { state, dispatch } = useApp()
  const { businessUnits, selectedBuId } = state
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    dispatch({ type: 'ADD_BU', name: name.trim(), description: '' })
    setName('')
    setAdding(false)
  }

  return (
    <div className="px-3 pt-3 pb-2 border-b border-pm-border-subtle">
      <p className="text-[9px] uppercase tracking-[0.1em] font-medium text-pm-muted mb-2">Business Units</p>
      <div className="flex flex-wrap gap-1 mb-2">
        {businessUnits.map(bu => (
          <div key={bu.id} className="group relative inline-flex items-center">
            <button
              onClick={() => dispatch({ type: 'SELECT_BU', id: bu.id })}
              className={`text-[10px] font-medium px-2 py-0.5 rounded pr-5 ${
                selectedBuId === bu.id
                  ? 'bg-pm-accent text-pm-bg'
                  : 'bg-pm-surface-up text-pm-text-2 hover:text-pm-text transition-colors'
              }`}
            >
              {bu.name}
            </button>
            <button
              type="button"
              onClick={e => {
                e.stopPropagation()
                const projectCount = state.projects.filter(p => p.businessUnitIds.includes(bu.id)).length
                const msg = projectCount > 0
                  ? `Delete "${bu.name}" and its ${projectCount} project(s)?`
                  : `Delete "${bu.name}"?`
                if (confirm(msg)) dispatch({ type: 'DELETE_BU', id: bu.id })
              }}
              className="absolute right-0.5 opacity-0 group-hover:opacity-100 text-[9px] text-pm-muted hover:text-pm-danger transition-opacity w-4 h-4 flex items-center justify-center"
              title="Delete unit"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      {adding ? (
        <form onSubmit={submit} className="flex gap-1">
          <input
            autoFocus
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Unit name"
            className="flex-1 text-[11px] bg-pm-surface-up text-pm-text border border-pm-border rounded px-2 py-1 outline-none focus:border-pm-accent"
          />
          <button type="submit" className="text-[10px] text-pm-accent hover:text-pm-text-2 px-1">Add</button>
          <button type="button" onClick={() => { setAdding(false); setName('') }} className="text-[10px] text-pm-muted hover:text-pm-text-2 px-1">✕</button>
        </form>
      ) : (
        <button onClick={() => setAdding(true)} className="text-[10px] text-pm-accent hover:text-pm-text-2">
          + New Unit
        </button>
      )}
    </div>
  )
}
