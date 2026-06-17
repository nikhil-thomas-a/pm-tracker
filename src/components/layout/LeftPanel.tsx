import BuSelector from '../bu/BuSelector'
import ProjectList from '../projects/ProjectList'
import ProjectDocsLinks from '../projects/ProjectDocsLinks'
import { useApp } from '../../context/AppContext'

export default function LeftPanel() {
  const { state } = useApp()
  return (
    <div className="w-48 bg-pm-surface border-r border-pm-border-subtle shrink-0 flex flex-col overflow-hidden">
      <BuSelector />
      <ProjectList />
      {state.selectedProjectId && <ProjectDocsLinks />}
    </div>
  )
}
