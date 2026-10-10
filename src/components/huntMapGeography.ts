import { isValidCheckpoint, type CheckpointPosition } from '../features/creator/checkpointGeography.ts'
import { isValidFinishPoint, type FinishPoint } from '../features/creator/finishPoint.ts'

export interface HuntGeography { checkpoints: CheckpointPosition[]; finishPoint?: FinishPoint; warning?: string }

/** Validate the artifact as stored. Never sort, repair, or source another version. */
export function inspectHuntGeography(configuration: Record<string, unknown>, sourceLabel = 'Submitted-version'): HuntGeography {
  const count = configuration.normalCheckpointCount
  const points = configuration.checkpointPositions
  const invalid = (reason: string): HuntGeography => ({ checkpoints: [], warning: `${sourceLabel} geography is missing or invalid: ${reason} No locations were substituted. Existing Template content and Hunt actions remain available.` })
  if (!Number.isInteger(count) || (count as number) < 1 || (count as number) > 20) return invalid('expected 1–20 normal checkpoints.')
  if (!Array.isArray(points) || points.length !== count) return invalid('checkpoint positions must match the normal checkpoint count.')
  if (points.some((point, index) => !point || typeof point !== 'object' || point.checkpointNumber !== index + 1
    || typeof point.name !== 'string' || point.name.length > 100 || !isValidCheckpoint(point))) return invalid('checkpoints must be ordered CP1..CPn with names, valid coordinates and integer discovery radii of 5–500 m.')
  if (!isValidFinishPoint(configuration.finishPoint)) return invalid('FinishPoint requires a name, valid coordinates and an integer discovery radius of 5–500 m.')
  // Copy only domain geography; optional editing/verification fields are not forwarded.
  return { checkpoints: points.map(({ checkpointNumber, name, latitude, longitude, radiusMeters }) => ({ checkpointNumber, name, latitude, longitude, radiusMeters })), finishPoint: { ...configuration.finishPoint } }
}
