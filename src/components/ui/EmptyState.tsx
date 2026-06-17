interface Props {
  icon: string
  title: string
  subtitle?: string
}

export default function EmptyState({ icon, title, subtitle }: Props) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-2 select-none">
      <span className="text-4xl text-pm-muted">{icon}</span>
      <p className="text-xs font-medium text-pm-text-2">{title}</p>
      {subtitle && <p className="text-[10px] text-pm-muted">{subtitle}</p>}
    </div>
  )
}
