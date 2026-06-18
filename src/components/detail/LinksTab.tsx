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
        <p className="text-[13px] text-pm-muted mb-3">No links added yet.</p>
      )}
      {item.links.map(link => (
        <div key={link.id} className="flex items-center gap-2 mb-2 group">
          <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex-1 text-[13px] text-pm-accent hover:opacity-80 truncate">
            → {link.label}
          </a>
          <span className="text-[12px] text-pm-muted truncate max-w-[120px]">{link.url}</span>
          <button
            onClick={() => dispatch({ type: 'DELETE_ITEM_LINK', itemId: selectedItemId!, linkId: link.id })}
            className="opacity-0 group-hover:opacity-100 text-pm-muted hover:text-pm-danger text-[12px]"
          >
            ✕
          </button>
        </div>
      ))}
      {adding ? (
        <form onSubmit={submit} className="flex flex-col gap-1 mt-2">
          <input autoFocus value={label} onChange={e => setLabel(e.target.value)} placeholder="Label" className="text-[13px] bg-pm-surface text-pm-text border border-pm-border rounded px-2 py-1 outline-none focus:border-pm-accent" />
          <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." className="text-[13px] bg-pm-surface text-pm-text border border-pm-border rounded px-2 py-1 outline-none focus:border-pm-accent" />
          <div className="flex gap-2">
            <button type="submit" className="text-[13px] text-pm-accent">Add</button>
            <button type="button" onClick={() => { setAdding(false); setLabel(''); setUrl('') }} className="text-[13px] text-pm-muted">✕</button>
          </div>
        </form>
      ) : (
        <button onClick={() => setAdding(true)} className="text-[13px] text-pm-accent hover:opacity-80 mt-2">
          + Add link
        </button>
      )}
    </div>
  )
}
