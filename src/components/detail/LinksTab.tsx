import { useState } from 'react'
import { useApp } from '../../context/AppContext'

export default function LinksTab() {
  const { state, dispatch } = useApp()
  const { selectedItemId } = state
  const [adding, setAdding] = useState(false)
  const [label, setLabel] = useState('')
  const [url, setUrl] = useState('')

  if (!selectedItemId) return null

  const item = state.items.find(i => i.id === selectedItemId)
  if (!item) return null

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!label.trim() || !url.trim()) return
    dispatch({ type: 'ADD_ITEM_LINK', itemId: selectedItemId!, label: label.trim(), url: url.trim() })
    setLabel('')
    setUrl('')
    setAdding(false)
  }

  return (
    <div className="p-4">
      {item.links.length === 0 && !adding && (
        <p className="text-xs text-zinc-600 mb-3">No links added yet.</p>
      )}
      {item.links.map(link => (
        <div key={link.id} className="flex items-center gap-2 mb-2 group">
          <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex-1 text-xs text-teal-400 hover:text-teal-300 truncate">
            → {link.label}
          </a>
          <span className="text-[10px] text-zinc-600 truncate max-w-[120px]">{link.url}</span>
          <button
            onClick={() => dispatch({ type: 'DELETE_ITEM_LINK', itemId: selectedItemId!, linkId: link.id })}
            className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 text-[10px]"
          >
            ✕
          </button>
        </div>
      ))}
      {adding ? (
        <form onSubmit={submit} className="flex flex-col gap-1 mt-2">
          <input autoFocus value={label} onChange={e => setLabel(e.target.value)} placeholder="Label" className="text-xs bg-zinc-800 text-zinc-100 border border-zinc-600 rounded px-2 py-1 outline-none focus:border-teal-500" />
          <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." className="text-xs bg-zinc-800 text-zinc-100 border border-zinc-600 rounded px-2 py-1 outline-none focus:border-teal-500" />
          <div className="flex gap-2">
            <button type="submit" className="text-xs text-teal-400">Add</button>
            <button type="button" onClick={() => { setAdding(false); setLabel(''); setUrl('') }} className="text-xs text-zinc-500">✕</button>
          </div>
        </form>
      ) : (
        <button onClick={() => setAdding(true)} className="text-[11px] text-teal-500 hover:text-teal-400 mt-2">
          + Add link
        </button>
      )}
    </div>
  )
}
