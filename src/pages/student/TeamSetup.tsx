import { StepContainer } from '../../components/StepContainer'
import { PrimaryButton } from '../../components/PrimaryButton'
import { eventData } from '../../data/eventData'

type Props = {
  onContinue: () => void
}

export function TeamSetup({ onContinue }: Props) {
  return (
    <StepContainer>
      <div className="flex flex-1 flex-col">
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">Set up your team</h1>

        <div className="mt-4 rounded-xl bg-brand-50 px-4 py-3">
          <p className="text-xs font-medium text-brand-700">Team code</p>
          <p className="mt-0.5 text-lg font-bold tracking-wider text-brand-800">{eventData.teamCode}</p>
        </div>

        <p className="mt-6 text-sm font-medium text-slate-700">Your team</p>
        <div className="mt-3 space-y-2">
          {eventData.teammates.map((mate) => (
            <div key={mate.name} className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white ${mate.color}`}>
                {mate.avatar}
              </div>
              <span className="text-sm font-medium text-slate-800">{mate.name}</span>
              <span className="ml-auto text-xs text-brand-600">Ready</span>
            </div>
          ))}
        </div>

        <button className="mt-3 text-sm font-medium text-brand-600 hover:text-brand-700">
          + Invite a friend
        </button>
      </div>

      <div className="pb-6 pt-4">
        <PrimaryButton onClick={onContinue}>Continue</PrimaryButton>
      </div>
    </StepContainer>
  )
}
