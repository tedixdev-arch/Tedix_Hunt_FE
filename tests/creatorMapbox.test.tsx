import { signalClujRouteProposal } from './fixtures/signalClujRouteProposal'
import { candidateReference, readRouteProposal, type RouteProposal } from '../src/features/creator/routeResearch'
import { act, useState } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { RouteEditor } from '../src/features/creator/RouteEditor'
import { checkpointRadius, TedixMap } from '../src/components/TedixMap'
import { createFinishPointDraft, type FinishPointDraft } from '../src/features/creator/finishPoint'
import { createCheckpointDrafts, type CheckpointDraft } from '../src/features/creator/checkpointGeography'

const mocks = vi.hoisted(() => ({ maps: [] as any[], markers: [] as any[], configuration: vi.fn() }))
vi.mock('mapbox-gl', () => ({ default: {
  LngLatBounds: class { coordinates: number[][] = []; extend(point: number[]) { this.coordinates.push(point); return this } },
  Map: class {
    handlers = new Map<string, Set<(...args: any[]) => void>>()
    sources = new Map<string, any>()
    layers = new Map<string, any>()
    flyTo = vi.fn()
    fitBounds = vi.fn()
    project = vi.fn(([longitude, latitude]: number[]) => ({ x: longitude * 100000, y: latitude * 100000 }))
    remove = vi.fn()
    resize = vi.fn()
    constructor(public options: any) { mocks.maps.push(this) }
    on(event: string, handler: (...args: any[]) => void) {
      if (!this.handlers.has(event)) this.handlers.set(event, new Set())
      this.handlers.get(event)!.add(handler)
    }
    off(event: string, handler: (...args: any[]) => void) { this.handlers.get(event)?.delete(handler) }
    emit(event: string, payload?: unknown) { this.handlers.get(event)?.forEach(handler => handler(payload)) }
    isStyleLoaded() { return true }
    getSource(id: string) { return this.sources.get(id) }
    addSource(id: string, source: unknown) { this.sources.set(id, source) }
    removeSource(id: string) { this.sources.delete(id) }
    getLayer(id: string) { return this.layers.get(id) }
    addLayer(layer: any) { this.layers.set(layer.id, layer) }
    removeLayer(id: string) { this.layers.delete(id) }
  },
  Marker: class {
    element: HTMLElement
    coordinates?: number[]
    handlers = new Map<string, () => void>()
    on(event: string, handler: () => void) { this.handlers.set(event, handler); return this }
    getLngLat() { return { lat: this.coordinates![1], lng: this.coordinates![0] } }
    constructor(public options: { element: HTMLElement; draggable?: boolean }) { this.element = options.element; mocks.markers.push(this) }
    setOffset = vi.fn()
    setLngLat(coordinates: number[]) { this.coordinates = coordinates; return this }
    addTo() { document.body.append(this.element); return this }
    remove() { this.element.remove() }
  },
} }))

let container: HTMLDivElement
let root: Root
let templateName: string | undefined
let proposal: RouteProposal | undefined
let initial: CheckpointDraft[]
let finishInitial: FinishPointDraft | undefined
let latestFinish: FinishPointDraft | undefined
let latestVerified: Set<number>
let latest: CheckpointDraft[]
const saved = { checkpointNumber: 1, name: 'Museum', latitude: 46.77, longitude: 23.59, radiusMeters: 30 }

function Editor() {
  const [drafts, setDrafts] = useState(initial)
  const [verified, setVerified] = useState(new Set<number>())
  const [safety, setSafety] = useState(new Set<string>())
  const [finish, setFinish] = useState(finishInitial)
  latestFinish = finish
  latestVerified = verified
  latest = drafts
  return <RouteEditor templateName={templateName} savedConfiguration={{ normalCheckpointCount: initial.length, checkpointPositions: initial.filter(point => point.latitude !== undefined) as typeof saved[], finishPoint: undefined }} finishDraft={finish} onFinishChange={finishInitial ? setFinish : undefined} proposal={proposal} drafts={drafts} verified={verified} safety={safety} onDraftsChange={setDrafts}
    onVerifiedChange={setVerified} onSafetyChange={setSafety} onConfigurationChange={mocks.configuration} />
}

beforeEach(() => {
  mocks.maps.length = 0; mocks.markers.length = 0; mocks.configuration.mockReset()
  vi.stubEnv('VITE_MAPBOX_ACCESS_TOKEN', 'test-public-token')
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} })
  finishInitial = undefined
  templateName = undefined
  proposal = undefined
  initial = [{ ...saved }, createCheckpointDrafts(2, ['Museum', 'Park'])[1]]
  container = document.createElement('div'); document.body.append(container); root = createRoot(container)
})
afterEach(() => {
  act(() => root.unmount()); container.remove()
  vi.useRealTimers(); vi.unstubAllEnvs(); vi.unstubAllGlobals()
})
function render() { act(() => root.render(<Editor />)) }
function clickMap(latitude: number, longitude: number) {
  act(() => mocks.maps[0].emit('click', { lngLat: { lat: latitude, lng: longitude } }))
}

test.each([5, 30, 500])('radius polygon lies %sm from the checkpoint at different latitudes', radiusMeters => {
  for (const latitude of [0, 46.77, 80]) {
    const polygon = checkpointRadius({ ...saved, latitude, radiusMeters })
    const ring = polygon.geometry.coordinates[0]
    expect(ring).toHaveLength(65)
    expect(ring[0][0]).toBeCloseTo(ring.at(-1)![0], 10)
    expect(ring[0][1]).toBeCloseTo(ring.at(-1)![1], 10)
    for (const [lng, lat] of ring) {
      const toRadians = Math.PI / 180
      const a = Math.sin((lat - latitude) * toRadians / 2) ** 2
        + Math.cos(latitude * toRadians) * Math.cos(lat * toRadians) * Math.sin((lng - saved.longitude) * toRadians / 2) ** 2
      expect(6371008.8 * 2 * Math.asin(Math.sqrt(a))).toBeCloseTo(radiusMeters, 5)
    }
  }
})

test('walking geometry draws on shared map, fits route, survives style reload and is removed when stale', () => {
  const geometry = { type: 'LineString' as const, coordinates: [[23.59, 46.77], [23.64, 46.78]] }
  act(() => root.render(<TedixMap initialLatitude={46.77} initialLongitude={23.59} walkingRoute={geometry} />))
  const map = mocks.maps[0]
  expect(map.sources.get('tedix-walking-route').data.geometry).toEqual(geometry)
  expect(map.layers.get('tedix-walking-route').type).toBe('line')
  expect(map.fitBounds).toHaveBeenCalledOnce()
  map.sources.clear(); map.layers.clear()
  act(() => map.emit('style.load'))
  expect(map.sources.get('tedix-walking-route').data.geometry).toEqual(geometry)
  act(() => root.render(<TedixMap initialLatitude={46.77} initialLongitude={23.59} />))
  expect(map.sources.has('tedix-walking-route')).toBe(false)
  expect(map.layers.has('tedix-walking-route')).toBe(false)
  expect(mocks.maps).toHaveLength(1)
})

test('read-only preview camera follows checkpoint destinations on the same Mapbox instance', () => {
  act(() => root.render(<TedixMap initialLatitude={46.77} initialLongitude={23.59} cameraTarget={{ latitude: 46.77, longitude: 23.59 }} />))
  const map = mocks.maps[0]
  expect(map.flyTo).toHaveBeenLastCalledWith({ center: [23.59, 46.77], zoom: 16 })
  act(() => root.render(<TedixMap initialLatitude={47} initialLongitude={24} cameraTarget={{ latitude: 47, longitude: 24 }} />))
  expect(map.flyTo).toHaveBeenLastCalledWith({ center: [24, 47], zoom: 16 })
  expect(mocks.maps).toHaveLength(1)
  expect(map.remove).not.toHaveBeenCalled()
})



const pins = () => mocks.markers.filter(marker => marker.element.isConnected)
const pin = (label: string) => pins().find(marker => marker.element.dataset.positionPin === label)!
function select(number: string) { act(() => container.querySelector<HTMLButtonElement>(`[data-checkpoint="${number}"]`)!.click()) }
function button(text: string) { return [...container.querySelectorAll('button')].find(button => button.textContent === text)! }
function signal() {
  proposal = readRouteProposal({ proposal: signalClujRouteProposal })
  initial = createCheckpointDrafts(6, [])
  finishInitial = { name: 'Finish', radiusMeters: 17 }
}
function advanceClick() { vi.spyOn(Date, 'now').mockReturnValue(Date.now() + 1000) }

test('one bottom-anchored numbered teardrop per checkpoint and terminal F, with display-only references', () => {
  signal(); render()
  expect(pins().map(marker => marker.element.dataset.positionPin)).toEqual(['1', '2', '3', '4', '5', '6', 'F'])
  expect(pins().every(marker => marker.options.anchor === 'bottom' && marker.element.querySelector('svg path'))).toBe(true)
  expect(pins().every(marker => !marker.element.className.includes('rounded-full'))).toBe(true)
  expect(latest.every(point => point.latitude === undefined)).toBe(true)
  expect(latestFinish!.latitude).toBeUndefined()
  expect(mocks.configuration).not.toHaveBeenCalled()
  expect(button('Confirm position').disabled).toBe(true)
  expect(mocks.maps[0].sources.size).toBe(0)
  expect(mocks.maps[0].layers.size).toBe(0)
})

test('selection is synchronized, suppresses bubbling placement, and only the selected point moves', () => {
  signal(); render()
  act(() => pin('2').element.click())
  expect(container.querySelector('[data-checkpoint="2"]')!.getAttribute('aria-pressed')).toBe('true')
  clickMap(47, 24)
  expect(latest.every(point => point.latitude === undefined)).toBe(true)
  advanceClick(); clickMap(47, 24)
  expect(latest[1]).toMatchObject({ latitude: 47, longitude: 24 })
  expect(latest.filter(point => point.latitude !== undefined)).toHaveLength(1)
  expect(pins()).toHaveLength(7)
  expect(pin('2').coordinates).toEqual([24, 47])
  select('3'); clickMap(48, 25)
  expect(latest[1]).toMatchObject({ latitude: 47, longitude: 24 })
  expect(latest[2]).toMatchObject({ latitude: 48, longitude: 25 })
  vi.restoreAllMocks()
})

test('selected pin drag places once, clears confirmation and suppresses its follow-up click', () => {
  render()
  act(() => button('Confirm position').click())
  const marker = pin('1')
  expect(marker.options.draggable).toBe(true)
  marker.coordinates = [24, 47]
  act(() => marker.handlers.get('dragend')!())
  clickMap(48, 25)
  act(() => pin('1').element.click())
  expect(latest[0]).toMatchObject({ latitude: 47, longitude: 24 })
  expect(latestVerified.has(1)).toBe(false)
  expect(mocks.configuration).toHaveBeenCalledOnce()
})

test('saved positions, custom labels and radii take precedence over research without duplicate pins', () => {
  signal(); initial[0] = { ...saved }; render()
  expect(pin('1').coordinates).toEqual([23.59, 46.77])
  expect(pin('1').element.getAttribute('aria-label')).toContain('Museum')
  expect(pins()).toHaveLength(7)
  expect(latest[0].radiusMeters).toBe(30)
  expect(mocks.configuration).not.toHaveBeenCalled()
})

test('Reset restores reference display, clears authored coordinates and confirmation, and preserves other content', () => {
  signal(); initial[0] = { ...saved }; initial[1] = { ...saved, checkpointNumber: 2 }; render()
  act(() => button('Confirm position').click())
  const original = structuredClone(latest[1])
  act(() => container.querySelector<HTMLButtonElement>('[aria-label="Reset checkpoint position"]')!.click())
  expect(latest[0]).toEqual({ checkpointNumber: 1, name: 'Museum', radiusMeters: 30, latitude: undefined, longitude: undefined })
  expect(latest[1]).toEqual(original)
  expect(latestVerified.has(1)).toBe(false)
  expect(pin('1').coordinates).not.toEqual([23.59, 46.77])
  expect(pin('1').element.getAttribute('aria-label')).toContain('Reference position')
  expect(mocks.configuration).toHaveBeenLastCalledWith({ normalCheckpointCount: 6, checkpointPositions: [original] })
  expect(button('Confirm position').disabled).toBe(true)
})

test('Reset without a research coordinate is disabled with an explanation', () => {
  render()
  const reset = container.querySelector<HTMLButtonElement>('[aria-label="Reset checkpoint position"]')!
  expect(reset.disabled).toBe(true)
  expect(reset.title).toContain('no researched reference coordinate')
})

test('FinishPoint placement, confirmation and Reset remain separate from normal checkpoints', () => {
  signal(); render(); select('F'); clickMap(47, 24)
  expect(latestFinish).toMatchObject({ latitude: 47, longitude: 24, radiusMeters: 17 })
  act(() => button('Confirm position').click())
  expect(pin('F').element.getAttribute('aria-label')).toContain('Creator-confirmed')
  act(() => container.querySelector<HTMLButtonElement>('[aria-label="Reset checkpoint position"]')!.click())
  expect(latestFinish).toEqual({ name: 'Finish', radiusMeters: 17, latitude: undefined, longitude: undefined })
  expect(pin('F').element.getAttribute('aria-label')).toContain('Reference position')
  expect(latest.every(point => point.latitude === undefined)).toBe(true)
  expect(mocks.configuration).not.toHaveBeenCalled()
})

test('camera fits references initially, remains stable after selection, move and confirmation, and fits only on request', () => {
  signal(); render()
  const map = mocks.maps[0]
  expect(map.fitBounds).toHaveBeenCalledOnce()
  expect(map.fitBounds.mock.calls[0][0].coordinates).toEqual(pins().map(marker => marker.coordinates))
  select('2'); clickMap(47, 24); act(() => button('Confirm position').click()); select('F')
  expect(map.fitBounds).toHaveBeenCalledOnce()
  expect(map.flyTo).not.toHaveBeenCalled()
  expect(mocks.maps).toHaveLength(1)
  expect(map.remove).not.toHaveBeenCalled()
  act(() => button('Fit route').click())
  expect(map.fitBounds).toHaveBeenCalledTimes(2)
  expect(map.fitBounds.mock.calls[1][0].coordinates).toContainEqual([24, 47])
})

test('deselecting makes clicks inert and turns off marker drag', () => {
  render(); act(() => button('Deselect').click()); clickMap(47, 24)
  expect(latest[0]).toEqual(saved)
  expect(pin('1').options.draggable).toBe(false)
  expect(mocks.configuration).not.toHaveBeenCalled()
  expect(container.textContent).toContain('Select a checkpoint to position it')
})

async function searchResult() {
  vi.useFakeTimers()
  vi.stubGlobal('fetch', vi.fn()
    .mockResolvedValueOnce({ ok: true, json: async () => ({ suggestions: [{ mapbox_id: 'park', name: 'Park' }] }) })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ features: [{ geometry: { coordinates: [24, 47] } }] }) }))
  const before = structuredClone(latest)
  const input = container.querySelector('input[role="combobox"]')!
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, 'Park')
    input.dispatchEvent(new Event('input', { bubbles: true }))
  })
  await act(async () => { await vi.advanceTimersByTimeAsync(300) })
  expect(latest).toEqual(before)
  await act(async () => container.querySelector<HTMLButtonElement>('[role="option"] button')!.click())
}

test('typing never changes GPS; selected search result positions only the active checkpoint without camera movement', async () => {
  render(); select('2'); await searchResult()
  expect(latest[0]).toEqual(saved)
  expect(latest[1]).toMatchObject({ latitude: 47, longitude: 24 })
  expect(mocks.maps[0].flyTo).not.toHaveBeenCalled()
  expect(mocks.configuration).toHaveBeenCalledOnce()
})

test('general search moves only the camera', async () => {
  render(); act(() => button('Deselect').click()); await searchResult()
  expect(latest[0]).toEqual(saved)
  expect(mocks.maps[0].flyTo).toHaveBeenCalledExactlyOnceWith({ center: [24, 47], zoom: 14 })
  expect(mocks.configuration).not.toHaveBeenCalled()
})

test('map workspace has a compact selection list, one contextual inspector and collapsed advanced settings', () => {
  signal(); render()
  const list = container.querySelector('[aria-label="Checkpoint positions"]')!
  expect(list.querySelectorAll('[data-checkpoint]')).toHaveLength(7)
  expect(list.querySelectorAll('input, details')).toHaveLength(0)
  expect(list.textContent).not.toContain('46.')
  expect(container.querySelectorAll('[role="combobox"]')).toHaveLength(1)
  expect(container.querySelector('[role="combobox"]')!.closest('[data-testid="position-map"]')).not.toBeNull()
  const inspector = container.querySelector('[aria-label="Selected checkpoint inspector"]')!
  expect(inspector.querySelectorAll('input[aria-label="Latitude"]')).toHaveLength(1)
  const advanced = inspector.querySelector<HTMLDetailsElement>('.position-advanced')!
  expect(advanced.open).toBe(false)
  expect(advanced.querySelector('summary')!.textContent).toBe('Advanced settings')
  act(() => advanced.querySelector('summary')!.click()); expect(advanced.open).toBe(true)
  expect(advanced.querySelector('[aria-label="Reset checkpoint position"]')).not.toBeNull()
  expect(advanced.textContent).toContain('Arrival area & research notes')
  select('F')
  expect(inspector.querySelector('h4')!.textContent).toContain('F · Finish')
  expect(inspector.querySelector<HTMLDetailsElement>('.position-advanced')!.open).toBe(false)
  act(() => button('Deselect').click())
  expect(inspector.querySelectorAll('input, details, button')).toHaveLength(0)
  expect(inspector.textContent).toContain('Select a checkpoint')
  expect(pin('1').element.className).toContain('h-11 w-11')
})

function undo() { act(() => button('Undo').click()) }
function redo() { act(() => button('Redo').click()) }
async function coordinate(label: string, value: string) {
  const input = container.querySelector<HTMLInputElement>(`[aria-label="${label}"]`)!
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, value)
    input.dispatchEvent(new Event('input', { bubbles: true }))
  })
}

test('toolbar keeps four map actions separate from contextual confirmation, has mirrored equally styled icons and empty disabled history', () => {
  render()
  const toolbar = container.querySelector('[role="toolbar"]')!
  expect([...toolbar.querySelectorAll('button')].map(button => button.textContent)).toEqual(['Undo', 'Redo', 'Fit route', 'Deselect'])
  expect(button('Undo').disabled).toBe(true)
  expect(button('Redo').disabled).toBe(true)
  expect(button('Undo').title).toBe('Undo last position change')
  expect(button('Redo').getAttribute('aria-label')).toBe('Redo last position change')
  expect(button('Undo').className).toBe(button('Redo').className)
  expect(button('Undo').parentElement).toBe(button('Redo').parentElement)
  const undoIcon = button('Undo').querySelector('svg')!
  const redoIcon = button('Redo').querySelector('svg')!
  expect(undoIcon.getAttribute('width')).toBe(redoIcon.getAttribute('width'))
  expect(undoIcon.getAttribute('stroke-width')).toBe(redoIcon.getAttribute('stroke-width'))
  expect(undoIcon.querySelector('g')!.innerHTML).toBe(redoIcon.querySelector('g')!.innerHTML)
  expect(redoIcon.querySelector('g')!.getAttribute('transform')).toBe('translate(24 0) scale(-1 1)')
  expect([...container.querySelectorAll('button')].filter(button => button.textContent === 'Confirm position')).toHaveLength(1)
  expect([...container.querySelectorAll('button')].filter(button => button.textContent === 'Fit route')).toHaveLength(1)
  expect(toolbar.querySelector('[aria-label="Reset checkpoint position"]')).toBeNull()
  expect(toolbar.className).toContain('min-w-0')
  expect(toolbar.querySelectorAll('button').length).toBe(4)
  expect(button('Confirm position').closest('[aria-label="Selected checkpoint inspector"]')).not.toBeNull()
  expect([...toolbar.querySelectorAll('button')].every(button => button.className.includes('min-h-11'))).toBe(true)
})

test('successive map edits undo to provisional reference and redo authored positions across CP1–CP6 and FinishPoint', () => {
  signal(); render()
  const originalReferences = pins().map(marker => [...marker.coordinates])
  for (const number of ['1', '2', '3', '4', '5', '6', 'F']) {
    select(number); clickMap(47, 24); clickMap(48, 25)
  }
  expect(latest.every(point => point.latitude === 48)).toBe(true)
  expect(latestFinish!.latitude).toBe(48)
  for (const number of ['F', '6', '5', '4', '3', '2', '1']) {
    undo()
    expect(pin(number).coordinates).toEqual([24, 47])
    expect(container.querySelector(`[data-checkpoint="${number}"]`)!.getAttribute('aria-pressed')).toBe('true')
    expect(container.textContent).toContain(`Undid position change for ${number === 'F' ? 'FinishPoint' : `CP${number}`}`)
    undo()
    expect(pin(number).element.getAttribute('aria-label')).toContain('Reference position')
    expect(button('Confirm position').disabled).toBe(true)
  }
  expect(button('Undo').disabled).toBe(true)
  expect(pins().map(marker => marker.coordinates)).toEqual(originalReferences)
  expect(latest.every(point => point.latitude === undefined)).toBe(true)
  expect(latestFinish!.latitude).toBeUndefined()
  expect(mocks.configuration).toHaveBeenLastCalledWith({ normalCheckpointCount: 6, checkpointPositions: [] })
  for (let index = 0; index < 14; index++) redo()
  expect(button('Redo').disabled).toBe(true)
  expect(latest.every(point => point.latitude === 48 && point.longitude === 25)).toBe(true)
  expect(latestFinish).toMatchObject({ latitude: 48, longitude: 25 })
})

test('undo restores confirmation; redo restores later confirmation; new edit discards redo', () => {
  render(); act(() => button('Confirm position').click())
  clickMap(47, 24)
  expect(latestVerified.has(1)).toBe(false)
  undo(); expect(latest[0]).toEqual(saved); expect(latestVerified.has(1)).toBe(true)
  redo(); expect(latestVerified.has(1)).toBe(false)
  act(() => button('Confirm position').click())
  undo(); redo(); expect(latestVerified.has(1)).toBe(true)
  undo(); select('2'); clickMap(48, 25)
  expect(button('Redo').disabled).toBe(true)
  undo(); expect(latest[1].latitude).toBeUndefined()
  expect(latest[0]).toEqual(saved)
})

test('dragend records exactly one edit and duplicate placement preserves confirmation without history', () => {
  render(); act(() => button('Confirm position').click())
  clickMap(saved.latitude, saved.longitude)
  expect(button('Undo').disabled).toBe(true)
  expect(latestVerified.has(1)).toBe(true)
  expect(mocks.configuration).not.toHaveBeenCalled()
  const marker = pin('1'); marker.coordinates = [24, 47]
  act(() => marker.handlers.get('dragend')!())
  clickMap(48, 25)
  undo()
  expect(latest[0]).toEqual(saved)
  expect(latestVerified.has(1)).toBe(true)
  expect(button('Undo').disabled).toBe(true)
  redo(); expect(latest[0]).toMatchObject({ latitude: 47, longitude: 24 })
})

test('search result creates exactly one history step', async () => {
  render(); select('2'); await searchResult()
  undo(); expect(latest[1].latitude).toBeUndefined()
  expect(button('Undo').disabled).toBe(true)
  redo(); expect(latest[1]).toMatchObject({ latitude: 47, longitude: 24 })
})

test('coordinate editing including empty or invalid coordinates is reversible and keeps names/radii', async () => {
  render(); act(() => button('Confirm position').click())
  await coordinate('Latitude', '47')
  await coordinate('Longitude', '24')
  await coordinate('Latitude', '')
  expect(button('Confirm position').disabled).toBe(true)
  undo(); expect(latest[0]).toMatchObject({ latitude: 47, longitude: 24 })
  undo(); expect(latest[0]).toMatchObject({ latitude: 47, longitude: saved.longitude })
  undo(); expect(latest[0]).toEqual(saved); expect(latestVerified.has(1)).toBe(true)
  redo(); redo(); redo(); expect(latest[0].latitude).toBeUndefined()
  await coordinate('Latitude', '999'); expect(button('Confirm position').disabled).toBe(true)
  undo(); expect(latest[0].latitude).toBeUndefined()
  expect(latest[0]).toMatchObject({ name: 'Museum', radiusMeters: 30 })
})

test('selection, pan, zoom, fit and deselect preserve geography, confirmation and history; general search stays camera-only', async () => {
  render(); clickMap(48, 25); act(() => button('Confirm position').click())
  const geography = structuredClone(latest)
  select('2'); select('1')
  act(() => { mocks.maps[0].emit('moveend'); mocks.maps[0].emit('zoomend'); button('Fit route').click(); button('Deselect').click() })
  expect(latest).toEqual(geography)
  expect(latestVerified.has(1)).toBe(true)
  expect(button('Deselect').disabled).toBe(true)
  expect(button('Confirm position')).toBeUndefined()
  await searchResult()
  expect(latest).toEqual(geography)
  undo(); expect(latest[0]).toEqual(saved); expect(button('Undo').disabled).toBe(true)
  redo(); expect(latest).toEqual(geography); expect(latestVerified.has(1)).toBe(true)
  expect(mocks.maps[0].fitBounds).toHaveBeenCalledOnce()
  expect(mocks.maps[0].fitBounds.mock.calls[0][0].coordinates).toEqual([[25, 48]])
})

test('FinishPoint confirmation follows its position history without modifying normal checkpoints', async () => {
  signal(); render(); select('F')
  expect(button('Confirm position').disabled).toBe(true)
  clickMap(47, 24); act(() => button('Confirm position').click()); clickMap(48, 25)
  expect(pin('F').element.getAttribute('aria-label')).toContain('Locally edited')
  undo(); expect(pin('F').element.getAttribute('aria-label')).toContain('Creator-confirmed')
  redo(); expect(pin('F').element.getAttribute('aria-label')).toContain('Locally edited')
  undo(); undo(); expect(latestFinish!.latitude).toBeUndefined()
  expect(button('Confirm position').disabled).toBe(true)
  redo(); expect(pin('F').element.getAttribute('aria-label')).toContain('Creator-confirmed')
  expect(latest.every(point => point.latitude === undefined)).toBe(true)
  expect(mocks.configuration).not.toHaveBeenCalled()
})

test('non-position metadata edits remain in place and cannot regain stale confirmation through undo', async () => {
  render(); act(() => button('Confirm position').click()); clickMap(47, 24)
  const radius = container.querySelector<HTMLInputElement>('input[max="500"]')!
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(radius, '45')
    radius.dispatchEvent(new Event('input', { bubbles: true }))
  })
  undo()
  expect(latest[0]).toEqual({ ...saved, radiusMeters: 45 })
  expect(latestVerified.has(1)).toBe(false)
  expect(button('Undo').disabled).toBe(true)
})


test('map precedes compact list and inspector; radius and validation are outside advanced settings', () => {
  signal(); render()
  const workspace = container.querySelector('.position-workspace')!
  expect([...workspace.children].map(child => child.className)).toEqual(['position-map', 'position-checkpoints', 'position-inspector'])
  expect(workspace.firstElementChild!.querySelector('[role="toolbar"]')).not.toBeNull()
  expect(container.querySelectorAll('.position-inspector > .grid input[type="number"]')).toHaveLength(1)
  expect(container.querySelector('.position-advanced')!.textContent).not.toContain('Detection radius')
  expect(container.querySelector('.position-inspector > [role="status"]')!.textContent).toContain('Reference positions cannot be confirmed')
})
