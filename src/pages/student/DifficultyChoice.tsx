import { StepContainer } from '../../components/StepContainer'
import { PrimaryButton } from '../../components/PrimaryButton'
import { eventData } from '../../data/eventData'
import type { Difficulty } from '../../types/simulation'

type Props = {
  selected: Difficulty | null
  onSelect: (d: Difficulty) => void
  onConfirm: () => void
}

export function DifficultyChoice({ selected, onSelect, onConfirm }: Props) {
  return (
    <StepContainer>
      <div className="flex flex-1 flex-col">
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">Choose your level</h1>
        <p className="mt-1 text-sm text-slate-500">Higher difficulty means a bigger score multiplier.</p>

        <div className="mt-6 space-y-3">
          {eventData.difficultyOptions.map((opt) => {
            const isSelected = selected === opt.id
            return (
              <button
                key={opt.id}
                onClick={() => onSelect(opt.id)}
                className={`flex w-full items-center justify-between rounded-xl border-2 p-4 text-left transition-all ${
                  isSelected
                    ? 'border-brand-500 bg-brand-50'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex-1">
                  <p className="text-base font-bold text-slate-900">{opt.label}</p>
                  <p className="mt-0.5 text-sm text-slate-500">{opt.description}</p>
                </div>
                <div className={`ml-3 flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-bold ${
                  isSelected ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {opt.multiplier}x
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <div className="pb-6 pt-4">
        <PrimaryButton onClick={onConfirm} disabled={!selected}>
          Confirm difficulty
        </PrimaryButton>
      </div>
    </StepContainer>
  )
}
