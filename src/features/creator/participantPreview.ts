import type { CreatorTemplateContent } from '../../services/api/creatorTemplates.ts'
import { hydrateGameplay, supportedGameplay, type CheckpointGameplay } from './checkpointGameplay.ts'
import { isValidCheckpoint, type CheckpointPosition } from './checkpointGeography.ts'
import { isValidFinishPoint, type FinishPoint } from './finishPoint.ts'

export type PreviewActivity = 'kind' | 'teamKind'
export interface PreviewCheckpoint {
  label: string
  role: 'normal' | 'terminal'
  position?: CheckpointPosition | FinishPoint
  gameplay: CheckpointGameplay
  warnings: string[]
}
export interface PreviewJourney { checkpoints: PreviewCheckpoint[]; warnings: string[] }
const object = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value)

/** A read-only projection of the working Template; never fills in mockup locations/content. */
export function projectPreview(content: CreatorTemplateContent): PreviewJourney {
  const configuration = content.configuration
  const warnings: string[] = []
  const saved = content.checkpoints
  const gameplay = hydrateGameplay(content)
  const count = configuration.normalCheckpointCount
  const validCount = Number.isInteger(count) && count >= 1 && count <= 20
  if (!validCount) warnings.push('Set 1–20 normal checkpoints in Feature 1. Legacy drafts preview only their saved gameplay entries; no geography is invented.')
  if (saved.some(entry => !object(entry))) warnings.push('Review checkpoint gameplay: some saved entries are incomplete or unsupported.')
  if (saved.some(entry => object(entry) && ['personal', 'team', 'navigation'].some(field => entry[field] !== undefined))) {
    warnings.push('Legacy gameplay choices use the existing read-only compatibility mapping. Original saved configuration is preserved.')
  }
  const normals = saved.filter(entry => object(entry) && entry.role !== 'terminal')
  const numbers = gameplay.normal.map(entry => entry.checkpoint)
  if (new Set(numbers).size !== numbers.length || numbers.some((number, index) => number !== index + 1)
    || (validCount && normals.length !== count)
    || normals.some(entry => object(entry) && entry.checkpoint !== undefined && entry.checkpointNumber !== undefined && entry.checkpoint !== entry.checkpointNumber)) {
    warnings.push('Correct normal gameplay numbering to unique checkpoints 1..N in Hunt Features. Preview does not repair saved numbering.')
  }
  const positions: unknown[] = Array.isArray(configuration.checkpointPositions) ? configuration.checkpointPositions : []
  if (validCount && (positions.length !== count || positions.some((point, index) => !object(point) || point.checkpointNumber !== index + 1))) {
    warnings.push('Correct checkpoint geography numbering and positions in Feature 2: exactly 1..N in order. Preview does not reorder saved geography.')
  }
  if (saved.filter(entry => object(entry) && entry.role === 'terminal').length > 1) warnings.push('Keep one FinishPoint gameplay entry in Feature 6; duplicate terminal gameplay cannot be previewed unambiguously.')
  const checkpoints: PreviewCheckpoint[] = Array.from({ length: validCount ? count : Math.min(gameplay.normal.length, 20) }, (_, index) => {
    const number = index + 1
    const matches = gameplay.normal.filter(entry => entry.checkpoint === number)
    const point = positions[index]
    const position = object(point) && point.checkpointNumber === number && typeof point.name === 'string'
      && point.name.length <= 100 && isValidCheckpoint(point as unknown as CheckpointPosition) ? point as unknown as CheckpointPosition : undefined
    return checkpoint(`CP${number}`, 'normal', matches.length === 1 ? matches[0] : undefined, position)
  })
  const terminals = saved.filter(entry => object(entry) && entry.role === 'terminal')
  checkpoints.push(checkpoint('FinishPoint', 'terminal', terminals.length === 1 ? gameplay.terminal : undefined,
    isValidFinishPoint(configuration.finishPoint) ? configuration.finishPoint : undefined))
  return { checkpoints, warnings }
}

function checkpoint(label: string, role: PreviewCheckpoint['role'], gameplay: CheckpointGameplay | undefined, position?: PreviewCheckpoint['position']): PreviewCheckpoint {
  const warnings: string[] = []
  const feature = role === 'terminal' ? 'Feature 6' : 'Feature 2'
  if (!position) warnings.push(`${label}: missing or invalid geography. Set a name, valid coordinates and a 5–500 m discovery radius in ${feature}. Arrival can still be simulated manually.`)
  if (gameplay?.role !== undefined && gameplay.role !== 'normal' && gameplay.role !== 'terminal') warnings.push(`${label}: unsupported checkpoint role. Review the saved gameplay entry in Hunt Features.`)
  if (!gameplay) warnings.push(`${label}: configure an unambiguous checkpoint gameplay entry in Hunt Features${role === 'terminal' ? ' / Feature 6' : ''}. No activities were invented.`)
  for (const field of ['navigationMode', 'kind', 'teamKind'] as const) {
    if (gameplay?.[field] !== undefined && !supportedGameplay[field].includes(gameplay[field]!)) warnings.push(`${label}: unsupported or incomplete ${field}. Review its saved choice in Hunt Features; interaction is simulated.`)
  }
  return { label, role, position, gameplay: gameplay ?? {}, warnings }
}

export interface PreviewProgress { phase: 'ready' | 'navigation' | 'arrived' | 'complete'; index: number; resolved: PreviewActivity[] }
export const initialPreviewProgress: PreviewProgress = { phase: 'ready', index: 0, resolved: [] }
export type PreviewAction = { type: 'start' | 'arrive' | 'continue' | 'restart' } | { type: 'resolve'; activity: PreviewActivity }
export function previewActivities(checkpoint: PreviewCheckpoint): PreviewActivity[] {
  return (['kind', 'teamKind'] as const).filter(field => checkpoint.gameplay[field] !== undefined)
}
/** One local simulation transition path for every checkpoint, including the terminal role. */
export function transitionPreview(state: PreviewProgress, action: PreviewAction, journey: PreviewJourney): PreviewProgress {
  if (action.type === 'restart') return { ...initialPreviewProgress, resolved: [] }
  const current = journey.checkpoints[state.index]
  if (!current) return state
  if (action.type === 'start' && state.phase === 'ready') return { ...state, phase: 'navigation' }
  if (action.type === 'arrive' && state.phase === 'navigation') return { ...state, phase: 'arrived' }
  if (action.type === 'resolve' && state.phase === 'arrived' && previewActivities(current).includes(action.activity) && !state.resolved.includes(action.activity)) return { ...state, resolved: [...state.resolved, action.activity] }
  if (action.type === 'continue' && state.phase === 'arrived' && previewActivities(current).every(field => state.resolved.includes(field))) {
    return current.role === 'terminal' ? { ...state, phase: 'complete' } : { phase: 'navigation', index: state.index + 1, resolved: [] }
  }
  return state
}
