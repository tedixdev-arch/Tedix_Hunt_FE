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

import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { ContentLibrary } from '../src/features/creator/content/ContentLibrary'
import { vi } from 'vitest'

test('approved exercises remain distinct from collapsed Starters; location and real curriculum narrow the available collection', async () => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  const container = document.createElement('div'); document.body.append(container)
  const root = createRoot(container)
  const approved = { ...starterContent[0], id: 'approved-fixture', collection: { id: 'approved', name: 'Approved' }, approvalStatus: 'approved' as const,
    location: { country: 'RO', region: 'Cluj', city: 'Cluj-Napoca' },
    curriculum: [{ domain: 'Math' as const, grade: 5, main: 'Algebra' as const, unitId: 'unit-from-record', lessonId: 'lesson-from-record' }] }
  const other = { ...approved, id: 'other-fixture', location: { country: 'GB', region: 'London', city: 'London' } }
  const select = async (label: string, value: string) => {
    const element = container.querySelector<HTMLSelectElement>(`select[aria-label="${label}"]`)!
    await act(async () => { element.value = value; element.dispatchEvent(new Event('change', { bubbles: true })) })
  }
  try {
    await act(async () => root.render(<ContentLibrary items={[starterContent[0], approved, other]} />))
    expect(container.querySelector('details')?.open).toBe(false)
    expect(container.querySelector('[role="status"]')?.textContent).toBe('2 approved exercises')
    await select('Country', 'RO')
    expect(container.querySelector('[role="status"]')?.textContent).toBe('1 approved exercises')
    await select('County/Region', 'Cluj'); await select('City', 'Cluj-Napoca')
    await select('Category', 'Math')
    const main = container.querySelector<HTMLSelectElement>('[aria-label="Main"]')!
    expect(main.disabled).toBe(true)
    await select('Grade', '5'); expect(main.disabled).toBe(false)
    expect([...main.options].map(o => o.value)).toEqual(['Mix', 'Algebra'])
    await select('Main', 'Algebra'); await select('Unit', 'unit-from-record'); await select('Lesson', 'lesson-from-record')
    expect(container.querySelector('[role="status"]')?.textContent).toBe('1 approved exercises')
    await select('Country', 'GB')
    expect(container.querySelector<HTMLSelectElement>('[aria-label="City"]')?.value).toBe('')
    expect(container.textContent).not.toContain('Unclassified')
  } finally { act(() => root.unmount()); container.remove(); vi.unstubAllGlobals() }
})
