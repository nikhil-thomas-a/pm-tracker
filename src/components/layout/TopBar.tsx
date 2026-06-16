import { useApp } from '../../context/AppContext'

export default function TopBar() {
  const { state, dispatch } = useApp()

  function handleExport() {
    const { selectedBuId, selectedProjectId, selectedItemId, activeTab, showSettings, toast, ...data } = state
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pmtracker-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    dispatch({ type: 'SET_TOAST', toast: { message: 'Backup exported', type: 'success' } })
  }

  function handleImport() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return
      try {
        const text = await file.text()
        const data = JSON.parse(text)
        if (!data.businessUnits || !data.statuses) throw new Error('Invalid file')
        if (confirm('This will overwrite all current data. Continue?')) {
          dispatch({ type: 'IMPORT_DATA', data })
        }
      } catch {
        dispatch({ type: 'SET_TOAST', toast: { message: 'Invalid backup file', type: 'error' } })
      }
    }
    input.click()
  }

  return (
    <header className="flex items-center justify-between px-4 py-2 bg-zinc-800 border-b border-zinc-700 shrink-0">
      <span className="font-bold text-teal-400 tracking-tight">PM Tracker</span>
      <div className="flex items-center gap-3">
        <button onClick={handleExport} className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors">
          ↓ Export
        </button>
        <button onClick={handleImport} className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors">
          ↑ Import
        </button>
        <button
          onClick={() => dispatch({ type: 'TOGGLE_SETTINGS' })}
          className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
          title="Settings"
        >
          ⚙
        </button>
      </div>
    </header>
  )
}
