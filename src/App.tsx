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
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center max-w-sm">
        <p className="text-3xl mb-3">📋</p>
        <h1 className="text-lg font-bold text-white mb-1">Welcome to PM Tracker</h1>
        <p className="text-sm text-zinc-500 mb-6">Your personal PM diary. Start by creating a Business Unit.</p>
        <form onSubmit={submit} className="flex gap-2">
          <input
            autoFocus
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Engineering, Marketing…"
            className="flex-1 text-sm bg-zinc-800 text-zinc-100 border border-zinc-600 rounded-lg px-3 py-2 outline-none focus:border-teal-500"
          />
          <button type="submit" className="bg-teal-600 hover:bg-teal-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
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
