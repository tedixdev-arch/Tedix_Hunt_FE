import { personalExamples } from '../exercises/personalExamples'
import { teamExamples } from '../exercises/teamExamples'
import type { Exercise, Mechanic } from '../exercises/catalog'

export const categories = ['Personal Challenges', 'Team Challenges', 'Navigation Hints'] as const
export type ContentCategory = typeof categories[number]
export interface CurriculumAssociation {
  domain: 'Math'; grade: number; main: 'Algebra' | 'Geometry'
  unitId?: string; lessonId?: string
}
/** Library metadata is separate from Template-owned exercise persistence. */
export interface ContentRecord {
  id: string
  category: ContentCategory
  mechanic: Mechanic
  exercise: Exercise
  curriculum: readonly CurriculumAssociation[]
  collection: { id: string; name: string }
  provenance: { source: 'repository-starter'; module: string; sourceId: string }
  approvalStatus: 'unreviewed' | 'pending' | 'approved' | 'rejected'
  revision: { kind: 'repository'; id: string } | { kind: 'backend'; id: string }
}
const records = (examples: readonly Exercise[], category: ContentCategory, module: string): ContentRecord[] => examples.map(exercise => ({
  id: `starter:${exercise.id}`, category, mechanic: exercise.type, exercise,
  curriculum: [], collection: { id: 'repository-starters', name: 'Starter' },
  provenance: { source: 'repository-starter', module, sourceId: exercise.id },
  approvalStatus: 'unreviewed',
  // A source locator, never a server revision or an approval claim.
  revision: { kind: 'repository', id: `${module}#${exercise.id}` },
}))
export const starterContent: readonly ContentRecord[] = [
  ...records(personalExamples, 'Personal Challenges', 'personalExamples.ts'),
  ...records(teamExamples, 'Team Challenges', 'teamExamples.ts'),
]
export interface ContentFilters { domain: string; grade: string; main: string; unit: string; lesson: string; query: string }
export const initialFilters: ContentFilters = { domain: 'Mix', grade: 'Mix', main: 'Mix', unit: '', lesson: '', query: '' }
/** Mix is a UI selection scope. All constrained fields must match one real association. */
export function filterContent(items: readonly ContentRecord[], category: ContentCategory, filters: ContentFilters) {
  return items.filter(item => item.category === category &&
    `${item.exercise.title} ${item.mechanic}`.toLowerCase().includes(filters.query.trim().toLowerCase()) &&
    (filters.domain === 'Mix' && filters.grade === 'Mix' && filters.main === 'Mix' && !filters.unit && !filters.lesson ||
      item.curriculum.some(c => (filters.domain === 'Mix' || c.domain === filters.domain) &&
        (filters.grade === 'Mix' || String(c.grade) === filters.grade) && (filters.main === 'Mix' || c.main === filters.main) &&
        (!filters.unit || c.unitId === filters.unit) && (!filters.lesson || c.lessonId === filters.lesson))))
}
