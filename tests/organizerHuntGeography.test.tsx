import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { HuntSnapshotGeographyInspection, OrganizerHuntGeographyInspection } from '../src/components/OrganizerHuntGeography'
import { CustomHuntEditorPage } from '../src/pages/CustomHuntEditor'
import { OrganizerMonitorPage } from '../src/pages/OrganizerMonitor'
import type { Hunt } from '../src/services/api/hunts'

const mocks = vi.hoisted(() => ({ maps: [] as any[], markers: [] as any[], get: vi.fn(), catalog: vi.fn(), options: vi.fn(), organizations: vi.fn(), rewards: vi.fn(), create: vi.fn(), update: vi.fn(), publish: vi.fn(), access: vi.fn() }))
vi.mock('../src/pages/OrganizerFlow', () => ({ OrganizerHeader: () => <header>Organizer workspace</header> }))
vi.mock('../src/services/api', async importOriginal => ({
  ...await importOriginal<any>(),
  huntsApi: { getHunt: mocks.get, createDraft: mocks.create, updateDraft: mocks.update, publish: mocks.publish, createOrGetAccess: mocks.access },
  huntTemplatesApi: { listHuntTemplates: mocks.catalog }, huntOptionsApi: { listHuntOptions: mocks.options },
  organizationsApi: { listAccessible: mocks.organizations }, huntRewardsApi: { list: mocks.rewards },
}))
vi.mock('mapbox-gl', () => ({ default: {
  Map: class {
    handlers = new Map<string, Set<(...args: any[]) => void>>()
    sources = new Map<string, any>(); layers = new Map<string, any>()
    fitBounds = vi.fn(); remove = vi.fn(); resize = vi.fn()
    constructor(options: any) { Object.assign(this, { options }); mocks.maps.push(this) }
    on(event: string, handler: (...args: any[]) => void) { if (!this.handlers.has(event)) this.handlers.set(event, new Set()); this.handlers.get(event)!.add(handler) }
    off(event: string, handler: (...args: any[]) => void) { this.handlers.get(event)?.delete(handler) }
    emit(event: string) { this.handlers.get(event)?.forEach(handler => handler()) }
    isStyleLoaded() { return true }
    getSource(id: string) { return this.sources.get(id) }
    addSource(id: string, source: any) { this.sources.set(id, source) }
    removeSource(id: string) { this.sources.delete(id) }
    getLayer(id: string) { return this.layers.get(id) }
    addLayer(layer: any) { this.layers.set(layer.id, layer) }
    removeLayer(id: string) { this.layers.delete(id) }
  },
  LngLatBounds: class { points: any[] = []; extend(point: any) { this.points.push(point); return this } },
  Marker: class {
    options: any; coordinates: any; remove = vi.fn()
    constructor(options: any) { this.options = options; mocks.markers.push(this) }
    setLngLat(point: any) { this.coordinates = point; return this }
    addTo() { return this }
  },
} }))

const configuration = { normalCheckpointCount: 2, checkpointPositions: [{ checkpointNumber: 1, name: 'Snapshot museum', latitude: 46, longitude: 23, radiusMeters: 5 }, { checkpointNumber: 2, name: 'Snapshot library', latitude: 47, longitude: 24, radiusMeters: 30 }], finishPoint: { name: 'Snapshot finish', latitude: 48, longitude: 25, radiusMeters: 17 } }
const savedHunt = {
  id: 'old-hunt', organizationId: 'org', name: 'Saved school Hunt', status: 'draft', templateKey: 'trail', templateVersion: 1,
  templateSnapshot: { key: 'trail', version: 1, displayName: 'Original trail', theme: 'History', configuration },
  country: 'Romania', city: 'Cluj Napoca', startDate: '2026-10-10', startTime: '10:00', timezone: 'Europe/Bucharest', durationMinutes: 90, capacity: 24, contactName: 'Ana',
  format: 'team', teamSize: 4, accessMode: 'invitation_only', difficulty: 'easy', checkpointOrder: 'recommended', accessCode: null,
} as Hunt
const catalog = [{ key: 'trail', version: 7, displayName: 'New approved trail', theme: 'Science' }, { key: 'other', version: 3, displayName: 'Another approved trail', theme: 'Art' }]
const options = { formats: [{ key: 'team', label: 'Team Hunters' }], teamSizes: [4], accessModes: [{ key: 'invitation_only', label: 'Invitation-only' }], difficulties: [{ key: 'easy', label: 'Easy' }], checkpointOrders: [{ key: 'recommended', label: 'Recommended route' }] }
const directions = { code: 'Ok', waypoints: [{}, {}, {}], routes: [{ geometry: { type: 'LineString', coordinates: [[23, 46], [24, 47], [25, 48]] }, legs: [{}, {}], distance: 1450, duration: 900 }] }
let container: HTMLDivElement, root: Root
beforeEach(() => {
  vi.clearAllMocks(); mocks.maps.length = 0; mocks.markers.length = 0
  mocks.get.mockReset().mockResolvedValue(structuredClone(savedHunt)); mocks.catalog.mockReset().mockResolvedValue(catalog)
  mocks.options.mockResolvedValue(options); mocks.organizations.mockResolvedValue([{ id: 'org', name: 'School' }]); mocks.rewards.mockResolvedValue({ leaderboard: [], specialAwards: [] })
  mocks.publish.mockReset().mockResolvedValue({ ...savedHunt, status: 'published' })
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true); vi.stubEnv('VITE_MAPBOX_ACCESS_TOKEN', 'test-token')
  vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} })
  vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(directions))))
  container = document.createElement('div'); document.body.append(container); root = createRoot(container)
})
afterEach(() => { act(() => root.unmount()); container.remove(); vi.unstubAllGlobals(); vi.unstubAllEnvs() })
async function render(element: React.ReactNode) { await act(async () => root.render(element)) }
async function click(label: string) {
  const button = [...container.querySelectorAll('button')].find(item => item.textContent === label)
  expect(button, label).toBeDefined(); await act(async () => button!.click())
}
async function choose(select: HTMLSelectElement, value: string) { await act(async () => { select.value = value; select.dispatchEvent(new Event('change', { bubbles: true })) }) }
function noMutation() { for (const action of [mocks.create, mocks.update, mocks.publish, mocks.access]) expect(action).not.toHaveBeenCalled() }
async function editor(path = '/organizer/hunts/old-hunt/setup') {
  await render(<MemoryRouter initialEntries={[path]}><Routes><Route path="/organizer/hunts/:huntId/setup" element={<CustomHuntEditorPage />} /><Route path="/organizer/hunts/new/setup" element={<CustomHuntEditorPage />} /></Routes></MemoryRouter>)
}

test('approved catalog browsing preserves exact identity and does not select or create a Hunt; missing content is explicit', async () => {
  // Even unexpected extra content is not an established approved-version contract.
  mocks.catalog.mockResolvedValue(catalog.map(item => ({ ...item, configuration })))
  await editor('/organizer/hunts/new/setup'); await click('4. Mission template & story')
  const selection = [...container.querySelectorAll('select')].find(item => item.closest('label')?.textContent?.startsWith('Competition template'))!
  const browsing = container.querySelector<HTMLSelectElement>('[aria-label="Approved Template geography inspection"] select')!
  expect(selection.value).toBe(''); await choose(browsing, 'other'); await click('Inspect Hunt geography')
  expect(container.textContent).toContain('Approved Template: Another approved trail · other · Version 3')
  expect(container.textContent).toContain('approved catalog provides names and versions only')
  expect(selection.value).toBe(''); expect(mocks.maps).toHaveLength(0); expect(fetch).not.toHaveBeenCalled(); noMutation()
  await click('Close geography inspection'); await choose(browsing, 'trail')
  expect(container.textContent).toContain('Approved Template: New approved trail · trail · Version 7')
  expect(container.querySelector('[aria-expanded]')!.getAttribute('aria-expanded')).toBe('false')
  await choose(selection, 'trail')
  expect(selection.value).toBe('trail'); expect(container.textContent).toContain('Science')
  expect([...container.querySelectorAll('button')].find(item => item.textContent === 'Complete General Setup')!.disabled).toBe(false)
  noMutation()
})

test('existing Hunt review refreshes from GET and uses its snapshot, never newer catalog geography', async () => {
  const refreshed = structuredClone(savedHunt)
  refreshed.templateSnapshot!.configuration = { ...configuration, checkpointPositions: [{ ...configuration.checkpointPositions[0], name: 'Persisted refresh', latitude: 45 }, configuration.checkpointPositions[1]] }
  mocks.get.mockResolvedValueOnce(savedHunt).mockResolvedValueOnce(refreshed)
  await editor(); expect(mocks.maps).toHaveLength(0)
  await click('Review saved Hunt'); expect(mocks.get.mock.calls).toEqual([['old-hunt'], ['old-hunt']])
  await click('Inspect Hunt geography')
  expect(container.textContent).toContain('Persisted Template snapshot · trail · Version 1')
  expect(container.textContent).toContain('Original trail'); expect(container.textContent).not.toContain('New approved trail')
  expect(container.textContent).toContain('Persisted refresh'); expect(mocks.markers.map(item => item.coordinates)).toEqual([[23, 45], [24, 47], [25, 48]])
  expect(container.textContent).toContain('Pilot configuration'); expect(container.textContent).toContain('No rewards configured')
  expect([...container.querySelectorAll('button')].find(item => item.textContent === 'Publish Hunt')!.disabled).toBe(false)
  noMutation(); expect(fetch).not.toHaveBeenCalled()
  await click('Close geography inspection'); await click('Publish Hunt')
  expect(mocks.publish).toHaveBeenCalledExactlyOnceWith('old-hunt'); expect(container.textContent).toContain('Hunt published')
})

test('explicit Template save remains separate from browsing and review uses the backend selection snapshot', async () => {
  const selectedHunt = { ...savedHunt, templateKey: 'other', templateVersion: 3, templateSnapshot: { ...savedHunt.templateSnapshot!, key: 'other', version: 3, displayName: 'Backend selected content' } }
  mocks.update.mockResolvedValue(selectedHunt)
  await editor(); await click('4. Mission template & story')
  const selection = [...container.querySelectorAll('select')].find(item => item.closest('label')?.textContent?.startsWith('Competition template'))!
  const browsing = container.querySelector<HTMLSelectElement>('[aria-label="Approved Template geography inspection"] select')!
  await choose(selection, 'other'); await choose(browsing, 'trail'); await click('Inspect Hunt geography'); noMutation()
  await choose(browsing, 'other')
  expect(container.querySelector('[aria-expanded]')!.getAttribute('aria-expanded')).toBe('false')
  await click('Complete General Setup')
  expect(mocks.update).toHaveBeenCalledExactlyOnceWith('old-hunt', { templateKey: 'other' }); expect(mocks.create).not.toHaveBeenCalled()
  mocks.get.mockResolvedValue(selectedHunt); await click('Review saved Hunt'); await click('Inspect Hunt geography')
  expect(container.textContent).toContain('Persisted Template snapshot · other · Version 3')
  expect(container.textContent).toContain('Backend selected content'); expect(container.textContent).toContain('Snapshot finish')
})

test.each(['empty', 'error'])('approved catalog %s state retains the existing selection feedback', async mode => {
  if (mode === 'empty') mocks.catalog.mockResolvedValue([])
  else mocks.catalog.mockRejectedValue(new Error('Catalog unavailable'))
  await editor('/organizer/hunts/new/setup'); await click('4. Mission template & story')
  expect(container.textContent).toContain(mode === 'empty' ? 'No approved Competition Templates' : "We couldn't load Hunt templates")
  expect(container.querySelector('[aria-label="Approved Template geography inspection"]')).toBeNull()
  expect([...container.querySelectorAll('button')].find(item => item.textContent === 'Complete General Setup')!.disabled).toBe(true)
  noMutation(); expect(mocks.maps).toHaveLength(0)
})

test('legacy snapshot contract warning does not block saved review or Publish readiness', async () => {
  mocks.get.mockResolvedValue({ ...savedHunt, templateSnapshot: { ...savedHunt.templateSnapshot!, configuration: undefined, checkpointNames: ['Legacy checkpoint'] } })
  await editor(); await click('Review saved Hunt'); await click('Inspect Hunt geography')
  expect(container.textContent).toContain('does not expose geographic configuration'); expect(container.textContent).toContain('Checkpoint names')
  expect([...container.querySelectorAll('button')].find(item => item.textContent === 'Publish Hunt')!.disabled).toBe(false)
  expect(mocks.maps).toHaveLength(0); noMutation()
})

test('published Hunt retains participant-access actions while inspection uses the same persisted snapshot', async () => {
  mocks.get.mockResolvedValue({ ...savedHunt, status: 'published' })
  await editor(); await click('Review saved Hunt'); await click('Inspect Hunt geography')
  expect(container.textContent).toContain('Hunt published'); expect(container.textContent).toContain('Create participant access')
  expect(container.textContent).toContain('Snapshot museum'); noMutation()
})

test('saved snapshot displays CP1..CPn then separate terminal FinishPoint with exact names, positions and radii read-only', async () => {
  const before = structuredClone(savedHunt)
  await render(<HuntSnapshotGeographyInspection hunt={savedHunt} />); expect(mocks.maps).toHaveLength(0)
  await click('Inspect Hunt geography')
  expect([...container.querySelectorAll('[aria-label="Ordered Hunt journey"] li')].map(item => item.textContent)).toEqual(['CP1', '→ CP2', '→ FinishPoint'])
  expect(container.textContent).not.toContain('CP3'); expect(container.textContent).toContain('Terminal stop')
  for (const stop of [...configuration.checkpointPositions, configuration.finishPoint]) {
    expect(container.textContent).toContain(stop.name); expect(container.textContent).toContain(`Coordinates: ${stop.latitude}, ${stop.longitude}`); expect(container.textContent).toContain(`Discovery radius: ${stop.radiusMeters} m`)
  }
  const map = mocks.maps[0]
  expect(map.sources.get('tedix-route-overview').data.geometry.coordinates).toEqual([[23, 46], [24, 47], [25, 48]])
  expect(map.sources.get('tedix-checkpoint-radii').data.features).toHaveLength(2)
  expect(map.sources.has('tedix-finishpoint-radius')).toBe(true)
  expect(map.handlers.has('click')).toBe(false); expect(mocks.markers.every(item => item.options.draggable === undefined)).toBe(true)
  expect(container.querySelectorAll('input, select, textarea')).toHaveLength(0)
  expect(savedHunt).toEqual(before); expect(fetch).not.toHaveBeenCalled(); noMutation()
})

test.each([null, { ...savedHunt.templateSnapshot, configuration: undefined }, { ...savedHunt.templateSnapshot, configuration: null }, { ...savedHunt.templateSnapshot, configuration: [] }, { ...savedHunt.templateSnapshot, configuration: 'unavailable' }])('missing snapshot contract or legacy content never substitutes catalog geography: %j', async snapshot => {
  await render(<HuntSnapshotGeographyInspection hunt={{ ...savedHunt, templateSnapshot: snapshot } as Hunt} />)
  await click('Inspect Hunt geography'); expect(container.querySelector('[role="alert"]')).not.toBeNull()
  expect(mocks.maps).toHaveLength(0); expect(mocks.catalog).not.toHaveBeenCalled(); expect(fetch).not.toHaveBeenCalled(); noMutation()
})

test.each([{ ...savedHunt, templateVersion: 7 }, { ...savedHunt, templateKey: 'other' }, { ...savedHunt, templateVersion: null }])('mismatched snapshot identity blocks inspection without repair', async hunt => {
  await render(<HuntSnapshotGeographyInspection hunt={hunt} />); await click('Inspect Hunt geography')
  expect(container.textContent).toContain('snapshot identity does not match'); expect(mocks.maps).toHaveLength(0); noMutation()
})

test.each([{}, { ...configuration, finishPoint: undefined }, { ...configuration, checkpointPositions: [...configuration.checkpointPositions].reverse() }, { ...configuration, checkpointPositions: [{ ...configuration.checkpointPositions[0], latitude: 91 }, configuration.checkpointPositions[1]] }])('invalid snapshot geography uses G3 validation without sorting or fabricated values', async value => {
  await render(<HuntSnapshotGeographyInspection hunt={{ ...savedHunt, templateSnapshot: { ...savedHunt.templateSnapshot!, configuration: value } }} />)
  await click('Inspect Hunt geography'); expect(container.textContent).toContain('Persisted Hunt snapshot geography is missing or invalid')
  expect(mocks.maps).toHaveLength(0); expect(fetch).not.toHaveBeenCalled(); noMutation()
})

test('details screen loads exact Hunt data independently of simulated monitor locations and preserves actions', async () => {
  await render(<MemoryRouter initialEntries={['/organizer/hunts/old-hunt']}><Routes><Route path="/organizer/hunts/:huntId" element={<OrganizerMonitorPage />} /></Routes></MemoryRouter>)
  expect(mocks.get).toHaveBeenCalledExactlyOnceWith('old-hunt'); expect(mocks.catalog).not.toHaveBeenCalled()
  await click('Inspect Hunt geography')
  const preview = container.querySelector('[aria-label="Hunt geography preview"]')!
  expect(preview.textContent).toContain('Snapshot museum'); expect(preview.textContent).not.toContain('Matthias Rex Statue')
  await click('Pause Hunt'); expect(container.textContent).toContain('Resume Hunt'); noMutation()
})

test('detail geography loading, failure and retry never block existing actions', async () => {
  let reject!: (error: Error) => void
  mocks.get.mockImplementationOnce(() => new Promise((_, fail) => { reject = fail }))
  await render(<MemoryRouter initialEntries={['/organizer/hunts/old-hunt']}><Routes><Route path="/organizer/hunts/:huntId" element={<OrganizerMonitorPage />} /></Routes></MemoryRouter>)
  expect(container.textContent).toContain('Loading saved Hunt geography'); await click('Pause Hunt')
  await act(async () => reject(new Error('Unavailable')))
  expect(container.textContent).toContain('couldn’t load the saved Hunt geography'); expect(container.textContent).toContain('Resume Hunt')
  await click('Retry geography'); await click('Inspect Hunt geography'); expect(container.textContent).toContain('Snapshot finish'); noMutation()
})

test('obsolete Hunt detail responses cannot populate another Hunt or an unmounted inspection', async () => {
  let resolve!: (hunt: Hunt) => void
  mocks.get.mockImplementationOnce(() => new Promise(done => { resolve = done })).mockResolvedValueOnce({ ...savedHunt, id: 'new-hunt', templateSnapshot: null })
  await render(<OrganizerHuntGeographyInspection huntId="old-hunt" />)
  await render(<OrganizerHuntGeographyInspection huntId="new-hunt" />)
  await act(async () => resolve(savedHunt)); await click('Inspect Hunt geography')
  expect(container.textContent).toContain('no persisted Template snapshot'); expect(mocks.maps).toHaveLength(0); expect(mocks.catalog).not.toHaveBeenCalled()
})

test('wrong Hunt response is unavailable and never renders another Hunt snapshot', async () => {
  mocks.get.mockResolvedValue({ ...savedHunt, id: 'different-hunt' })
  await render(<OrganizerHuntGeographyInspection huntId="old-hunt" />)
  expect(container.textContent).toContain('returned Hunt does not match'); expect(mocks.maps).toHaveLength(0)
})

test('walking estimate is explicit; closing removes resources and reopening starts without metrics', async () => {
  await render(<HuntSnapshotGeographyInspection hunt={savedHunt} />); await click('Inspect Hunt geography')
  expect(fetch).not.toHaveBeenCalled(); await click('Estimate walking route')
  expect(vi.mocked(fetch).mock.calls[0][0]).toContain('/mapbox/walking/23,46;24,47;25,48')
  expect(container.textContent).toContain('1.4 km'); expect(container.textContent).toContain('15 min')
  const map = mocks.maps[0]; await click('Close geography inspection')
  expect(map.remove).toHaveBeenCalledOnce(); expect(mocks.markers.every(item => item.remove.mock.calls.length === 1)).toBe(true)
  await click('Inspect Hunt geography'); expect(mocks.maps).toHaveLength(2); expect(container.querySelector('dl')).toBeNull(); noMutation()
})

test('closing pending directions aborts requests and late results do not affect reopened snapshots', async () => {
  let resolve!: (response: Response) => void
  vi.mocked(fetch).mockImplementationOnce(() => new Promise(done => { resolve = done }))
  await render(<HuntSnapshotGeographyInspection hunt={savedHunt} />); await click('Inspect Hunt geography'); await click('Estimate walking route')
  const signal = vi.mocked(fetch).mock.calls[0][1]!.signal!
  await click('Close geography inspection'); expect(signal.aborted).toBe(true); await click('Inspect Hunt geography')
  await act(async () => resolve(new Response(JSON.stringify(directions))))
  expect(container.querySelector('dl')).toBeNull(); expect(mocks.maps[1].sources.has('tedix-walking-route')).toBe(false); noMutation()
})

test.each(['missing token', 'network failure', 'invalid metrics'])('snapshot %s preserves saved details and never invents walking metrics', async mode => {
  if (mode === 'missing token') vi.stubEnv('VITE_MAPBOX_ACCESS_TOKEN', '')
  else if (mode === 'network failure') vi.mocked(fetch).mockRejectedValue(new Error('Offline'))
  else vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ ...directions, routes: [{ ...directions.routes[0], duration: -1 }] })))
  await render(<HuntSnapshotGeographyInspection hunt={savedHunt} />); await click('Inspect Hunt geography'); await click('Estimate walking route')
  expect(container.textContent).toContain('Snapshot museum'); expect(container.querySelector('[role="alert"]')).not.toBeNull(); expect(container.querySelector('dl')).toBeNull()
  if (mode === 'missing token') { expect(mocks.maps).toHaveLength(0); expect(fetch).not.toHaveBeenCalled() }
  else expect(mocks.maps[0].sources.has('tedix-walking-route')).toBe(false)
  noMutation()
})
