import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, afterEach, test, expect, vi } from 'vitest'
import { CreatorTemplateEditorPage } from '../src/pages/CreatorStudio'
import type { CreatorTemplate } from '../src/services/api/creatorTemplates'

vi.mock('../src/pages/OrganizerFlow', () => ({ OrganizerHeader: () => null }))

const mocks = vi.hoisted(() => ({ get: vi.fn(), create: vi.fn(), createVersion: vi.fn(), submit: vi.fn() }))
vi.mock('../src/services/api/creatorTemplates', () => ({ creatorTemplatesApi: mocks }))
vi.mock('../src/components/TedixMap', () => ({ TedixMap: ({ onMapClick }: any) => <button type="button" onClick={() => onMapClick(47, 24)}>Place map point</button> }))
vi.mock('../src/features/creator/RouteEditor', () => ({ RouteEditor: (props: any) => <button type="button" onClick={() => {
  props.onVerifiedChange(new Set([1])); props.onSafetyChange(new Set(['a', 'b', 'c', 'd', 'e', 'f']))
  props.onConfigurationChange({ normalCheckpointCount: 1, checkpointPositions: props.drafts })
}}>Verify saved route</button> }))

const finishPoint = { name: ' City Wall ', latitude: 46.778123, longitude: 23.641234, radiusMeters: 17 }
const checkpoint = { checkpointNumber: 1, name: 'Museum', latitude: 46.77, longitude: 23.59, radiusMeters: 30 }
let record: CreatorTemplate
let container: HTMLDivElement
let root: Root
beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  Element.prototype.scrollIntoView = vi.fn()
  Object.values(mocks).forEach(mock => mock.mockReset())
  record = { key: 'trail', version: 3, status: 'draft', content: {
    key: 'trail', version: 3, displayName: 'Trail', theme: 'City', mission: 'Go',
    configuration: { normalCheckpointCount: 1, checkpointPositions: [checkpoint], finishPoint, customSetting: 'preserved', summary: '', category: '', ageRange: '', durationMinutes: 45, language: '', participants: '', teamSize: '', format: '', environment: '', equipment: '', difficulty: '', briefing: '' },
    scoring: { model: 'platform', selections: { final: 1 }, extra: 'preserved' }, checkpoints: [{ checkpointNumber: 1, name: 'Museum', personal: 0, team: 0, navigation: 0, extra: 'preserved' }],
  } }
  mocks.get.mockImplementation(async () => structuredClone(record))
  mocks.createVersion.mockImplementation(async (key, content) => ({ key, content, version: content.version, status: 'draft' }))
  container = document.createElement('div'); document.body.append(container); root = createRoot(container)
})
afterEach(() => { act(() => root.unmount()); container.remove(); vi.restoreAllMocks(); vi.unstubAllGlobals() })
async function render() { await act(async () => root.render(<MemoryRouter initialEntries={['/create?template=trail']}><CreatorTemplateEditorPage /></MemoryRouter>)) }
async function click(text: string) {
  const button = /^\d\.$/.test(text) ? container.querySelectorAll('nav')[1].querySelectorAll('button')[Number(text.slice(0, -1)) - 1] : Array.from(container.querySelectorAll('button')).findLast(item => item.textContent?.includes(text))!
  expect(button, text).toBeDefined()
  await act(async () => button.click())
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
  expect(container.textContent).toContain('Place one FinishPoint in Feature 6')
  await click('6.')
  expect((container.querySelector('input[type="number"][min="5"]') as HTMLInputElement).value).toBe('5')
  expect(mocks.submit).not.toHaveBeenCalled()
})
test('legacy non-geographic drafts load and save without introducing geographic defaults', async () => {
  record.content.configuration = { ...record.content.configuration } as any
  delete (record.content.configuration as any).normalCheckpointCount
  delete (record.content.configuration as any).checkpointPositions
  delete record.content.configuration.finishPoint
  await render(); await save()
  expect(container.textContent).not.toContain('Place one FinishPoint in Feature 6')
  expect(mocks.createVersion).not.toHaveBeenCalled()
  expect(mocks.get).toHaveBeenCalledWith('trail')
})

async function selectGameplay(label: string, value: string) {
  const labelElement = Array.from(container.querySelectorAll('label')).find(item => item.firstChild?.textContent === label)!
  const select = labelElement.querySelector('select')!
  expect(select, label).toBeDefined()
  await act(async () => {
    select.value = value
    select.dispatchEvent(new Event('change', { bubbles: true }))
  })
}

test('FinishPoint uses shared gameplay choices and saves one unnumbered terminal with exact scoring', async () => {
  const before = structuredClone(record)
  await render(); await verify(); await click('6.')
  expect(container.textContent).not.toContain('Multi-Stage Boss Challenge')
  await selectGameplay('Navigation', 'decoded-route')
  await selectGameplay('Personal Challenge', 'square')
  await selectGameplay('Team Challenge', 'hypothesis')
  await save()
  const saved = mocks.createVersion.mock.calls[0][1]
  expect(saved.checkpoints).toHaveLength(2)
  expect(saved.checkpoints[0].checkpoint).toBe(1)
  expect(saved.checkpoints[1]).toEqual({ role: 'terminal', navigationMode: 'decoded-route', kind: 'square', teamKind: 'hypothesis' })
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
  expect(selects.map(select => select.value)).toEqual(['none', 'radial', 'clue-synthesis'])
  expect(container.querySelector('section[aria-label="FinishPoint scoring"]')?.textContent).toContain('250')
  await selectGameplay('Personal Challenge', 'build-key'); await save()
  const next = mocks.createVersion.mock.calls[0][1]
  expect(next.checkpoints[0]).toEqual({ ...original.content.checkpoints[0] as object, kind: 'build-key' })
  expect(next.checkpoints[1]).toEqual(original.content.checkpoints[1])
  expect(next.scoring).toEqual(original.content.scoring)
  await click('Preview full journey'); await click('Run template validation')
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
  await click('Preview full journey'); await click('Run template validation')
  expect(container.textContent).toContain('Validation passed')
})

test('normal checkpoint and FinishPoint expose identical supported activity options', async () => {
  await render(); await click('3.')
  const normal = Array.from(container.querySelectorAll('section[aria-label="Checkpoint gameplay"] option')).map(option => (option as HTMLOptionElement).value)
  await click('6.')
  const personal = Array.from(container.querySelectorAll('section[aria-label="Checkpoint gameplay"] select'))[1]
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
  ['3.', 'Personal Challenge', 'kind', 'radial', true],
  ['4.', 'Team Challenge', 'teamKind', 'clue-synthesis', true],
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

test('prototype authoring alone does not create an immutable version or overwrite custom data', async () => {
  record.content.checkpoints = [{ checkpoint: 1, kind: 'square', custom: { prompt: 'Saved custom prompt' } }, { role: 'terminal', custom: 'saved' }]
  const original = structuredClone(record)
  await render(); await verify(); await click('3.'); await click('Create new')
  const input = container.querySelector('[aria-label="Prototype component authoring"] input')!
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, 'Not persisted')
    input.dispatchEvent(new Event('input', { bubbles: true }))
  })
  await save()
  expect(mocks.createVersion).not.toHaveBeenCalled()
  expect(record).toEqual(original)
})
