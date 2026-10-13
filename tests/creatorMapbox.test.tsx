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
let latest: CheckpointDraft[]
const saved = { checkpointNumber: 1, name: 'Museum', latitude: 46.77, longitude: 23.59, radiusMeters: 30 }

function Editor() {
  const [drafts, setDrafts] = useState(initial)
  const [verified, setVerified] = useState(new Set<number>())
  const [safety, setSafety] = useState(new Set<string>())
  const [finish, setFinish] = useState(finishInitial)
  latestFinish = finish
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

test('loads existing positions, radius and coordinates without emitting changes', () => {
  render()
  expect(container.querySelector('[aria-label="Proposed Signal Route"]')).toBeNull()
  expect(container.textContent).toContain('Place and inspect checkpoint positions')
  expect(container.textContent).toContain('0 of 2 positions confirmed')
  expect(container.textContent).toContain('Not confirmed')
  expect(container.textContent).toContain('Review standing-area safety')
  expect(container.textContent).not.toContain('Create and verify the safe route')
  expect(latest[0]).toEqual(saved)
  expect(container.querySelector<HTMLInputElement>('[aria-label="Latitude"]')!.value).toBe('46.77')
  expect(container.querySelector<HTMLInputElement>('[aria-label="Longitude"]')!.value).toBe('23.59')
  expect(mocks.markers[0].coordinates).toEqual([23.59, 46.77])
  expect(mocks.markers[0].element.getAttribute('aria-pressed')).toBe('true')
  expect((container.querySelector('input[type="number"][max="500"]') as HTMLInputElement).value).toBe('30')
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
  proposal = readRouteProposal({ proposal: signalClujRouteProposal })
  vi.useFakeTimers()
  vi.stubGlobal('fetch', vi.fn()
    .mockResolvedValueOnce({ ok: true, json: async () => ({ suggestions: [{ mapbox_id: 'park', name: 'Park' }] }) })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ features: [{ geometry: { coordinates: [23.7, 46.9] } }] }) }))
  render()
  act(() => container.querySelector<HTMLButtonElement>('[data-checkpoint="2"]')!.click())
  act(() => [...container.querySelectorAll('button')].find(button => button.textContent?.startsWith('CP2 ·'))!.click())
  expect(container.textContent).toContain('Provisional landmark reference available')
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
  const input = container.querySelector('input[type="number"][max="500"]')!
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


test('research references inspect the existing map without placement, radius changes or confirmation changes', () => {
  vi.stubGlobal('fetch', vi.fn())
  proposal = readRouteProposal({ proposal: signalClujRouteProposal })
  initial = createCheckpointDrafts(6, [])
  render()
  const before = structuredClone(latest)
  const select = (prefix: string) => act(() => [...container.querySelectorAll('button')].find(button => button.textContent?.startsWith(prefix))!.click())
  select('CP6 ·')
  const map = mocks.maps[0]
  expect(map.flyTo).toHaveBeenLastCalledWith({ center: [23.5955112, 46.7683841], zoom: 16 })
  expect(latest).toEqual(before)
  expect(mocks.configuration).not.toHaveBeenCalled()
  expect(map.sources.get('tedix-checkpoint-radii').data.features).toEqual([])
  const reference = mocks.markers.findLast(marker => marker.element.isConnected && marker.element.getAttribute('aria-label')?.startsWith('Select provisional landmark 6'))!
  expect(reference.options.draggable).toBe(false)
  expect(reference.handlers.has('dragend')).toBe(false)
  act(() => reference.element.click())
  expect(latest).toEqual(before)
  expect(container.textContent).toContain('0 of 6 positions confirmed')
  expect(container.textContent).toContain('Selected checkpoint: 6')
  select('FinishPoint ·')
  expect(map.flyTo).toHaveBeenLastCalledWith({ center: [23.5975153, 46.768014], zoom: 16 })
  expect(latest).toEqual(before)
  expect(document.querySelector('[aria-label^="FinishPoint:"]')).toBeNull()
  select('CP1 ·')
  expect(container.textContent).toContain('Provisional landmark reference available')
  expect(document.querySelectorAll('[aria-label^="Select provisional landmark"]')).toHaveLength(7)
  expect(map.flyTo).toHaveBeenCalledTimes(4)
  expect(mocks.configuration).not.toHaveBeenCalled()
  // Selecting the gameplay checkpoint and clicking an exterior area are still explicit actions.
  act(() => container.querySelector<HTMLButtonElement>('[data-checkpoint="6"]')!.click())
  vi.spyOn(Date, 'now').mockReturnValue(Date.now() + 1000)
  clickMap(46.7685, 23.5958)
  vi.restoreAllMocks()
  expect(latest[5]).toMatchObject({ latitude: 46.7685, longitude: 23.5958, radiusMeters: 5 })
  expect(latest.slice(0, 5)).toEqual(before.slice(0, 5))
  expect(container.textContent).toContain('0 of 6 positions confirmed')
  expect(mocks.configuration).toHaveBeenCalledOnce()
  expect(mocks.maps).toHaveLength(1)
  expect(fetch).not.toHaveBeenCalled()
})

test('inspection preserves a placed and session-confirmed checkpoint and can refocus after search', () => {
  proposal = readRouteProposal({ proposal: signalClujRouteProposal })
  render()
  act(() => [...container.querySelectorAll('button')].find(button => button.textContent === 'Confirm position')!.click())
  const before = structuredClone(latest)
  const candidate = [...container.querySelectorAll('button')].find(button => button.textContent?.startsWith('CP6 ·'))!
  act(() => candidate.click())
  act(() => mocks.maps[0].flyTo({ center: [24, 47], zoom: 14 }))
  act(() => candidate.click())
  expect(mocks.maps[0].flyTo).toHaveBeenLastCalledWith({ center: [23.5955112, 46.7683841], zoom: 16 })
  expect(mocks.maps[0].flyTo).toHaveBeenCalledTimes(3)
  expect(latest).toEqual(before)
  expect(container.textContent).toContain('1 of 2 positions confirmed')
  expect(mocks.configuration).not.toHaveBeenCalled()
})


test('map precedes one expanded form and collapsed research, with responsive height', () => {
  proposal = readRouteProposal({ proposal: signalClujRouteProposal })
  render()
  const map = container.querySelector('[data-testid="position-map"]')!
  expect(map.className).toContain('sm:h-[500px]')
  expect(map.className).toContain('h-[360px]')
  const list = container.querySelector('[aria-label="Checkpoint positions"]')!
  expect(map.compareDocumentPosition(list) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  expect(container.querySelectorAll('input[aria-label="Latitude"]')).toHaveLength(1)
  const research = [...container.querySelectorAll('details')].find(detail => detail.querySelector('summary')?.textContent === 'Location research & safety notes')!
  expect(research.open).toBe(false)
  expect(list.compareDocumentPosition(research) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  act(() => research.querySelector('summary')!.click())
  expect(research.open).toBe(true)
  act(() => research.querySelector('summary')!.click())
  expect(research.open).toBe(false)
})

test('dragging changes local coordinates and resets confirmation without creating unpositioned pins', () => {
  render()
  expect(mocks.markers).toHaveLength(1)
  act(() => [...container.querySelectorAll('button')].find(button => button.textContent === 'Confirm position')!.click())
  const marker = mocks.markers.at(-1)!
  marker.coordinates = [24, 47]
  act(() => marker.handlers.get('dragend')!())
  expect(latest[0]).toMatchObject({ latitude: 47, longitude: 24 })
  expect(latest[1].latitude).toBeUndefined()
  expect(container.textContent).toContain('0 of 2 positions confirmed')
  expect(container.textContent).toContain('Positioned · not saved')
  clickMap(48, 25)
  expect(latest[0].latitude).toBe(47)
})


test('saved position changes to unsaved after placement and only confirmed valid positions can continue', () => {
  render()
  expect(container.textContent).toContain('Saved position')
  expect(container.textContent).toContain('Not positioned')
  clickMap(47, 24)
  expect(container.textContent).not.toContain('Saved position')
  expect(container.textContent).toContain('Positioned · not saved')
  act(() => container.querySelector<HTMLButtonElement>('[data-checkpoint="2"]')!.click())
  expect([...container.querySelectorAll('button')].find(button => button.textContent === 'Confirm position')!.disabled).toBe(true)
})

test('FinishPoint has F selection and placement without increasing normal count or fabricating a pin', () => {
  finishInitial = { ...createFinishPointDraft(), name: 'Finish' }
  render()
  expect(mocks.markers).toHaveLength(1)
  expect(container.querySelectorAll('[data-checkpoint]')).toHaveLength(3)
  act(() => container.querySelector<HTMLButtonElement>('[data-checkpoint="F"]')!.click())
  clickMap(47, 24)
  expect(latestFinish).toMatchObject({ latitude: 47, longitude: 24 })
  expect(latest).toHaveLength(2)
  const marker = mocks.markers.findLast(item => item.element.isConnected && item.element.textContent === 'F')!
  expect(marker.element.textContent).toBe('F')
  expect(marker.element.getAttribute('aria-pressed')).toBe('true')
  act(() => container.querySelector<HTMLButtonElement>('[data-checkpoint="1"]')!.click())
  act(() => mocks.markers.findLast(item => item.element.isConnected && item.element.textContent === 'F')!.element.click())
  expect(container.querySelector('[data-checkpoint="F"]')!.getAttribute('aria-pressed')).toBe('true')
  const finishMarker = mocks.markers.findLast(item => item.element.isConnected && item.element.textContent === 'F')!
  finishMarker.coordinates = [25, 48]
  act(() => finishMarker.handlers.get('dragend')!())
  expect(latestFinish).toMatchObject({ latitude: 48, longitude: 25 })
  expect(mocks.configuration).not.toHaveBeenCalled()
})


test.each(['name', 'research'])('unpositioned Signal Cluj opens at the existing Cluj view via %s without placing or confirming points', context => {
  initial = createCheckpointDrafts(6, [])
  if (context === 'name') templateName = 'Signal: Cluj Napoca'
  else proposal = readRouteProposal({ proposal: signalClujRouteProposal })
  const before = structuredClone(initial)
  render()
  expect(mocks.maps[0].options).toMatchObject({ center: [23.6236, 46.7712], zoom: 14 })
  expect(latest).toEqual(before)
  expect(mocks.markers).toHaveLength(context === 'research' ? 7 : 0)
  expect(mocks.markers.map(marker => marker.element.textContent)).toEqual(context === 'research' ? ['1', '2', '3', '4', '5', '6', 'F'] : [])
  expect(mocks.markers.every(marker => marker.options.draggable === false)).toBe(true)
  expect(mocks.configuration).not.toHaveBeenCalled()
  expect(container.textContent).toContain('0 of 6 positions confirmed')
})

test('saved checkpoint geography takes priority over FinishPoint and Signal context', () => {
  templateName = 'Signal: Cluj Napoca'
  initial = [{ ...saved, latitude: 51.5, longitude: -0.12 }]
  finishInitial = { name: 'Finish', latitude: 48.85, longitude: 2.35, radiusMeters: 30 }
  render()
  expect(mocks.maps[0].options).toMatchObject({ center: [-0.12, 51.5], zoom: 14 })
  expect(mocks.configuration).not.toHaveBeenCalled()
})

test('valid FinishPoint geography takes priority over Signal context when normal points are unpositioned', () => {
  templateName = 'Signal: Cluj Napoca'
  initial = createCheckpointDrafts(2, [])
  finishInitial = { name: 'Finish', latitude: 48.85, longitude: 2.35, radiusMeters: 30 }
  render()
  expect(mocks.maps[0].options).toMatchObject({ center: [2.35, 48.85], zoom: 14 })
  expect(latest.every(point => point.latitude === undefined)).toBe(true)
  expect(mocks.configuration).not.toHaveBeenCalled()
})

test('Templates without geographic context use the regional overview without fabricated pins', () => {
  initial = createCheckpointDrafts(2, [])
  render()
  expect(mocks.maps[0].options).toMatchObject({ center: [23.6236, 46.7712], zoom: 3 })
  expect(mocks.markers).toHaveLength(0)
  expect(mocks.configuration).not.toHaveBeenCalled()
})


test('non-Signal Templates use existing sourced research context only for the camera', () => {
  initial = createCheckpointDrafts(2, [])
  proposal = structuredClone(signalClujRouteProposal)
  proposal.candidates.forEach(candidate => { candidate.address = 'Another city' })
  const reference = proposal.candidates.map(candidate => candidateReference(candidate, proposal!)).find(point => !!point)!
  render()
  expect(mocks.maps[0].options).toMatchObject({ center: [reference.longitude, reference.latitude], zoom: 14 })
  expect(mocks.markers).toHaveLength(0)
  expect(mocks.configuration).not.toHaveBeenCalled()
})

test('invalid saved positions do not override valid saved geography', () => {
  initial = [{ ...saved, latitude: 999 }, { ...saved, checkpointNumber: 2, latitude: 51.5, longitude: -0.12 }]
  render()
  expect(mocks.maps[0].options).toMatchObject({ center: [-0.12, 51.5], zoom: 14 })
  expect(mocks.markers).toHaveLength(1)
})


test('reference/card/arrival selection stays synchronized and references never satisfy confirmation', () => {
  proposal = readRouteProposal({ proposal: signalClujRouteProposal })
  finishInitial = { name: "Tailors' Tower — exterior", radiusMeters: 5 }
  initial = createCheckpointDrafts(6, [])
  render()
  const reference = () => mocks.markers.findLast(marker => marker.element.isConnected && marker.element.getAttribute('aria-label')?.startsWith('Select provisional landmark 6'))!
  act(() => reference().element.click())
  expect(container.querySelector('[data-checkpoint="6"]')!.getAttribute('aria-pressed')).toBe('true')
  expect(reference().element.getAttribute('aria-pressed')).toBe('true')
  expect(latest[5].latitude).toBeUndefined()
  expect(container.querySelector<HTMLButtonElement>('.bg-emerald-500')!.disabled).toBe(true)
  expect(mocks.configuration).not.toHaveBeenCalled()
  expect(mocks.maps[0].sources.get('tedix-proposed-landmarks').data.geometry.coordinates).toHaveLength(6)
  // Reference selection suppresses placement from the same click, then a later deliberate click places an arrival.
  vi.spyOn(Date, 'now').mockReturnValue(Date.now() + 1000)
  clickMap(46.7686, 23.5959)
  const arrival = mocks.markers.findLast(marker => marker.element.isConnected && marker.element.getAttribute('aria-label')?.startsWith('Select checkpoint 6'))!
  expect(arrival.options.draggable).toBe(true)
  expect(arrival.element.className).toContain('bg-emerald-700')
  expect(arrival.handlers.has('dragend')).toBe(true)
  expect(reference().handlers.has('dragend')).toBe(false)
  expect(mocks.configuration).toHaveBeenLastCalledWith({ normalCheckpointCount: 6, checkpointPositions: [{ checkpointNumber: 6, name: 'Checkpoint 6', radiusMeters: 5, latitude: 46.7686, longitude: 23.5959 }] })
  act(() => container.querySelector<HTMLButtonElement>('[data-checkpoint="F"]')!.click())
  expect(reference().element.getAttribute('aria-pressed')).toBe('false')
  expect(mocks.markers.findLast(marker => marker.element.isConnected && marker.element.getAttribute('aria-label')?.startsWith('Select provisional landmark F'))!.element.getAttribute('aria-pressed')).toBe('true')
  act(() => arrival.element.click())
  expect(container.querySelector('[data-checkpoint="6"]')!.getAttribute('aria-pressed')).toBe('true')
  vi.restoreAllMocks()
})

test('all seven sourced references fit initially and expose metadata without network lookup or saved geography', () => {
  proposal = readRouteProposal({ proposal: signalClujRouteProposal })
  finishInitial = { name: "Tailors' Tower — exterior", radiusMeters: 5 }
  initial = createCheckpointDrafts(6, [])
  vi.stubGlobal('fetch', vi.fn())
  render()
  const map = mocks.maps[0]
  const pins = mocks.markers.filter(marker => marker.element.isConnected)
  expect(pins.map(marker => marker.element.textContent)).toEqual(['1', '2', '3', '4', '5', '6', 'F'])
  expect(pins.every(marker => marker.options.draggable === false && !marker.handlers.has('dragend'))).toBe(true)
  expect(map.fitBounds).toHaveBeenCalledOnce()
  expect(map.fitBounds.mock.calls[0][0].coordinates).toEqual(pins.map(marker => marker.coordinates))
  expect(map.fitBounds.mock.calls[0][1]).toEqual({ padding: { top: 180, bottom: 64, left: 64, right: 64 }, maxZoom: 16, duration: 0 })
  expect(container.querySelector('[data-checkpoint="1"]')!.closest('article')!.textContent).toContain('Wikidata Q368963')
  expect(container.querySelector('a[href="https://www.wikidata.org/wiki/Q368963"]')).not.toBeNull()
  const source = [...container.querySelectorAll('details')].find(detail => detail.querySelector('summary')?.textContent === 'Reference source & uncertainty')!
  expect(source.open).toBe(false)
  act(() => pins[4].element.click())
  expect(container.querySelector('[data-checkpoint="5"]')!.getAttribute('aria-pressed')).toBe('true')
  expect(container.textContent).toContain('OSM node 963409421')
  expect(map.fitBounds).toHaveBeenCalledOnce()
  expect(latest.every(point => point.latitude === undefined)).toBe(true)
  expect(latestFinish!.latitude).toBeUndefined()
  expect(mocks.configuration).not.toHaveBeenCalled()
  expect(fetch).not.toHaveBeenCalled()
})

test('unidentified replacement landmark remains unresolved and its sequence has a gap', () => {
  proposal = structuredClone(signalClujRouteProposal)
  proposal.candidates[2].landmark = 'Unknown replacement building'
  initial = createCheckpointDrafts(6, [])
  render()
  expect(document.querySelector('[aria-label^="Select provisional landmark 3"]')).toBeNull()
  act(() => container.querySelector<HTMLButtonElement>('[data-checkpoint="3"]')!.click())
  expect(container.querySelector('[data-checkpoint="3"]')!.closest('article')!.textContent).toContain('Reference location unavailable')
  expect(container.textContent).toContain('Incomplete sequence')
  expect(mocks.maps[0].sources.get('tedix-proposed-landmarks').data.geometry.coordinates).toHaveLength(4)
  expect(mocks.configuration).not.toHaveBeenCalled()
})


test('nearby provisional badges separate on screen without moving sourced coordinates or authoring arrivals', () => {
  proposal = readRouteProposal({ proposal: signalClujRouteProposal })
  initial = createCheckpointDrafts(6, [])
  render()
  const map = mocks.maps[0]
  const pins = mocks.markers.filter(marker => marker.element.isConnected)
  const before = pins.map(marker => [...marker.coordinates])
  map.project.mockReturnValue({ x: 100, y: 100 })
  act(() => map.emit('moveend'))
  expect(pins[0].setOffset).toHaveBeenLastCalledWith([24, -24])
  expect(pins[1].setOffset).toHaveBeenLastCalledWith([24, 28])
  expect(pins.map(marker => marker.coordinates)).toEqual(before)
  expect(pins.every(marker => marker.options.draggable === false)).toBe(true)
  expect(latest.every(point => point.latitude === undefined)).toBe(true)
  expect(mocks.configuration).not.toHaveBeenCalled()
})
