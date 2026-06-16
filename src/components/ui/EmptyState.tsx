interface Props {
  icon: string
  title: string
  subtitle?: string
}

export default function EmptyState({ icon, title, subtitle }: Props) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-2 text-zinc-600 select-none">
      <span className="text-4xl">{icon}</span>
      <p className="text-sm font-medium text-zinc-500">{title}</p>
      {subtitle && <p className="text-xs text-zinc-600">{subtitle}</p>}
    </div>
  )
}
