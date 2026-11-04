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
  for (const filters of [{ category: 'Mathematics' }, { grade: '5' }, { main: 'Geometry' }, { unit: 'unknown' }, { lesson: 'unknown' }]) {
    expect(filterContent(starterContent, 'Personal Challenges', { ...initialFilters, ...filters })).toEqual([])
  }
  const classified = { ...starterContent[0], curriculum: [{ category: 'Mathematics' as const, grade: 5, main: 'Algebra' as const, unitId: 'real-unit', lessonId: 'real-lesson' }] }
  expect(filterContent([classified], 'Personal Challenges', { ...initialFilters, category: 'Mathematics', grade: '5', main: 'Algebra', unit: 'real-unit', lesson: 'real-lesson' })).toHaveLength(1)
  expect(filterContent([classified], 'Personal Challenges', { ...initialFilters, grade: '6' })).toEqual([])
  expect(filterContent(starterContent, 'Navigation Hints', initialFilters)).toEqual([])
})

test('specific geography excludes unknown applicability and respects unrestricted levels', () => {
  const scope = { country: 'RO', region: 'CJ', city: 'city-id' }
  expect(filterContent(starterContent, 'Personal Challenges', { ...initialFilters, scope })).toEqual([])
  const example = starterContent[0]
  const universal = { ...example, geography: { country: '', region: '', city: '' } }
  const regional = { ...example, geography: { country: 'RO', region: 'CJ', city: '' } }
  expect(filterContent([universal, regional], 'Personal Challenges', { ...initialFilters, scope })).toHaveLength(2)
  expect(filterContent([regional], 'Personal Challenges', { ...initialFilters, scope: { ...scope, country: 'FR' } })).toEqual([])
})
