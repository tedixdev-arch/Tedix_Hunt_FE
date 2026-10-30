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
test('05 submits exact saved latest route-free Universal once, then locks independently of publication', async () => {
  await render(); expect(container.textContent).not.toContain('Route reviewed this session'); expect(container.textContent).not.toContain('Place one FinishPoint')
  let resolve!: (v: any) => void; api.submit.mockReturnValue(new Promise(done => resolve = done))
  await act(async () => { button('Submit version').click(); button('Submit version').click() })
  expect(api.submit).toHaveBeenCalledExactlyOnceWith('owned', 3)
  await act(async () => resolve({ ...record, status: 'submitted', submittedVersion: 3 }))
  expect(container.querySelector('input')).toBeNull(); expect(container.textContent).toContain('submitted for Admin review'); expect(container.textContent).not.toContain('Published version 3')
})
test('05 unsaved story edit cannot be submitted and does not implicitly save', async () => {
  await render(); await name('Not saved'); expect(button('Submit version').disabled).toBe(true); await click('Submit version'); expect(api.submit).not.toHaveBeenCalled(); expect(api.createVersion).not.toHaveBeenCalled(); expect(container.textContent).toContain('Save your changes')
})
test('05 stale preflight sends no submission and requires latest saved reopen', async () => {
  await render(); record = { ...record, version: 4, content: { ...record.content, version: 4 } }; await click('Submit version'); expect(api.submit).not.toHaveBeenCalled(); expect(container.textContent).toContain('saved version changed'); expect(button('Submit version').disabled).toBe(true)
})
test.each([400,403,409,500])('05 server response %s preserves snapshot and reports correct boundary', async status => {
  await render(); api.submit.mockRejectedValue(new ApiError('Failed', status, 'http')); await click('Submit version'); expect(container.querySelector('input')).not.toBeNull(); expect(container.querySelector('[role=alert]')).not.toBeNull(); expect(api.submit).toHaveBeenCalledExactlyOnceWith('owned', 3)
  if (status === 400) { expect(container.textContent).toContain('saved Universal content was rejected'); expect(container.textContent).not.toContain('FinishPoint geography') }
  if ([409,500].includes(status)) expect(button('Submit version').disabled).toBe(true)
})
test.each(['terminal','numbering','unsupported'])('05 invalid %s gameplay blocks submission locally', async kind => {
  if (kind === 'terminal') record.content.checkpoints.pop()
  if (kind === 'numbering') (record.content.checkpoints[0] as any).checkpoint = 2
  if (kind === 'unsupported') (record.content.checkpoints[0] as any).kind = 'invented-game'
  await render(); const submit = [...container.querySelectorAll('button')].find(b => b.textContent?.startsWith('Submit version')); expect(!submit || submit.disabled).toBe(true); expect(api.submit).not.toHaveBeenCalled()
})
