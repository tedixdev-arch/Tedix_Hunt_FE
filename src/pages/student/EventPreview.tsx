import { StepContainer } from '../../components/StepContainer'
import { PrimaryButton } from '../../components/PrimaryButton'
import { eventData } from '../../data/eventData'

type Props = {
  onContinue: () => void
}

export function EventPreview({ onContinue }: Props) {
  return (
    <StepContainer>
      <div className="flex flex-1 flex-col">
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">The Mission</h1>
        <p className="mt-3 text-base leading-relaxed text-slate-600">{eventData.premise}</p>

        <div className="mt-6 space-y-3">
          <InfoRow label="Checkpoints" value={`${eventData.checkpointCount} locations`} />
          <InfoRow label="Team size" value={eventData.teamSize} />
        </div>

        <div className="mt-6 flex items-start gap-3 rounded-xl bg-danger-50 px-4 py-3">
          <svg viewBox="0 0 24 24" className="mt-0.5 h-5 w-5 shrink-0 text-danger-600" fill="currentColor">
            <path d="M12 2L1 21h22L12 2zm0 4l7.53 13H4.47L12 6zm-1 5v4h2v-4h-2zm0 6v2h2v-2h-2z" />
          </svg>
          <p className="text-sm text-danger-800">{eventData.safetyNote}</p>
        </div>
      </div>

      <div className="pb-6 pt-4">
        <PrimaryButton onClick={onContinue}>Join event</PrimaryButton>
      </div>
    </StepContainer>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-semibold text-slate-900">{value}</span>
    </div>
  )
}
