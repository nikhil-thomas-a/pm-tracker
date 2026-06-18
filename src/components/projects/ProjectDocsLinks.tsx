import { useState } from 'react'
import { useApp } from '../../context/AppContext'

export default function ProjectDocsLinks() {
  const { state, dispatch } = useApp()
  const project = state.projects.find(p => p.id === state.selectedProjectId)
  const [adding, setAdding] = useState(false)
  const [label, setLabel] = useState('')
  const [url, setUrl] = useState('')

  if (!project) return null

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!label.trim() || !url.trim() || !project) return
    dispatch({ type: 'ADD_PROJECT_DOC', projectId: project.id, label: label.trim(), url: url.trim() })
    setLabel('')
    setUrl('')
    setAdding(false)
  }

  return (
    <div className="border-t border-zinc-700 px-3 py-2">
      <p className="text-[12px] uppercase tracking-widest text-zinc-500 mb-2">Docs &amp; Links</p>
      {project.docs.map(doc => (
        <div key={doc.id} className="flex items-center gap-1 mb-1 group">
          <a href={doc.url} target="_blank" rel="noopener noreferrer" className="flex-1 text-[13px] text-teal-400 hover:text-teal-300 truncate">
            → {doc.label}
          </a>
          <button
            onClick={() => dispatch({ type: 'DELETE_PROJECT_DOC', projectId: project.id, docId: doc.id })}
            className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 text-[12px] transition-opacity"
          >
            ✕
          </button>
        </div>
      ))}
      {adding ? (
        <form onSubmit={submit} className="flex flex-col gap-1 mt-1">
          <input autoFocus value={label} onChange={e => setLabel(e.target.value)} placeholder="Label" className="text-[13px] bg-zinc-700 text-zinc-100 border border-zinc-600 rounded px-2 py-1 outline-none focus:border-teal-500" />
          <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." className="text-[13px] bg-zinc-700 text-zinc-100 border border-zinc-600 rounded px-2 py-1 outline-none focus:border-teal-500" />
          <div className="flex gap-1">
            <button type="submit" className="text-[13px] text-teal-400">Add</button>
            <button type="button" onClick={() => { setAdding(false); setLabel(''); setUrl('') }} className="text-[13px] text-zinc-500">✕</button>
          </div>
        </form>
      ) : (
        <button onClick={() => setAdding(true)} className="text-[13px] text-zinc-500 hover:text-teal-500">+ Add link</button>
      )}
    </div>
  )
}
