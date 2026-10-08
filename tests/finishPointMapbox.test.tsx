import { act, useState } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { FinishPointEditor } from '../src/features/creator/FinishPointEditor'
import { checkpointRadius } from '../src/components/TedixMap'
import { type FinishPointDraft } from '../src/features/creator/finishPoint'

const mocks = vi.hoisted(() => ({ maps: [] as any[], markers: [] as any[], configuration: vi.fn() }))
vi.mock('mapbox-gl', () => ({ default: {
  Map: class {
    handlers = new Map<string, Set<(...args: any[]) => void>>()
    sources = new Map<string, any>()
    layers = new Map<string, any>()
    flyTo = vi.fn()
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
let initial: FinishPointDraft | undefined
let latest: FinishPointDraft | undefined
const saved = { name: ' City Wall ', latitude: 46.778123, longitude: 23.641234, radiusMeters: 17 }
function Editor() {
  const [draft, setDraft] = useState(initial)
  latest = draft
  return <FinishPointEditor draft={draft} onChange={point => { mocks.configuration(point); setDraft(point) }} />
}
beforeEach(() => {
  mocks.maps.length = 0; mocks.markers.length = 0; mocks.configuration.mockReset()
  vi.stubEnv('VITE_MAPBOX_ACCESS_TOKEN', 'test-public-token')
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} })
  initial = undefined
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
function input(selector: string, value: string) {
  act(() => {
    const element = container.querySelector(selector)!
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(element, value)
    element.dispatchEvent(new Event('input', { bubbles: true }))
  })
}
test('new FinishPoint defaults to 5m and map clicks place and reposition without remounting', () => {
  render()
  expect((container.querySelector('input[type="number"]') as HTMLInputElement).value).toBe('5')
  expect(mocks.markers).toHaveLength(0)
  input('input[maxlength="100"]', 'Finish')
  clickMap(46.8, 23.6)
  expect(latest).toEqual({ name: 'Finish', radiusMeters: 5, latitude: 46.8, longitude: 23.6 })
  expect(mocks.markers.at(-1)!.coordinates).toEqual([23.6, 46.8])
  expect(mocks.markers.at(-1)!.element.textContent).toBe('⚑')
  expect(mocks.markers.at(-1)!.element.className).toContain('bg-violet-700')
  clickMap(47, 24)
  expect(latest).toEqual({ name: 'Finish', radiusMeters: 5, latitude: 47, longitude: 24 })
  expect(mocks.maps).toHaveLength(1)
  expect(mocks.maps[0].remove).not.toHaveBeenCalled()
})
test('saved name, coordinates and radius load exactly without emitting changes', () => {
  initial = { ...saved }; render()
  expect(latest).toEqual(saved)
  expect(container.textContent).toContain('46.778123')
  expect(container.textContent).toContain('23.641234')
  expect((container.querySelector('input[type="number"]') as HTMLInputElement).value).toBe('17')
  expect(mocks.configuration).not.toHaveBeenCalled()
  expect(mocks.maps[0].sources.get('tedix-finishpoint-radius').data).toEqual(checkpointRadius(saved))
})
test.each([5, 500])('radius %s updates the discovery circle on the same map', radius => {
  initial = { ...saved }; render()
  input('input[type="number"]', String(radius))
  expect(latest).toEqual({ ...saved, radiusMeters: radius })
  expect(mocks.maps[0].sources.get('tedix-finishpoint-radius').data).toEqual(checkpointRadius({ ...saved, radiusMeters: radius }))
  expect(mocks.maps).toHaveLength(1)
})
test.each(['4', '501', '5.5'])('invalid radius %s shows validation and is not silently corrected', radius => {
  initial = { ...saved }; render()
  input('input[type="number"]', radius)
  expect(latest!.radiusMeters).toBe(Number(radius))
  expect(container.querySelector('section > p[role="status"]')!.textContent).toContain('integer radius')
})
test.each([false, true])('search moves camera only with placed FinishPoint %s', async placed => {
  vi.useFakeTimers()
  initial = placed ? { ...saved } : undefined
  vi.stubGlobal('fetch', vi.fn()
    .mockResolvedValueOnce({ ok: true, json: async () => ({ suggestions: [{ mapbox_id: 'park', name: 'Park' }] }) })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ features: [{ geometry: { coordinates: [23.7, 46.9] } }] }) }))
  render()
  const before = latest ? { ...latest } : undefined
  input('input[role="combobox"]', 'Park')
  await act(async () => { await vi.advanceTimersByTimeAsync(300) })
  await act(async () => container.querySelector<HTMLButtonElement>('[role="option"] button')!.click())
  expect(mocks.maps[0].flyTo).toHaveBeenCalledWith({ center: [23.7, 46.9], zoom: 14 })
  expect(latest).toEqual(before)
  expect(mocks.configuration).not.toHaveBeenCalled()
  expect(mocks.maps).toHaveLength(1)
})
test('FinishPoint circle restores after a style reload', () => {
  initial = { ...saved }; render()
  const map = mocks.maps[0]
  map.sources.clear(); map.layers.clear()
  act(() => map.emit('style.load'))
  expect(map.sources.get('tedix-finishpoint-radius').data).toEqual(checkpointRadius(saved))
  expect(map.layers.size).toBe(2)
})
