import ItemList from '../items/ItemList'

export default function MiddlePanel() {
  return (
    <div className="w-56 bg-zinc-900 border-r border-zinc-700 shrink-0 flex flex-col overflow-hidden">
      <ItemList />
    </div>
  )
}
