import { useState } from 'react'
import { AppProvider, useApp } from './context/AppContext'
import TopBar from './components/layout/TopBar'
import ThreePanel from './components/layout/ThreePanel'
import Toast from './components/ui/Toast'
import SettingsPage from './components/settings/SettingsPage'

function Welcome() {
  const { dispatch } = useApp()
  const [name, setName] = useState('')
  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    dispatch({ type: 'ADD_BU', name: name.trim(), description: '' })
  }
  return (
    <div className="flex-1 flex items-center justify-center bg-pm-bg">
      <div className="text-center max-w-sm px-4">
        <p className="text-[11px] uppercase tracking-[0.12em] text-pm-muted mb-6">PM Tracker</p>
        <h1 className="text-xl font-semibold text-pm-text mb-2" style={{ letterSpacing: '-0.02em' }}>
          Your personal PM diary
        </h1>
        <p className="text-[14px] text-pm-muted mb-8">
          Start by creating a Business Unit.
        </p>
        <form onSubmit={submit} className="flex gap-2">
          <input
            autoFocus
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Engineering, Marketing…"
            className="flex-1 text-[14px] bg-pm-surface text-pm-text border border-pm-border rounded-lg px-3 py-2 outline-none focus:border-pm-accent transition-colors placeholder-pm-muted"
          />
          <button type="submit" className="bg-pm-accent text-pm-bg text-[14px] font-semibold px-4 py-2 rounded-lg transition-colors hover:opacity-90">
            Create
          </button>
        </form>
      </div>
    </div>
  )
}

function Inner() {
  const { state } = useApp()
  const isFirstLaunch = state.businessUnits.length === 0 && !state.showSettings
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <TopBar />
      {state.showSettings
        ? <SettingsPage />
        : isFirstLaunch
          ? <Welcome />
          : <ThreePanel />}
      <Toast />
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <Inner />
    </AppProvider>
  )
}
