import { DEFAULT_RADIUS_METERS, MIN_RADIUS_METERS, MAX_RADIUS_METERS } from './checkpointGeography.ts'

export interface FinishPoint {
  name: string
  latitude: number
  longitude: number
  radiusMeters: number
}
export type FinishPointDraft = Omit<FinishPoint, 'latitude' | 'longitude'> & Partial<Pick<FinishPoint, 'latitude' | 'longitude'>>

export function createFinishPointDraft(): FinishPointDraft {
  return { name: '', radiusMeters: DEFAULT_RADIUS_METERS }
}

export function isValidFinishPoint(value: unknown): value is FinishPoint {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const point = value as Record<string, unknown>
  return Object.keys(point).every(key => ['name', 'latitude', 'longitude', 'radiusMeters'].includes(key))
    && typeof point.name === 'string' && point.name.trim().length > 0 && point.name.length <= 100
    && typeof point.latitude === 'number' && Number.isFinite(point.latitude) && point.latitude >= -90 && point.latitude <= 90
    && typeof point.longitude === 'number' && Number.isFinite(point.longitude) && point.longitude >= -180 && point.longitude <= 180
    && Number.isInteger(point.radiusMeters) && (point.radiusMeters as number) >= MIN_RADIUS_METERS && (point.radiusMeters as number) <= MAX_RADIUS_METERS
}

export function finishPointValidation(configuration: Record<string, unknown>, submission = false): string {
  if (configuration.finishPoint !== undefined) {
    return isValidFinishPoint(configuration.finishPoint) ? '' : 'FinishPoint needs a non-empty name of at most 100 characters, valid coordinates, and an integer radius from 5 to 500 metres.'
  }
  return submission && (configuration.normalCheckpointCount !== undefined || configuration.checkpointPositions !== undefined)
    ? 'Place one FinishPoint in Feature 6 before submitting this geographic Template.' : ''
}
