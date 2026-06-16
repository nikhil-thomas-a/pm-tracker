import { createContext, useContext, useEffect, useReducer, type ReactNode } from 'react'
import { reducer, INITIAL_STATE, type Action } from './reducer'
import type { AppState } from '../types'
import { loadData, saveData } from '../data/storage'

interface AppContextValue {
  state: AppState
  dispatch: React.Dispatch<Action>
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)

  // Load from localStorage on mount
  useEffect(() => {
    const data = loadData()
    dispatch({ type: 'LOAD_DATA', data })
  }, [])

  // Persist to localStorage on every state change (skip UI-only fields)
  useEffect(() => {
    const { selectedBuId, selectedProjectId, selectedItemId, activeTab, showSettings, toast, ...data } = state
    saveData(data)
  }, [state])

  // Auto-dismiss toast after 3s
  useEffect(() => {
    if (!state.toast) return
    const t = setTimeout(() => dispatch({ type: 'SET_TOAST', toast: null }), 3000)
    return () => clearTimeout(t)
  }, [state.toast])

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
