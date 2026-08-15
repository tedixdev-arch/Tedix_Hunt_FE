import { StepContainer } from '../../components/StepContainer'
import { PrimaryButton } from '../../components/PrimaryButton'
import { eventData } from '../../data/eventData'
import type { Difficulty } from '../../types/simulation'

type Props = {
  difficulty: Difficulty | null
  onRestart: () => void
}

const multiplierMap: Record<Difficulty, number> = {
  easy: 1,
  medium: 1.5,
  hard: 2,
}

export function Results({ difficulty, onRestart }: Props) {
  const multiplier = difficulty ? multiplierMap[difficulty] : 1
  const finalScore = Math.round(eventData.results.baseScore * multiplier)
  const { badgeName, sponsor, sponsorReward, feedbackMessage } = eventData.results

  return (
    <StepContainer>
      <div className="flex flex-1 flex-col items-center text-center">
        <div className="mt-4 flex h-24 w-24 items-center justify-center rounded-full bg-brand-100">
          <svg viewBox="0 0 24 24" className="h-12 w-12 text-brand-600" fill="currentColor">
            <path d="M19 5h-2V3H7v2H5a2 2 0 0 0-2 2v2a4 4 0 0 0 4 4 5 5 0 0 0 5 3v2H8v2h8v-2h-4v-2a5 5 0 0 0 5-3 4 4 0 0 0 4-4V7a2 2 0 0 0-2-2zM5 9V7h2v4a2 2 0 0 1-2-2zm14 0a2 2 0 0 1-2 2V7h2v2z" />
          </svg>
        </div>

        <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-900">Mission complete!</h1>
        <p className="mt-2 text-base text-slate-600">{feedbackMessage}</p>

        <div className="mt-8 w-full space-y-3">
          <div className="flex items-center justify-between rounded-xl bg-slate-50 px-5 py-4">
            <span className="text-sm font-medium text-slate-500">Team score</span>
            <span className="text-2xl font-bold text-brand-600">{finalScore}</span>
          </div>

          {difficulty && (
            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-5 py-4">
              <span className="text-sm font-medium text-slate-500">Difficulty multiplier</span>
              <span className="text-lg font-bold text-slate-800">{multiplier}x</span>
            </div>
          )}

          <div className="flex items-center justify-between rounded-xl bg-reward-50 px-5 py-4">
            <span className="text-sm font-medium text-reward-700">Badge earned</span>
            <span className="flex items-center gap-2 text-base font-bold text-reward-800">
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-reward-600" fill="currentColor">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
              {badgeName}
            </span>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-reward-200 bg-reward-50 px-5 py-4">
            <div className="text-left">
              <p className="text-xs font-semibold uppercase tracking-wide text-reward-600">Sponsor reward</p>
              <p className="mt-0.5 text-sm font-medium text-reward-800">{sponsorReward}</p>
              <p className="mt-0.5 text-xs text-reward-600">Courtesy of {sponsor}</p>
            </div>
            <svg viewBox="0 0 24 24" className="h-8 w-8 text-reward-400" fill="currentColor">
              <path d="M20 7h-4V5a3 3 0 0 0-6 0v2H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zm-6 0h-4V5a2 2 0 0 1 4 0v2z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="pb-6 pt-4">
        <PrimaryButton onClick={onRestart} className="bg-slate-700 hover:bg-slate-800">
          Restart demo
        </PrimaryButton>
      </div>
    </StepContainer>
  )
}
