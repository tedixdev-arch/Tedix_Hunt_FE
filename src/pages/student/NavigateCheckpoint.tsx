import { StepContainer } from '../../components/StepContainer'
import { PrimaryButton } from '../../components/PrimaryButton'
import { eventData } from '../../data/eventData'

type Props = {
  onContinue: () => void
}

export function NavigateCheckpoint({ onContinue }: Props) {
  const { checkpoint, distance, clue } = eventData.navigate

  return (
    <StepContainer>
      <div className="flex flex-1 flex-col">
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{checkpoint}</h1>
        <p className="mt-1 text-sm text-slate-500">{distance} away</p>

        {/* Stylized map visual */}
        <div className="relative mt-6 flex-1 overflow-hidden rounded-2xl bg-brand-50">
          <svg viewBox="0 0 300 300" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
            {/* Path */}
            <path
              d="M40 250 Q 80 200, 100 180 T 160 120 T 220 80 T 260 50"
              fill="none"
              stroke="#34d399"
              strokeWidth="4"
              strokeDasharray="8 6"
              strokeLinecap="round"
            />
            {/* Previous checkpoints */}
            <circle cx="40" cy="250" r="8" fill="#10b981" opacity="0.5" />
            <circle cx="100" cy="180" r="8" fill="#10b981" opacity="0.5" />
            <circle cx="160" cy="120" r="8" fill="#10b981" opacity="0.5" />
            {/* Current checkpoint */}
            <circle cx="260" cy="50" r="12" fill="#059669" />
            <circle cx="260" cy="50" r="6" fill="white" />
            {/* You are here marker */}
            <circle cx="220" cy="80" r="8" fill="#f59e0b" />
            <text x="220" y="68" textAnchor="middle" className="fill-reward-600 text-[8px] font-bold">YOU</text>
          </svg>

          <div className="absolute bottom-3 left-3 right-3 rounded-xl bg-white/90 px-4 py-3 backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">Location clue</p>
            <p className="mt-0.5 text-sm text-slate-700">{clue}</p>
          </div>
        </div>
      </div>

      <div className="pb-6 pt-4">
        <PrimaryButton onClick={onContinue}>I'm here</PrimaryButton>
      </div>
    </StepContainer>
  )
}
