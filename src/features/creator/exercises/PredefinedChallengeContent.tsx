import type { Exercise } from './catalog'
import { ChallengeCanvas } from './ChallengeCanvas'

/** Read-only authored content with temporary, immediately playable engine state. */
export function PredefinedChallengeContent({ exercise }: { exercise: Exercise }) {
  return <ChallengeCanvas exercise={exercise} />
}
