// components/ui/StarRating.tsx
'use client'

export function StarRating({ label, value, onChange }: {
  label: string
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm" style={{ color: 'var(--text2)' }}>{label}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className="text-xl leading-none transition-colors"
            style={{ color: n <= value ? 'var(--gold)' : 'var(--text3)' }}
            aria-label={`${n} estrela${n > 1 ? 's' : ''}`}
          >
            ★
          </button>
        ))}
      </div>
    </div>
  )
}
