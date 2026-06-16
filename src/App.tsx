import { AppProvider } from './context/AppContext'
import { useApp } from './context/AppContext'
import TopBar from './components/layout/TopBar'
import ThreePanel from './components/layout/ThreePanel'
import Toast from './components/ui/Toast'
import SettingsPage from './components/settings/SettingsPage'

function Inner() {
  const { state } = useApp()
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <TopBar />
      {state.showSettings ? <SettingsPage /> : <ThreePanel />}
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
