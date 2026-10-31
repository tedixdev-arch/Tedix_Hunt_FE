import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter, useNavigate } from 'react-router-dom'
import { beforeEach, afterEach, test, expect, vi } from 'vitest'
import { CreatorTemplateEditorPage } from '../src/pages/CreatorStudio'
import { checkpointExercises } from '../src/data/templateOne'
import { personalCreationContext } from '../src/features/creator/exercises/creationContext'
import { createNormalGameplay, hydrateGameplay } from '../src/features/creator/checkpointGameplay'
import { personalTypes } from '../src/features/creator/exercises/catalog'
import type { CreatorTemplate } from '../src/services/api/creatorTemplates'

const api = vi.hoisted(() => ({ get: vi.fn(), create: vi.fn(), createVersion: vi.fn(), submit: vi.fn() }))
vi.mock('../src/services/api/creatorTemplates', () => ({ creatorTemplatesApi: api }))
vi.mock('../src/pages/OrganizerFlow', () => ({ OrganizerHeader: () => null }))
vi.mock('../src/features/creator/RouteEditor', () => ({ RouteEditor: (props: any) => <output aria-label="Position names">{props.drafts.map((p: any) => p.name).join('|')}</output> }))
vi.mock('../src/components/TedixMap', () => ({ TedixMap: () => null }))
let container: HTMLDivElement, root: Root
beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true); vi.spyOn(window, 'confirm').mockReturnValue(true)
  Element.prototype.scrollIntoView = vi.fn()
  Object.values(api).forEach(mock => mock.mockReset())
  container = document.createElement('div'); document.body.append(container); root = createRoot(container)
})
afterEach(() => { act(() => root.unmount()); container.remove(); vi.restoreAllMocks(); vi.unstubAllGlobals() })
const button = (name: string) => [...container.querySelectorAll<HTMLButtonElement>('button')].find(b => b.textContent === name || b.getAttribute('aria-label') === name)!
async function click(name: string) { await act(async () => button(name).click()) }
async function input(node: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement, value: string) {
  await act(async () => {
    const proto = node instanceof HTMLSelectElement ? HTMLSelectElement.prototype : node instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype
    Object.getOwnPropertyDescriptor(proto, 'value')!.set!.call(node, value); node.dispatchEvent(new Event(node instanceof HTMLSelectElement ? 'change' : 'input', { bubbles: true }))
  })
}
const record = (category: CreatorTemplate['category'], checkpoints: any[]): CreatorTemplate => ({ key: 'chosen-source', version: 2, status: 'draft', category, content: { key: 'chosen-source', version: 2, displayName: 'Signal: Cluj Napoca', theme: 'Mixed', mission: { name: 'Only the selected story', clue: 'Keep this clue' }, configuration: { normalCheckpointCount: 6, checkpointPositions: [] }, scoring: { model: 'platform' }, checkpoints } })
async function feature(name: string) { await act(async () => [...container.querySelectorAll('nav[aria-label="Hunt Features"] button')].find(b => b.textContent?.includes(name))!.dispatchEvent(new MouseEvent('click', { bubbles: true }))) }

for (const category of ['local', 'universal'] as const) test(`new ${category}: complete saved payload starts clean with one modern selector, independent Team and terminal`, async () => {
  const protectedSignal = structuredClone(checkpointExercises)
  api.create.mockImplementation(async (content, savedCategory) => ({ key: content.key, version: 1, status: 'draft', category: savedCategory, content: structuredClone(content) }))
  await act(async () => root.render(<MemoryRouter initialEntries={[`/create?category=${category}`]}><CreatorTemplateEditorPage /></MemoryRouter>))
  const name = [...container.querySelectorAll('label')].find(label => label.firstChild?.textContent === 'Template name')!.querySelector('input')!
  expect(name.value).toBe(''); await input(name, 'My new challenge')
  await click('Save draft'); expect(api.create).toHaveBeenCalledTimes(1)
  const content = api.create.mock.calls[0][0]
  expect(api.create.mock.calls[0][1]).toBe(category)
  expect(content.mission).toEqual({ name: '' }); expect(content.theme).toBe('Mixed'); expect(content.routeResearch).toBeUndefined()
  expect(content.checkpoints).toEqual([...Array.from({ length: 6 }, (_, i) => ({ checkpoint: i + 1 })), { role: 'terminal' }])
  expect(content.configuration.checkpointPositions).toEqual([])
  expect(JSON.stringify(content)).not.toMatch(/hidden-rule|Signal|relay|transmitter/)
  await feature('Personal Challenge')
  const select = container.querySelector<HTMLSelectElement>('[aria-label="Personal Challenge"]')!
  expect([...select.options].map(option => option.value)).toEqual(['', ...personalTypes.map(row => row[0])])
  expect(container.querySelectorAll('[aria-label="Personal Challenge"]')).toHaveLength(1)
  expect(container.textContent).toContain('Checkpoint 1')
  await input(select, 'single-choice'); await click('Create Your Own')
  await input(container.querySelector<HTMLTextAreaElement>('[aria-label="Title"]')!, 'Checkpoint one only'); await click('Apply to Hunt')
  await click('Checkpoint 2'); expect(container.querySelector('[aria-label="Title"]')).toBeNull()
  await click('Checkpoint 1'); expect(container.querySelector<HTMLTextAreaElement>('[aria-label="Title"]')!.value).toBe('Checkpoint one only')
  await click('Checkpoint 7, FinishPoint'); expect(container.textContent).toContain('FinishPoint'); expect(container.querySelector('[aria-label="Title"]')).toBeNull()
  await feature('Team Challenge'); expect(container.querySelector<HTMLSelectElement>('[aria-label="Checkpoint gameplay"] select')!.value).toBe('')
  expect(checkpointExercises).toEqual(protectedSignal)
})

test('Local from a selected Universal hydrates only returned content; source and canonical Signal stay independent', async () => {
  const source = record('universal', [...createNormalGameplay(6, 'modern').map((cp, i) => i === 0 ? { ...cp, kind: 'square' } : cp), { role: 'terminal', story: { message: 'Selected ending' } }])
  const destination = structuredClone(source); destination.key = destination.content.key = 'destination'; destination.category = 'local'
  const before = structuredClone(source), signal = structuredClone(checkpointExercises)
  api.get.mockResolvedValue(destination)
  await act(async () => root.render(<MemoryRouter initialEntries={['/create?template=destination']}><CreatorTemplateEditorPage /></MemoryRouter>))
  await feature('Personal Challenge')
  expect([...container.querySelector<HTMLSelectElement>('[aria-label="Personal Challenge"]')!.options]).toHaveLength(16)
  expect(container.textContent).not.toContain('Restore the Signal')
  await click('Create Your Own'); await input(container.querySelector<HTMLTextAreaElement>('[aria-label="Title"]')!, 'Destination edit')
  expect(source).toEqual(before); expect(checkpointExercises).toEqual(signal)
  expect(hydrateGameplay(destination.content).normal[0].kind).toBe('square'); expect(personalCreationContext(destination)).toEqual({ mode: 'modern' })
})

test('explicit null category retains unclassified compatibility, with only original relevant choices', async () => {
  const legacy = record(null, [{ checkpoint: 1, kind: 'square', prompt: 'Original question', correctAnswers: { answer: '8' }, navigationMode: 'compass' }, { role: 'terminal', kind: 'radial' }])
  const original = structuredClone(legacy)
  api.get.mockResolvedValue(legacy)
  await act(async () => root.render(<MemoryRouter initialEntries={['/create?template=chosen-source']}><CreatorTemplateEditorPage /></MemoryRouter>))
  await feature('Personal Challenge')
  expect([...container.querySelector<HTMLSelectElement>('[aria-label="Personal Challenge"]')!.options].map(o => o.value)).toEqual(['', 'square', 'radial'])
  expect(container.textContent).toContain('Original question')
  expect(legacy).toEqual(original)
  expect(personalCreationContext(record('local', createNormalGameplay(6, 'modern')))).toEqual({ mode: 'modern' }) // Signal name and seven stops are not authority.
  const copiedLegacy = { ...structuredClone(legacy), key: 'explicit-copy' }
  expect(personalCreationContext(copiedLegacy)).toEqual({ mode: 'legacy', kinds: ['square', 'radial'] })
  expect(personalCreationContext(record('local', [{ checkpoint: 1, kind: 'square' }]))).toEqual({ mode: 'modern' }) // Contents cannot override immutable category.
})

test('the unclassified scratch URL starts a clean Local draft too', async () => {
  await act(async () => root.render(<MemoryRouter initialEntries={['/create']}><CreatorTemplateEditorPage /></MemoryRouter>))
  await feature('Personal Challenge')
  expect(container.querySelector<HTMLSelectElement>('[aria-label="Personal Challenge"]')!.options).toHaveLength(16)
  expect(container.textContent).not.toContain('Restore the Signal')
  expect(personalCreationContext(null)).toEqual({ mode: 'modern' })
})

test('route changes cannot reuse Legacy or another creation context state', async () => {
  const legacy = record(null, [{ checkpoint: 1, kind: 'hidden-rule', story: 'Legacy only' }, { role: 'terminal', kind: 'radial' }])
  api.get.mockResolvedValue(legacy)
  function Routes() {
    const navigate = useNavigate()
    return <><button onClick={() => navigate('/create?category=local')}>New Local route</button><button onClick={() => navigate('/create?category=universal')}>New Universal route</button><CreatorTemplateEditorPage /></>
  }
  await act(async () => root.render(<MemoryRouter initialEntries={['/create?template=chosen-source']}><Routes /></MemoryRouter>))
  await feature('Personal Challenge')
  expect(container.querySelector<HTMLSelectElement>('[aria-label="Personal Challenge"]')!.options).toHaveLength(3)
  await click('New Local route'); await feature('Personal Challenge')
  expect(container.querySelector<HTMLSelectElement>('[aria-label="Personal Challenge"]')!.options).toHaveLength(16)
  expect(container.querySelector<HTMLTextAreaElement>('[aria-label="Title"]')).toBeNull()
  await click('Create Your Own'); await input(container.querySelector<HTMLTextAreaElement>('[aria-label="Title"]')!, 'Local draft only')
  await click('New Universal route'); await feature('Personal Challenge')
  expect(container.querySelector<HTMLSelectElement>('[aria-label="Personal Challenge"]')!.options).toHaveLength(16)
  expect(container.querySelector<HTMLTextAreaElement>('[aria-label="Title"]')).toBeNull()
  expect(container.textContent).not.toContain('Local draft only'); expect(container.textContent).not.toContain('Legacy only')
})

for (const category of ['local', 'universal'] as const) test(`${category} stays modern with older identifiers, source-looking keys and lifecycle pins`, async () => {
  const modern = record(category, [{ checkpoint: 1, kind: 'square', prompt: 'Existing assigned question', correctAnswers: { answer: '8' } }, { role: 'terminal', kind: 'radial' }])
  modern.origin = 'creator'; modern.submittedVersion = 1; modern.publishedVersion = 1
  const before = structuredClone(modern)
  api.get.mockResolvedValue(modern)
  await act(async () => root.render(<MemoryRouter initialEntries={['/create?template=chosen-source']}><CreatorTemplateEditorPage /></MemoryRouter>))
  await feature('Personal Challenge')
  const selector = container.querySelector<HTMLSelectElement>('[aria-label="Personal Challenge"]')!
  expect([...selector.options].map(o => o.value)).toEqual(['', ...personalTypes.map(row => row[0])])
  expect(container.textContent).toContain('Existing assigned question')
  expect(personalCreationContext(modern)).toEqual({ mode: 'modern' })
  await input(selector, 'single-choice'); await click('Create Your Own')
  expect(container.querySelector('[aria-label="Mobile challenge canvas"]')).not.toBeNull()
  expect(button('Edit with Preview').getAttribute('aria-pressed')).toBe('true')
  expect(modern).toEqual(before); expect(api.createVersion).not.toHaveBeenCalled()
})

for (const origin of [undefined, 'creator', 'platform', { source: 'legacy' }]) test(`missing category is unresolved even with origin ${JSON.stringify(origin)}`, async () => {
  const ambiguous = record(undefined, [{ checkpoint: 1, kind: 'square', prompt: 'Keep this assignment', correctAnswers: { answer: '8' } }, { role: 'terminal', kind: 'radial' }])
  delete ambiguous.category; ambiguous.origin = origin
  const before = structuredClone(ambiguous)
  expect(personalCreationContext(ambiguous)).toEqual({ mode: 'unresolved', kinds: ['square', 'radial'] })
  api.get.mockResolvedValue(ambiguous)
  await act(async () => root.render(<MemoryRouter initialEntries={['/create?template=chosen-source']}><CreatorTemplateEditorPage /></MemoryRouter>))
  await feature('Personal Challenge')
  expect(container.textContent).toContain('Template type information is unavailable')
  expect(container.textContent).toContain('Keep this assignment')
  expect(container.querySelector('[aria-label="Personal Challenge"]')).toBeNull()
  await click('Edit existing challenges')
  expect([...container.querySelector<HTMLSelectElement>('[aria-label="Personal Challenge"]')!.options].map(o => o.value)).toEqual(['', 'square', 'radial'])
  expect(ambiguous).toEqual(before)
  await act(async () => root.unmount()); root = createRoot(container)
  await act(async () => root.render(<MemoryRouter initialEntries={['/create?template=chosen-source']}><CreatorTemplateEditorPage /></MemoryRouter>))
  await feature('Personal Challenge'); expect(container.textContent).toContain('Template type information is unavailable')
  await click('Use modern challenge editor')
  expect(container.querySelector<HTMLSelectElement>('[aria-label="Personal Challenge"]')!.options).toHaveLength(16)
  expect(ambiguous).toEqual(before); expect(api.createVersion).not.toHaveBeenCalled()
})

test('explicit starter copy with omitted category offers compatibility without inventing persisted provenance', async () => {
  // Actual starter operation/GET shape: origin=creator; database null category is omitted.
  const copy = record(undefined, checkpointExercises.map((cp, i) => { const entry: any = { ...structuredClone(cp), role: i === 6 ? 'terminal' : 'normal' }; if (i === 6) delete entry.checkpoint; return entry }))
  delete copy.category; copy.origin = 'creator'; copy.key = copy.content.key = 'explicit-starter-copy'
  const before = structuredClone(copy)
  api.get.mockResolvedValue(copy)
  await act(async () => root.render(<MemoryRouter initialEntries={['/create?template=explicit-starter-copy']}><CreatorTemplateEditorPage /></MemoryRouter>))
  await feature('Personal Challenge'); await click('Edit existing challenges')
  expect([...container.querySelector<HTMLSelectElement>('[aria-label="Personal Challenge"]')!.options].map(o => o.value)).toEqual(['', ...checkpointExercises.map(cp => cp.kind)])
  api.createVersion.mockImplementation(async (_key, content) => ({ ...copy, content, version: content.version }))
  await click('Save draft')
  expect(api.createVersion.mock.calls[0][1].checkpoints).toEqual(before.content.checkpoints)
  expect(JSON.stringify(api.createVersion.mock.calls[0][1])).not.toContain('contextChoice')
  expect(copy).toEqual(before)
})

test('protected Signal approved record stays read-only with original assignments', async () => {
  const protectedSignal = record(null, structuredClone(checkpointExercises))
  protectedSignal.origin = 'platform'; protectedSignal.status = 'approved'; protectedSignal.key = 'signal-cluj-napoca'
  const before = structuredClone(protectedSignal)
  api.get.mockResolvedValue(protectedSignal)
  await act(async () => root.render(<MemoryRouter initialEntries={['/create?template=signal-cluj-napoca']}><CreatorTemplateEditorPage /></MemoryRouter>))
  expect(container.textContent).toContain('read-only')
  expect(container.querySelector('[aria-label="Personal Challenge"]')).toBeNull()
  expect(api.createVersion).not.toHaveBeenCalled(); expect(protectedSignal).toEqual(before)
})

for (const category of ['local', 'universal'] as const) test(`${category} category survives unchanged save, explicit revision and reload without stripping older assignments`, async () => {
  let modern = record(category, [{ checkpoint: 1, role: 'normal', kind: 'square', marker: 'preserve' }, { role: 'terminal', kind: 'radial' }])
  modern.status = 'approved'; modern.content.configuration.normalCheckpointCount = 1
  if (category === 'local') modern.localApproval = { version: 2, authority: 'approved', independentEvidence: true, localityBound: false }
  const approved = structuredClone(modern)
  api.get.mockImplementation(async () => structuredClone(modern))
  api.createVersion.mockImplementation(async (_key, content) => { modern = { ...modern, content: structuredClone(content), version: content.version, status: 'draft' }; return structuredClone(modern) })
  await act(async () => root.render(<MemoryRouter initialEntries={['/create?template=chosen-source']}><CreatorTemplateEditorPage /></MemoryRouter>))
  await feature('Personal Challenge')
  expect(container.querySelector<HTMLSelectElement>('[aria-label="Personal Challenge"]')!.options).toHaveLength(16)
  await click('Save draft')
  expect(api.createVersion).toHaveBeenCalledTimes(1); expect(modern.version).toBe(3)
  expect(modern.category).toBe(category); expect(modern.content.checkpoints).toEqual(approved.content.checkpoints)
  expect(approved.version).toBe(2); expect(approved.status).toBe('approved')
  await click('Save draft'); expect(api.createVersion).toHaveBeenCalledTimes(1)
  await act(async () => root.unmount()); root = createRoot(container)
  await act(async () => root.render(<MemoryRouter initialEntries={['/create?template=chosen-source']}><CreatorTemplateEditorPage /></MemoryRouter>))
  await feature('Personal Challenge')
  expect(container.querySelector<HTMLSelectElement>('[aria-label="Personal Challenge"]')!.options).toHaveLength(16)
  expect(modern.content.checkpoints).toEqual(approved.content.checkpoints)
})
