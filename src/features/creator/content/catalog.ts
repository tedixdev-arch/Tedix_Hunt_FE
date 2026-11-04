import type { ActivityCategory } from './classification'
import { personalExamples } from '../exercises/personalExamples'
import { teamExamples } from '../exercises/teamExamples'
import type { Exercise, Mechanic } from '../exercises/catalog'

export const categories = ['Personal Challenges', 'Team Challenges', 'Navigation Hints'] as const
export type ContentCategory = typeof categories[number]
export interface CurriculumAssociation {
  category: ActivityCategory; grade: number; main: 'Algebra' | 'Geometry'
  unitId?: string; lessonId?: string
}
/** Library metadata is separate from Template-owned exercise persistence. */
export interface ContentRecord {
  id: string
  category: ContentCategory
  geography?: { country: string; region: string; city: string }
  activityCategory?: ActivityCategory
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
export interface ContentFilters { scope?: { country: string; region: string; city: string }; category: string; grade: string; main: string; unit: string; lesson: string; query: string }
export const initialFilters: ContentFilters = { category: 'All', grade: 'Mix', main: 'Mix', unit: '', lesson: '', query: '' }
/** Mix is a UI selection scope. All constrained fields must match one real association. */
export function filterContent(items: readonly ContentRecord[], category: ContentCategory, filters: ContentFilters) {
  return items.filter(item => item.category === category &&
    (!filters.scope || !filters.scope.country || !!item.geography && (!item.geography.country || item.geography.country === filters.scope.country) && (!item.geography.region || item.geography.region === filters.scope.region) && (!item.geography.city || item.geography.city === filters.scope.city)) && (filters.category === 'All' || item.activityCategory === filters.category || item.curriculum.some(c => c.category === filters.category)) &&
    `${item.exercise.title} ${item.exercise.instructions} ${item.mechanic} ${item.activityCategory ?? ''} ${item.collection.name}`.toLowerCase().includes(filters.query.trim().toLowerCase()) &&
    (filters.grade === 'Mix' && filters.main === 'Mix' && !filters.unit && !filters.lesson ||
      item.curriculum.some(c => (filters.category === 'All' || c.category === filters.category) &&
        (filters.grade === 'Mix' || String(c.grade) === filters.grade) && (filters.main === 'Mix' || c.main === filters.main) &&
        (!filters.unit || c.unitId === filters.unit) && (!filters.lesson || c.lessonId === filters.lesson))))
}
