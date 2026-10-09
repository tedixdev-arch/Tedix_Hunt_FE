import { checkpointExercises } from '../../data/templateOne.ts'
import type { CreatorTemplateContent } from '../../services/api/creatorTemplates.ts'

export type GameplayField = 'kind' | 'teamKind' | 'navigationMode'
export interface CheckpointGameplay extends Record<string, unknown> {
  role?: 'normal' | 'terminal'
  checkpoint?: number
  kind?: string
  teamKind?: string
  navigationMode?: string
}

// BE PR #62 derives its vocabulary from the same immutable Signal v1 checkpoints.
export const gameplayFields: GameplayField[] = ['navigationMode', 'kind', 'teamKind']
export const supportedGameplay = Object.fromEntries(gameplayFields.map(field =>
  [field, [...new Set(checkpointExercises.map(checkpoint => checkpoint[field]))]],
)) as Record<GameplayField, string[]>

const isObject = (value: unknown): value is CheckpointGameplay => !!value && typeof value === 'object' && !Array.isArray(value)

export function createNormalGameplay(count: number): CheckpointGameplay[] {
  return Array.from({ length: count }, (_, index) => {
    const existing = checkpointExercises[index]
    return { checkpoint: index + 1, ...(index < 6 && existing ? {
      kind: existing.kind, teamKind: existing.teamKind, navigationMode: existing.navigationMode,
    } : {}) }
  })
}

export function hydrateGameplay(content: CreatorTemplateContent): { normal: CheckpointGameplay[]; terminal?: CheckpointGameplay } {
  const entries = content.checkpoints.filter(isObject)
  const normal = entries.filter(entry => entry.role !== 'terminal').map((entry, index) => {
    const next = { ...entry }
    // Older FE drafts persisted approved component indexes instead of the flat BE fields.
    // Convert only explicit indexes; omitted activities stay omitted on existing drafts.
    for (const [oldField, field] of [['personal', 'kind'], ['team', 'teamKind'], ['navigation', 'navigationMode']] as const) {
      const selected = entry[oldField]
      if (next[field] === undefined && Number.isInteger(selected) && (selected as number) >= 0 && (selected as number) < checkpointExercises.length) {
        // Navigation prototype labels describe arrival at each checkpoint, whereas Signal
        // navigationMode describes departure. Only map labels supported by the BE contract.
        const mode = [undefined, 'compass', 'landmark', 'compass', 'decoded-route', 'compass', 'signal-strength'][selected as number]
        const value = field === 'navigationMode' ? mode : checkpointExercises[selected as number][field]
        if (value !== undefined) next[field] = value
      }
    }
    if (next.checkpoint === undefined) next.checkpoint = typeof entry.checkpointNumber === 'number' ? entry.checkpointNumber : index + 1
    return next
  })
  // Match numbered gameplay to its own checkpoint, independently of array order/terminal position.
  normal.sort((a, b) => (a.checkpoint ?? 0) - (b.checkpoint ?? 0))
  const terminal = entries.find(entry => entry.role === 'terminal')
  return { normal, ...(terminal ? { terminal: { ...terminal } } : {}) }
}

export function serializeGameplay(normal: CheckpointGameplay[], count: number, terminal?: CheckpointGameplay, original: unknown[] = []): CheckpointGameplay[] {
  const entries: CheckpointGameplay[] = [
    ...Array.from({ length: Math.max(count, normal.length) }, (_, index) => ({ checkpoint: index + 1, ...normal[index] })),
    ...(terminal ? [{ ...terminal, role: 'terminal' as const }] : []),
  ]
  // Preserve the saved array order on unchanged canonical drafts/versions.
  const remaining = new Set(entries)
  const ordered: CheckpointGameplay[] = []
  for (const old of original) {
    if (!isObject(old)) continue
    const next = entries.find(entry => remaining.has(entry) && (old.role === 'terminal'
      ? entry.role === 'terminal' : entry.role !== 'terminal' && entry.checkpoint === (old.checkpoint ?? old.checkpointNumber)))
    if (next) { ordered.push(next); remaining.delete(next) }
  }
  return [...ordered, ...remaining]
}

export function gameplayValidation(content: CreatorTemplateContent, submission = false): string {
  const geographic = content.configuration.normalCheckpointCount !== undefined || content.configuration.checkpointPositions !== undefined
  const entries = content.checkpoints
  if (!geographic && !entries.some(entry => isObject(entry) && entry.role !== undefined)) return ''
  if (!entries.length || !entries.every(isObject)) return 'Checkpoint gameplay must contain valid checkpoint entries.'
  const terminal = entries.filter(entry => entry.role === 'terminal')
  if (terminal.length > 1) return 'Keep exactly one FinishPoint gameplay entry.'
  for (const entry of entries) {
    if (entry.role !== undefined && entry.role !== 'normal' && entry.role !== 'terminal') return 'Checkpoint role must be normal or terminal.'
    if (entry.role === 'terminal' && (entry.checkpoint !== undefined || entry.checkpointNumber !== undefined)) return 'FinishPoint gameplay must not have normal checkpoint numbering.'
    for (const field of gameplayFields) {
      if (entry[field] !== undefined && !supportedGameplay[field].includes(entry[field] as string)) return `Choose a supported ${field === 'kind' ? 'Personal Challenge' : field === 'teamKind' ? 'Team Challenge' : 'navigation mode'} for ${entry.role === 'terminal' ? 'FinishPoint' : `checkpoint ${entry.checkpoint ?? ''}`}.`
    }
  }
  if (!submission || !geographic) return ''
  if (terminal.length !== 1) return 'Configure FinishPoint gameplay in Feature 6, then save before submitting. Challenges may be left unconfigured.'
  const count = content.configuration.normalCheckpointCount
  const normal = entries.filter(entry => entry.role !== 'terminal')
  const numbers = new Set(normal.map(entry => entry.checkpoint))
  if (!Number.isInteger(count) || normal.length !== count || numbers.size !== count || normal.some(entry =>
    !Number.isInteger(entry.checkpoint) || entry.checkpoint! < 1 || entry.checkpoint! > count!
      || (entry.checkpointNumber !== undefined && entry.checkpointNumber !== entry.checkpoint))) {
    return 'Normal gameplay must be numbered exactly 1 through the normal checkpoint count, matching checkpoint geography. Review and save the normal checkpoint configuration.'
  }
  return ''
}
