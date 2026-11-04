import type { ReactNode } from 'react'
import './exercises/personalChallenge.css'

/** Shared participant-style surface; each preview owns its content and behavior. */
export function ParticipantPreviewShell({ children, label, compact = false }: { children: ReactNode; label: string; compact?: boolean }) {
  return <div className={`challenge-canvas${compact ? ' navigation-preview' : ''}`} aria-label={label}>
    <div className="challenge-canvas-brand" aria-hidden="true"><span>TEDIXHUNT</span><span>✦</span></div>
    {children}
  </div>
}
