import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { CreatorTemplateEditorPage, CreatorStudioPage } from '../src/pages/CreatorStudio'
import type { CreatorTemplate } from '../src/services/api/creatorTemplates'
import { canReviseTemplate } from '../src/features/creator/templateLifecycle'
const api = vi.hoisted(() => ({ get: vi.fn(), list: vi.fn(), create: vi.fn(), createVersion: vi.fn(), submit: vi.fn() }))
vi.mock('../src/services/api/creatorTemplates', () => ({ creatorTemplatesApi: api }))
vi.mock('../src/services/api/geography', () => ({ geographyApi: { countries: async () => ({ countries: [] }), get: async () => ({ id: 'place', countryCode: 'RO', latitude: 46, longitude: 23, active: true }) } }))
vi.mock('../src/pages/OrganizerFlow', () => ({ OrganizerHeader: () => null }))
vi.mock('../src/components/TedixMap', () => ({ TedixMap: () => <div /> }))
let root: Root, container: HTMLDivElement, record: CreatorTemplate
beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true); vi.resetAllMocks(); Element.prototype.scrollIntoView = vi.fn()
  container = document.createElement('div'); document.body.append(container); root = createRoot(container)
  record = { key: 'owned', version: 3, category: 'universal', status: 'approved', publishedVersion: 2, submittedVersion: 2, content: {
    key: 'owned', version: 3, displayName: 'Saved mystery', theme: 'City', mission: { name: 'Retained story' }, configuration: { normalCheckpointCount: 1, checkpointPositions: [{ checkpointNumber: 1, name: 'Museum', latitude: 46, longitude: 23, radiusMeters: 30 }], finishPoint: { name: 'Finish', latitude: 46.1, longitude: 23.1, radiusMeters: 20 } }, scoring: { model: 'platform' }, checkpoints: [{ checkpoint: 1, role: 'normal' }, { role: 'terminal' }],
  } }
  api.get.mockImplementation(async () => structuredClone(record)); api.list.mockImplementation(async () => [structuredClone(record)])
  api.createVersion.mockImplementation(async (_key, content) => { record = { ...record, content, version: content.version, status: 'draft', submittedVersion: null }; return structuredClone(record) })
  api.submit.mockImplementation(async (_key, version) => { record = { ...record, status: 'submitted', submittedVersion: version }; return structuredClone(record) })
})
afterEach(() => { act(() => root.unmount()); container.remove(); vi.unstubAllGlobals() })
const button = (text: string) => [...container.querySelectorAll('button')].find(b => b.textContent?.startsWith(text))!
async function click(text: string) { await act(async () => button(text).click()) }
async function render(list = false) { await act(async () => root.render(<MemoryRouter initialEntries={['/create?template=owned']}>{list ? <CreatorStudioPage /> : <CreatorTemplateEditorPage />}</MemoryRouter>)) }
function local() { record.category = 'local'; delete record.publishedVersion; record.localityId = 'place'; record.localitySnapshot = { id: 'place', countryCode: 'RO', countryDisplayName: 'Romania', name: 'Town', administrativeContext: 'North', latitude: 46, longitude: 23 }; record.localApprovedVersion = 2; record.localApproval = { version: 2, authority: 'approved', independentEvidence: true, localityBound: true }; record.localSuspension = { at: '2026-10-30T00:00:00Z', byUserId: 'admin', reason: 'Closed access', version: 2 } }
test.each(['approved','changes_requested'] as const)('11 Universal %s explicitly creates even unchanged replacement then exact resubmits; publication stays retained', async status => {
  record.status = status; const old = structuredClone(record); await render(); expect(api.createVersion).not.toHaveBeenCalled(); expect(button('Submit version').disabled).toBe(true)
  await click('Save draft'); expect(api.createVersion).toHaveBeenCalledTimes(1); expect(api.createVersion.mock.calls[0][1].version).toBe(4); expect(api.createVersion.mock.calls[0][1]).not.toHaveProperty('publishedVersion'); expect(record.publishedVersion).toBe(2); expect(container.textContent).toContain('Published version 2')
  await click('Submit version'); expect(api.submit).toHaveBeenCalledExactlyOnceWith('owned', 4); expect(record.publishedVersion).toBe(2); expect(old.status).toBe(status); expect(old.version).toBe(3)
})
test.each(['approved','changes_requested'] as const)('11 Local %s saves a new candidate with inherited snapshot and suspension intact', async status => {
  local(); record.status = status; const old = structuredClone(record); await render(); expect(container.querySelector('input')).not.toBeNull(); expect(container.textContent).toContain('Suspended'); await click('Save draft')
  expect(api.createVersion).toHaveBeenCalledTimes(1); expect(api.createVersion.mock.calls[0]).toHaveLength(2); expect(record.version).toBe(4); expect(record.localitySnapshot).toEqual(old.localitySnapshot); expect(record.localApproval).toEqual(old.localApproval); expect(record.localSuspension).toEqual(old.localSuspension); expect(container.textContent).toContain('Closed access'); await click('Run template validation'); await click('Submit version'); expect(api.submit).toHaveBeenCalledExactlyOnceWith('owned', 4); expect(record.localApprovedVersion).toBe(2); expect(record.localSuspension).toEqual(old.localSuspension)
})
test.each(['universal','local'] as const)('11 My Templates exposes Revise from the shared editor for %s', async category => {
  if (category === 'local') local(); await render(true); expect(container.querySelector('a[href="/create?template=owned"]')?.textContent).toBe('Revise'); expect(api.createVersion).not.toHaveBeenCalled()
})
test.each(['universal','local',null] as const)('11 submitted %s stays locked', async category => {
  record.category = category; record.status = 'submitted'; await render(); expect(container.querySelector('input')).toBeNull(); expect(button('Save draft')).toBeUndefined(); expect(canReviseTemplate(record)).toBe(false)
})
test('11 legacy and evidence-less historical approvals retain restrictions', async () => {
  record.category = null; expect(canReviseTemplate(record)).toBe(false); local(); record.localApproval!.authority = 'historical'; record.localApproval!.independentEvidence = false; await render(); expect(container.querySelector('input')).toBeNull(); expect(api.createVersion).not.toHaveBeenCalled()
})
test('11 changed retained authority is stale even when candidate version is unchanged', async () => {
  local(); await render(); record.localSuspension = null; await click('Save draft'); expect(api.createVersion).not.toHaveBeenCalled(); expect(container.textContent).toContain('changed on the server')
})
