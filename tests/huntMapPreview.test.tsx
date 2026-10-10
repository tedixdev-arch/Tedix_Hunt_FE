import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, afterEach, test, expect, vi } from 'vitest'
import { HuntMapInspection } from '../src/components/HuntMapPreview'
import { AdminTemplateReviewDetailPage } from '../src/pages/AdminTemplateReviews'

const mocks = vi.hoisted(() => ({ maps: [] as any[], markers: [] as any[], get: vi.fn(), approve: vi.fn(), requestChanges: vi.fn() }))
vi.mock('../src/pages/AdminConsole.tsx', () => ({ AdminShell: ({ children }: any) => <main>{children}</main> }))
vi.mock('../src/services/api/index.ts', () => ({ adminTemplateReviewsApi: { get: mocks.get, approve: mocks.approve, requestChanges: mocks.requestChanges } }))
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
const configuration = { normalCheckpointCount: 2, checkpointPositions: [{ checkpointNumber: 1, name: 'Submitted museum', latitude: 46, longitude: 23, radiusMeters: 30 }, { checkpointNumber: 2, name: 'Submitted library', latitude: 47, longitude: 24, radiusMeters: 50 }], finishPoint: { name: 'Submitted wall', latitude: 48, longitude: 25, radiusMeters: 17 } }
const review = { key: 'exact', version: 4, status: 'submitted', origin: 'creator', creator: { name: 'Ada', email: 'ada@test' }, content: { key: 'exact', version: 4, displayName: 'Exact Template', configuration, checkpoints: [], scoring: {} } }
const response = { code: 'Ok', waypoints: [{}, {}, {}], routes: [{ geometry: { type: 'LineString', coordinates: [[23, 46], [24, 47], [25, 48]] }, legs: [{}, {}], distance: 1450, duration: 900 }] }
let root: Root, container: HTMLDivElement
beforeEach(() => {
  mocks.maps.length = 0; mocks.markers.length = 0; mocks.get.mockReset().mockResolvedValue(review); mocks.approve.mockReset().mockResolvedValue({ ...review, status: 'approved' }); mocks.requestChanges.mockReset().mockResolvedValue({ ...review, status: 'changes_requested' })
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true); vi.stubEnv('VITE_MAPBOX_ACCESS_TOKEN', 'test-token')
  vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} })
  vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(response))))
  container = document.createElement('div'); document.body.append(container); root = createRoot(container)
})
afterEach(() => { act(() => root.unmount()); container.remove(); vi.unstubAllGlobals(); vi.unstubAllEnvs() })
async function render(value: Record<string, unknown> = configuration) { await act(async () => root.render(<HuntMapInspection configuration={value} />)) }
async function action(text: string) { const button = [...container.querySelectorAll('button')].find(button => button.textContent === text)!; expect(button).toBeDefined(); await act(async () => button.click()) }
async function admin() { await act(async () => root.render(<MemoryRouter initialEntries={['/admin/reviews/exact']}><Routes><Route path="/admin/reviews/:key" element={<AdminTemplateReviewDetailPage />} /></Routes></MemoryRouter>)) }

test('on-demand map shows ordered stops, radii and dashed overview; close removes resources and reopen works', async () => {
  const before = structuredClone(configuration)
  await render(); expect(mocks.maps).toHaveLength(0); expect(fetch).not.toHaveBeenCalled()
  expect(container.querySelector('button')!.getAttribute('aria-expanded')).toBe('false')
  await action('Inspect Hunt geography')
  expect(mocks.maps).toHaveLength(1)
  expect([...container.querySelectorAll('[aria-label="Ordered Hunt journey"] li')].map(el => el.textContent)).toEqual(['CP1', '→ CP2', '→ FinishPoint'])
  expect(container.textContent).toContain('Terminal stop'); expect(container.textContent).not.toContain('CP3')
  for (const point of [...configuration.checkpointPositions, configuration.finishPoint]) {
    expect(container.textContent).toContain(point.name); expect(container.textContent).toContain(`Coordinates: ${point.latitude}, ${point.longitude}`); expect(container.textContent).toContain(`Discovery radius: ${point.radiusMeters} m`)
  }
  const map = mocks.maps[0]
  expect(map.sources.get('tedix-route-overview').data.geometry.coordinates).toEqual([[23, 46], [24, 47], [25, 48]])
  expect(map.layers.get('tedix-route-overview').paint['line-dasharray']).toEqual([2, 2])
  expect(map.fitBounds.mock.calls[0][0].points).toEqual([[23, 46], [24, 47], [25, 48]])
  expect(map.handlers.has('click')).toBe(false); expect(container.querySelector('input')).toBeNull()
  expect(mocks.markers.every(marker => marker.options.draggable === undefined)).toBe(true)
  expect(fetch).not.toHaveBeenCalled()
  await action('Close geography inspection'); expect(map.remove).toHaveBeenCalledOnce(); expect(mocks.markers.every(marker => marker.remove.mock.calls.length === 1)).toBe(true)
  await action('Inspect Hunt geography'); expect(mocks.maps).toHaveLength(2)
  expect(configuration).toEqual(before)
})

test('Admin uses the exact review GET artifact, never fetches a draft, and inspection has no decision side effects', async () => {
  await admin(); expect(mocks.get).toHaveBeenCalledExactlyOnceWith('exact'); expect(mocks.maps).toHaveLength(0)
  await action('Inspect Hunt geography')
  expect(mocks.markers.map(marker => marker.coordinates)).toEqual([[23, 46], [24, 47], [25, 48]])
  expect(container.textContent).toContain('Submitted version 4'); expect(fetch).not.toHaveBeenCalled()
  await action('Close geography inspection'); expect(mocks.approve).not.toHaveBeenCalled(); expect(mocks.requestChanges).not.toHaveBeenCalled()
  expect(container.textContent).toContain('Submitted checkpoint and challenge content')
  expect(container.querySelector('[aria-label="Hunt geography preview"]')).toBeNull()
})

test.each(['Approve template', 'Request changes'])('preserves explicit %s and backend decision authority', async label => {
  await admin(); await action('Inspect Hunt geography')
  if (label === 'Approve template') await act(async () => { container.querySelectorAll<HTMLInputElement>('input[type="checkbox"]').forEach(input => input.click()) })
  await action(label)
  expect(label === 'Approve template' ? mocks.approve : mocks.requestChanges).toHaveBeenCalledExactlyOnceWith('exact')
  expect(container.textContent).toContain('Decision recorded by backend'); expect(mocks.maps[0].remove).toHaveBeenCalledOnce()
})

test('review loading errors and retry remain authoritative; failed decisions preserve inspection and notes', async () => {
  mocks.get.mockRejectedValueOnce(new Error('Review unavailable'))
  await admin()
  expect(container.textContent).toContain('Review unavailable'); expect(mocks.maps).toHaveLength(0)
  await action('Retry'); await action('Inspect Hunt geography')
  mocks.requestChanges.mockRejectedValueOnce(new Error('Decision unavailable'))
  await action('Request changes')
  expect(container.textContent).toContain('Decision unavailable')
  expect(container.textContent).toContain('Submitted configuration')
  expect(mocks.maps[0].remove).not.toHaveBeenCalled()
  expect(mocks.approve).not.toHaveBeenCalled()
})

test('malformed submitted positions do not crash the existing review or substitute geography', async () => {
  mocks.get.mockResolvedValue({ ...review, content: { ...review.content, configuration: { ...configuration, checkpointPositions: [null] } } })
  await admin(); await action('Inspect Hunt geography')
  expect(container.textContent).toContain('Submitted-version geography is missing or invalid')
  expect(mocks.maps).toHaveLength(0); expect(fetch).not.toHaveBeenCalled()
})

test('nested invalid coordinate values remain inspectable as raw submitted content', async () => {
  mocks.get.mockResolvedValue({ ...review, content: { ...review.content, configuration: { ...configuration, checkpointPositions: [{ ...configuration.checkpointPositions[0], latitude: { invalid: 'raw coordinate' } }] } } })
  await admin(); await action('Inspect Hunt geography')
  expect(container.textContent).toContain('raw coordinate')
  expect(container.textContent).toContain('Submitted-version geography is missing or invalid')
  expect(mocks.maps).toHaveLength(0)
})

test.each([{}, { ...configuration, finishPoint: undefined }, { ...configuration, checkpointPositions: [null] }])('missing, invalid and legacy geography warn without mounting or requesting routes', async value => {
  await render(value); await action('Inspect Hunt geography')
  expect(container.querySelector('[role="alert"]')?.textContent).toContain('missing or invalid'); expect(mocks.maps).toHaveLength(0); expect(fetch).not.toHaveBeenCalled()
})

test('missing token retains details, avoids initialization and produces no invented estimate', async () => {
  vi.stubEnv('VITE_MAPBOX_ACCESS_TOKEN', '')
  await render(); await action('Inspect Hunt geography'); expect(mocks.maps).toHaveLength(0)
  expect(container.textContent).toContain('Configure VITE_MAPBOX_ACCESS_TOKEN'); expect(container.textContent).toContain('Submitted wall')
  await action('Estimate walking route'); expect(fetch).not.toHaveBeenCalled(); expect(container.querySelector('dl')).toBeNull()
})

test('walking estimates are explicit and temporary, with full CP-to-FinishPoint routing and safety distinction', async () => {
  await render(); await action('Inspect Hunt geography'); expect(fetch).not.toHaveBeenCalled()
  await action('Estimate walking route'); expect(fetch).toHaveBeenCalledOnce()
  expect(vi.mocked(fetch).mock.calls[0][0]).toContain('/mapbox/walking/23,46;24,47;25,48')
  expect(container.textContent).toContain('1.4 km'); expect(container.textContent).toContain('15 min'); expect(container.textContent).toContain('Human verification of safety and accessibility')
  await action('Close geography inspection'); await action('Inspect Hunt geography'); expect(container.querySelector('dl')).toBeNull()
})

test.each(['network', 'no route', 'malformed'])('walking %s failure shows no metrics or fabricated geometry', async mode => {
  if (mode === 'network') vi.mocked(fetch).mockRejectedValue(new Error('offline'))
  else vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify(mode === 'no route' ? { code: 'NoRoute' } : { ...response, routes: [{ ...response.routes[0], distance: '1450' }] })))
  await render(); await action('Inspect Hunt geography'); await action('Estimate walking route')
  expect(container.querySelector('[role="alert"]')).not.toBeNull(); expect(container.querySelector('dl')).toBeNull()
  expect(mocks.maps[0].sources.has('tedix-walking-route')).toBe(false)
})

test('close aborts pending directions and late responses cannot populate a reopened inspection', async () => {
  let resolve!: (value: Response) => void
  vi.mocked(fetch).mockImplementationOnce(() => new Promise(done => { resolve = done }))
  await render(); await action('Inspect Hunt geography'); await action('Estimate walking route')
  const signal = vi.mocked(fetch).mock.calls[0][1]!.signal!
  await action('Close geography inspection'); expect(signal.aborted).toBe(true)
  await action('Inspect Hunt geography'); await act(async () => resolve(new Response(JSON.stringify(response))))
  expect(container.querySelector('dl')).toBeNull()
})

test('map loading and provider failures remain visible alongside mobile-friendly stop details', async () => {
  await render(); await action('Inspect Hunt geography')
  expect(container.textContent).toContain('Loading map…')
  act(() => mocks.maps[0].emit('error')); expect(container.querySelector('[role="alert"]')?.textContent).toContain('token and network')
  expect(container.textContent).toContain('Submitted library')
  expect(container.querySelector('[aria-label="Hunt geography preview"]')!.classList.contains('min-w-0')).toBe(true)
  expect(container.querySelector('[aria-label="Ordered Hunt journey"]')!.classList.contains('flex-wrap')).toBe(true)
  act(() => mocks.maps[0].emit('load')); expect(container.querySelector('[role="alert"]')).toBeNull()
})
