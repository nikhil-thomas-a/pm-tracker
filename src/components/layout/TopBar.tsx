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
    setTimeout(() => URL.revokeObjectURL(url), 100)
    dispatch({ type: 'SET_TOAST', toast: { message: 'Backup exported', type: 'success' } })
  }

  function handleImport() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    document.body.appendChild(input)
    input.onchange = async () => {
      document.body.removeChild(input)
      const file = input.files?.[0]
      if (!file) return
      try {
        const text = await file.text()
        const data = JSON.parse(text)
        function isArrayOfObjects(arr: unknown): arr is Record<string, unknown>[] {
          return Array.isArray(arr) && arr.every(item => typeof item === 'object' && item !== null && 'id' in item)
        }
        if (
          !isArrayOfObjects(data.businessUnits) ||
          !isArrayOfObjects(data.statuses) ||
          !isArrayOfObjects(data.projects) ||
          !isArrayOfObjects(data.items)
        ) throw new Error('Invalid file')
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
    <header className="flex items-center justify-between px-4 h-10 bg-pm-surface border-b border-pm-border-subtle shrink-0">
      <span className="text-sm font-semibold text-pm-accent" style={{ letterSpacing: '-0.02em' }}>
        PM Tracker
      </span>
      <div className="flex items-center gap-4">
        <button onClick={handleExport} className="text-[13px] text-pm-muted hover:text-pm-text-2 transition-colors">
          Export
        </button>
        <button onClick={handleImport} className="text-[13px] text-pm-muted hover:text-pm-text-2 transition-colors">
          Import
        </button>
        <button
          onClick={() => dispatch({ type: 'TOGGLE_SETTINGS' })}
          className="text-[13px] text-pm-muted hover:text-pm-text-2 transition-colors"
          title="Settings"
        >
          Settings
        </button>
      </div>
    </header>
  )
}
