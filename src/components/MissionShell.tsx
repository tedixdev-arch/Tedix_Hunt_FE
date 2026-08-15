import { type ReactNode } from 'react'
import { ProgressDots } from './ProgressDots'

type MissionShellProps = {
  currentStep: number
  totalSteps: number
  onBack: () => void
  onRestart: () => void
  showProgress?: boolean
  children: ReactNode
}

export function MissionShell({
  currentStep,
  totalSteps,
  onBack,
  onRestart,
  showProgress = true,
  children,
}: MissionShellProps) {
  return (
    <div className="flex min-h-full flex-col bg-white">
      <div className="flex items-center justify-between px-5 py-4">
        <button
          onClick={onBack}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
          aria-label="Go back"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M11 18l-6-6 6-6" />
          </svg>
        </button>
        {showProgress ? (
          <ProgressDots current={currentStep} total={totalSteps} />
        ) : (
          <span />
        )}
        <button
          onClick={onRestart}
          className="text-xs font-medium text-slate-400 hover:text-slate-600"
        >
          Restart
        </button>
      </div>
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  )
}
