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
  act(() => button('Confirm FinishPoint position').click())
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
  render(); act(() => button('Deselect checkpoint').click()); clickMap(47, 24)
  expect(latest[0]).toEqual(saved)
  expect(pin('1').options.draggable).toBe(false)
  expect(mocks.configuration).not.toHaveBeenCalled()
  expect(container.textContent).toContain('No checkpoint selected')
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
  render(); act(() => button('Deselect checkpoint').click()); await searchResult()
  expect(latest[0]).toEqual(saved)
  expect(mocks.maps[0].flyTo).toHaveBeenCalledExactlyOnceWith({ center: [24, 47], zoom: 14 })
  expect(mocks.configuration).not.toHaveBeenCalled()
})

test('map-first responsive layout uses one form, 44px controls and collapsed accessible HowTo', () => {
  signal(); render()
  const map = container.querySelector('[data-testid="position-map"]')!
  expect(map.className).toContain('h-[540px]')
  expect(map.className).toContain('sm:h-[640px]')
  expect(map.parentElement!.className).toContain('lg:sticky lg:top-24')
  expect(container.querySelectorAll('[aria-label="Latitude"]')).toHaveLength(1)
  const how = [...container.querySelectorAll('details')].find(detail => detail.querySelector('summary')?.textContent === 'How to position checkpoints')!
  expect(how.open).toBe(false)
  act(() => how.querySelector('summary')!.click()); expect(how.open).toBe(true)
  expect(how.textContent).toContain('1. Select'); expect(how.textContent).toContain('2. Position'); expect(how.textContent).toContain('3. Confirm & Save')
  act(() => how.querySelector('summary')!.click()); expect(how.open).toBe(false)
  expect(pin('1').element.className).toContain('h-11 w-11')
  expect(container.querySelector<HTMLInputElement>('[role="combobox"]')!.value).toBe('')
})
