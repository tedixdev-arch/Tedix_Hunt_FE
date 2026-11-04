import { act, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { ChallengeAllocation } from '../src/features/creator/content/ChallengeAllocation'
import { starterContent } from '../src/features/creator/content/catalog'
import { PersonalChallengeAuthoring } from '../src/features/creator/exercises/PersonalChallengeAuthoring'
import { geographyApi } from '../src/services/api/geography'
import type { AuthoringDraft } from '../src/features/creator/exercises/experimentDrafts'
import { applyExerciseDrafts } from '../src/features/creator/exercises/templateExercises'

let host: HTMLDivElement, root: ReturnType<typeof createRoot>
beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  vi.spyOn(geographyApi, 'countries').mockResolvedValue({ countries: [] })
  host = document.createElement('div'); document.body.append(host); root = createRoot(host)
})
afterEach(() => { act(() => root.unmount()); host.remove(); vi.restoreAllMocks(); vi.unstubAllGlobals() })
const select = async (label: string, value: string) => {
  const node = host.querySelector<HTMLSelectElement>(`[aria-label="${label}"]`)!
  await act(async () => { node.value = value; node.dispatchEvent(new Event('change', { bubbles: true })) })
}
async function filters() { await act(async () => host.querySelector<HTMLInputElement>('input[value="filters"]')!.click()) }
test('allocation is session-only, has exact category choices and hides unavailable curriculum', async () => {
  await act(async () => root.render(<ChallengeAllocation />))
  expect(host.querySelector<HTMLInputElement>('input[value="random"]')!.checked).toBe(true)
  expect(host.querySelector('select')).toBeNull()
  expect(geographyApi.countries).not.toHaveBeenCalled()
  await filters()
  const category = host.querySelector<HTMLSelectElement>('[aria-label="Allocation category"]')!
  expect([...category.options].map(o => o.text)).toEqual(['Starter', 'Mathematics', 'History', 'Science', 'Mixed'])
  expect(category.value).toBe('starter-preset')
  expect(host.querySelector<HTMLSelectElement>('[aria-label="Content country"]')!.value).toBe('')
  await select('Allocation category', 'Mathematics')
  expect(host.querySelector('[aria-label="Grade"]')).toBeNull()
  expect(host.textContent).toContain('unavailable for publication')
  await act(async () => host.querySelector<HTMLInputElement>('input[value="random"]')!.click())
  expect(host.querySelector('select')).toBeNull()
})
test('real mathematics associations expose cascading levels and category changes clear them', async () => {
  const items = [{ ...starterContent[0], curriculum: [{ category: 'Mathematics' as const, grade: 5, main: 'Algebra' as const, unitId: 'actual-unit', lessonId: 'actual-lesson' }] }]
  await act(async () => root.render(<ChallengeAllocation items={items} />)); await filters()
  await select('Allocation category', 'Mathematics')
  expect(host.querySelector('[aria-label="Main"]')).toBeNull()
  await select('Grade', '5'); await select('Main', 'Algebra'); await select('Unit', 'actual-unit'); await select('Lesson', 'actual-lesson')
  await select('Grade', 'Mix')
  expect(host.querySelector('[aria-label="Main"]')).toBeNull()
  await select('Allocation category', 'History')
  expect(host.querySelector('[aria-label="Grade"]')).toBeNull()
})
test('changing allocation and mechanics preserves saved checkpoint assignment and scoring', async () => {
  const checkpoint = { checkpoint: 1, kind: 'hidden-rule', points: 37 }
  const changed = vi.fn(); let current: AuthoringDraft = { source: 'saved', assignment: 'predefined' }
  function Harness() {
    const [draft, setDraft] = useState(current); current = draft
    return <PersonalChallengeAuthoring value={checkpoint} draft={draft} onChange={changed} onDraftChange={setDraft} />
  }
  await act(async () => root.render(<Harness />))
  await filters(); await select('Allocation category', 'Science'); await select('Personal Challenge', 'tap-pair')
  expect(changed).not.toHaveBeenCalled()
  expect(applyExerciseDrafts([checkpoint], { 'kind:0': current }).checkpoints).toEqual([checkpoint])
  expect(host.querySelector('[aria-label="Content exercise picker"]')).toBeNull()
  expect(host.querySelector('[aria-label="Mobile challenge canvas"]')).toBeNull()
})
