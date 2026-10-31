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
  const source = record('universal', [...createNormalGameplay(6, 'modern'), { role: 'terminal', story: { message: 'Selected ending' } }])
  const destination = structuredClone(source); destination.key = destination.content.key = 'destination'; destination.category = 'local'
  const before = structuredClone(source), signal = structuredClone(checkpointExercises)
  api.get.mockResolvedValue(destination)
  await act(async () => root.render(<MemoryRouter initialEntries={['/create?template=destination']}><CreatorTemplateEditorPage /></MemoryRouter>))
  await feature('Personal Challenge')
  expect([...container.querySelector<HTMLSelectElement>('[aria-label="Personal Challenge"]')!.options]).toHaveLength(16)
  expect(container.textContent).not.toContain('Restore the Signal')
  await click('Create Your Own'); await input(container.querySelector<HTMLTextAreaElement>('[aria-label="Title"]')!, 'Destination edit')
  expect(source).toEqual(before); expect(checkpointExercises).toEqual(signal)
  expect(hydrateGameplay(destination.content).normal.every(cp => !cp.kind && !cp.teamKind && !cp.navigationMode)).toBe(true)
})

test('Legacy remains Legacy based on explicit records/identifiers, with only original relevant choices', async () => {
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
  expect(personalCreationContext(record('local', [{ checkpoint: 1, kind: 'square' }]))).toEqual({ mode: 'legacy', kinds: ['square'] }) // Never silently migrate historical classified content.
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
