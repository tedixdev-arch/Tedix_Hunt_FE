import { act, useState } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { ChallengeAllocation } from '../src/features/creator/content/ChallengeAllocation'
import { allocationValidation, discoveryContext, eligibleApproved, reconcileAllocationCheckpoint, selectAllocation, type ExercisePoolDefaults } from '../src/features/creator/content/templateAllocation'
import { confirmAllocatedTemplate, persistCreatorTemplate, creatorTemplateError } from '../src/features/creator/templatePersistence'
import { applyExerciseDrafts, hydrateExerciseDrafts } from '../src/features/creator/exercises/templateExercises'
import { PersonalChallengeAuthoring } from '../src/features/creator/exercises/PersonalChallengeAuthoring'
import { TeamChallengeAuthoring } from '../src/features/creator/exercises/TeamChallengeAuthoring'
import { teamExample } from '../src/features/creator/exercises/teamExamples'
import { authorPrototype, toPersistence } from '../src/features/creator/exercises/persistenceAdapter'
import { prototypes } from '../src/features/creator/exercises/catalog'
import type { AuthoringDraft } from '../src/features/creator/exercises/experimentDrafts'
import type { CheckpointGameplay } from '../src/features/creator/checkpointGameplay'
import type { CreatorTemplate, CreatorTemplateContent } from '../src/services/api/creatorTemplates'
import type { ApprovedDetail } from '../src/services/api/creatorContent'
import { ApiError } from '../src/services/api/client'
const api = vi.hoisted(() => ({ approved: vi.fn(), approvedRevision: vi.fn() }))
const geo = vi.hoisted(() => ({ cities: vi.fn() }))
vi.mock('../src/services/api/creatorContent', () => ({ creatorContentApi: api }))
vi.mock('../src/services/api/geography', () => ({ geographyApi: geo }))
const exercise = toPersistence(authorPrototype(prototypes.find(e => e.type === 'single-choice')!))
const approved: ApprovedDetail = { contentId: '11111111-1111-4111-8111-111111111111', revisionId: '22222222-2222-4222-8222-222222222222', version: 2, status: 'approved', classification: 'personal', type: 'single-choice', title: 'Approved question', category: 'Mathematics', curriculum: { grade: '9' }, geography: { scope: 'universal' }, exercise }
const defaults: ExercisePoolDefaults = { classification: 'universal', category: 'Mathematics', grade: '9' }
const specific = { mode: 'specific' as const, contentId: approved.contentId, revisionId: approved.revisionId }
const content = (checkpoints: CheckpointGameplay[]): CreatorTemplateContent => ({ key: 'allocation', version: 1, displayName: 'Allocation', theme: 'City', mission: { name: 'Find' }, configuration: { category: 'Mathematics', grade: '9' }, scoring: {}, checkpoints })
const frozen = (mode: 'random' | 'specific' = 'specific'): CheckpointGameplay => ({ checkpoint: 1, libraryAllocations: { personal: { ...specific, mode, version: 2, classification: 'personal', type: 'single-choice' } }, customExercises: { personal: { ...exercise, id: '33333333-3333-4333-8333-333333333333', owner: { templateKey: 'allocation', version: 1 } } } })
let root: Root, container: HTMLDivElement, current: CheckpointGameplay
beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true); vi.resetAllMocks(); vi.spyOn(window, 'confirm').mockReturnValue(true)
  api.approved.mockResolvedValue({ items: [approved], nextAfter: null }); api.approvedRevision.mockResolvedValue(approved); geo.cities.mockResolvedValue({ cities: [], nextAfter: null })
  container = document.createElement('div'); document.body.append(container); root = createRoot(container)
})
afterEach(() => { act(() => root.unmount()); container.remove(); vi.restoreAllMocks(); vi.unstubAllGlobals() })
async function mount(start: CheckpointGameplay = {}, pool = defaults, usedPersonalIds: string[] = []) {
  function Harness() { const [cp, setCp] = useState(start), [preview, setPreview] = useState<ApprovedDetail>(); current = cp; return <ChallengeAllocation value={cp} onChange={setCp} defaults={pool} usedPersonalIds={usedPersonalIds} preview={preview} onPreview={setPreview} onSelect={() => true} /> }
  await act(async () => root.render(<Harness />))
}
async function click(text: string) { const node = [...container.querySelectorAll('button,label')].find(e => e.textContent === text || e.getAttribute('aria-label') === text) as HTMLElement; expect(node, text).toBeDefined(); await act(async () => node.click()) }
async function change(label: string, value: string) { const node = container.querySelector(`[aria-label="${label}"]`) as HTMLSelectElement; expect(node).not.toBeNull(); await act(async () => { node.value = value; node.dispatchEvent(new Event('change', { bubbles: true })) }) }

test('Specific discovers approved content, fetches exact detail, submits only exact IDs and previews immediately', async () => {
  await mount(); expect(current.libraryAllocations).toBeUndefined(); expect(api.approved).toHaveBeenCalledWith({ classification: 'personal', category: 'Mathematics', grade: '9' }, undefined)
  await click('Choose specific exercise'); await click('Select Approved question')
  expect(api.approvedRevision).toHaveBeenCalledWith(approved.contentId, approved.revisionId)
  expect(current.libraryAllocations?.personal).toEqual(specific); expect(current.customExercises).toBeUndefined(); expect(container.querySelector('[aria-label="Mobile challenge canvas"]')).not.toBeNull()
  expect(container.textContent).toContain('Save Template to allocate'); expect(container.textContent).not.toContain(approved.contentId)
})
test('Random configures supported filters without previewing or resolving an exercise', async () => {
  await mount(); await click('Random matching exercise'); await change('Exercise mechanic', 'single-choice')
  expect(current.libraryAllocations?.personal).toEqual({ mode: 'random', filters: { type: 'single-choice' } }); expect(current.customExercises).toBeUndefined()
  expect(container.textContent).toContain('Random pool configured'); expect(container.querySelector('[aria-label="Mobile challenge canvas"]')).toBeNull(); expect(api.approvedRevision).not.toHaveBeenCalled()
})
test('mixed Template can narrow Random to a specific or unspecified grade', async () => {
  await mount({}, { ...defaults, grade: 'mixed' }); await click('Random matching exercise'); await change('Allocation grade', '10')
  expect(api.approved).toHaveBeenLastCalledWith({ category: 'Mathematics', classification: 'personal', grade: '10' }, undefined)
  await change('Allocation grade', 'unspecified'); expect(current.libraryAllocations?.personal).toEqual({ mode: 'random', filters: { grade: 'unspecified' } })
})
test('saved Random restores its frozen preview and only explicit reroll removes IDs and payload', async () => {
  const start = frozen('random'); await mount(start)
  expect(current).toEqual(start); expect(container.textContent).toContain('Exercise allocated'); expect(api.approvedRevision).not.toHaveBeenCalled()
  await click('Choose another Random exercise'); expect(current.libraryAllocations?.personal).toEqual({ mode: 'random' }); expect(current.customExercises).toBeUndefined(); expect(start.customExercises?.personal?.id).toBeTruthy()
})
test('cancelled reroll preserves complete pin and frozen payload', async () => {
  vi.mocked(window.confirm).mockReturnValue(false); const start = frozen('random'); await mount(start); await click('Choose another Random exercise'); expect(current).toEqual(start)
})
test('Personal duplicates are disabled by Content ID, independent of revision', async () => {
  await mount({}, defaults, [approved.contentId]); await click('Choose specific exercise'); const select = container.querySelector('button[aria-label="Select Approved question"]') as HTMLButtonElement
  expect(select.disabled).toBe(true); expect(container.textContent).toContain('Already used at another checkpoint'); expect(api.approvedRevision).not.toHaveBeenCalled()
  const first = frozen(); expect(allocationValidation(content([first, { role: 'terminal', libraryAllocations: { personal: { ...specific, revisionId: 'different' } } }]))).toContain('already used')
})
test('failed exact detail preserves previous selection and retry remains available', async () => {
  await mount(frozen()); api.approvedRevision.mockRejectedValueOnce(new Error('network')); await click('Select Approved question'); expect(current).toEqual(frozen()); expect(container.querySelector('[role="alert"]')?.textContent).toContain('revision is unavailable')
  await click('Select Approved question'); expect(current.libraryAllocations?.personal).toEqual(specific)
})
test('late exact detail cannot replace a newer Random choice', async () => {
  let finish!: (value: ApprovedDetail) => void; api.approvedRevision.mockImplementation(() => new Promise(resolve => { finish = resolve }))
  await mount(); await click('Choose specific exercise'); await click('Select Approved question'); await click('Random matching exercise'); await act(async () => finish(approved)); expect(current.libraryAllocations?.personal).toEqual({ mode: 'random' })
})
test('pagination is sent to discovery and filters never become pagination/search allocation fields', async () => {
  api.approved.mockResolvedValueOnce({ items: [approved], nextAfter: 'opaque' }).mockResolvedValueOnce({ items: [{ ...approved, contentId: 'other' }], nextAfter: null })
  await mount(); await click('Load More'); expect(api.approved.mock.calls[1][1]).toBe('opaque'); expect(container.textContent).toContain('2 eligible approved'); expect(current.libraryAllocations).toBeUndefined()
})
test('empty Random pool is honest, contains no starter and keeps configuration', async () => {
  api.approved.mockResolvedValue({ items: [], nextAfter: null }); await mount(); await click('Random matching exercise'); expect(container.textContent).toContain('No eligible approved exercises'); expect(container.textContent).not.toContain('Starter'); expect(current.libraryAllocations?.personal).toEqual({ mode: 'random' })
})
test('Universal, exact Mixed category and specific grade eligibility fail closed', () => {
  expect(eligibleApproved(approved, 'personal', defaults)).toBe(true)
  expect(eligibleApproved({ ...approved, geography: { scope: 'country', countryCode: 'RO' } }, 'personal', defaults)).toBe(false)
  expect(eligibleApproved({ ...approved, category: 'Mixed' }, 'personal', defaults)).toBe(false)
  expect(eligibleApproved({ ...approved, curriculum: {} }, 'personal', defaults)).toBe(false)
  expect(eligibleApproved({ ...approved, status: 'draft' } as unknown as ApprovedDetail, 'personal', defaults)).toBe(false)
})
test('Local eligibility uses locality ID mapping, never labels or a temporary browser filter', async () => {
  const local: ExercisePoolDefaults = { ...defaults, classification: 'local', location: { id: 'locality', countryCode: 'RO', countryDisplayName: 'Romania', name: 'Test city', administrativeContext: '', latitude: 46, longitude: 23 }, geography: { localityId: 'locality', countryCode: 'RO', geographicId: '990001', admin1Code: '13', regionStatus: 'resolved' } }
  expect(discoveryContext(local)).toEqual({ category: 'Mathematics', grade: '9', countryCode: 'RO', geographicId: '990001' })
  const scoped = { ...approved, geography: { scope: 'city' as const, countryCode: 'RO', geographicId: '990001' } }
  expect(eligibleApproved(scoped, 'personal', local)).toBe(true)
  expect(eligibleApproved(scoped, 'personal', { ...local, geography: { ...local.geography!, localityId: 'another' } })).toBe(false)
  expect(eligibleApproved({ ...approved, geography: { scope: 'region', countryCode: 'RO', admin1Code: '13' } }, 'personal', { ...local, geography: { ...local.geography!, regionStatus: 'unspecified' } })).toBe(false)
  await mount({}, local); expect(api.approved).toHaveBeenCalledWith({ ...discoveryContext(local), classification: 'personal' }, undefined); expect(container.querySelector('[aria-label="Geographic applicability"]')).toBeNull()
})
test.each(['personal', 'team'] as const)('FinishPoint %s uses existing unnumbered terminal slot and preserves unrelated checkpoint data', slot => {
  const cp: CheckpointGameplay = { role: 'terminal', customExercises: { [slot]: exercise }, title: 'Finish', route: { preserved: true }, libraryAllocations: { [slot]: specific } }
  const changed = selectAllocation(cp, slot, { mode: 'random' }); expect(changed.role).toBe('terminal'); expect(changed.checkpoint).toBeUndefined(); expect(changed.title).toBe('Finish'); expect(changed.route).toEqual(cp.route); expect(changed.customExercises).toBeUndefined()
})
test('Library payload is never hydrated as Create Your Own; custom applies explicitly remove provenance', () => {
  const cp = frozen(); expect(hydrateExerciseDrafts(content([cp]))).toEqual({})
  const selected = applyExerciseDrafts([cp], { 'kind:0': { source: 'saved', assignment: 'predefined' } }); expect(selected.checkpoints[0]).toEqual(cp)
  const custom = authorPrototype(prototypes[0]); const changed = applyExerciseDrafts([cp], { 'kind:0': { source: 'custom', assignment: 'custom', custom } }); expect(changed.errors).toEqual([]); expect(changed.checkpoints[0].libraryAllocations).toBeUndefined(); expect(changed.checkpoints[0].customExercises?.personal?.type).toBe('tap-pair'); expect(cp.libraryAllocations).toBeDefined()
})
test.each(['personal', 'team'] as const)('%s switching tabs preserves unapplied custom drafts and requires confirmation before replacing a custom assignment', async slot => {
  let draftNow!: AuthoringDraft
  function Harness() {
    const [cp, setCp] = useState<CheckpointGameplay>({}), [draft, setDraft] = useState<AuthoringDraft>({ source: 'custom', assignment: 'custom', custom: authorPrototype(slot === 'team' ? teamExample('scrambled-word') : prototypes[0]) }); draftNow = draft
    const props = { value: cp, onChange: setCp, draft, onDraftChange: setDraft, context: { mode: 'modern' as const, poolDefaults: defaults } }
    return slot === 'personal' ? <PersonalChallengeAuthoring {...props} /> : <TeamChallengeAuthoring {...props} legacy={null} />
  }
  await act(async () => root.render(<Harness />)); const before = structuredClone(draftNow.custom); await click('Predefined'); vi.mocked(window.confirm).mockReturnValue(false); await click('Random matching exercise'); expect(draftNow.assignment).toBe('custom'); expect(draftNow.custom).toEqual(before); await click('Create Your Own'); expect(draftNow.custom).toEqual(before)
})
test('backend confirmation is required, frozen exercise restores and an unrelated save preserves the complete Random pin', async () => {
  const pending = content([{ checkpoint: 1, libraryAllocations: { personal: { mode: 'random', filters: { type: 'single-choice' } } } }])
  const saved: CreatorTemplate = { key: 'allocation', category: 'universal', version: 1, status: 'draft', content: content([frozen('random')]) }
  const api = { create: vi.fn().mockResolvedValue(saved), createVersion: vi.fn().mockImplementation(async (_key, c) => ({ ...saved, version: c.version, content: { ...c, checkpoints: (c.checkpoints as CheckpointGameplay[]).map(cp => ({ ...cp, customExercises: { personal: { ...cp.customExercises!.personal!, owner: { templateKey: 'allocation', version: c.version } } } })) } })) }
  const result = await persistCreatorTemplate(api, pending, null, 'universal'); expect(result).toEqual(saved)
  const edited = { ...saved.content, displayName: 'Unrelated edit' }; await persistCreatorTemplate(api, edited, saved)
  expect(api.createVersion.mock.calls[0][1].checkpoints).toEqual(saved.content.checkpoints)
  api.create.mockResolvedValue({ ...saved, content: pending }); await expect(persistCreatorTemplate(api, pending, null, 'universal')).rejects.toThrow('could not be confirmed')
})
test('failed saves preserve exact selection for retry; backend collision and shortage errors are actionable', async () => {
  const request = content([{ checkpoint: 1, libraryAllocations: { personal: specific } }]), before = structuredClone(request)
  const api = { create: vi.fn().mockRejectedValue(new ApiError('raw', 400, 'bad_request', { error: 'insufficient_distinct_exercises' })), createVersion: vi.fn() }
  await expect(persistCreatorTemplate(api, request, null, 'universal')).rejects.toBeInstanceOf(ApiError); expect(request).toEqual(before)
  for (const error of ['insufficient_distinct_exercises', 'duplicate_personal_exercise', 'empty_random_pool', 'allocation_category_mismatch', 'allocation_grade_mismatch', 'allocation_geography_mismatch', 'incorrect_revision_identity', 'unapproved_revision', 'unsupported_content_revision']) {
    const message = creatorTemplateError(new ApiError('raw JSON must stay hidden', 400, 'bad_request', { error }), 'save'); expect(message).not.toContain('raw JSON'); expect(message).toContain('kept')
  }
  const saved: CreatorTemplate = { key: 'allocation', version: 1, status: 'draft', content: content([frozen()]) }; api.create.mockResolvedValue(saved)
  expect(await persistCreatorTemplate(api, request, null, 'universal')).toEqual(saved); expect(request).toEqual(before)
})
test('save in flight rebases unchanged selections while retaining newer checkpoint edits', () => {
  const sent: CheckpointGameplay = { checkpoint: 1, libraryAllocations: { personal: { mode: 'random' } } }, saved = frozen('random')
  expect(reconcileAllocationCheckpoint({ ...sent, notes: 'New text' }, sent, saved)).toEqual({ ...saved, notes: 'New text' })
  const newer = selectAllocation(sent, 'personal', specific); expect(reconcileAllocationCheckpoint(newer, sent, saved)).toEqual(newer)
})
test('legacy content stays unchanged and unclassified templates cannot opt into allocations', async () => {
  const legacy = content([{ checkpoint: 1, kind: 'hidden-rule', old: 'preserved' }]); expect(applyExerciseDrafts(legacy.checkpoints, {}).checkpoints).toEqual(legacy.checkpoints); expect(allocationValidation(legacy)).toBe('')
  await mount({}, { category: 'Mathematics', classification: null }); expect(api.approved).not.toHaveBeenCalled(); expect(container.textContent).toContain('requires a Universal or Local Template')
})

test('allocated saves confirm the owner GET projection and reject a changed or missing frozen artifact', async () => {
  const sent = content([{ checkpoint: 1, libraryAllocations: { personal: { mode: 'random' } } }])
  const response: CreatorTemplate = { key: 'allocation', category: 'universal', version: 1, status: 'draft', content: content([frozen('random')]) }
  const owner = { ...response, publishedVersion: null, submittedVersion: null }
  const api = { get: vi.fn().mockResolvedValue(owner) }
  expect(await confirmAllocatedTemplate(api, sent, response)).toEqual(owner)
  api.get.mockResolvedValue({ ...owner, version: 2 }); await expect(confirmAllocatedTemplate(api, sent, response)).rejects.toThrow('changed')
  api.get.mockRejectedValue(new Error('network')); await expect(confirmAllocatedTemplate(api, sent, response)).rejects.toThrow('network')
  expect(await confirmAllocatedTemplate(api, content([{ checkpoint: 1 }]), response)).toBe(response)
})
test('switching a restored allocation to Specific retains its mechanic without adding source metadata to the request', async () => {
  let checkpoint!: CheckpointGameplay
  function Harness() {
    const [cp, setCp] = useState(frozen('random')), [draft, setDraft] = useState<AuthoringDraft>({ source: 'saved', assignment: 'predefined' }); checkpoint = cp
    return <PersonalChallengeAuthoring value={cp} onChange={setCp} draft={draft} onDraftChange={setDraft} context={{ mode: 'modern', poolDefaults: defaults }} />
  }
  await act(async () => root.render(<Harness />)); await click('Choose specific exercise')
  expect(api.approved).toHaveBeenLastCalledWith({ category: 'Mathematics', classification: 'personal', grade: '9', type: 'single-choice' }, undefined)
  expect((container.querySelector('[aria-label="Personal Challenge"]') as HTMLSelectElement).value).toBe('single-choice')
  await click('Select Approved question'); expect(checkpoint.libraryAllocations?.personal).toEqual(specific)
})

test.each(['personal', 'team'] as const)('returning from Create Your Own preserves the saved %s mechanic and frozen assignment', async slot => {
  const type = slot === 'personal' ? 'single-choice' : 'shared-final-key'
  const cp: CheckpointGameplay = slot === 'personal' ? frozen() : { role: 'terminal', libraryAllocations: { team: { ...specific, version: 2, classification: 'team', type } }, customExercises: { team: toPersistence(authorPrototype(teamExample(type))) } }
  let checkpoint!: CheckpointGameplay
  function Harness() {
    const [value, onChange] = useState(cp), [draft, onDraftChange] = useState<AuthoringDraft>({ source: 'saved', assignment: 'predefined' }); checkpoint = value
    const props = { value, onChange, draft, onDraftChange, context: { mode: 'modern' as const, poolDefaults: defaults } }
    return slot === 'personal' ? <PersonalChallengeAuthoring {...props} /> : <TeamChallengeAuthoring {...props} legacy={null} />
  }
  await act(async () => root.render(<Harness />)); await click('Create Your Own'); await click('Predefined')
  expect((container.querySelector(`[aria-label="${slot === 'personal' ? 'Personal' : 'Team'} Challenge"]`) as HTMLSelectElement).value).toBe(type)
  expect(checkpoint).toEqual(cp); expect(container.querySelector('[aria-label="Playable exercise preview"]')).not.toBeNull()
})
