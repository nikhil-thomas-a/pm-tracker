import ItemList from '../items/ItemList'

export default function MiddlePanel() {
  return (
    <div className="w-56 bg-pm-bg border-r border-pm-border-subtle shrink-0 flex flex-col overflow-hidden">
      <ItemList />
    </div>
  )
}
