import { act, useState } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { RouteEditor } from '../src/features/creator/RouteEditor'
import { checkpointRadius, TedixMap } from '../src/components/TedixMap'
import { createCheckpointDrafts, type CheckpointDraft } from '../src/features/creator/checkpointGeography'

const mocks = vi.hoisted(() => ({ maps: [] as any[], markers: [] as any[], configuration: vi.fn() }))
vi.mock('mapbox-gl', () => ({ default: {
  LngLatBounds: class { extend() { return this } },
  Map: class {
    handlers = new Map<string, Set<(...args: any[]) => void>>()
    sources = new Map<string, any>()
    layers = new Map<string, any>()
    flyTo = vi.fn()
    fitBounds = vi.fn()
    remove = vi.fn()
    resize = vi.fn()
    constructor() { mocks.maps.push(this) }
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
    constructor({ element }: { element: HTMLElement }) { this.element = element; mocks.markers.push(this) }
    setLngLat(coordinates: number[]) { this.coordinates = coordinates; return this }
    addTo() { document.body.append(this.element); return this }
    remove() { this.element.remove() }
  },
} }))

let container: HTMLDivElement
let root: Root
let initial: CheckpointDraft[]
let latest: CheckpointDraft[]
const saved = { checkpointNumber: 1, name: 'Museum', latitude: 46.77, longitude: 23.59, radiusMeters: 30 }

function Editor() {
  const [drafts, setDrafts] = useState(initial)
  const [verified, setVerified] = useState(new Set<number>())
  const [safety, setSafety] = useState(new Set<string>())
  latest = drafts
  return <RouteEditor drafts={drafts} verified={verified} safety={safety} onDraftsChange={setDrafts}
    onVerifiedChange={setVerified} onSafetyChange={setSafety} onConfigurationChange={mocks.configuration} />
}

beforeEach(() => {
  mocks.maps.length = 0; mocks.markers.length = 0; mocks.configuration.mockReset()
  vi.stubEnv('VITE_MAPBOX_ACCESS_TOKEN', 'test-public-token')
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} })
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

test('loads existing positions, radius and coordinates without emitting changes', () => {
  render()
  expect(container.textContent).toContain('Place and inspect checkpoint positions')
  expect(container.textContent).toContain('0 of 2 positions confirmed')
  expect(container.textContent).toContain('Not confirmed')
  expect(container.textContent).toContain('Review standing-area safety')
  expect(container.textContent).not.toContain('Create and verify the safe route')
  expect(latest[0]).toEqual(saved)
  expect(container.textContent).toContain('46.770000')
  expect(container.textContent).toContain('23.590000')
  expect(mocks.markers[0].coordinates).toEqual([23.59, 46.77])
  expect(mocks.markers[0].element.getAttribute('aria-pressed')).toBe('true')
  expect((container.querySelector('input[type="number"]') as HTMLInputElement).value).toBe('30')
  expect(mocks.configuration).not.toHaveBeenCalled()
})

test('switching, placement and repositioning retain the map and change only the selected checkpoint', () => {
  render()
  const map = mocks.maps[0]
  act(() => container.querySelector<HTMLButtonElement>('[data-checkpoint="2"]')!.click())
  expect(mocks.maps).toHaveLength(1)
  expect(map.remove).not.toHaveBeenCalled()
  clickMap(46.8, 23.6)
  expect(latest).toEqual([saved, { checkpointNumber: 2, name: 'Park', radiusMeters: 5, latitude: 46.8, longitude: 23.6 }])
  clickMap(46.9, 23.7)
  expect(latest[0]).toEqual(saved)
  expect(latest[1]).toMatchObject({ latitude: 46.9, longitude: 23.7, radiusMeters: 5 })
  expect(mocks.configuration).toHaveBeenLastCalledWith({ normalCheckpointCount: 2, checkpointPositions: latest })
  const marker = mocks.markers.at(-2)!
  act(() => marker.element.click())
  expect(mocks.configuration).toHaveBeenCalledTimes(2)
  clickMap(47, 24)
  expect(latest[0]).toMatchObject({ latitude: 47, longitude: 24, radiusMeters: 30 })
  expect(latest[1]).toMatchObject({ latitude: 46.9, longitude: 23.7 })
  expect(mocks.maps[0]).toBe(map)
  expect(mocks.maps).toHaveLength(1)
})

test('search selection only moves the map, even with a selected unpositioned checkpoint', async () => {
  vi.useFakeTimers()
  vi.stubGlobal('fetch', vi.fn()
    .mockResolvedValueOnce({ ok: true, json: async () => ({ suggestions: [{ mapbox_id: 'park', name: 'Park' }] }) })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ features: [{ geometry: { coordinates: [23.7, 46.9] } }] }) }))
  render()
  act(() => container.querySelector<HTMLButtonElement>('[data-checkpoint="2"]')!.click())
  const before = structuredClone(latest)
  const input = container.querySelector('input[role="combobox"]')!
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, 'Park')
    input.dispatchEvent(new Event('input', { bubbles: true }))
    await vi.advanceTimersByTimeAsync(300)
  })
  // The debounce effect starts after React commits the changed input.
  await act(async () => { await vi.advanceTimersByTimeAsync(300) })
  await act(async () => container.querySelector<HTMLButtonElement>('[role="option"] button')!.click())
  expect(mocks.maps[0].flyTo).toHaveBeenCalledWith({ center: [23.7, 46.9], zoom: 14 })
  expect(latest).toEqual(before)
  expect(mocks.configuration).not.toHaveBeenCalled()
  expect(mocks.maps).toHaveLength(1)
})

test('radius input updates presentation and preserves the backend fields', () => {
  render()
  const input = container.querySelector('input[type="number"]')!
  act(() => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, '500')
    input.dispatchEvent(new Event('input', { bubbles: true }))
  })
  expect(latest[0].radiusMeters).toBe(500)
  expect(mocks.maps[0].sources.get('tedix-checkpoint-radii').data.features).toEqual([checkpointRadius({ ...saved, radiusMeters: 500, selected: true })])
  expect(mocks.configuration).toHaveBeenLastCalledWith({ normalCheckpointCount: 2, checkpointPositions: [{ ...saved, radiusMeters: 500 }] })
})

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

test('restores checkpoint radii after the map style reloads', () => {
  render()
  const map = mocks.maps[0]
  map.sources.clear(); map.layers.clear()
  act(() => map.emit('style.load'))
  expect(map.sources.get('tedix-checkpoint-radii').data.features).toHaveLength(1)
  expect(map.layers.size).toBe(2)
  expect(mocks.maps).toHaveLength(1)
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


test('temporary position confirmation changes wording without certifying safety or changing geography', () => {
  render()
  const before = structuredClone(latest)
  const confirm = [...container.querySelectorAll('button')].find(button => button.textContent === 'Confirm position')!
  act(() => confirm.click())
  expect(container.textContent).toContain('1 of 2 positions confirmed')
  expect(container.textContent).toContain('Position confirmed')
  expect(container.textContent).toContain('not saved evidence of physical verification')
  expect(latest).toEqual(before)
  expect(mocks.configuration).not.toHaveBeenCalled()
  clickMap(47, 24)
  expect(container.textContent).toContain('0 of 2 positions confirmed')
  expect(container.textContent).toContain('Not confirmed')
})
