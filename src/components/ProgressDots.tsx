type ProgressDotsProps = {
  current: number
  total: number
}

export function ProgressDots({ current, total }: ProgressDotsProps) {
  return (
    <div className="flex items-center justify-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => {
        const isCurrent = i === current
        const isCompleted = i < current
        return (
          <span
            key={i}
            className={`rounded-full transition-all ${
              isCurrent
                ? 'h-2.5 w-2.5 bg-brand-600'
                : isCompleted
                  ? 'h-2 w-2 bg-brand-400'
                  : 'h-2 w-2 bg-slate-200'
            }`}
          />
        )
      })}
    </div>
  )
}
