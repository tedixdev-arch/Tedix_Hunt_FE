import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { CreatorTemplateEditorPage } from '../src/pages/CreatorStudio'
import type { CreatorTemplate } from '../src/services/api/creatorTemplates'
import { ApiError } from '../src/services/api/client'
const api = vi.hoisted(() => ({ get: vi.fn(), create: vi.fn(), createVersion: vi.fn(), submit: vi.fn(), place: vi.fn() }))
vi.mock('../src/services/api/creatorTemplates', () => ({ creatorTemplatesApi: api }))
vi.mock('../src/services/api/geography', () => ({ geographyApi: { countries: async () => ({ countries: [] }), get: api.place } }))
vi.mock('../src/pages/OrganizerFlow', () => ({ OrganizerHeader: () => null }))
vi.mock('../src/components/TedixMap', () => ({ TedixMap: () => <div /> }))
let root: Root, container: HTMLDivElement, record: CreatorTemplate
const place = { id: 'place', countryCode: 'RO', countryDisplayName: 'Romania', name: 'Town', administrativeContext: 'North', latitude: 46, longitude: 23, active: true }
beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true); vi.stubGlobal('confirm', vi.fn(() => true)); vi.resetAllMocks(); Element.prototype.scrollIntoView = vi.fn()
  container = document.createElement('div'); document.body.append(container); root = createRoot(container)
  record = { key: 'owned', version: 3, category: 'local', status: 'draft', localityId: 'place', localitySnapshot: place, content: {
    key: 'owned', version: 3, displayName: 'Local mystery', theme: 'City', mission: { name: 'Story' }, configuration: { normalCheckpointCount: 1, checkpointPositions: [{ checkpointNumber: 1, name: 'Museum', latitude: 46, longitude: 23, radiusMeters: 30 }], finishPoint: { name: 'Finish', latitude: 46.1, longitude: 23.1, radiusMeters: 20 } }, scoring: { model: 'platform' }, checkpoints: [{ checkpoint: 1, role: 'normal' }, { role: 'terminal' }],
  } }
  api.get.mockImplementation(async () => structuredClone(record)); api.place.mockResolvedValue(place)
  api.createVersion.mockImplementation(async (_key, content) => { record = { ...record, version: content.version, content }; return structuredClone(record) })
  api.submit.mockImplementation(async () => ({ ...record, status: 'submitted', submittedVersion: record.version }))
})
afterEach(() => { act(() => root.unmount()); container.remove(); vi.unstubAllGlobals() })
const button = (text: string) => [...container.querySelectorAll('button')].find(b => b.textContent?.startsWith(text))!
async function click(text: string) { await act(async () => button(text).click()) }
async function render() { await act(async () => root.render(<MemoryRouter initialEntries={['/create?template=owned']}><CreatorTemplateEditorPage /></MemoryRouter>)) }
async function name(value: string) { const input = container.querySelector('#template-setup input')!; await act(async () => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, value); input.dispatchEvent(new Event('input', { bubbles: true })) }) }
test('12 complete saved Local requires explicit validation, then exact submission without repeating completed sections', async () => {
  await render(); expect(button('Submit version').disabled).toBe(true); await click('Run template validation'); expect(button('Submit version').disabled).toBe(false)
  await click('Submit version'); expect(api.submit).toHaveBeenCalledExactlyOnceWith('owned', 3); expect(api.createVersion).not.toHaveBeenCalled(); expect(container.textContent).toContain('submitted for Admin review')
})
test.each(['positions','terminal','finish','locality','count'] as const)('12 incomplete %s can save progressively but cannot submit', async missing => {
  if (missing === 'positions') record.content.configuration.checkpointPositions = []
  if (missing === 'terminal') record.content.checkpoints.pop()
  if (missing === 'finish') delete record.content.configuration.finishPoint
  if (missing === 'locality') { record.localityId = null; record.localitySnapshot = null }
  if (missing === 'count') { delete (record.content.configuration as any).normalCheckpointCount }
  await render(); await name('Progress saved'); await click('Save draft')
  if (missing !== 'count') expect(api.createVersion).toHaveBeenCalledTimes(1)
  await click('Run template validation'); expect(button('Submit version').disabled).toBe(true); expect(api.submit).not.toHaveBeenCalled(); expect(container.textContent).toContain('Review the highlighted sections')
})
test.each([{ active: false }, { latitude: 47 }, { countryCode: 'US' }, { id: 'wrong' }])('12 inactive or materially changed registry blocks exact submission %j', async change => {
  api.place.mockResolvedValue({ ...place, ...change }); await render(); await click('Run template validation'); expect(button('Submit version').disabled).toBe(true); expect(api.submit).not.toHaveBeenCalled(); expect(container.textContent).toMatch(/locality.*(active|changed|available)/i)
})
test('12 descriptive registry corrections do not force resnapshot; drift after validation is rechecked', async () => {
  api.place.mockResolvedValue({ ...place, name: 'Renamed town', administrativeContext: 'Corrected context' }); await render(); await click('Run template validation'); expect(button('Submit version').disabled).toBe(false)
  api.place.mockResolvedValue({ ...place, longitude: 25 }); await click('Submit version'); expect(api.submit).not.toHaveBeenCalled(); expect(button('Submit version').disabled).toBe(true); expect(container.textContent).toContain('coordinates or country changed')
})
test('12 validation is tied to exact content; unsaved edits never submit or implicitly save', async () => {
  await render(); await click('Run template validation'); await name('Unsaved'); expect(button('Submit version').disabled).toBe(true); await click('Submit version'); expect(api.submit).not.toHaveBeenCalled(); expect(api.createVersion).not.toHaveBeenCalled()
  await click('Save draft'); expect(button('Submit version').disabled).toBe(true); await click('Run template validation'); await click('Submit version'); expect(api.submit).toHaveBeenCalledExactlyOnceWith('owned', 4)
})
test.each(['locality_required','locality_unavailable','locality_geography_changed'])('12 backend binding gate %s remains actionable near geography', async error => {
  await render(); await click('Run template validation'); api.submit.mockRejectedValue(new ApiError(error, 409, 'http', { error })); await click('Submit version'); expect(container.querySelector('#local-geography')?.textContent).toMatch(/(registered locality|unavailable|coordinates changed)/); expect(button('Submit version').disabled).toBe(true)
})
test('12 pending locality selection must be explicitly saved before validation', async () => {
  await render(); await click('Clear locality'); await click('Run template validation'); expect(container.textContent).toContain('Save your locality selection'); expect(button('Submit version').disabled).toBe(true); expect(api.submit).not.toHaveBeenCalled()
})
test('12 one validation request blocks duplicate validation/save and submission', async () => {
  await render(); let resolve!: (v: any) => void; api.place.mockReturnValueOnce(new Promise(done => resolve = done))
  await act(async () => { button('Run template validation').click(); button('Run template validation').click(); button('Save draft').click() }); expect(api.createVersion).not.toHaveBeenCalled(); expect(api.submit).not.toHaveBeenCalled()
  await act(async () => resolve(place)); expect(button('Submit version').disabled).toBe(false)
})
