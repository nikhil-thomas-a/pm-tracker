import LeftPanel from './LeftPanel'
import MiddlePanel from './MiddlePanel'
import RightPanel from './RightPanel'

export default function ThreePanel() {
  return (
    <div className="flex flex-1 overflow-hidden">
      <LeftPanel />
      <MiddlePanel />
      <RightPanel />
    </div>
  )
}
