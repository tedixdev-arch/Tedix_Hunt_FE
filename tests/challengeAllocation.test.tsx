import { act, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { ChallengeAllocation } from '../src/features/creator/content/ChallengeAllocation'
import { creatorContentApi, type ApprovedDetail } from '../src/services/api/creatorContent'
import { geographyApi } from '../src/services/api/geography'
import { authorPrototype, toPersistence } from '../src/features/creator/exercises/persistenceAdapter'
import { prototypes } from '../src/features/creator/exercises/catalog'
import type { CheckpointGameplay } from '../src/features/creator/checkpointGameplay'
import type { ExercisePoolDefaults } from '../src/features/creator/content/templateAllocation'
let host: HTMLDivElement, root: ReturnType<typeof createRoot>, current: CheckpointGameplay
const approved: ApprovedDetail = { contentId: 'content', revisionId: 'revision', version: 2, classification: 'personal', type: 'tap-pair', title: 'Exact approved pairs', status: 'approved', category: 'Mathematics', curriculum: {}, geography: { scope: 'universal' }, exercise: toPersistence(authorPrototype(prototypes[0])) }
const defaults: ExercisePoolDefaults = { classification: 'universal', category: 'Mathematics' }
beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  vi.spyOn(creatorContentApi, 'approved').mockResolvedValue({ items: [approved], nextAfter: null }); vi.spyOn(creatorContentApi, 'approvedRevision').mockResolvedValue(approved)
  vi.spyOn(geographyApi, 'cities').mockResolvedValue({ cities: [], nextAfter: null }); vi.spyOn(geographyApi, 'countries').mockResolvedValue({ countries: [] })
  host = document.createElement('div'); document.body.append(host); root = createRoot(host)
})
afterEach(() => { act(() => root.unmount()); host.remove(); vi.restoreAllMocks(); vi.unstubAllGlobals() })
async function mount(pool: ExercisePoolDefaults = defaults) {
  function Harness() { const [cp, setCp] = useState<CheckpointGameplay>({ checkpoint: 1, points: 37 }), [preview, setPreview] = useState<ApprovedDetail>(); current = cp; return <ChallengeAllocation value={cp} onChange={setCp} defaults={pool} preview={preview} onPreview={setPreview} onSelect={() => true} /> }
  await act(async () => root.render(<Harness />))
}
async function click(text: string) { await act(async () => (Array.from(host.querySelectorAll('label,button')).find(node => node.textContent === text || node.getAttribute('aria-label') === text) as HTMLElement).click()) }
async function select(label: string, value: string) { const node = host.querySelector<HTMLSelectElement>(`[aria-label="${label}"]`)!; await act(async () => { node.value = value; node.dispatchEvent(new Event('change', { bubbles: true })) }) }

test('collapsed refinement uses only supported pool controls; no new assignment on mount', async () => {
  await mount(); expect(host.querySelector('details')?.open).toBe(false); expect(host.querySelector('[aria-label="Allocation category"]')).toBeNull()
  expect(host.querySelector('[aria-label="Main"]')).toBeNull(); expect(host.querySelector('[aria-label="Unit"]')).toBeNull(); expect(host.querySelector('[aria-label="Lesson"]')).toBeNull()
  expect(geographyApi.countries).not.toHaveBeenCalled(); expect(current).toEqual({ checkpoint: 1, points: 37 }); expect(host.querySelector('[aria-label="Mobile challenge canvas"]')).toBeNull()
})
test('failed discovery retries without replacing existing checkpoint state', async () => {
  vi.mocked(creatorContentApi.approved).mockRejectedValueOnce(new Error('network'))
  await mount(); expect(host.querySelector('[role="alert"]')?.textContent).toContain('could not be loaded'); await click('Retry')
  expect(creatorContentApi.approved).toHaveBeenCalledTimes(2); expect(current.points).toBe(37); expect(current.libraryAllocations).toBeUndefined()
})
test('specific only selects approved exact revisions and preview stays read only during play', async () => {
  await mount(); await click('Choose specific exercise'); await click('Select Exact approved pairs')
  const before = structuredClone(current); expect(host.querySelector('[aria-label="Playable exercise preview"]')).not.toBeNull()
  await click('Check answer'); await click('Reset'); expect(current).toEqual(before)
  expect(host.querySelectorAll('textarea,.challenge-pencil,[aria-label^="Edit "]')).toHaveLength(0); expect(current.points).toBe(37)
})
test('category, grade and location are Template context; refinements never override them', async () => {
  await mount({ ...defaults, grade: '9' }); expect(host.querySelector('[aria-label="Allocation grade"]')).toBeNull()
  expect(host.querySelector('[aria-label="Geographic applicability"]')).toBeNull(); expect(host.querySelector('[aria-label="Find content city"]')).toBeNull()
  await click('Random matching exercise'); await select('Exercise mechanic', 'single-choice')
  expect(creatorContentApi.approved).toHaveBeenLastCalledWith({ category: 'Mathematics', grade: '9', classification: 'personal', type: 'single-choice' }, undefined)
  expect(current.libraryAllocations?.personal).toEqual({ mode: 'random', filters: { type: 'single-choice' } })
})
test('missing city mapping conservatively offers Universal and exact Country; no guessed geographic IDs', async () => {
  vi.mocked(geographyApi.cities).mockRejectedValueOnce(new Error('offline'))
  const location = { id: 'locality', name: 'Test city', countryCode: 'RO', countryDisplayName: 'Romania', administrativeContext: '', latitude: 1, longitude: 2 }
  await mount({ ...defaults, classification: 'local', location })
  expect(creatorContentApi.approved).toHaveBeenLastCalledWith({ category: 'Mathematics', countryCode: 'RO', classification: 'personal' }, undefined)
  expect(host.textContent).toContain('City mapping unavailable'); expect(host.textContent).not.toContain('Starter'); expect(current.libraryAllocations).toBeUndefined()
})
test('catalog lookup accepts only explicit locality binding and follows pagination', async () => {
  const location = { id: 'locality', name: 'Test city', countryCode: 'RO', countryDisplayName: 'Romania', administrativeContext: '', latitude: 1, longitude: 2 }
  const wrong = { localityId: 'another', countryCode: 'RO', geographicId: '111', admin1Code: '13', regionStatus: 'resolved' }
  const exact = { ...wrong, localityId: location.id, geographicId: '222' }
  vi.mocked(geographyApi.cities).mockResolvedValueOnce({ cities: [wrong], nextAfter: 'cursor' } as any).mockResolvedValueOnce({ cities: [exact], nextAfter: null } as any)
  await mount({ ...defaults, classification: 'local', location })
  expect(geographyApi.cities).toHaveBeenLastCalledWith('RO', 'Test city', undefined, 'cursor')
  expect(creatorContentApi.approved).toHaveBeenLastCalledWith({ category: 'Mathematics', countryCode: 'RO', geographicId: '222', classification: 'personal' }, undefined)
})
test('wrong-locality or wrong-country catalog metadata cannot broaden the Template scope', async () => {
  const location = { id: 'locality', name: 'City', countryCode: 'RO', countryDisplayName: 'Romania', administrativeContext: '', latitude: 1, longitude: 2 }
  await mount({ ...defaults, classification: 'local', location, geography: { localityId: 'another', countryCode: 'FR', geographicId: 'wrong', admin1Code: 'CJ', regionStatus: 'resolved' } })
  expect(creatorContentApi.approved).toHaveBeenLastCalledWith({ category: 'Mathematics', countryCode: 'RO', classification: 'personal' }, undefined)
})
test('incorrect Content/Revision pair from detail fails before altering the checkpoint', async () => {
  vi.mocked(creatorContentApi.approvedRevision).mockResolvedValueOnce({ ...approved, revisionId: 'wrong' })
  await mount(); await click('Choose specific exercise'); const before = structuredClone(current); await click('Select Exact approved pairs')
  expect(current).toEqual(before); expect(host.querySelector('[role="alert"]')?.textContent).toContain('revision is unavailable'); expect(host.querySelector('[aria-label="Mobile challenge canvas"]')).toBeNull()
})
test('no Template classification or academic category fails closed instead of browsing across categories', async () => {
  await mount({}); expect(creatorContentApi.approved).not.toHaveBeenCalled(); expect(host.textContent).toContain('requires a Universal or Local Template')
})
