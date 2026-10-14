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
    setStyle = vi.fn(() => { this.sources.clear(); this.layers.clear(); this.emit('style.load') })
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
  vi.stubGlobal('confirm', vi.fn(() => true))
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
function button(text: string) { return [...container.querySelectorAll('button')].find(button => (button.textContent?.trim() === text || button.getAttribute('aria-label') === `${text} last position change`))! }
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
  act(() => button('Confirm position').click()); select('1')
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
  act(() => button('Confirm position').click()); select('1')
  const original = structuredClone(latest[1])
  act(() => button('Reset position').click())
  expect(latest[0]).toEqual({ checkpointNumber: 1, name: 'Museum', radiusMeters: 30, latitude: undefined, longitude: undefined })
  expect(latest[1]).toEqual(original)
  expect(latestVerified.has(1)).toBe(false)
  expect(pin('1').coordinates).not.toEqual([23.59, 46.77])
  expect(pin('1').element.getAttribute('aria-label')).toContain('Reference position')
  expect(mocks.configuration).toHaveBeenLastCalledWith({ normalCheckpointCount: 6, checkpointPositions: [original] })
  expect(button('Confirm position').disabled).toBe(true)
})

test('Reset without research clears saved authored coordinates after explicit confirmation', () => {
  render(); act(() => button('Reset position').click())
  expect(window.confirm).toHaveBeenCalledOnce()
  expect(latest[0].latitude).toBeUndefined()
  undo(); expect(latest[0]).toEqual(saved)
})

test('FinishPoint placement, confirmation and Reset remain separate from normal checkpoints', () => {
  signal(); render(); select('F'); clickMap(47, 24)
  expect(latestFinish).toMatchObject({ latitude: 47, longitude: 24, radiusMeters: 17 })
  act(() => button('Confirm position').click()); select('F')
  expect(pin('F').element.getAttribute('aria-label')).toContain('Creator-confirmed')
  act(() => button('Reset position').click())
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
  select('2'); clickMap(47, 24); act(() => button('Confirm position').click()); select('1'); select('F')
  expect(map.fitBounds).toHaveBeenCalledOnce()
  expect(map.flyTo).not.toHaveBeenCalled()
  expect(mocks.maps).toHaveLength(1)
  expect(map.remove).not.toHaveBeenCalled()
  expect(button('Fit route')).toBeUndefined()
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
  act(() => (input as HTMLInputElement).focus())
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, 'Park landmark')
    input.dispatchEvent(new Event('input', { bubbles: true }))
  })
  await act(async () => { await vi.advanceTimersByTimeAsync(300) })
  expect(latest).toEqual(before)
  await act(async () => container.querySelector<HTMLButtonElement>('[role="option"] button')!.click())
}

test('focused search navigates without changing selected checkpoint, confirmation or history', async () => {
  signal(); initial[0] = { ...saved }; render()
  act(() => button('Confirm position').click()); select('1')
  const before = structuredClone(latest)
  const references = pins().map(marker => [...marker.coordinates])
  const map = mocks.maps[0]
  const initialFits = map.fitBounds.mock.calls.length
  await searchResult()
  expect(latest).toEqual(before)
  expect(latestVerified.has(1)).toBe(true)
  expect(pins().map(marker => marker.coordinates)).toEqual(references)
  expect(container.querySelector('[data-checkpoint="1"]')!.getAttribute('aria-pressed')).toBe('true')
  expect(map.flyTo).toHaveBeenCalledExactlyOnceWith({ center: [24, 47], zoom: 16 })
  expect(map.fitBounds).toHaveBeenCalledTimes(initialFits)
  expect(mocks.configuration).not.toHaveBeenCalled()
  expect(button('Undo').disabled).toBe(true)
  expect(container.querySelector('[role="listbox"]')).toBeNull()
  expect(container.textContent).toContain('Location selected.')
  select('2'); select('1')
  expect(map.flyTo).toHaveBeenCalledOnce()
  expect(map.fitBounds).toHaveBeenCalledTimes(initialFits)
  clickMap(47.01, 24.01)
  expect(latest[0]).toMatchObject({ latitude: 47.01, longitude: 24.01 })
  expect(latestVerified.has(1)).toBe(false)
  undo(); expect(latest).toEqual(before); expect(latestVerified.has(1)).toBe(true)
  expect(button('Undo').disabled).toBe(true)
})

test('general search moves only the camera', async () => {
  render(); act(() => button('Deselect').click()); await searchResult()
  expect(latest[0]).toEqual(saved)
  expect(mocks.maps[0].flyTo).toHaveBeenCalledExactlyOnceWith({ center: [24, 47], zoom: 16 })
  expect(mocks.configuration).not.toHaveBeenCalled()
})

test('four-field inspector is read-only until pencil Edit; research panels are absent', () => {
  signal(); render()
  const inspector = container.querySelector('[aria-label="Selected checkpoint inspector"]')!
  expect(container.querySelectorAll('[data-checkpoint]')).toHaveLength(7)
  expect([...inspector.querySelectorAll('dt')].map(node => node.textContent)).toEqual(['Name:', 'Detection radius (meters):', 'Coordinates:', 'Notes:'])
  expect(inspector.querySelectorAll('input, textarea')).toHaveLength(0)
  expect(container.textContent).not.toMatch(/Advanced settings|Location research & safety notes|Walking research and pending field checks/)
  expect(container.textContent).toContain('Arrival verification & safety reminders')
  expect(container.querySelectorAll('input[type="checkbox"]')).toHaveLength(6)
  act(() => button('Edit').click())
  expect(inspector.querySelectorAll('input')).toHaveLength(4)
  expect(inspector.querySelector('textarea')).not.toBeNull()
  act(() => button('Cancel').click())
  select('F'); expect(inspector.querySelector('h4')!.textContent).toContain('F · Finish')
  expect(container.querySelector('[data-checkpoint="F"]')!.textContent).toContain('FinishPoint')
  expect(container.querySelector('[data-checkpoint="F"]')!.className).toBe('position-checkpoint')
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

test('toolbar adds map modes alongside existing map actions separate from contextual confirmation, has mirrored equally styled icons and empty disabled history', () => {
  render()
  const toolbar = container.querySelector('[role="toolbar"]')!
  expect([...toolbar.querySelectorAll('button')].map(button => button.textContent)).toEqual(['', '', 'Deselect', 'Map', 'Satellite'])
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
  expect([...container.querySelectorAll('button')].filter(button => button.textContent === 'Fit route')).toHaveLength(0)
  expect(toolbar.querySelector('[aria-label="Reset checkpoint position"]')).toBeNull()
  expect(toolbar.className).toContain('min-w-0')
  expect(toolbar.querySelectorAll('button').length).toBe(5)
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
  render(); act(() => button('Confirm position').click()); select('1')
  clickMap(47, 24)
  expect(latestVerified.has(1)).toBe(false)
  undo(); expect(latest[0]).toEqual(saved); expect(latestVerified.has(1)).toBe(true)
  redo(); expect(latestVerified.has(1)).toBe(false)
  act(() => button('Confirm position').click()); select('1')
  undo(); redo(); expect(latestVerified.has(1)).toBe(true)
  undo(); select('2'); clickMap(48, 25)
  expect(button('Redo').disabled).toBe(true)
  undo(); expect(latest[1].latitude).toBeUndefined()
  expect(latest[0]).toEqual(saved)
})

test('dragend records exactly one edit and duplicate placement preserves confirmation without history', () => {
  render(); act(() => button('Confirm position').click()); select('1')
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

test.each(['1', '2', '3', '4', '5', '6', 'F'])('search preserves unconfirmed reference %s without history', async number => {
  signal(); render(); select(number)
  const before = structuredClone(latest)
  const finish = structuredClone(latestFinish)
  await searchResult()
  expect(latest).toEqual(before); expect(latestFinish).toEqual(finish)
  expect(latestVerified.size).toBe(0)
  expect(button('Undo').disabled).toBe(true)
  expect(button('Confirm position').disabled).toBe(true)
  expect(container.querySelector(`[data-checkpoint="${number}"]`)!.getAttribute('aria-pressed')).toBe('true')
  expect(mocks.configuration).not.toHaveBeenCalled()
})

test('local edit Save applies one history entry, Cancel restores draft, invalid inputs never apply', async () => {
  render(); act(() => button('Confirm position').click()); select('1')
  act(() => button('Edit').click())
  await coordinate('Latitude', '47'); await coordinate('Longitude', '24')
  expect(latest[0]).toEqual(saved)
  act(() => button('Cancel').click()); expect(latest[0]).toEqual(saved)
  act(() => button('Edit').click()); await coordinate('Latitude', '999')
  act(() => button('Save changes').click()); expect(latest[0]).toEqual(saved)
  expect(container.querySelector('[role="alert"]')).not.toBeNull()
  await coordinate('Latitude', '47'); await coordinate('Longitude', '24')
  act(() => button('Save changes').click())
  expect(latest[0]).toMatchObject({ latitude: 47, longitude: 24 })
  undo(); expect(latest[0]).toEqual(saved); expect(latestVerified.has(1)).toBe(true)
  expect(button('Undo').disabled).toBe(true)
  redo(); expect(latest[0]).toMatchObject({ latitude: 47, longitude: 24 })
})

test('selection, pan, zoom, fit and deselect preserve geography, confirmation and history; general search stays camera-only', async () => {
  render(); clickMap(48, 25); act(() => button('Confirm position').click()); select('1')
  const geography = structuredClone(latest)
  select('2'); select('1')
  act(() => { mocks.maps[0].emit('moveend'); mocks.maps[0].emit('zoomend'); button('Deselect').click() })
  expect(latest).toEqual(geography)
  expect(latestVerified.has(1)).toBe(true)
  expect(button('Deselect').disabled).toBe(true)
  expect(button('Confirm position')).toBeUndefined()
  await searchResult()
  expect(latest).toEqual(geography)
  undo(); expect(latest[0]).toEqual(saved); expect(button('Undo').disabled).toBe(true)
  redo(); expect(latest).toEqual(geography); expect(latestVerified.has(1)).toBe(true)
  expect(mocks.maps[0].fitBounds).not.toHaveBeenCalled()
})

test('FinishPoint confirmation follows its position history without modifying normal checkpoints', async () => {
  signal(); render(); select('F')
  expect(button('Confirm position').disabled).toBe(true)
  clickMap(47, 24); act(() => button('Confirm position').click()); select('F'); clickMap(48, 25)
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
  render(); act(() => button('Confirm position').click()); select('1'); clickMap(47, 24)
  act(() => button('Edit').click())
  const radius = container.querySelector<HTMLInputElement>('input[max="500"]')!
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(radius, '45')
    radius.dispatchEvent(new Event('input', { bubbles: true }))
  })
  act(() => button('Save changes').click())
  undo()
  expect(latest[0]).toEqual({ ...saved, radiusMeters: 45 })
  expect(latestVerified.has(1)).toBe(false)
  expect(button('Undo').disabled).toBe(true)
})


test('map precedes list and inspector and reference coordinates cannot be confirmed', () => {
  signal(); render()
  const workspace = container.querySelector('.position-workspace')!
  expect([...workspace.children].map(child => child.className)).toEqual(['position-map', 'position-checkpoints', 'position-inspector'])
  expect(workspace.firstElementChild!.querySelector('[role="toolbar"]')).not.toBeNull()
  expect(button('Confirm position').disabled).toBe(true)
})

test('canceled reset preserves saved position and confirmation; reset undo/redo restores confirmation', () => {
  render(); act(() => button('Confirm position').click()); select('1')
  vi.mocked(window.confirm).mockReturnValueOnce(false)
  act(() => button('Reset position').click()); expect(latest[0]).toEqual(saved)
  expect(latestVerified.has(1)).toBe(true)
  act(() => button('Reset position').click()); expect(latest[0].latitude).toBeUndefined()
  undo(); expect(latest[0]).toEqual(saved); expect(latestVerified.has(1)).toBe(true)
  redo(); expect(latest[0].latitude).toBeUndefined(); expect(latestVerified.has(1)).toBe(false)
})

test('reset of an unsaved local placement is immediate and reversible', () => {
  signal(); render(); clickMap(47, 24); act(() => button('Confirm position').click()); select('1')
  act(() => button('Reset position').click())
  expect(window.confirm).not.toHaveBeenCalled()
  expect(latest[0].latitude).toBeUndefined()
  undo(); expect(latest[0].latitude).toBe(47); expect(latestVerified.has(1)).toBe(true)
  redo(); expect(latest[0].latitude).toBeUndefined()
})

test.each([['', '30'], ['Museum', '4'], ['Museum', '501'], ['Museum', '5.5']])('local edit rejects name/radius %s/%s', async (name, radius) => {
  render(); act(() => button('Edit').click())
  const fields = container.querySelectorAll<HTMLInputElement>('.position-inspector input')
  await act(async () => {
    for (const [input, value] of [[fields[0], name], [fields[1], radius]] as const) {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, value)
      input.dispatchEvent(new Event('input', { bubbles: true }))
    }
  })
  act(() => button('Save changes').click())
  expect(latest[0]).toEqual(saved)
  expect(container.querySelector('[role="alert"]')).not.toBeNull()
})

test('clearing saved coordinates in local Edit also requires explicit confirmation', async () => {
  render(); act(() => button('Edit').click())
  await coordinate('Latitude', ''); await coordinate('Longitude', '')
  vi.mocked(window.confirm).mockReturnValueOnce(false)
  act(() => button('Save changes').click()); expect(latest[0]).toEqual(saved)
  act(() => button('Save changes').click()); expect(latest[0].latitude).toBeUndefined()
  undo(); expect(latest[0]).toEqual(saved)
})

test('Deselect preserves staged local edits for reselecting the same checkpoint', async () => {
  render(); act(() => button('Edit').click()); await coordinate('Latitude', '48')
  act(() => button('Deselect').click()); expect(latest[0]).toEqual(saved)
  select('1')
  expect(container.querySelector<HTMLInputElement>('[aria-label="Latitude"]')!.value).toBe('48')
  act(() => button('Save changes').click()); expect(latest[0].latitude).toBe(48)
})

test('selected reference pins use blue outlining; green fill means session confirmation', () => {
  signal(); render()
  let path = pin('1').element.querySelector('path')!
  expect(path.getAttribute('stroke')).toBe('#2563eb')
  expect(path.getAttribute('fill')).toBe('#475569')
  clickMap(47, 24); act(() => button('Confirm position').click()); select('1')
  path = pin('1').element.querySelector('path')!
  expect(path.getAttribute('fill')).toBe('#047857')
  act(() => button('Deselect').click())
  expect(pin('1').element.querySelector('path')!.getAttribute('stroke')).toBe('#ffffff')
  expect(latestVerified.has(1)).toBe(true)
})

test('search bounds use a constrained inspection zoom without positioning', async () => {
  render()
  vi.useFakeTimers()
  vi.stubGlobal('fetch', vi.fn()
    .mockResolvedValueOnce({ ok: true, json: async () => ({ suggestions: [{ mapbox_id: 'landmark', name: 'Landmark' }] }) })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ features: [{ geometry: { coordinates: [23.59, 46.77] }, bbox: [23.58, 46.76, 23.60, 46.78] }] }) }))
  const input = container.querySelector<HTMLInputElement>('[role="combobox"]')!
  await act(async () => {
    input.focus()
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, 'Landmark')
    input.dispatchEvent(new Event('input', { bubbles: true }))
    await vi.advanceTimersByTimeAsync(300)
  })
  await act(async () => { await vi.advanceTimersByTimeAsync(300) })
  await act(async () => container.querySelector<HTMLButtonElement>('[role="option"] button')!.click())
  expect(mocks.maps[0].fitBounds).toHaveBeenCalledExactlyOnceWith([[23.58, 46.76], [23.60, 46.78]], { padding: 64, minZoom: 15, maxZoom: 16, duration: 1200 })
  expect(mocks.maps[0].flyTo).not.toHaveBeenCalled()
  expect(latest[0]).toEqual(saved)
  expect(button('Undo').disabled).toBe(true)
})


test.each(['1', '2', '3', '4', '5', '6', 'F'])('confirm %s deselects, preserves its visible pin/history, and requires explicit re-selection', number => {
  signal(); render(); select(number); clickMap(47, 24)
  const before = structuredClone(latest)
  const finishBefore = structuredClone(latestFinish)
  mocks.configuration.mockClear()
  act(() => button('Confirm position').click())
  expect(container.querySelectorAll('[data-checkpoint][aria-pressed="true"]')).toHaveLength(0)
  expect(button('Deselect').disabled).toBe(true)
  expect(button('Confirm position')).toBeUndefined()
  expect(pin(number).coordinates).toEqual([24, 47])
  expect(pin(number).element.getAttribute('aria-label')).toContain('Creator-confirmed')
  expect(pin(number).options.draggable).toBe(false)
  expect(button('Undo').disabled).toBe(false)
  clickMap(48, 25)
  expect(latest).toEqual(before)
  expect(latestFinish).toEqual(finishBefore)
  expect(mocks.configuration).not.toHaveBeenCalled()
  undo(); expect(pin(number).element.getAttribute('aria-label')).toContain('Reference position')
  expect(container.querySelectorAll('[data-checkpoint][aria-pressed="true"]')).toHaveLength(0)
  redo(); expect(pin(number).coordinates).toEqual([24, 47])
  expect(pin(number).element.getAttribute('aria-label')).toContain('Creator-confirmed')
  expect(container.querySelectorAll('[data-checkpoint][aria-pressed="true"]')).toHaveLength(0)
  clickMap(48, 25); expect(pin(number).coordinates).toEqual([24, 47])
  select(number); clickMap(48, 25)
  expect(pin(number).coordinates).toEqual([25, 48])
  expect(pin(number).element.getAttribute('aria-label')).toContain('Locally edited')
})

test('switching map modes preserves pins, confirmation, selection and history, with search and positioning in both modes', async () => {
  signal(); render(); select('F'); clickMap(47, 24)
  act(() => button('Confirm position').click())
  select('2'); clickMap(48, 25)
  const before = structuredClone(latest)
  const finishBefore = structuredClone(latestFinish)
  const coordinates = pins().map(marker => marker.coordinates)
  const map = mocks.maps[0]
  const listeners = [...map.handlers].map(([event, handlers]: [string, Set<unknown>]) => [event, handlers.size])
  const fits = map.fitBounds.mock.calls.length
  const mode = (text: string) => [...container.querySelectorAll<HTMLButtonElement>('[aria-label="Map view"] button')].find(node => node.textContent === text)!
  for (const [label, style] of [['Satellite', 'satellite-streets-v12'], ['Map', 'streets-v12']]) {
    act(() => mode(label).click())
    expect(map.setStyle).toHaveBeenLastCalledWith(`mapbox://styles/mapbox/${style}`)
    expect(mode(label).getAttribute('aria-pressed')).toBe('true')
    expect(latest).toEqual(before); expect(latestFinish).toEqual(finishBefore)
    expect(pins().map(marker => marker.coordinates)).toEqual(coordinates)
    expect(pin('F').element.getAttribute('aria-label')).toContain('Creator-confirmed')
    expect(container.querySelector('[data-checkpoint="2"]')!.getAttribute('aria-pressed')).toBe('true')
    await searchResult()
    expect(latest).toEqual(before); expect(latestFinish).toEqual(finishBefore)
    clickMap(49, 26); undo(); expect(latest).toEqual(before)
    redo(); expect(latest[1]).toMatchObject({ latitude: 49, longitude: 26 })
    undo()
    expect([...map.handlers].map(([event, handlers]: [string, Set<unknown>]) => [event, handlers.size])).toEqual(listeners)
  }
  expect(map.fitBounds).toHaveBeenCalledTimes(fits)
  expect(mocks.maps).toHaveLength(1)
  expect(map.remove).not.toHaveBeenCalled()
  act(() => root.unmount())
  expect([...map.handlers.values()].every((handlers: Set<unknown>) => handlers.size === 0)).toBe(true)
  expect(pins()).toHaveLength(0)
  expect(map.remove).toHaveBeenCalledOnce()
  root = createRoot(container)
})

test('style changes restore custom sources/layers without fitting the camera or duplicating markers/listeners', () => {
  const props = {
    initialLatitude: 46.77, initialLongitude: 23.59,
    checkpoints: [{ ...saved, selected: true }],
    finishPoint: { name: 'Finish', latitude: 46.8, longitude: 23.6, radiusMeters: 25 },
    walkingRoute: { type: 'LineString' as const, coordinates: [[23.59, 46.77], [23.6, 46.8]] },
    routeOverview: { type: 'LineString' as const, coordinates: [[23.59, 46.77], [23.6, 46.8]] },
  }
  act(() => root.render(<TedixMap {...props} />))
  const map = mocks.maps[0]
  const sources = [...map.sources.keys()]
  const layers = [...map.layers.keys()]
  const listenerCount = [...map.handlers.values()].map((handlers: Set<unknown>) => handlers.size)
  const fits = map.fitBounds.mock.calls.length
  for (const style of ['satellite-streets-v12', 'streets-v12']) {
    act(() => root.render(<TedixMap {...props} mapStyle={`mapbox://styles/mapbox/${style}`} />))
    expect([...map.sources.keys()]).toEqual(sources)
    expect([...map.layers.keys()]).toEqual(layers)
    expect([...map.handlers.values()].map((handlers: Set<unknown>) => handlers.size)).toEqual(listenerCount)
    expect(mocks.markers.filter(marker => marker.element.isConnected)).toHaveLength(2)
  }
  expect(map.fitBounds).toHaveBeenCalledTimes(fits)
  expect(mocks.maps).toHaveLength(1)
})
