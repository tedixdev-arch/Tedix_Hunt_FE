import type { ApprovedContent, ApprovedFilters } from '../../../services/api/creatorContent.ts'
import type { GeographicCity, LocalitySnapshot } from '../../../services/api/geography.ts'
import type { CheckpointGameplay } from '../checkpointGameplay.ts'
import type { CreatorTemplateContent } from '../../../services/api/creatorTemplates.ts'

export type AllocationSlot = 'personal' | 'team'
export type RandomFilters = Pick<ApprovedFilters, 'classification' | 'type' | 'category' | 'grade'>
export type LibraryAllocation = { mode: 'specific'; contentId: string; revisionId: string } | { mode: 'random'; filters?: RandomFilters } | {
  mode: 'specific' | 'random'; contentId: string; revisionId: string; version: number; classification: AllocationSlot; type: string; filters?: RandomFilters
}
export interface ExercisePoolDefaults {
  category?: string
  grade?: unknown
  classification?: 'universal' | 'local' | null
  location?: LocalitySnapshot | null
  geography?: Pick<GeographicCity, 'localityId' | 'countryCode' | 'geographicId' | 'admin1Code' | 'regionStatus'> | null
}
export const contentGrade = (grade: unknown) => /^(5|6|7|8|9|10|11|12|unspecified)$/.test(String(grade)) ? String(grade) : undefined
export const isResolvedAllocation = (a?: LibraryAllocation): a is Extract<LibraryAllocation, { version: number }> => !!a && 'version' in a && Number.isInteger(a.version) && !!a.contentId && !!a.revisionId
export function discoveryContext(defaults?: ExercisePoolDefaults): ApprovedFilters {
  const local = defaults?.classification === 'local' ? defaults.location : null
  const geo = defaults?.geography
  return { category: defaults?.category, ...(contentGrade(defaults?.grade) ? { grade: contentGrade(defaults?.grade) } : {}), ...(local ? { countryCode: local.countryCode,
    ...(geo?.localityId === local.id && geo.countryCode === local.countryCode && geo.geographicId ? { geographicId: geo.geographicId } : {}) } : {}) }
}
export function eligibleApproved(item: ApprovedContent, slot: AllocationSlot, defaults?: ExercisePoolDefaults): boolean {
  if (item.status !== 'approved' || item.classification !== slot || item.category !== defaults?.category) return false
  const grade = contentGrade(defaults?.grade)
  if (grade && (item.curriculum.grade ?? 'unspecified') !== grade) return false
  const geo = item.geography, local = defaults?.classification === 'local' ? defaults.location : null, mapping = defaults?.geography
  if (geo.scope === 'universal') return true
  if (!local || geo.countryCode !== local.countryCode) return false
  if (geo.scope === 'country') return true
  if (!mapping || mapping.localityId !== local.id || mapping.countryCode !== local.countryCode) return false
  return geo.scope === 'city' ? geo.geographicId === mapping.geographicId : mapping.regionStatus === 'resolved' && geo.admin1Code === mapping.admin1Code
}
/** A new choice removes the old source/payload pair in this slot only. */
export function selectAllocation(cp: CheckpointGameplay, slot: AllocationSlot, allocation?: LibraryAllocation): CheckpointGameplay {
  const next: CheckpointGameplay = { ...cp, libraryAllocations: { ...cp.libraryAllocations }, customExercises: { ...cp.customExercises } }
  delete next.customExercises![slot]
  if (allocation) next.libraryAllocations![slot] = allocation
  else delete next.libraryAllocations![slot]
  if (!Object.keys(next.customExercises!).length) delete next.customExercises
  if (!Object.keys(next.libraryAllocations!).length) delete next.libraryAllocations
  return next
}
export function allocationValidation(content: CreatorTemplateContent): string {
  const used = new Set<string>()
  for (const cp of content.checkpoints as CheckpointGameplay[]) for (const slot of ['personal', 'team'] as const) {
    const a = cp.libraryAllocations?.[slot]
    if (!a) continue
    if (a.mode === 'specific' && (!('contentId' in a) || !a.contentId || !a.revisionId)) return 'Choose an approved exercise before saving.'
    if (isResolvedAllocation(a) && !cp.customExercises?.[slot]) return 'The allocated exercise is missing. Reopen the saved Template before editing.'
    if (!isResolvedAllocation(a) && cp.customExercises?.[slot]) return 'Choose either Predefined or Create Your Own for this challenge.'
    if (slot === 'personal' && 'contentId' in a) {
      if (used.has(a.contentId)) return 'This Personal exercise is already used at another checkpoint. Choose a different exercise.'
      used.add(a.contentId)
    }
  }
  return ''
}
const stable = (v: unknown): string => JSON.stringify(v, (_key, value) => value && typeof value === 'object' && !Array.isArray(value) ? Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b))) : value)
export function verifyAllocationSave(sent: CreatorTemplateContent, saved: CreatorTemplateContent): void {
  for (const cp of sent.checkpoints as CheckpointGameplay[]) for (const slot of ['personal', 'team'] as const) {
    const a = cp.libraryAllocations?.[slot]
    if (!a) continue
    const destination = (saved.checkpoints as CheckpointGameplay[]).find(row => cp.role === 'terminal' ? row.role === 'terminal' : row.role !== 'terminal' && (row.checkpoint ?? row.checkpointNumber) === (cp.checkpoint ?? cp.checkpointNumber))
    const actual = destination?.libraryAllocations?.[slot]
    if (!isResolvedAllocation(actual) || actual.mode !== a.mode || actual.classification !== slot || !destination?.customExercises?.[slot] || destination.customExercises[slot]!.type !== actual.type
      || ('contentId' in a && (actual.contentId !== a.contentId || actual.revisionId !== a.revisionId))
      || (isResolvedAllocation(a) && stable(actual) !== stable(a))) throw new Error('Saving could not be confirmed: the allocated exercise or approved revision is missing or changed. Your draft is kept.')
  }
  const issue = allocationValidation(saved)
  if (issue) throw new Error(`Saving could not be confirmed. ${issue}`)
}
/** Rebase only selections unchanged since the request; never overwrite a newer selection. */
export function reconcileAllocationCheckpoint(current: CheckpointGameplay, sent: CheckpointGameplay | undefined, saved: CheckpointGameplay | undefined): CheckpointGameplay {
  let next = { ...current }
  for (const slot of ['personal', 'team'] as const) {
    if (!sent?.libraryAllocations?.[slot] || !saved?.libraryAllocations?.[slot] || stable(current.libraryAllocations?.[slot]) !== stable(sent.libraryAllocations[slot])) continue
    next = { ...next, libraryAllocations: { ...next.libraryAllocations, [slot]: structuredClone(saved.libraryAllocations[slot]) }, customExercises: { ...next.customExercises, [slot]: structuredClone(saved.customExercises?.[slot]) } }
  }
  return next
}
