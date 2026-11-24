import type { CheckpointGameplay } from './checkpointGameplay.ts'

/**
 * Names of the checkpoints (and the FinishPoint) that have neither a Personal nor a Team challenge.
 * Used as a non-blocking review warning: whether submission must require a Personal challenge,
 * a Team challenge or at least one of either is still awaiting client confirmation (Q-04 / B-02).
 */
export function pointsWithoutChallenge(checkpoints: readonly unknown[]): string[] {
  let normal = 0
  return checkpoints.flatMap(entry => {
    const point = (entry && typeof entry === 'object' ? entry : {}) as CheckpointGameplay
    const terminal = point.role === 'terminal'
    if (!terminal) normal++
    const assigned = (['personal', 'team'] as const).some(slot => !!point.libraryAllocations?.[slot] || !!point.customExercises?.[slot])
    return assigned ? [] : [terminal ? 'FinishPoint' : `Checkpoint ${normal}`]
  })
}
