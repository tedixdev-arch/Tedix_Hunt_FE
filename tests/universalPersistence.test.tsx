import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { CreatorTemplateEditorPage } from '../src/pages/CreatorStudio'
import { ApiError } from '../src/services/api/client'
import type { CreatorTemplate } from '../src/services/api/creatorTemplates'
const api = vi.hoisted(() => ({ create: vi.fn(), createVersion: vi.fn(), get: vi.fn(), submit: vi.fn() }))
vi.mock('../src/services/api/creatorTemplates', async original => ({ ...await original<typeof import('../src/services/api/creatorTemplates')>(), creatorTemplatesApi: api }))
vi.mock('../src/pages/OrganizerFlow', () => ({ OrganizerHeader: () => <div /> }))
vi.mock('../src/components/TedixMap', () => ({ TedixMap: () => <div /> }))
let root: Root, container: HTMLDivElement, record: CreatorTemplate
beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true); vi.resetAllMocks(); Element.prototype.scrollIntoView = vi.fn(); container = document.createElement('div'); document.body.append(container); root = createRoot(container)
  record = { key: 'owned', version: 3, category: 'universal', status: 'draft', content: { key: 'owned', version: 3, displayName: 'Saved mystery', theme: 'City', mission: { name: 'Story', metadata: { keep: 'yes' } }, configuration: { normalCheckpointCount: 1, checkpointPositions: [], custom: { keep: true } }, scoring: { model: 'platform', extra: true }, checkpoints: [{ checkpoint: 1, role: 'normal', kind: 'square', answer: '42' }, { role: 'terminal', teamKind: 'clue-synthesis', story: 'Ending' }] } }
  api.get.mockImplementation(async () => structuredClone(record)); api.createVersion.mockImplementation(async (_key, content) => ({ ...record, version: content.version, content, status: 'draft' }))
})
afterEach(() => { act(() => root.unmount()); container.remove(); vi.unstubAllGlobals() })
async function render() { await act(async () => root.render(<MemoryRouter initialEntries={['/create?template=owned']}><CreatorTemplateEditorPage /></MemoryRouter>)) }
const button = (text: string) => [...container.querySelectorAll('button')].find(b => b.textContent?.startsWith(text))!
async function click(text: string) { await act(async () => button(text).click()) }
async function name(value: string) { const input = container.querySelector('input')!; await act(async () => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, value); input.dispatchEvent(new Event('input', { bubbles: true })) }) }
test('04 reopen preserves full story/gameplay/terminal; explicit immutable save hydrates server content', async () => {
  await render(); await click('Save draft'); expect(api.createVersion).not.toHaveBeenCalled()
  await name('Changed'); expect(api.createVersion).not.toHaveBeenCalled()
  api.createVersion.mockImplementationOnce(async (_key, content) => ({ ...record, version: 4, content: { ...content, displayName: 'Canonical server name' } }))
  await click('Save draft'); expect(api.createVersion).toHaveBeenCalledTimes(1)
  const [key, content] = api.createVersion.mock.calls[0]; expect(key).toBe('owned'); expect(content.version).toBe(4); expect(content.mission).toEqual(record.content.mission); expect(content.checkpoints).toEqual(record.content.checkpoints); expect(content.scoring).toEqual(record.content.scoring); expect(content.configuration).toEqual(record.content.configuration)
  expect((container.querySelector('input') as HTMLInputElement).value).toBe('Canonical server name')
})
test('04 stale save retains input, sends no version, explicit reopen discards for latest authority', async () => {
  await render(); await name('Working edit'); record = { ...record, version: 4, content: { ...record.content, version: 4, displayName: 'Other session' } }
  await click('Save draft'); expect(api.createVersion).not.toHaveBeenCalled(); expect(container.textContent).toContain('changed on the server'); expect((container.querySelector('input') as HTMLInputElement).value).toBe('Working edit'); expect(button('Save draft').disabled).toBe(true)
  await click('Reopen saved version'); expect((container.querySelector('input') as HTMLInputElement).value).toBe('Other session')
})
test.each([400,403,409,500])('04 failed save %s keeps input and prior snapshot', async status => {
  await render(); await name('Unsent edit'); api.createVersion.mockRejectedValue(new ApiError('Failed', status, 'http')); await click('Save draft'); expect((container.querySelector('input') as HTMLInputElement).value).toBe('Unsent edit'); expect(container.querySelector('[role=alert]')).not.toBeNull(); expect(record.version).toBe(3)
})
test('04 submitted Universal is read-only, approved/changes-requested can create a new candidate', async () => {
  record.status = 'submitted'; await render(); expect(container.querySelector('input')).toBeNull(); expect(container.textContent).toContain('submitted for Admin review'); expect(api.createVersion).not.toHaveBeenCalled()
})
test.each(['approved','changes_requested'] as const)('04 %s starts a new immutable draft without altering publication', async status => {
  record.status = status; record.publishedVersion = 2; await render(); await name('Revision'); await click('Save draft'); expect(api.createVersion).toHaveBeenCalledTimes(1); expect(api.createVersion.mock.calls[0][1].version).toBe(4); expect(api.createVersion.mock.calls[0][1]).not.toHaveProperty('publishedVersion')
})
test.each([401,403,404])('04 owner detail denial %s reveals no content', async status => {
  api.get.mockRejectedValue(new ApiError('Denied', status, 'http')); await render(); expect(container.querySelector('input')).toBeNull(); expect(container.textContent).not.toContain('Saved mystery')
})
