import { StepContainer } from '../../components/StepContainer'
import { PrimaryButton } from '../../components/PrimaryButton'
import { eventData } from '../../data/eventData'

type Props = {
  onContinue: () => void
}

export function TeamProgress({ onContinue }: Props) {
  const { checkpointsCompleted, cluesCollected, score, contributions } = eventData.teamProgress

  return (
    <StepContainer>
      <div className="flex flex-1 flex-col">
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">Team progress</h1>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <StatCard label="Checkpoints" value={`${checkpointsCompleted} / 4`} />
          <StatCard label="Score" value={score.toString()} />
        </div>

        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Clues collected</p>
          <div className="mt-2 flex gap-2">
            {cluesCollected.map((clue, i) => (
              <div key={i} className="flex h-10 w-10 items-center justify-center rounded-lg bg-reward-500 text-base font-bold text-white">
                {clue}
              </div>
            ))}
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-dashed border-slate-200 text-slate-300">
              ?
            </div>
          </div>
        </div>

        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Teammate contributions</p>
          <div className="mt-2 space-y-2">
            {contributions.map((c) => (
              <div key={c.name} className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-2.5">
                <span className="text-sm font-medium text-slate-700">{c.name}</span>
                <div className="flex items-center gap-1">
                  {Array.from({ length: c.contributions }).map((_, i) => (
                    <span key={i} className="h-2 w-2 rounded-full bg-brand-500" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="pb-6 pt-4">
        <PrimaryButton onClick={onContinue}>Continue mission</PrimaryButton>
      </div>
    </StepContainer>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-0.5 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  )
}
