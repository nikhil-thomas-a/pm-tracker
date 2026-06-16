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
    <div className="px-3 pt-3 pb-2 border-b border-zinc-700">
      <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Business Units</p>
      <div className="flex flex-wrap gap-1 mb-2">
        {businessUnits.map(bu => (
          <button
            key={bu.id}
            onClick={() => dispatch({ type: 'SELECT_BU', id: bu.id })}
            className={`px-2 py-0.5 rounded text-xs transition-colors ${
              selectedBuId === bu.id
                ? 'bg-teal-500 text-white'
                : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
            }`}
          >
            {bu.name}
          </button>
        ))}
      </div>
      {adding ? (
        <form onSubmit={submit} className="flex gap-1">
          <input
            autoFocus
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Unit name"
            className="flex-1 text-xs bg-zinc-700 text-zinc-100 border border-zinc-600 rounded px-2 py-1 outline-none focus:border-teal-500"
          />
          <button type="submit" className="text-xs text-teal-400 hover:text-teal-300 px-1">Add</button>
          <button type="button" onClick={() => { setAdding(false); setName('') }} className="text-xs text-zinc-500 hover:text-zinc-300 px-1">✕</button>
        </form>
      ) : (
        <button onClick={() => setAdding(true)} className="text-[11px] text-teal-500 hover:text-teal-400">
          + New Unit
        </button>
      )}
    </div>
  )
}
