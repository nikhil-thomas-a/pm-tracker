import { AppProvider } from './context/AppContext'

export default function App() {
  return (
    <AppProvider>
      <div className="flex items-center justify-center h-screen text-zinc-500">
        PM Tracker — context OK
      </div>
    </AppProvider>
  )
}
