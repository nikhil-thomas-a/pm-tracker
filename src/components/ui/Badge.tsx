interface Props { label: string; color: string }

export default function Badge({ label, color }: Props) {
  return (
    <span
      className="text-[9px] px-1.5 py-0.5 rounded-full font-medium whitespace-nowrap"
      style={{ background: `${color}22`, color }}
    >
      {label}
    </span>
  )
}
