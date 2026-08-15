import { StepContainer } from '../../components/StepContainer'
import { PrimaryButton } from '../../components/PrimaryButton'

type CheckProps = {
  label: string
  ready: boolean
  detail: string
}

function ReadinessCheck({ label, ready, detail }: CheckProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
        ready ? 'bg-brand-100' : 'bg-slate-100'
      }`}>
        {ready ? (
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-brand-600" fill="currentColor">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
          </svg>
        ) : (
          <span className="h-3 w-3 rounded-full border-2 border-slate-300" />
        )}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-900">{label}</p>
        <p className="text-xs text-slate-500">{detail}</p>
      </div>
      <span className={`text-xs font-semibold ${ready ? 'text-brand-600' : 'text-slate-400'}`}>
        {ready ? 'Ready' : 'Checking'}
      </span>
    </div>
  )
}

type Props = {
  onContinue: () => void
}

export function DeviceReadiness({ onContinue }: Props) {
  return (
    <StepContainer>
      <div className="flex flex-1 flex-col">
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">Device check</h1>
        <p className="mt-1 text-sm text-slate-500">Let's make sure your phone is ready.</p>

        <div className="mt-6 space-y-3">
          <ReadinessCheck label="GPS location" ready={true} detail="Signal found" />
          <ReadinessCheck label="Internet connection" ready={true} detail="Connected" />
          <ReadinessCheck label="Battery level" ready={true} detail="82% remaining" />
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-brand-50 py-4">
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-brand-600" fill="currentColor">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
          </svg>
          <p className="text-sm font-bold text-brand-700">Everything is ready</p>
        </div>
      </div>

      <div className="pb-6 pt-4">
        <PrimaryButton onClick={onContinue}>Start mission</PrimaryButton>
      </div>
    </StepContainer>
  )
}
