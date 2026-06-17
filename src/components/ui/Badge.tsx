interface Props { label: string; color: string }

export default function Badge({ label, color }: Props) {
  return (
    <span
      className="text-[8px] px-1.5 py-px rounded-full font-semibold whitespace-nowrap"
      style={{ background: `${color}26`, color }}
    >
      {label}
    </span>
  )
}
