import type { CreatorTemplateContent } from '../../services/api/creatorTemplates.ts'
import type { Locality, LocalitySnapshot } from '../../services/api/geography.ts'
import { isValidCheckpoint } from './checkpointGeography.ts'
import { gameplayValidation } from './checkpointGameplay.ts'
import { isValidFinishPoint } from './finishPoint.ts'

export function localContentValidation(content: CreatorTemplateContent) {
  const { normalCheckpointCount: count, checkpointPositions: positions, finishPoint } = content.configuration
  const validCount = Number.isInteger(count) && count >= 1 && count <= 20
  const validPositions = validCount && Array.isArray(positions) && positions.length === count
    && new Set(positions.map(point => point.checkpointNumber)).size === count
    && positions.every(point => isValidCheckpoint(point) && point.name.length <= 100 && point.checkpointNumber >= 1 && point.checkpointNumber <= count && Number.isInteger(point.checkpointNumber))
  return {
    count: validCount ? '' : 'Choose 1–20 route checkpoints in Number of Checkpoints.',
    positions: validPositions ? '' : 'Place and name each numbered checkpoint exactly once in Checkpoint Positions. Set valid coordinates and a radius from 5 to 500 metres.',
    finish: isValidFinishPoint(finishPoint) ? '' : 'Place one FinishPoint with a name, valid coordinates and a radius from 5 to 500 metres in Feature 6.',
    gameplay: gameplayValidation(content, true),
  }
}
export function localBindingValidation(id?: string | null, snapshot?: LocalitySnapshot | null, current?: Locality): string {
  if (!id || !snapshot || snapshot.id !== id) return 'Choose an active registered locality in Country & locality, then save your draft.'
  if (!current || current.id !== id || !current.active) return 'This locality is no longer active or available. Refresh Country & locality and save an active selection.'
  if (current.countryCode !== snapshot.countryCode || current.latitude !== snapshot.latitude || current.longitude !== snapshot.longitude) return 'The locality coordinates or country changed. Use current registry details in Country & locality, check your route, then save a new draft.'
  return ''
}
export function localContractError(error: unknown): string {
  const details = error && typeof error === 'object' && 'details' in error ? error.details : null
  const code = details && typeof details === 'object' && 'error' in details ? details.error : null
  if (code === 'locality_required') return 'Choose a registered locality in Country & locality, then save before submitting.'
  if (code === 'locality_unavailable' || code === 'locality_not_found') return 'The locality is unavailable. Refresh Country & locality and save an active selection.'
  if (code === 'locality_geography_changed') return 'The locality country or coordinates changed. Use current registry details, review the route and save a new draft.'
  return ''
}
