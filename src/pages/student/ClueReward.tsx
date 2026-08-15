import { StepContainer } from '../../components/StepContainer'
import { PrimaryButton } from '../../components/PrimaryButton'
import { eventData } from '../../data/eventData'

type Props = {
  onContinue: () => void
}

export function ClueReward({ onContinue }: Props) {
  const { letter, message, cluesSoFar, cluesTotal } = eventData.clueReward

  return (
    <StepContainer>
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="flex h-28 w-28 items-center justify-center rounded-full bg-reward-100">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-reward-500 text-4xl font-bold text-white">
            {letter}
          </div>
        </div>

        <h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-900">Clue collected!</h1>
        <p className="mt-2 text-base text-slate-600">{message}</p>

        <div className="mt-8 w-full">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Clues collected</p>
          <div className="mt-2 flex justify-center gap-2">
            {Array.from({ length: cluesTotal }).map((_, i) => {
              const earned = i < cluesSoFar.length
              return (
                <div
                  key={i}
                  className={`flex h-10 w-10 items-center justify-center rounded-lg text-base font-bold ${
                    earned
                      ? 'bg-reward-500 text-white'
                      : 'border-2 border-dashed border-slate-200 text-slate-300'
                  }`}
                >
                  {earned ? cluesSoFar[i] : '?'}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="pb-6 pt-4">
        <PrimaryButton onClick={onContinue}>Next checkpoint</PrimaryButton>
      </div>
    </StepContainer>
  )
}
