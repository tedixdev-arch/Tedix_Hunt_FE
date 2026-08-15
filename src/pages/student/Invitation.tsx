import { StepContainer } from '../../components/StepContainer'
import { PrimaryButton } from '../../components/PrimaryButton'
import { eventData } from '../../data/eventData'

type Props = {
  onContinue: () => void
}

export function Invitation({ onContinue }: Props) {
  return (
    <StepContainer>
      <div className="flex flex-1 flex-col">
        <div className="relative -mx-5 mb-6 h-56 overflow-hidden">
          <img src={eventData.image} alt="Cluj Napoca city square" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>

        <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">You're invited</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">{eventData.name}</h1>

        <div className="mt-6 space-y-3">
          <div className="flex items-center gap-3">
            <IconCalendar />
            <div>
              <p className="text-sm font-medium text-slate-900">{eventData.date}</p>
              <p className="text-xs text-slate-500">{eventData.time}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <IconPin />
            <div>
              <p className="text-sm font-medium text-slate-900">{eventData.location}</p>
              <p className="text-xs text-slate-500">{eventData.duration}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="pb-6 pt-4">
        <PrimaryButton onClick={onContinue}>View mission</PrimaryButton>
      </div>
    </StepContainer>
  )
}

function IconCalendar() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-brand-600" fill="currentColor">
      <path d="M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 16H5V10h14v10zM5 8V6h14v2H5z" />
    </svg>
  )
}

function IconPin() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-brand-600" fill="currentColor">
      <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" />
    </svg>
  )
}
