import { act, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { ChallengeAllocation } from '../src/features/creator/content/ChallengeAllocation'
import { starterContent, type ContentRecord } from '../src/features/creator/content/catalog'
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
async function click(text: string) { await act(async () => [...host.querySelectorAll('button')].find(n => n.textContent === text)!.click()) }
async function specific() { await act(async () => host.querySelector<HTMLInputElement>('input[value="specific"]')!.click()) }
const approved: ContentRecord = { ...starterContent[0], id: 'test-approved', approvalStatus: 'approved', revision: { kind: 'backend', id: 'test-revision' }, collection: { id: 'test-library', name: 'Test library' }, activityCategory: 'Mathematics' }
test('default random has independent collapsed refinement and honest specific empty state', async () => {
  await act(async () => root.render(<ChallengeAllocation />))
  expect(host.querySelector<HTMLInputElement>('input[value="random"]')!.checked).toBe(true)
  expect(host.querySelector('select')).toBeNull()
  expect(geographyApi.countries).not.toHaveBeenCalled()
  await click('Refine exercise pool+')
  expect([...host.querySelector<HTMLSelectElement>('[aria-label="Allocation category"]')!.options].map(o => o.text)).toEqual(['All categories', 'Starter', 'Mathematics', 'History', 'Science', 'Mixed'])
  await select('Allocation category', 'Mathematics')
  for (const label of ['Grade', 'Main', 'Unit', 'Lesson']) expect(host.querySelector<HTMLSelectElement>(`[aria-label="${label}"]`)!.disabled).toBe(true)
  expect(host.querySelector('[aria-label="Master"]')).toBeNull()
  await specific()
  expect(host.querySelector('[aria-label="Grade"]')).not.toBeNull()
  expect(host.textContent).toContain('No approved exercise records')
  expect(host.querySelector<HTMLSelectElement>('[aria-label="Approved exercise"]')!.disabled).toBe(true)
  expect(host.textContent).not.toContain('Preview Starter demonstration')
  expect(host.textContent).toContain('unavailable for publication')
})
test('real mathematics hierarchy stays visible and parent/category changes reset children', async () => {
  const items = [{ ...approved, curriculum: [{ category: 'Mathematics' as const, grade: 5, main: 'Algebra' as const, unitId: 'test-unit', lessonId: 'test-lesson' }] }]
  await act(async () => root.render(<ChallengeAllocation items={items} defaults={{ category: 'Mathematics' }} />)); await click('Refine exercise pool+')
  expect(host.querySelector<HTMLSelectElement>('[aria-label="Main"]')!.disabled).toBe(true)
  await select('Grade', '5'); await select('Main', 'Algebra'); await select('Unit', 'test-unit'); await select('Lesson', 'test-lesson')
  await select('Grade', 'Mix')
  for (const [label, value] of [['Main', 'Mix'], ['Unit', ''], ['Lesson', '']]) {
    const field = host.querySelector<HTMLSelectElement>(`[aria-label="${label}"]`)!
    expect(field.disabled).toBe(true); expect(field.value).toBe(value)
  }
  await select('Allocation category', 'History'); expect(host.querySelector('[aria-label="Grade"]')).toBeNull()
  await select('Allocation category', 'Mathematics'); expect(host.querySelector<HTMLSelectElement>('[aria-label="Grade"]')!.value).toBe('Mix')
})
test('only eligible approved backend records can be selected; pool changes invalidate selection', async () => {
  const items = [approved, ...starterContent, { ...approved, id: 'pending', approvalStatus: 'pending' as const }]
  await act(async () => root.render(<ChallengeAllocation items={items} mechanic={approved.mechanic} defaults={{ category: 'Mathematics' }} />))
  await specific()
  const field = host.querySelector<HTMLSelectElement>('[aria-label="Approved exercise"]')!
  expect([...field.options].map(o => o.value)).toEqual(['', approved.id])
  await select('Approved exercise', approved.id)
  expect(host.querySelector('[aria-label="Playable exercise preview"]')).not.toBeNull()
  expect(host.querySelector('textarea')).toBeNull()
  await click('Refine exercise pool+'); await select('Allocation category', 'History')
  expect(host.querySelector('[aria-label="Mobile challenge canvas"]')).toBeNull()
  expect(host.textContent).toContain('No approved exercises match')
})
test('Template category/location inherited automatically with Universal override and no guessed IDs', async () => {
  const location = { id: 'test-locality', name: 'Test city', countryCode: 'RO', countryDisplayName: 'Romania', administrativeContext: 'Test county', latitude: 1, longitude: 2 }
  const cities = vi.spyOn(geographyApi, 'cities').mockRejectedValue(new Error('lookup must not be needed'))
  const get = vi.spyOn(geographyApi, 'get').mockRejectedValue(new Error('lookup must not be needed'))
  const geography = { localityId: location.id, geographicId: 'test-geographic', countryCode: 'RO', admin1Code: 'CJ', regionStatus: 'resolved' as const }
  const items = [{ ...approved, geography: { country: 'RO', region: 'CJ', city: 'test-geographic' } }, { ...approved, id: 'other-city', geography: { country: 'RO', region: 'CJ', city: 'different-geographic' } }]
  await act(async () => root.render(<ChallengeAllocation items={items} defaults={{ category: 'Mathematics', location, geography }} />))
  await click('Refine exercise pool+')
  expect(host.querySelector<HTMLSelectElement>('[aria-label="Allocation category"]')!.value).toBe('Mathematics')
  expect(host.querySelector<HTMLSelectElement>('[aria-label="Geographic applicability"]')!.value).toBe('template')
  expect(host.querySelector('[aria-label="Find content city"]')).toBeNull()
  expect(cities).not.toHaveBeenCalled(); expect(get).not.toHaveBeenCalled()
  expect(host.textContent).toContain('Approved exercise · Representative preview only')
  await specific()
  expect([...host.querySelector<HTMLSelectElement>('[aria-label="Approved exercise"]')!.options].map(o => o.value)).toEqual(['', approved.id])
  await select('Geographic applicability', 'universal')
  expect([...host.querySelector<HTMLSelectElement>('[aria-label="Approved exercise"]')!.options].map(o => o.value)).toEqual(['', approved.id, 'other-city'])
})
test('missing conversion fails closed even when lookup services are unavailable; Universal and Starter remain available', async () => {
  const cities = vi.spyOn(geographyApi, 'cities').mockRejectedValue(new Error('offline'))
  vi.spyOn(geographyApi, 'get').mockRejectedValue(new Error('offline'))
  await act(async () => root.render(<ChallengeAllocation items={[approved, ...starterContent]} defaults={{ category: 'Mathematics', location: { id: 'test', name: 'City', countryCode: 'RO', countryDisplayName: 'Romania', administrativeContext: '', latitude: 1, longitude: 2 } }} />))
  expect(host.textContent).not.toContain('Approved exercise · Representative preview only')
  expect(host.textContent).toContain('Starter demonstration · No eligible approved exercise. Nothing allocated.')
  await click('Refine exercise pool+'); expect(host.textContent).toContain('geographic city mapping is unavailable')
  expect(cities).not.toHaveBeenCalled()
  await select('Geographic applicability', 'universal'); expect(host.textContent).toContain('Approved exercise · Representative preview only')
})
test('allocation and mechanics preserve saved assignment and scoring', async () => {
  const checkpoint = { checkpoint: 1, kind: 'hidden-rule', points: 37 }
  const changed = vi.fn(); let current: AuthoringDraft = { source: 'saved', assignment: 'predefined' }
  function Harness() { const [draft, setDraft] = useState(current); current = draft; return <PersonalChallengeAuthoring value={checkpoint} draft={draft} onChange={changed} onDraftChange={setDraft} /> }
  await act(async () => root.render(<Harness />))
  await click('Refine exercise pool+'); await select('Allocation category', 'Science'); await select('Personal Challenge', 'tap-pair')
  expect([...host.querySelectorAll('button')].some(n => n.textContent === 'Apply challenge')).toBe(false)
  expect(changed).not.toHaveBeenCalled()
  expect(applyExerciseDrafts([checkpoint], { 'kind:0': current }).checkpoints).toEqual([checkpoint])
  expect(host.querySelector('[aria-label="Content exercise picker"]')).toBeNull()
})

test('a mapping for another locality or country cannot broaden the inherited pool', async () => {
  const location = { id: 'locality', name: 'City', countryCode: 'RO', countryDisplayName: 'Romania', administrativeContext: '', latitude: 1, longitude: 2 }
  for (const geography of [
    { localityId: 'wrong', countryCode: 'RO', geographicId: 'catalog-city', admin1Code: 'CJ', regionStatus: 'resolved' as const },
    { localityId: 'locality', countryCode: 'FR', geographicId: 'catalog-city', admin1Code: 'CJ', regionStatus: 'resolved' as const },
  ]) {
    await act(async () => root.render(<ChallengeAllocation items={[approved]} defaults={{ category: 'Mathematics', location, geography }} />))
    expect(host.textContent).not.toContain('Approved exercise · Representative preview only')
  }
})

test('automatic mobile preview switches mechanics, resets play, and never exposes editing', async () => {
  await act(async () => root.render(<ChallengeAllocation mechanic="tap-pair" />))
  expect(host.querySelector('[aria-label="Mobile challenge canvas"]')).not.toBeNull()
  expect(host.querySelector('[aria-label="Tap and pair cards"]')).not.toBeNull()
  await click('Check answer')
  await click('Reset')
  await act(async () => root.render(<ChallengeAllocation mechanic="sequence" />))
  expect(host.querySelector('[aria-label="Tap and pair cards"]')).toBeNull()
  expect(host.querySelectorAll('.challenge-pencil, textarea, [aria-label^="Edit "]')).toHaveLength(0)
  expect([...host.querySelectorAll('button')].some(n => /preview/i.test(n.textContent ?? ''))).toBe(false)
  await specific()
  expect(host.textContent).toContain('Choose an approved exercise to preview.')
  expect(host.querySelector('[aria-label="Mobile challenge canvas"]')).toBeNull()
})

test('without Template defaults, approved previews can cross categories and pool refinement never assigns', async () => {
  await act(async () => root.render(<ChallengeAllocation items={[approved, ...starterContent]} />))
  expect(host.textContent).toContain('Approved exercise · Representative preview only')
  expect(host.textContent).not.toContain('Starter demonstration')
  await specific()
  expect(host.querySelector('[aria-label="Mobile challenge canvas"]')).toBeNull()
  await select('Approved exercise', approved.id)
  expect(host.textContent).toContain('Approved exercise · Selected preview only')
  expect(host.querySelector('[aria-label="Mobile challenge canvas"]')).not.toBeNull()
  await click('Refine exercise pool+')
  await select('Allocation category', 'History')
  expect(host.querySelector('[aria-label="Mobile challenge canvas"]')).toBeNull()
})
