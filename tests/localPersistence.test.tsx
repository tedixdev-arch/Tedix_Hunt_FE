import { geographyApi } from '../src/services/api/geography'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter, useNavigate } from 'react-router-dom'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { CreatorTemplateEditorPage } from '../src/pages/CreatorStudio'
import { ApiError } from '../src/services/api/client'
import type { CreatorTemplate } from '../src/services/api/creatorTemplates'
vi.mock('../src/services/api/geography', () => ({ geographyApi: { countries: vi.fn(async () => ({ countries: [] })), get: vi.fn(), search: vi.fn() } }))
const api = vi.hoisted(() => ({ create: vi.fn(), createVersion: vi.fn(), get: vi.fn(), submit: vi.fn() }))
vi.mock('../src/services/api/creatorTemplates', async original => ({ ...await original<typeof import('../src/services/api/creatorTemplates')>(), creatorTemplatesApi: api }))
vi.mock('../src/pages/OrganizerFlow', () => ({ OrganizerHeader: () => <div /> }))
vi.mock('../src/components/TedixMap', () => ({ TedixMap: () => <div /> }))
let root: Root, container: HTMLDivElement, record: CreatorTemplate
beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true); vi.resetAllMocks(); Element.prototype.scrollIntoView = vi.fn(); container = document.createElement('div'); document.body.append(container); root = createRoot(container)
  record = { key: 'owned', version: 3, category: 'local', status: 'draft', content: { key: 'owned', version: 3, displayName: 'Saved mystery', theme: 'City', mission: { name: 'Story', metadata: { keep: 'yes' } }, configuration: { normalCheckpointCount: 1, checkpointPositions: [], custom: { keep: true } }, scoring: { model: 'platform', extra: true }, checkpoints: [{ checkpoint: 1, role: 'normal', kind: 'square', answer: '42' }, { role: 'terminal', teamKind: 'clue-synthesis', story: 'Ending' }] } }
  api.get.mockImplementation(async () => structuredClone(record)); api.createVersion.mockImplementation(async (_key, content) => ({ ...record, version: content.version, content, status: 'draft' }))
})
afterEach(() => { act(() => root.unmount()); container.remove(); vi.unstubAllGlobals() })
async function render() { await act(async () => root.render(<MemoryRouter initialEntries={['/create?template=owned']}><CreatorTemplateEditorPage /></MemoryRouter>)) }
const button = (text: string) => [...container.querySelectorAll('button')].find(b => b.textContent?.startsWith(text))!
async function click(text: string) { await act(async () => button(text).click()) }
async function name(value: string) { const input = container.querySelector('#template-setup input')!; await act(async () => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, value); input.dispatchEvent(new Event('input', { bubbles: true })) }) }
test('09 reopen preserves full story/gameplay/terminal; explicit immutable save hydrates server content', async () => {
  await render(); await click('Save draft'); expect(api.createVersion).not.toHaveBeenCalled()
  await name('Changed'); expect(api.createVersion).not.toHaveBeenCalled()
  api.createVersion.mockImplementationOnce(async (_key, content) => ({ ...record, version: 4, content: { ...content, displayName: 'Canonical server name' } }))
  await click('Save draft'); expect(api.createVersion).toHaveBeenCalledTimes(1)
  const [key, content] = api.createVersion.mock.calls[0]; expect(key).toBe('owned'); expect(content.version).toBe(4); expect(content.mission).toEqual(record.content.mission); expect(content.checkpoints).toEqual(record.content.checkpoints); expect(content.scoring).toEqual(record.content.scoring); expect(content.configuration).toEqual(record.content.configuration)
  expect((container.querySelector('#template-setup input') as HTMLInputElement).value).toBe('Canonical server name')
})
test('09 stale save retains input, sends no version, explicit reopen discards for latest authority', async () => {
  await render(); await name('Working edit'); record = { ...record, version: 4, content: { ...record.content, version: 4, displayName: 'Other session' } }
  await click('Save draft'); expect(api.createVersion).not.toHaveBeenCalled(); expect(container.textContent).toContain('changed on the server'); expect((container.querySelector('#template-setup input') as HTMLInputElement).value).toBe('Working edit'); expect(button('Save draft').disabled).toBe(true)
  await click('Reopen saved version'); expect((container.querySelector('#template-setup input') as HTMLInputElement).value).toBe('Other session')
})
test.each([400,403,409,500])('09 failed save %s keeps input and prior snapshot', async status => {
  await render(); await name('Unsent edit'); api.createVersion.mockRejectedValue(new ApiError('Failed', status, 'http')); await click('Save draft'); expect((container.querySelector('#template-setup input') as HTMLInputElement).value).toBe('Unsent edit'); expect(container.querySelector('[role=alert]')).not.toBeNull(); expect(record.version).toBe(3)
})
test('09 submitted Local is read-only, approved/changes-requested can create a new candidate', async () => {
  record.status = 'submitted'; await render(); expect(container.querySelector('#template-setup input')).toBeNull(); expect(container.textContent).toContain('submitted for Admin review'); expect(api.createVersion).not.toHaveBeenCalled()
})
test.each([401,403,404])('09 owner detail denial %s reveals no content', async status => {
  api.get.mockRejectedValue(new ApiError('Denied', status, 'http')); await render(); expect(container.querySelector('#template-setup input')).toBeNull(); expect(container.textContent).not.toContain('Saved mystery')
})

test('09 duplicate save during stale-state preflight creates only one next version', async () => {
  await render(); await name('One immutable save')
  let resolve!: (value: CreatorTemplate) => void
  api.get.mockReturnValueOnce(new Promise(done => resolve = done))
  await act(async () => { button('Save draft').click(); button('Save draft').click() })
  expect(api.createVersion).not.toHaveBeenCalled()
  await act(async () => resolve(structuredClone(record)))
  expect(api.createVersion).toHaveBeenCalledTimes(1)
})

test('09 late owner read cannot replace a newly opened Template', async () => {
  let resolve!: (value: CreatorTemplate) => void
  api.get.mockReturnValueOnce(new Promise(done => resolve = done))
  const newest = { ...record, key: 'newest', content: { ...record.content, key: 'newest', displayName: 'Newest owned draft' } }
  api.get.mockResolvedValueOnce(newest)
  function Navigation() { const navigate = useNavigate(); return <button onClick={() => navigate('/create?template=newest')}>Open newest</button> }
  await act(async () => root.render(<MemoryRouter initialEntries={['/create?template=older']}><Navigation /><CreatorTemplateEditorPage /></MemoryRouter>))
  await click('Open newest')
  await act(async () => resolve(structuredClone(record)))
  expect((container.querySelector('#template-setup input') as HTMLInputElement).value).toBe('Newest owned draft')
})

const snapshot = { id: '11111111-1111-4111-8111-111111111111', countryCode: 'RO', countryDisplayName: 'Romania', name: 'Saved town', administrativeContext: 'North', latitude: 46, longitude: 23 }
test.each([null, snapshot.id])('09 binding-only change %s creates a new version; response rehydrates server snapshot', async id => {
  record.localityId = snapshot.id; record.localitySnapshot = snapshot
  vi.mocked(geographyApi.get).mockResolvedValue({ ...snapshot, name: 'Current town', active: true })
  api.createVersion.mockImplementationOnce(async (_key, content, localityId) => ({ ...record, version: 4, content, localityId, localitySnapshot: localityId ? { ...snapshot, name: 'Server snapshot' } : null }))
  await render(); await click(id ? 'Use current registry details' : 'Clear locality'); await click('Save draft')
  expect(api.createVersion).toHaveBeenCalledTimes(1); expect(api.createVersion.mock.calls[0][2]).toBe(id); expect(api.createVersion.mock.calls[0][1].version).toBe(4); expect(api.createVersion.mock.calls[0][1]).not.toHaveProperty('localitySnapshot')
  expect(container.textContent).toContain(id ? 'Server snapshot' : 'No locality saved.')
})
test.each([[400,'invalid_input'],[404,'locality_not_found'],[409,'locality_unavailable']])('09 binding save rejection %s retains saved snapshot and pending choice', async (status,error) => {
  record.localityId = snapshot.id; record.localitySnapshot = snapshot
  vi.mocked(geographyApi.get).mockResolvedValue({ ...snapshot, active: true })
  api.createVersion.mockRejectedValue(new ApiError('Rejected',status as number,'http',{error})); await render(); await click('Clear locality'); await click('Save draft')
  expect(container.textContent).toContain('Saved town'); expect(container.textContent).toContain('next save will clear'); expect(container.querySelector('[role=alert]')!.textContent).toContain('saved version is unchanged'); expect(record.version).toBe(3)
})
