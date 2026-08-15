import { StepContainer } from '../../components/StepContainer'
import { PrimaryButton } from '../../components/PrimaryButton'
import { eventData } from '../../data/eventData'

type Props = {
  input: string
  onInputChange: (value: string) => void
  onSubmit: () => void
  solved: boolean
}

export function FinalPuzzle({ input, onInputChange, onSubmit, solved }: Props) {
  const { letters, question } = eventData.finalPuzzle

  return (
    <StepContainer>
      <div className="flex flex-1 flex-col">
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">Final puzzle</h1>
        <p className="mt-1 text-sm text-slate-500">Use your clues to solve the mystery.</p>

        <div className="mt-6 flex justify-center gap-3">
          {letters.map((letter, i) => (
            <div key={i} className="flex h-14 w-14 items-center justify-center rounded-xl bg-reward-500 text-2xl font-bold text-white shadow-sm">
              {letter}
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl bg-brand-600 p-5 text-white">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-100">Final question</p>
          <p className="mt-2 text-lg font-medium leading-snug">{question}</p>
        </div>

        {solved && (
          <div className="mt-4 flex items-start gap-3 rounded-xl bg-brand-50 px-4 py-3">
            <svg viewBox="0 0 24 24" className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
            </svg>
            <p className="text-sm font-bold text-brand-700">The mystery is solved!</p>
          </div>
        )}

        <div className="mt-5">
          <input
            type="text"
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder="Type your final answer..."
            disabled={solved}
            className="h-12 w-full rounded-xl border-2 border-slate-200 px-4 text-base text-slate-900 placeholder:text-slate-400 focus:border-brand-500 disabled:bg-slate-50"
          />
        </div>
      </div>

      <div className="pb-6 pt-4">
        {solved ? (
          <PrimaryButton onClick={onSubmit}>See results</PrimaryButton>
        ) : (
          <PrimaryButton onClick={onSubmit} disabled={!input.trim()}>
            Submit final answer
          </PrimaryButton>
        )}
      </div>
    </StepContainer>
  )
}
