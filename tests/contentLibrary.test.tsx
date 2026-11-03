import { expect, test } from 'vitest'
import { filterContent, initialFilters, starterContent } from '../src/features/creator/content/catalog'
import { personalTypes, validateExercise } from '../src/features/creator/exercises/catalog'

test('Starter adapter preserves canonical mechanics, valid examples and honest provenance', () => {
  const personal = starterContent.filter(item => item.category === 'Personal Challenges')
  expect(personal.map(item => item.mechanic)).toEqual(personalTypes.map(([id]) => id))
  expect(new Set(starterContent.map(item => item.id)).size).toBe(22)
  for (const item of starterContent) {
    expect(validateExercise(item.exercise)).toEqual([])
    expect(item.approvalStatus).toBe('unreviewed')
    expect(item.curriculum).toEqual([])
    expect(item.provenance.sourceId).toBe(item.exercise.id)
  }
})

test('Mix is unconstrained, while actual filters match one association without inventing classifications', () => {
  expect(filterContent(starterContent, 'Personal Challenges', initialFilters)).toHaveLength(15)
  for (const filters of [{ domain: 'Math' }, { grade: '5' }, { main: 'Geometry' }, { unit: 'unknown' }, { lesson: 'unknown' }]) {
    expect(filterContent(starterContent, 'Personal Challenges', { ...initialFilters, ...filters })).toEqual([])
  }
  const classified = { ...starterContent[0], curriculum: [{ domain: 'Math' as const, grade: 5, main: 'Algebra' as const, unitId: 'real-unit', lessonId: 'real-lesson' }] }
  expect(filterContent([classified], 'Personal Challenges', { ...initialFilters, domain: 'Math', grade: '5', main: 'Algebra', unit: 'real-unit', lesson: 'real-lesson' })).toHaveLength(1)
  expect(filterContent([classified], 'Personal Challenges', { ...initialFilters, grade: '6' })).toEqual([])
  expect(filterContent(starterContent, 'Navigation Hints', initialFilters)).toEqual([])
})
