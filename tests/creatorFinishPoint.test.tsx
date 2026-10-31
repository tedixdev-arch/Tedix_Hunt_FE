import { exerciseFixtures } from './fixtures/customExercises'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, afterEach, test, expect, vi } from 'vitest'
import { CreatorTemplateEditorPage } from '../src/pages/CreatorStudio'
import type { CreatorTemplate } from '../src/services/api/creatorTemplates'

vi.mock('../src/pages/OrganizerFlow', () => ({ OrganizerHeader: () => null }))

const mocks = vi.hoisted(() => ({ get: vi.fn(), create: vi.fn(), createVersion: vi.fn(), submit: vi.fn() }))
vi.mock('../src/services/api/creatorTemplates', () => ({ creatorTemplatesApi: mocks }))
vi.mock('../src/components/TedixMap', () => ({ TedixMap: ({ onMapClick }: any) => onMapClick ? <button type="button" onClick={() => onMapClick(47, 24)}>Place map point</button> : <div aria-label="Read-only route map" /> }))
vi.mock('../src/features/creator/RouteEditor', () => ({ RouteEditor: (props: any) => <div data-position-count={props.drafts.length}><button type="button" onClick={() => {
  props.onVerifiedChange(new Set([1])); props.onSafetyChange(new Set(['a', 'b', 'c', 'd', 'e', 'f']))
  props.onConfigurationChange({ normalCheckpointCount: 1, checkpointPositions: props.drafts })
}}>Verify saved route</button></div> }))

const finishPoint = { name: ' City Wall ', latitude: 46.778123, longitude: 23.641234, radiusMeters: 17 }
const checkpoint = { checkpointNumber: 1, name: 'Museum', latitude: 46.77, longitude: 23.59, radiusMeters: 30 }
let record: CreatorTemplate
let container: HTMLDivElement
let root: Root
beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  Element.prototype.scrollIntoView = vi.fn()
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', '') }
  HTMLDialogElement.prototype.close = function () { this.removeAttribute('open') }
  vi.spyOn(window, 'confirm').mockReturnValue(true)
  Object.values(mocks).forEach(mock => mock.mockReset())
  record = { key: 'trail', version: 3, status: 'draft', content: {
    key: 'trail', version: 3, displayName: 'Trail', theme: 'City', mission: 'Go',
    configuration: { normalCheckpointCount: 1, checkpointPositions: [checkpoint], finishPoint, customSetting: 'preserved', summary: '', category: '', ageRange: '', durationMinutes: 45, language: '', participants: '', teamSize: '', format: '', environment: '', equipment: '', difficulty: '', briefing: '' },
    scoring: { model: 'platform', selections: { final: 1 }, extra: 'preserved' }, checkpoints: [{ checkpointNumber: 1, name: 'Museum', personal: 0, team: 0, navigation: 0, extra: 'preserved' }],
  } }
  mocks.get.mockImplementation(async () => structuredClone(record))
  mocks.createVersion.mockImplementation(async (key, content) => ({ ...structuredClone(record), key, content, version: content.version, status: 'draft' }))
  container = document.createElement('div'); document.body.append(container); root = createRoot(container)
})
afterEach(() => { act(() => root.unmount()); container.remove(); vi.restoreAllMocks(); vi.unstubAllGlobals() })
async function render() { await act(async () => root.render(<MemoryRouter initialEntries={['/create?template=trail']}><CreatorTemplateEditorPage /></MemoryRouter>)) }
async function click(text: string) {
  if (text === '2.') { await currentStep(0); return }
  const oldSteps: Record<string, number> = { '3.': 1, '4.': 2, '5.': 3, '6.': 1, '9.': 6 }
  if (text === '6.') await currentStep(0)
  const button = /^\d\.$/.test(text) ? container.querySelectorAll('nav')[1].querySelectorAll('button')[oldSteps[text] ?? 0] : Array.from(container.querySelectorAll('button')).findLast(item => item.textContent?.includes(text))!
  expect(button, text).toBeDefined()
  if (text === '6.') {
    const toggle = [...container.querySelectorAll('button')].find(b => b.textContent === 'FinishPoint location details')!
    if (toggle.getAttribute('aria-expanded') === 'false') await act(async () => toggle.click())
    await act(async () => button.click())
    await click('Predefined'); await act(async () => (container.querySelector('[aria-label="Checkpoint selector"] button:last-child') as HTMLButtonElement).click()) }
  else await act(async () => button.click())
}
function change(selector: string, value: string) {
  act(() => {
    const element = container.querySelector(selector)!
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(element, value)
    element.dispatchEvent(new Event('input', { bubbles: true }))
  })
}
async function verify() {
  await click('2.')
  await click('Verify saved route')
  await click('Save & continue')
}
async function save() {
  await click('9.')
  await click('Complete Hunt Features')
}
test('Feature 6 hydration and saving preserve settings, checkpoints and immutable versions', async () => {
  const before = structuredClone(record)
  await render(); await verify(); await click('6.')
  await currentStep(0)
  expect(container.querySelector('section[aria-label="FinishPoint placement"]')).not.toBeNull()
  expect((container.querySelector('input[maxlength="100"]') as HTMLInputElement).value).toBe(finishPoint.name)
  expect((container.querySelector('input[type="number"][min="5"]') as HTMLInputElement).value).toBe('17')
  await click('Place map point'); await save()
  expect(mocks.createVersion).toHaveBeenCalledTimes(1)
  const content = mocks.createVersion.mock.calls[0][1]
  expect(content.version).toBe(4)
  expect(content.configuration.finishPoint).toEqual({ ...finishPoint, latitude: 47, longitude: 24 })
  expect(content.configuration.checkpointPositions).toEqual([checkpoint])
  expect(content.configuration.normalCheckpointCount).toBe(1)
  expect(content.configuration.customSetting).toBe('preserved')
  expect(content.checkpoints).toEqual([{ ...record.content.checkpoints[0] as object, checkpoint: 1, kind: 'hidden-rule', teamKind: 'scrambled-word' }])
  expect(content.scoring).toEqual(record.content.scoring)
  expect(record).toEqual(before)
  await click('Complete Hunt Features')
  expect(mocks.createVersion).toHaveBeenCalledTimes(1)
})
test('invalid FinishPoint blocks persistence and geographic validation', async () => {
  await render(); await verify(); await click('6.')
  await currentStep(0)
  change('input[type="number"][min="5"]', '4')
  await save()
  expect(mocks.createVersion).not.toHaveBeenCalled()
  expect(container.textContent).toContain('integer radius from 5 to 500')
  const validate = Array.from(container.querySelectorAll('button')).find(button => button.textContent === 'Run template validation')!
  expect(validate.disabled).toBe(true)
})
test('missing geographic FinishPoint remains an incomplete draft without defaulted geography', async () => {
  delete record.content.configuration.finishPoint
  await render(); await verify(); await save()
  expect(mocks.createVersion).toHaveBeenCalledTimes(1)
  expect(mocks.createVersion.mock.calls[0][1].configuration).not.toHaveProperty('finishPoint')
  expect(container.textContent).toContain('Place one FinishPoint in Checkpoint Positions')
  await click('6.')
  await currentStep(0)
  expect((container.querySelector('input[type="number"][min="5"]') as HTMLInputElement).value).toBe('15')
  expect(mocks.submit).not.toHaveBeenCalled()
})
test('legacy non-geographic drafts load and save without introducing geographic defaults', async () => {
  record.content.configuration = { ...record.content.configuration } as any
  delete (record.content.configuration as any).normalCheckpointCount
  delete (record.content.configuration as any).checkpointPositions
  delete record.content.configuration.finishPoint
  await render(); await save()
  expect(container.textContent).not.toContain('Place one FinishPoint in Checkpoint Positions')
  expect(mocks.createVersion).not.toHaveBeenCalled()
  expect(mocks.get).toHaveBeenCalledWith('trail')
})

async function selectGameplay(label: string, value: string) {
  if (label === 'Team Challenge') await click('4.')
  if (label === 'Personal Challenge') await click('3.')
  if (label === 'Navigation') await click('5.')
  const labelElement = Array.from(container.querySelectorAll('label')).find(item => item.firstChild?.textContent === label)!
  const select = labelElement.querySelector('select')!
  expect(select, label).toBeDefined()
  await act(async () => {
    select.value = value
    select.dispatchEvent(new Event('change', { bubbles: true }))
  })
  if (label === 'Personal Challenge') await click('Use this challenge')
}

test('FinishPoint uses shared gameplay choices and saves one unnumbered terminal with exact scoring', async () => {
  const before = structuredClone(record)
  await render(); await verify(); await click('6.')
  expect(container.textContent).not.toContain('Multi-Stage Boss Challenge')
  await selectGameplay('Personal Challenge', 'hidden-rule')
  await selectGameplay('Team Challenge', 'hypothesis')
  await save()
  const saved = mocks.createVersion.mock.calls[0][1]
  expect(saved.checkpoints).toHaveLength(2)
  expect(saved.checkpoints[0].checkpoint).toBe(1)
  expect(saved.checkpoints[1]).toEqual({ role: 'terminal', kind: 'hidden-rule', teamKind: 'hypothesis' })
  expect(saved.checkpoints[1]).not.toHaveProperty('checkpoint')
  expect(saved.checkpoints[1]).not.toHaveProperty('checkpointNumber')
  expect(saved.configuration).toEqual(before.content.configuration)
  expect(saved.scoring).toEqual(before.content.scoring)
  expect(record).toEqual(before)
})

test('saved terminal gameplay reloads, edits preserve custom data, and exact saved version submits', async () => {
  record.content.checkpoints = [
    { role: 'terminal', kind: 'radial', teamKind: 'clue-synthesis', navigationMode: 'none', custom: { preserved: true } },
    { checkpoint: 1, kind: 'square', teamKind: 'hypothesis', navigationMode: 'compass', custom: ['normal'] },
  ]
  record.content.scoring = { startingScore: 500, finishPointPuzzle: 250, firstAttemptAccuracyEligibleCheckpoints: [1], extra: 'kept' }
  const original = structuredClone(record)
  await render(); await verify(); await click('6.')
  const selects = Array.from(container.querySelectorAll('section[aria-label="Checkpoint gameplay"] select')) as HTMLSelectElement[]
  expect(selects.map(select => select.value)).toEqual(['radial'])
  expect(container.querySelector('section[aria-label="FinishPoint scoring"]')?.textContent).toContain('250')
  await selectGameplay('Personal Challenge', 'square'); await save()
  const next = mocks.createVersion.mock.calls[0][1]
  expect(next.checkpoints[0]).toEqual({ ...original.content.checkpoints[0] as object, kind: 'square' })
  expect(next.checkpoints[1]).toEqual(original.content.checkpoints[1])
  expect(next.scoring).toEqual(original.content.scoring)
  await click('Preview full journey'); await click('Exit preview'); await click('Run template validation')
  mocks.submit.mockImplementation(async () => ({ ...record, version: 4, content: next, status: 'submitted' }))
  await click('Submit version to Admin')
  expect(mocks.submit).toHaveBeenCalledWith('trail', 4)
  expect(record).toEqual(original)
})

test('older geographic drafts can explicitly configure terminal without requiring either challenge', async () => {
  await render(); await verify(); await click('6.')
  await click('Configure FinishPoint gameplay'); await save()
  const next = mocks.createVersion.mock.calls[0][1]
  expect(next.checkpoints[1]).toEqual({ role: 'terminal' })
  expect(next.configuration.normalCheckpointCount).toBe(1)
  await click('Preview full journey'); await click('Exit preview'); await click('Run template validation')
  expect(container.textContent).toContain('Validation passed')
})

test('normal checkpoint and FinishPoint expose identical supported activity options', async () => {
  await render(); await click('3.')
  const normal = Array.from(container.querySelectorAll('section[aria-label="Checkpoint gameplay"] option')).map(option => (option as HTMLOptionElement).value)
  await click('6.')
  const personal = Array.from(container.querySelectorAll('section[aria-label="Checkpoint gameplay"] select'))[0]
  expect(Array.from(personal.querySelectorAll('option')).map(option => option.value)).toEqual(normal)
})

test('approved Template content is read-only and never normalized or saved', async () => {
  record.status = 'approved'
  const original = structuredClone(record)
  await render()
  expect(container.textContent).toContain('read-only')
  expect(container.querySelector('section[aria-label="Checkpoint gameplay"]')).toBeNull()
  expect(mocks.createVersion).not.toHaveBeenCalled()
  expect(record).toEqual(original)
})

test('editing a normal checkpoint writes the same flat fields as FinishPoint', async () => {
  ;(record.content.checkpoints[0] as any).personal = 5
  await render(); await verify(); await click('3.')
  await selectGameplay('Personal Challenge', 'identify-signal')
  await click('6.'); await click('Configure FinishPoint gameplay'); await save()
  const next = mocks.createVersion.mock.calls[0][1]
  expect(next.checkpoints[0].kind).toBe('identify-signal')
  expect(next.checkpoints[0].checkpoint).toBe(1)
  expect(next.checkpoints[1]).toEqual({ role: 'terminal' })
  expect(next.scoring).toEqual(record.content.scoring)
})

for (const [featureNumber, gameplayLabel, fieldName, approvedType, challenge] of [
  ['5.', 'Navigation', 'navigationMode', 'signal-strength', false],
] as const) {
  test(`${gameplayLabel} retains prototype controls without changing saved gameplay`, async () => {
    record.content.checkpoints = [
      { checkpoint: 1, kind: 'square', teamKind: 'hypothesis', navigationMode: 'compass', custom: { preserved: true } },
      { role: 'terminal', kind: 'build-key', teamKind: 'assemble-machine', navigationMode: 'none', custom: ['finish'] },
    ]
    const original = structuredClone(record)
    await render(); await verify(); await click(featureNumber)
    expect(container.textContent).toContain('Approved component')
    expect(container.textContent).toContain('Create new')
    expect(container.textContent).toContain('Creator note')
    expect(container.querySelector('[aria-label="Approved Participant preview"]')).not.toBeNull()
    await selectGameplay(gameplayLabel, approvedType)
    const approvedPreview = container.querySelector('[aria-label="Approved Participant preview"]')!.textContent
    await click('Create new')
    const authoring = container.querySelector('[aria-label="Prototype component authoring"]')!
    expect(authoring.textContent).toContain('Prototype-only · not yet persistable')
    expect(authoring.textContent).toContain('not saved or submitted')
    expect(authoring.textContent).toContain('Component name')
    expect(authoring.textContent).toContain('Participant instructions')
    for (const label of ['Challenge format', 'Correct answer', 'Difficulty', 'Options or pairs', 'Hint', 'Solution']) {
      expect(authoring.textContent?.includes(label)).toBe(challenge)
    }
    const input = authoring.querySelector('input')!
    await act(async () => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, 'Unsupported custom challenge')
      input.dispatchEvent(new Event('input', { bubbles: true }))
      const textarea = authoring.querySelector('textarea')!
      Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!.call(textarea, 'Prototype instructions')
      textarea.dispatchEvent(new Event('input', { bubbles: true }))
    })
    expect(container.querySelector('[aria-label="Prototype Participant preview"]')?.textContent).toContain('Unsupported custom challenge')
    // Saving from the prototype tab still persists only the explicitly selected supported choice.
    await save()
    const saved = mocks.createVersion.mock.calls[0][1]
    expect(saved.checkpoints).toEqual([
      { ...original.content.checkpoints[0] as object, [fieldName]: approvedType }, original.content.checkpoints[1],
    ])
    expect(saved.configuration).toEqual(original.content.configuration)
    expect(saved.scoring).toEqual(original.content.scoring)
    expect(JSON.stringify(saved)).not.toContain('Unsupported custom challenge')
    expect(JSON.stringify(saved)).not.toContain('Prototype instructions')
    expect(record).toEqual(original)
    await click(featureNumber); await click('Approved component')
    expect(container.querySelector('[aria-label="Approved Participant preview"]')?.textContent).toBe(approvedPreview)
    await save()
    expect(mocks.createVersion).toHaveBeenCalledTimes(1)
  })
}

test('walking inspection entry is in Review and opens separately from checkpoint placement', async () => {
  const before = structuredClone(record)
  await render()
  const review = container.querySelector('#creator-review')!
  expect(review.querySelector('[aria-label="Read-only route map"]')).toBeNull()
  expect([...review.querySelectorAll('button')].some(button => button.textContent === 'Inspect walking route')).toBe(true)
  await click('2.')
  expect(container.textContent).toContain('Verify saved route')
  await click('Inspect walking route')
  expect(review.querySelectorAll('[aria-label="Read-only route map"]')).toHaveLength(1)
  expect(container.textContent).toContain('Verify saved route')
  await click('Close inspection')
  expect(review.querySelector('[aria-label="Read-only route map"]')).toBeNull()
  await click('6.')
  await currentStep(0)
  expect(container.textContent).toContain('Place map point')
  expect(record).toEqual(before)
  expect(mocks.createVersion).not.toHaveBeenCalled()
})

test('Review preview preserves unsaved setup, geography, gameplay and prototype form state without persistence', async () => {
  const original = structuredClone(record)
  await render()
  change('input', 'Unsaved Trail')
  await click('6.')
  await currentStep(0)
  change('input[maxlength="100"]', 'Unsaved Finish')
  await click('6.')
  await selectGameplay('Personal Challenge', 'hidden-rule')
  await click('3.'); await click('Create Your Own')
  const authoring = container.querySelector('[aria-label$="content editor"]')!
  const input = authoring.querySelector('textarea')!
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!.call(input, 'Temporary idea')
    input.dispatchEvent(new Event('input', { bubbles: true }))
  })
  const validate = [...container.querySelectorAll('button')].find(button => button.textContent === 'Run template validation')!
  expect(validate.disabled).toBe(true)
  await click('Preview full journey')
  const dialog = container.querySelector('[role="dialog"]')!
  expect(dialog.textContent).toContain('Unsaved Trail')
  expect(container.querySelector('div[hidden]')).not.toBeNull()
  expect(container.querySelector('[aria-label$="content editor"]')).toBe(authoring)
  await click('Start preview'); await click('Simulate arrival')
  await click('Inspect Personal Challenge'); await click('Simulate Personal Challenge completion')
  await click('Inspect Team Challenge'); await click('Simulate Team Challenge completion')
  await click('Continue to next checkpoint')
  expect(dialog.textContent).toContain('Unsaved Finish')
  await click('Simulate arrival'); await click('Inspect Personal Challenge')
  expect(dialog.querySelector('pre')!.textContent).toContain('hidden-rule')
  await click('Exit preview')
  expect(container.querySelector('[role="dialog"]')).toBeNull()
  expect(container.querySelector('div[hidden]')).toBeNull()
  expect(input.value).toBe('Temporary idea')
  expect((container.querySelector('input') as HTMLInputElement).value).toBe('Unsaved Trail')
  expect(document.activeElement?.textContent).toContain('Journey previewed')
  expect(validate.disabled).toBe(true)
  await click('6.')
  await currentStep(0)
  expect((container.querySelector('input[maxlength="100"]') as HTMLInputElement).value).toBe('Unsaved Finish')
  await click('6.'); await click('Predefined')
  expect((container.querySelectorAll('section[aria-label="Checkpoint gameplay"] select')[0] as HTMLSelectElement).value).toBe('hidden-rule')
  await click('Journey previewed')
  expect(container.querySelector('[role="dialog"]')!.textContent).toContain('Start preview')
  expect(container.querySelector('[role="dialog"]')!.textContent).not.toContain('Simulated arrival')
  await click('Exit preview')
  expect(mocks.get).toHaveBeenCalledTimes(1)
  expect(mocks.create).not.toHaveBeenCalled()
  expect(mocks.createVersion).not.toHaveBeenCalled()
  expect(mocks.submit).not.toHaveBeenCalled()
  expect(record).toEqual(original)
})

test('incomplete draft preview leaves Creator validation and saving boundaries intact', async () => {
  delete record.content.configuration.finishPoint
  const original = structuredClone(record)
  await render(); await click('Preview full journey'); await click('Start preview')
  expect(container.querySelector('[role="dialog"]')).not.toBeNull()
  await click('Exit preview')
  expect(container.textContent).toContain('Place one FinishPoint in Checkpoint Positions')
  expect([...container.querySelectorAll('button')].find(button => button.textContent === 'Run template validation')!.disabled).toBe(true)
  expect([...container.querySelectorAll('button')].find(button => button.textContent === 'Submit version to Admin')!.disabled).toBe(true)
  expect(mocks.createVersion).not.toHaveBeenCalled()
  expect(record).toEqual(original)
})

function sixCheckpointRecord() {
  record.content.configuration.normalCheckpointCount = 6
  record.content.configuration.checkpointPositions = Array.from({ length: 6 }, (_, index) => ({ ...checkpoint, checkpointNumber: index + 1, name: `Location ${index + 1}` }))
  record.content.checkpoints = [...Array.from({ length: 6 }, (_, index) => ({ checkpoint: index + 1, role: 'normal', kind: 'square', navigationMode: 'compass' })), { role: 'terminal', kind: 'radial', teamKind: 'clue-synthesis', navigationMode: 'none', savedNote: 'keep terminal' }]
}
async function currentStep(index: number) {
  await act(async () => (container.querySelectorAll('nav')[1].querySelectorAll('button')[index] as HTMLButtonElement).click())
}
async function checkpointButton(number: number) {
  await act(async () => (container.querySelector(`[aria-label="Checkpoint selector"] button:nth-child(${number})`) as HTMLButtonElement).click())
}
test('saved six-plus-terminal shows seven total with numbered flag; unchanged save preserves route, challenges and notes', async () => {
  sixCheckpointRecord()
  const original = structuredClone(record.content)
  await render()
  expect((container.querySelector('[aria-label="Total checkpoint count"]') as HTMLInputElement).value).toBe('7')
  expect(container.textContent).toContain('01 → 02 → 03 → 04 → 05 → 06 → 07 🚩')
  expect(container.textContent).toContain('Checkpoint 7 is the FinishPoint.')
  expect(container.querySelectorAll('nav')[1].querySelectorAll('button')).toHaveLength(7)
  expect(container.textContent).not.toContain('Final Checkpoint')
  await click('Save draft')
  expect(mocks.createVersion).not.toHaveBeenCalled() // Exact unchanged content reuses saved version.
  expect(record.content).toEqual(original)
})
test.each([2, 21])('total count %s serializes to existing regular count with exactly one unnumbered terminal', async total => {
  sixCheckpointRecord(); await render()
  change('[aria-label="Total checkpoint count"]', String(total))
  await click('Save draft')
  const saved = mocks.createVersion.mock.calls[0][1]
  expect(saved.configuration.normalCheckpointCount).toBe(total - 1)
  expect(saved.configuration.checkpointPositions).toHaveLength(Math.min(6, total - 1)) // New locations remain unpositioned until explicitly placed.
  expect(saved.checkpoints.filter((entry: any) => entry.role !== 'terminal')).toHaveLength(total - 1)
  expect(saved.checkpoints.filter((entry: any) => entry.role === 'terminal')).toEqual([record.content.checkpoints[6]])
  expect((container.querySelector(`[aria-label="${total === 2 ? 'Remove' : 'Add'} checkpoint"]`) as HTMLButtonElement).disabled).toBe(true)
})
test.each(['personal', 'team'])('%s offers all seven checkpoints and edits terminal via shared component without changing the other challenge', async feature => {
  sixCheckpointRecord(); const before = structuredClone(record.content.checkpoints[6])
  await render(); await currentStep(feature === 'personal' ? 1 : 2)
  expect(container.querySelectorAll('[aria-label="Checkpoint selector"] button')).toHaveLength(7)
  const finish = container.querySelector('[aria-label="Checkpoint 7, FinishPoint"]') as HTMLButtonElement
  expect(finish.textContent).toContain('FinishPoint 🚩'); expect(finish.disabled).toBe(false)
  await checkpointButton(7)
  await selectGameplay(feature === 'personal' ? 'Personal Challenge' : 'Team Challenge', feature === 'personal' ? 'square' : 'hypothesis')
  await click('Save draft')
  const saved = mocks.createVersion.mock.calls[0][1]
  expect(saved.checkpoints[6]).toEqual({ ...before as object, [feature === 'personal' ? 'kind' : 'teamKind']: feature === 'personal' ? 'square' : 'hypothesis' })
  expect(saved.checkpoints.slice(0,6)).toEqual(record.content.checkpoints.slice(0,6))
  mocks.get.mockResolvedValue({ ...record, version: saved.version, content: saved })
  await act(async () => root.unmount()); root = createRoot(container)
  await render(); await currentStep(feature === 'personal' ? 1 : 2); await checkpointButton(7)
  expect((container.querySelector('[aria-label="Checkpoint gameplay"] select') as HTMLSelectElement).value).toBe(feature === 'personal' ? 'square' : 'hypothesis')
})
test('navigation displays a disabled numbered FinishPoint and permits checkpoint six departure to it', async () => {
  sixCheckpointRecord(); await render(); await currentStep(1); await checkpointButton(7); await currentStep(3)
  const buttons = [...container.querySelectorAll<HTMLButtonElement>('[aria-label="Checkpoint selector"] button')]
  expect(buttons.map(button => button.disabled)).toEqual([false,false,false,false,false,false,true])
  expect(buttons[6].textContent).toBe('FinishPoint 🚩')
  expect(container.textContent).toContain('The FinishPoint has no next checkpoint.')
  await checkpointButton(6); await selectGameplay('Navigation', 'signal-strength'); await click('Save draft')
  const saved = mocks.createVersion.mock.calls[0][1]
  expect(saved.checkpoints[5].navigationMode).toBe('signal-strength')
  expect(saved.checkpoints[6]).toEqual(record.content.checkpoints[6])
})
test.each(['universal', 'local'] as const)('%s creation uses seven confirmation steps; opening alone never completes a feature', async category => {
  await act(async () => root.render(<MemoryRouter initialEntries={[`/create?category=${category}`]}><CreatorTemplateEditorPage /></MemoryRouter>))
  expect(container.textContent).toContain('0 of 7 complete')
  await currentStep(3); expect(container.textContent).toContain('0 of 7 complete')
  await click('Continue'); expect(container.textContent).toContain('1 of 7 complete')
  expect(container.textContent).toContain('Feature 5 of 7')
  await click('Previous'); expect(container.textContent).toContain('Feature 4 of 7')
  expect(mocks.create).not.toHaveBeenCalled(); expect(mocks.submit).not.toHaveBeenCalled()
})

test('geographic controls remain locked with the rest of the editor during an immutable save', async () => {
  sixCheckpointRecord(); await render(); await click('6.')
  await currentStep(0)
  change('input[maxlength="100"]', 'Pending Finish')
  let resolve!: (value: CreatorTemplate) => void
  mocks.createVersion.mockImplementationOnce(() => new Promise(done => { resolve = done }))
  await click('Save draft')
  expect(container.querySelector('input[maxlength="100"]')!.matches(':disabled')).toBe(true)
  expect([...container.querySelectorAll('#checkpoint-positions button')].every(button => button.matches(':disabled'))).toBe(true)
  const saved = mocks.createVersion.mock.calls[0][1]
  await act(async () => resolve({ ...record, version: saved.version, content: saved }))
  expect(container.querySelector('input[maxlength="100"]')!.matches(':disabled')).toBe(false)
})

test.each(['local', undefined] as const)('Feature 1 contains one positioning editor for geographic category %s; Continue requires no route verification', async category => {
  sixCheckpointRecord(); record.category = category
  await render()
  const article = container.querySelector('[aria-label="Hunt Features"]')!.nextElementSibling!
  expect(article.querySelector('[aria-label="Total checkpoint count"]')).not.toBeNull()
  expect(article.querySelectorAll('#checkpoint-positions')).toHaveLength(1)
  expect(container.querySelectorAll('#checkpoint-positions')).toHaveLength(1)
  change('[aria-label="Total checkpoint count"]', '8')
  expect(article.querySelector('[data-position-count="7"]')).not.toBeNull()
  await click('FinishPoint location details')
  expect(article.querySelector('[aria-label="FinishPoint placement"]')).not.toBeNull()
  await click(category ? 'Continue' : 'Save & continue')
  expect(container.textContent).toContain('Feature 2 of 7')
  expect(container.querySelector('#checkpoint-positions')).toBeNull()
  expect(mocks.createVersion).not.toHaveBeenCalled()
  expect(mocks.submit).not.toHaveBeenCalled()
  expect([...container.querySelectorAll<HTMLButtonElement>('button')].find(button => button.textContent === 'Submit version to Admin')!.disabled).toBe(true)
  await currentStep(0)
  expect(container.querySelector('[data-position-count="7"]')).not.toBeNull()
})
test('Universal Feature 1 has count and preview without geography or a FinishPoint location editor', async () => {
  sixCheckpointRecord(); record.category = 'universal'; await render()
  expect(container.querySelector('[aria-label="Total checkpoint count"]')).not.toBeNull()
  expect(container.textContent).toContain('Checkpoint 7 is the FinishPoint.')
  expect(container.querySelector('#checkpoint-positions')).toBeNull()
  expect(container.querySelector('[data-position-count]')).toBeNull()
  expect(container.textContent).not.toContain('FinishPoint location details')
  await click('Continue'); expect(container.textContent).toContain('Feature 2 of 7')
})

for (const [featureNumber, label, field] of [['3.', 'Personal Challenge', 'kind'], ['4.', 'Team Challenge', 'teamKind']] as const) {
  test(`${label}: all seven stops remain independent, including FinishPoint and feature switching`, async () => {
    record.content.configuration.normalCheckpointCount = 6
    record.content.configuration.checkpointPositions = Array.from({ length: 6 }, (_, i) => ({ ...checkpoint, checkpointNumber: i + 1 }))
    record.content.checkpoints = [...Array.from({ length: 6 }, (_, i) => ({ checkpoint: i + 1, role: 'normal', kind: 'hidden-rule', teamKind: 'scrambled-word', marker: i })), { role: 'terminal', kind: 'shared-final-key', teamKind: 'shared-final-key', marker: 'terminal' }]
    const before = structuredClone(record)
    await render(); await click(featureNumber)
    const choose = async (number: number) => {
      const selector = container.querySelector('[aria-label="Checkpoint selector"]')!
      await act(async () => (selector.querySelectorAll('button')[number] as HTMLButtonElement).click())
    }
    expect(container.querySelector('[aria-label="Checkpoint selector"]')?.querySelectorAll('button').length).toBe(7)
    for (let i = 0; i < 7; i++) {
      await choose(i); await click('Create Your Own')
      const title = container.querySelector('[aria-label$="content editor"] textarea') as HTMLTextAreaElement
      await act(async () => {
        Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!.call(title, `Draft ${i + 1}`)
        title.dispatchEvent(new Event('input', { bubbles: true }))
      })
    }
    for (let i = 0; i < 7; i++) {
      await choose(i)
      expect((container.querySelector('[aria-label$="content editor"] textarea') as HTMLTextAreaElement).value).toBe(`Draft ${i + 1}`)
    }
    await click(featureNumber === '3.' ? '4.' : '3.'); await click(featureNumber)
    for (let i = 0; i < 7; i++) { await choose(i); await click('Predefined') }
    await choose(6); await selectGameplay(label, field === 'kind' ? 'hidden-rule' : 'clue-synthesis')
    expect((container.querySelector('section[aria-label="Checkpoint gameplay"] select') as HTMLSelectElement).value).toBe(field === 'kind' ? 'hidden-rule' : 'clue-synthesis')
    expect(record).toEqual(before); expect(mocks.createVersion).not.toHaveBeenCalled()
  })
}


async function experimentTitle(value: string) {
  const title = container.querySelector('[aria-label$="content editor"] textarea') as HTMLTextAreaElement
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!.call(title, value)
    title.dispatchEvent(new Event('input', { bubbles: true }))
  })
}
test('Use predefined assignment removes only the selected Personal checkpoint and preserves Team and FinishPoint drafts', async () => {
  sixCheckpointRecord(); await render(); await currentStep(1); await click('Create Your Own'); await experimentTitle('Personal one')
  await checkpointButton(7); await click('Create Your Own'); await experimentTitle('Personal FinishPoint')
  await currentStep(2); await checkpointButton(1); await click('Create Your Own'); await experimentTitle('Team one')
  await currentStep(1); await checkpointButton(1); await click('Discard changes')
  expect(container.querySelector('[aria-label$="content editor"]')).toBeNull()
  await checkpointButton(7)
  expect((container.querySelector('[aria-label$="content editor"] textarea') as HTMLTextAreaElement).value).toBe('Personal FinishPoint')
  await currentStep(2); await checkpointButton(1)
  expect((container.querySelector('[aria-label$="content editor"] textarea') as HTMLTextAreaElement).value).toBe('Team one')
  expect(mocks.createVersion).not.toHaveBeenCalled(); expect(mocks.submit).not.toHaveBeenCalled()
})
test.each(['personal', 'team'] as const)('%s custom content saves with backend identity, reloads and submits the exact version', async classification => {
  sixCheckpointRecord(); record.category = 'universal'
  const wire = structuredClone(exerciseFixtures.find(e => e.classification === classification)!)
  ;(record.content.checkpoints[0] as any).customExercises = { [classification]: wire }
  await render(); await currentStep(classification === 'personal' ? 1 : 2)
  await experimentTitle('Persisted custom title')
  const submit = () => [...container.querySelectorAll<HTMLButtonElement>('button')].find(b => b.textContent === 'Submit version to Admin')!
  expect(submit().disabled).toBe(true)
  mocks.createVersion.mockImplementationOnce(async (key, content) => {
    const result = structuredClone(content)
    const e = result.checkpoints[0].customExercises[classification]
    expect(e.title).toBe('Persisted custom title'); expect(e.id).toBeUndefined(); expect(e.owner).toBeUndefined()
    e.id = crypto.randomUUID(); e.owner = { templateKey: key, version: content.version }
    record = { ...record, version: content.version, content: result }
    return structuredClone(record)
  })
  await click('Save draft'); expect(mocks.createVersion).toHaveBeenCalledTimes(1)
  expect(container.textContent).toContain('Template version saved by the backend')
  expect(submit().disabled).toBe(false)
  const saved = structuredClone(record)
  await act(async () => root.unmount()); root = createRoot(container)
  await render(); await currentStep(classification === 'personal' ? 1 : 2)
  expect((container.querySelector('[aria-label$="content editor"] textarea') as HTMLTextAreaElement).value).toBe('Persisted custom title')
  mocks.submit.mockResolvedValue({ ...record, status: 'submitted' })
  await click('Submit version to Admin'); expect(mocks.submit).toHaveBeenCalledWith('trail', saved.version)
  expect(record).toEqual(saved)
})
test('backend rejection preserves custom content and preview-only variants; explicit discard permits predefined saving', async () => {
  sixCheckpointRecord(); record.category = 'universal'
  await render(); await currentStep(1); await click('Create Your Own'); await experimentTitle('Retained after rejection'); await click('Apply to Hunt')
  mocks.createVersion.mockRejectedValueOnce(new Error('Connection lost'))
  await click('Save draft')
  expect((container.querySelector('[aria-label$="content editor"] textarea') as HTMLTextAreaElement).value).toBe('Retained after rejection')
  expect(container.textContent).toContain('could not be confirmed')
  expect(mocks.submit).not.toHaveBeenCalled()
})
test('FinishPoint custom exercise saves in the unnumbered terminal slot without changing normal assignments', async () => {
  sixCheckpointRecord(); record.category = 'universal'
  const original = structuredClone(record.content.checkpoints.slice(0, 6))
  ;(record.content.checkpoints[6] as any).customExercises = { team: structuredClone(exerciseFixtures[21]) }
  await render(); await currentStep(2); await checkpointButton(7)
  await experimentTitle('FinishPoint custom key')
  await click('Save draft')
  const payload = mocks.createVersion.mock.calls[0][1]
  expect(payload.checkpoints.slice(0, 6)).toEqual(original)
  expect(payload.checkpoints[6].customExercises.team.title).toBe('FinishPoint custom key')
  expect(payload.checkpoints[6].checkpoint).toBeUndefined(); expect(payload.checkpoints[6].checkpointNumber).toBeUndefined()
})
test('reducing checkpoint count requires explicit removal and never reassigns retained custom drafts', async () => {
  sixCheckpointRecord(); record.category = 'universal'
  ;(record.content.checkpoints[5] as any).customExercises = { personal: structuredClone(exerciseFixtures[1]) }
  await render()
  change('[aria-label="Total checkpoint count"]', '3')
  expect(window.confirm).toHaveBeenCalled()
  await click('Save draft')
  expect(mocks.createVersion).not.toHaveBeenCalled()
  expect(container.textContent).toContain('checkpoint was removed')
  expect(container.textContent).toContain('Checkpoint 6')
})
test('choosing a predefined assignment retains the custom draft but explicitly removes it from the saved slot', async () => {
  sixCheckpointRecord(); record.category = 'universal'
  ;(record.content.checkpoints[0] as any).customExercises = { personal: structuredClone(exerciseFixtures[1]) }
  await render(); await currentStep(1); await experimentTitle('Retained custom draft')
  await click('Predefined'); await selectGameplay('Personal Challenge', 'radial')
  await click('Save draft')
  expect(mocks.createVersion.mock.calls[0][1].checkpoints[0].customExercises).toBeUndefined()
  await click('Create Your Own')
  expect((container.querySelector('[aria-label$="content editor"] textarea') as HTMLTextAreaElement).value).toBe('Retained custom draft')
})

// Selection semantics apply identically to both classifications and the terminal slot.
for (const classification of ['personal', 'team'] as const) for (const terminal of [false, true]) {
  test(`${classification} ${terminal ? 'FinishPoint' : 'checkpoint'}: viewed tab, confirmed replacement, retained variants and exact submission stay independent`, async () => {
    sixCheckpointRecord(); record.category = 'universal'; record.status = 'approved'
    const wire = (kind: 'personal' | 'team', suffix: string) => ({ ...structuredClone(exerciseFixtures.find(e => e.classification === kind)!), id: crypto.randomUUID(), owner: { templateKey: record.key, version: record.version }, title: suffix })
    for (const [i, cp] of (record.content.checkpoints as any[]).entries()) cp.customExercises = { personal: wire('personal', `Personal ${i}`), team: wire('team', `Team ${i}`) }
    const previousApproved = structuredClone(record), approvedArtifact = record.content
    const index = terminal ? 6 : 0, feature = classification === 'personal' ? 1 : 2
    mocks.createVersion.mockImplementation(async (key, content) => {
      const saved = structuredClone(content)
      for (const cp of saved.checkpoints) for (const exercise of Object.values(cp.customExercises ?? {}) as any[]) { exercise.id = crypto.randomUUID(); exercise.owner = { templateKey: key, version: content.version } }
      record = { ...record, status: 'draft', version: saved.version, content: saved }; return structuredClone(record)
    })
    await render(); await currentStep(feature); if (terminal) await checkpointButton(7)
    await experimentTitle('Retained authored variant')
    await click('Predefined')
    expect(container.querySelector('[aria-label="Selected exercise assignment"]')?.textContent).toContain('Custom')
    await click('Create Your Own')
    expect((container.querySelector('[aria-label$="content editor"] textarea') as HTMLTextAreaElement).value).toBe('Retained authored variant')
    await click('Predefined')
    vi.mocked(window.confirm).mockReturnValueOnce(false)
    await click(classification === 'personal' ? 'Use this challenge' : 'Use predefined assignment')
    expect(container.querySelector('[aria-label="Selected exercise assignment"]')?.textContent).toContain('Custom')
    await click(classification === 'personal' ? 'Use this challenge' : 'Use predefined assignment')
    expect(container.querySelector('[aria-label="Selected exercise assignment"]')?.textContent).toMatch(/Predefined|Current challenge/)
    await click('Create Your Own') // Viewing retained content cannot silently reactivate it.
    expect((container.querySelector('[aria-label$="content editor"] textarea') as HTMLTextAreaElement).value).toBe('Retained authored variant')
    expect(container.querySelector('[aria-label="Selected exercise assignment"]')?.textContent).toMatch(/Predefined|Current challenge/)
    const chooseType = async (type: string) => act(async () => { const select = container.querySelector<HTMLSelectElement>('[aria-label$="Challenge authoring"] select')!; select.value = type; select.dispatchEvent(new Event('change', { bubbles: true })) })
    if (classification === 'team') await chooseType('distributed-information')
    expect(container.querySelector('[aria-label="Selected exercise assignment"]')?.textContent).toMatch(/Predefined|Current challenge/)
    if (classification === 'team') await chooseType('scrambled-word')
    expect((container.querySelector('[aria-label$="content editor"] textarea') as HTMLTextAreaElement).value).toBe('Retained authored variant')
    await click('Save draft')
    const payload = mocks.createVersion.mock.calls[0][1]
    expect(payload.checkpoints[index].customExercises[classification]).toBeUndefined()
    const other = classification === 'personal' ? 'team' : 'personal'
    expect(payload.checkpoints[index].customExercises[other]).toEqual((previousApproved.content.checkpoints[index] as any).customExercises[other])
    expect(payload.checkpoints.filter((_: any, i: number) => i !== index)).toEqual(previousApproved.content.checkpoints.filter((_, i) => i !== index))
    expect(approvedArtifact).toEqual(previousApproved.content)
    expect(previousApproved.version).toBe(3); expect((previousApproved.content.checkpoints[index] as any).customExercises[classification].title).not.toBe('Retained authored variant')
    // Save acknowledged only the active selection, keeping the unrelated session variant.
    expect((container.querySelector('[aria-label$="content editor"] textarea') as HTMLTextAreaElement).value).toBe('Retained authored variant')
    mocks.submit.mockImplementation(async (key, version) => { expect(key).toBe(record.key); expect(version).toBe(record.version); return { ...record, status: 'submitted' } })
    await click('Submit version to Admin'); expect(mocks.submit).toHaveBeenCalledWith(record.key, 4)
    expect((record.content.checkpoints[index] as any).customExercises[classification]).toBeUndefined()
    await act(async () => root.unmount()); root = createRoot(container)
    await render(); await currentStep(feature); if (terminal) await checkpointButton(7)
    expect(container.querySelector('[aria-label$="content editor"]')).toBeNull() // Reload follows the persisted selection.
    await click('Create Your Own')
    if (classification === 'team') await act(async () => { const select = container.querySelector<HTMLSelectElement>('[aria-label="Team Challenge authoring"] select')!; select.value = 'distributed-information'; select.dispatchEvent(new Event('change', { bubbles: true })) })
    await experimentTitle('New custom after predefined'); if (classification === 'personal') await click('Apply to Hunt')
    if (classification === 'team') await click('Use this custom exercise'); await click('Save draft')
    expect((record.content.checkpoints[index] as any).customExercises[classification].title).toBe('New custom after predefined')
    await act(async () => root.unmount()); root = createRoot(container)
    await render(); await currentStep(feature); if (terminal) await checkpointButton(7)
    expect((container.querySelector('[aria-label$="content editor"] textarea') as HTMLTextAreaElement).value).toBe('New custom after predefined')
  })
}

test('discarding an unsaved persisted-custom variant requires confirmation and restores the saved custom selection', async () => {
  sixCheckpointRecord(); record.category = 'universal'
  ;(record.content.checkpoints[0] as any).customExercises = { personal: structuredClone(exerciseFixtures[1]) }
  await render(); await currentStep(1); await experimentTitle('Do not discard silently')
  const discard = () => container.querySelector<HTMLButtonElement>('[aria-label="Discard unsaved draft: Personal Challenge · Checkpoint 1"]')!
  vi.mocked(window.confirm).mockReturnValueOnce(false)
  await act(async () => discard().click())
  expect((container.querySelector('[aria-label$="content editor"] textarea') as HTMLTextAreaElement).value).toBe('Do not discard silently')
  await act(async () => discard().click())
  expect((container.querySelector('[aria-label$="content editor"] textarea') as HTMLTextAreaElement).value).toBe(exerciseFixtures[1].title)
  expect(container.querySelector('[aria-label="Selected exercise assignment"]')?.textContent).toContain('Custom')
})
