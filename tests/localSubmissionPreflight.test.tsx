import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { CreatorTemplateEditorPage } from '../src/pages/CreatorStudio'
import { ApiError } from '../src/services/api/client'
import type { CreatorTemplate } from '../src/services/api/creatorTemplates'

const api = vi.hoisted(() => ({ get: vi.fn(), create: vi.fn(), createVersion: vi.fn(), submit: vi.fn() }))
vi.mock('../src/services/api/creatorTemplates', () => ({ creatorTemplatesApi: api }))
vi.mock('../src/services/api/geography', () => ({ geographyApi: { countries: async () => ({ countries: [] }), get: async () => ({ id: 'place', active: true, countryCode: 'RO', latitude: 46, longitude: 23 }) } }))
vi.mock('../src/pages/OrganizerFlow', () => ({ OrganizerHeader: () => null }))
vi.mock('../src/components/TedixMap', () => ({ TedixMap: () => <div /> }))
vi.mock('../src/features/creator/RouteEditor', () => ({ RouteEditor: (props: any) => <button type="button" onClick={() => {
  props.onVerifiedChange(new Set([1])); props.onSafetyChange(new Set(['a', 'b', 'c', 'd', 'e', 'f']))
}}>Verify saved route</button> }))
vi.mock('../src/features/creator/ParticipantPreview', () => ({ ParticipantPreview: ({ onExit }: any) => <button onClick={onExit}>Close preview</button> }))
let root: Root, container: HTMLDivElement, record: CreatorTemplate
beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true); vi.resetAllMocks(); Element.prototype.scrollIntoView = vi.fn()
  container = document.createElement('div'); document.body.append(container); root = createRoot(container)
  record = { key: 'owned-local', version: 3, category: 'local', status: 'draft', localityId: 'place', localitySnapshot: { id: 'place', countryCode: 'RO', countryDisplayName: 'Romania', name: 'Saved town', administrativeContext: 'North', latitude: 46, longitude: 23 }, content: {
    key: 'owned-local', version: 3, displayName: 'Local mystery', theme: 'City', mission: { name: 'Story' },
    configuration: { normalCheckpointCount: 1, checkpointPositions: [{ checkpointNumber: 1, name: 'Museum', latitude: 46, longitude: 23, radiusMeters: 30 }], finishPoint: { name: 'Finish', latitude: 46.1, longitude: 23.1, radiusMeters: 20 } },
    scoring: { model: 'platform' }, checkpoints: [{ checkpoint: 1, role: 'normal' }, { role: 'terminal' }],
  } }
  api.get.mockImplementation(async () => structuredClone(record))
  api.submit.mockImplementation(async () => ({ ...record, status: 'submitted', submittedVersion: 3 }))
})
afterEach(() => { act(() => root.unmount()); container.remove(); vi.unstubAllGlobals() })
const button = (text: string) => text === '2.' ? container.querySelectorAll('nav')[1].querySelectorAll('button')[1] : [...container.querySelectorAll('button')].findLast(b => b.textContent?.startsWith(text))!
async function click(text: string) { await act(async () => button(text).click()) }
async function render() { await act(async () => root.render(<MemoryRouter initialEntries={['/create?template=owned-local']}><CreatorTemplateEditorPage /></MemoryRouter>)) }
async function ready() {
  await render(); expect(button('Submit version').disabled).toBe(true)
  await click('Run template validation')
  expect(button('Submit version').disabled).toBe(false)
  expect(api.get).toHaveBeenCalledTimes(1); expect(api.submit).not.toHaveBeenCalled()
}

test('Local preflight reads current owner state after readiness and submits the exact saved version once', async () => {
  await ready(); await click('Submit version')
  expect(api.get).toHaveBeenCalledTimes(2); expect(api.get).toHaveBeenLastCalledWith('owned-local')
  expect(api.submit).toHaveBeenCalledExactlyOnceWith('owned-local', 3)
  expect(container.textContent).toContain('Version 3 submitted for Admin review')
})
test.each(['version', 'locality ID', 'locality snapshot', 'status', 'content'])('Local preflight rejects stale %s without submitting or saving', async changed => {
  await ready()
  if (changed === 'version') { record.version = 4; record.content.version = 4 }
  if (changed === 'locality ID') record.localityId = 'different-place'
  if (changed === 'locality snapshot') record.localitySnapshot = { ...record.localitySnapshot!, latitude: 47 }
  if (changed === 'status') record.status = 'submitted'
  if (changed === 'content') record.content.displayName = 'Another session'
  await click('Submit version')
  expect(api.get).toHaveBeenCalledTimes(2); expect(api.submit).not.toHaveBeenCalled(); expect(api.createVersion).not.toHaveBeenCalled()
  expect(container.querySelector('[role=alert]')?.textContent).toContain('saved version changed')
  expect(button('Submit version').disabled).toBe(true); expect(button('Reopen saved version')).toBeDefined()
  expect((container.querySelector('#template-setup input') as HTMLInputElement).value).toBe('Local mystery')
})
test.each([401, 403, 404, 409])('Local preflight denial/conflict %s sends no submission', async status => {
  await ready(); api.get.mockRejectedValueOnce(new ApiError('Denied', status, 'http'))
  await click('Submit version'); expect(api.submit).not.toHaveBeenCalled(); expect(container.querySelector('[role=alert]')).not.toBeNull()
})
test('Local readiness and submitted lifecycle remain restrictive', async () => {
  await render(); await click('Submit version'); expect(api.get).toHaveBeenCalledTimes(1); expect(api.submit).not.toHaveBeenCalled()
  await act(async () => root.unmount()); root = createRoot(container); record.status = 'submitted'; await render()
  expect(container.textContent).toContain('Version 3 submitted for Admin review'); expect(button('Submit version')).toBeUndefined(); expect(api.submit).not.toHaveBeenCalled()
})
