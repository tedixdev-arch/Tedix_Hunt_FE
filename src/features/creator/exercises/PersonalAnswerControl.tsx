import type { ReactNode } from 'react'
import { ContextualControl } from './ChallengeCanvas'

/** Creator-only answers never enter the closed student-style preview. */
export function PersonalAnswerControl({ children }: { children: ReactNode }) {
  return <div className="personal-answer-control"><ContextualControl label="correct answer" preview={<span className="text-sm font-bold">Correct answer</span>}>{children}</ContextualControl></div>
}
