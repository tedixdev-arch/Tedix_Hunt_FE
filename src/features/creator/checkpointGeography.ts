export const MIN_RADIUS_METERS = 10
export const MAX_RADIUS_METERS = 500
export const DEFAULT_RADIUS_METERS = 30

export interface CheckpointPosition {
  checkpointNumber: number
  name: string
  latitude: number
  longitude: number
  radiusMeters: number
}

export interface CreatorGeographyConfiguration {
  normalCheckpointCount: number
  checkpointPositions: CheckpointPosition[]
}

export interface CheckpointDraft {
  checkpointNumber: number
  name: string
  radiusMeters: number
  latitude?: number
  longitude?: number
}

export function createCheckpointDrafts(count: number, names: string[]): CheckpointDraft[] {
  return Array.from({ length: count }, (_, index) => ({
    checkpointNumber: index + 1,
    name: names[index] ?? `Checkpoint ${index + 1}`,
    radiusMeters: DEFAULT_RADIUS_METERS,
  }))
}

export function resizeCheckpointDrafts(drafts: CheckpointDraft[], count: number, names: string[]): CheckpointDraft[] {
  return Array.from({ length: count }, (_, index) => drafts[index] ?? {
    checkpointNumber: index + 1,
    name: names[index] ?? `Checkpoint ${index + 1}`,
    radiusMeters: DEFAULT_RADIUS_METERS,
  })
}

export function updateCheckpointDraft(drafts: CheckpointDraft[], verified: Set<number>, checkpointNumber: number, change: Partial<CheckpointDraft>) {
  const nextDrafts = drafts.map(point => point.checkpointNumber === checkpointNumber ? { ...point, ...change } : point)
  // A verified definition becomes unverified whenever name, position, or radius changes.
  const nextVerified = new Set(verified)
  nextVerified.delete(checkpointNumber)
  return { drafts: nextDrafts, verified: nextVerified }
}

export function isValidCheckpoint(draft: CheckpointDraft): draft is CheckpointPosition {
  return draft.name.trim().length > 0
    && typeof draft.latitude === 'number' && draft.latitude >= -90 && draft.latitude <= 90
    && typeof draft.longitude === 'number' && draft.longitude >= -180 && draft.longitude <= 180
    && Number.isInteger(draft.radiusMeters) && draft.radiusMeters >= MIN_RADIUS_METERS && draft.radiusMeters <= MAX_RADIUS_METERS
}

// Only backend domain values cross the Template-content boundary; never Leaflet or viewport state.
export function buildGeographyConfiguration(count: number, drafts: CheckpointDraft[]): CreatorGeographyConfiguration {
  return {
    normalCheckpointCount: count,
    checkpointPositions: drafts.filter(isValidCheckpoint).map(({ checkpointNumber, name, latitude, longitude, radiusMeters }) => ({
      checkpointNumber, name, latitude, longitude, radiusMeters,
    })),
  }
}

export function isGeographyComplete(drafts: CheckpointDraft[], verified: Set<number>, safetyCount: number, requiredSafetyCount: number): boolean {
  return drafts.length > 0 && drafts.every(point => isValidCheckpoint(point) && verified.has(point.checkpointNumber)) && safetyCount === requiredSafetyCount
}
