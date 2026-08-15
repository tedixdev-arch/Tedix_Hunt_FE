import { StepContainer } from '../../components/StepContainer'
import { PrimaryButton } from '../../components/PrimaryButton'
import { eventData } from '../../data/eventData'

type Props = {
  onContinue: () => void
}

export function MissionBriefing({ onContinue }: Props) {
  return (
    <StepContainer>
      <div className="flex flex-1 flex-col">
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">Mission briefing</h1>

        <div className="mt-4 rounded-xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Objective</p>
          <p className="mt-1 text-base font-medium text-slate-800">{eventData.objective}</p>
        </div>

        <div className="mt-4 rounded-xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">What to collect</p>
          <p className="mt-1 text-base text-slate-700">{eventData.collectItems}</p>
        </div>

        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Rules</p>
          <ul className="mt-2 space-y-2">
            {eventData.rules.map((rule, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                  {i + 1}
                </span>
                <span className="text-sm text-slate-700">{rule}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="pb-6 pt-4">
        <PrimaryButton onClick={onContinue}>Choose difficulty</PrimaryButton>
      </div>
    </StepContainer>
  )
}
