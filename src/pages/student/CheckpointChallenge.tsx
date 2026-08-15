import { StepContainer } from '../../components/StepContainer'
import { PrimaryButton } from '../../components/PrimaryButton'
import { eventData } from '../../data/eventData'

type Props = {
  input: string
  onInputChange: (value: string) => void
  onSubmit: () => void
  onHint: () => void
  hintUsed: boolean
  solved: boolean
  attempts: number
}

export function CheckpointChallenge({
  input,
  onInputChange,
  onSubmit,
  onHint,
  hintUsed,
  solved,
  attempts,
}: Props) {
  const { title, question, hint, successMessage } = eventData.challenge
  const showIncorrect = attempts > 0 && !solved

  return (
    <StepContainer>
      <div className="flex flex-1 flex-col">
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{title}</h1>

        <div className="mt-4 rounded-2xl bg-brand-600 p-5 text-white">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-100">Challenge</p>
          <p className="mt-2 text-lg font-medium leading-snug">{question}</p>
        </div>

        {solved && (
          <div className="mt-4 flex items-start gap-3 rounded-xl bg-brand-50 px-4 py-3">
            <svg viewBox="0 0 24 24" className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
            </svg>
            <div>
              <p className="text-sm font-bold text-brand-700">Correct!</p>
              <p className="mt-0.5 text-sm text-brand-700">{successMessage}</p>
            </div>
          </div>
        )}

        {showIncorrect && (
          <div className="mt-4 flex items-start gap-3 rounded-xl bg-danger-50 px-4 py-3">
            <svg viewBox="0 0 24 24" className="mt-0.5 h-5 w-5 shrink-0 text-danger-600" fill="currentColor">
              <path d="M12 2L1 21h22L12 2zm-1 13v2h2v-2h-2zm0-8v6h2V7h-2z" />
            </svg>
            <p className="text-sm font-medium text-danger-700">Not quite — try again!</p>
          </div>
        )}

        {hintUsed && (
          <div className="mt-4 rounded-xl bg-reward-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-reward-600">Hint</p>
            <p className="mt-0.5 text-sm text-reward-800">{hint}</p>
          </div>
        )}

        <div className="mt-5">
          <input
            type="text"
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder="Type your answer..."
            disabled={solved}
            className="h-12 w-full rounded-xl border-2 border-slate-200 px-4 text-base text-slate-900 placeholder:text-slate-400 focus:border-brand-500 disabled:bg-slate-50"
          />
        </div>

        {!solved && (
          <button
            onClick={onHint}
            disabled={hintUsed}
            className="mt-3 text-sm font-medium text-reward-600 hover:text-reward-700 disabled:text-slate-300"
          >
            {hintUsed ? 'Hint used' : 'Need a hint?'}
          </button>
        )}
      </div>

      <div className="pb-6 pt-4">
        {solved ? (
          <PrimaryButton onClick={onSubmit}>Next checkpoint</PrimaryButton>
        ) : (
          <PrimaryButton onClick={onSubmit} disabled={!input.trim()}>
            Submit answer
          </PrimaryButton>
        )}
      </div>
    </StepContainer>
  )
}
