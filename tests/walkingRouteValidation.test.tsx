import { act, useEffect } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { beforeEach, afterEach, test, expect, vi } from 'vitest'
import { WalkingRouteValidation, WalkingRouteInspection } from '../src/features/creator/WalkingRouteValidation'

const map = vi.hoisted(() => ({ props: {} as any, mounted: 0, mounts: 0, unmounts: 0 }))
vi.mock('../src/components/TedixMap', () => ({ TedixMap: (props: any) => { map.props = props; useEffect(() => { map.mounted++; map.mounts++; return () => { map.mounted--; map.unmounts++ } }, []); return <div aria-label="Map" /> } }))
const point = { checkpointNumber: 1, name: 'Museum', latitude: 46.77, longitude: 23.59, radiusMeters: 30 }
const configuration = { normalCheckpointCount: 1, checkpointPositions: [point], finishPoint: { name: 'Wall', latitude: 46.78, longitude: 23.64, radiusMeters: 17 } }
const response = { code: 'Ok', waypoints: [{}, {}], routes: [{ geometry: { type: 'LineString', coordinates: [[23.59, 46.77], [23.64, 46.78]] }, legs: [{}], distance: 1450, duration: 900 }] }
let root: Root, container: HTMLDivElement
beforeEach(() => {
  map.mounted = 0; map.mounts = 0; map.unmounts = 0;
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  vi.stubEnv('VITE_MAPBOX_ACCESS_TOKEN', 'test-token')
  vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(response))))
  container = document.createElement('div'); document.body.append(container); root = createRoot(container)
})
afterEach(() => { act(() => root.unmount()); container.remove(); vi.unstubAllGlobals(); vi.unstubAllEnvs() })
function render(value: Record<string, unknown> = configuration) { act(() => root.render(<WalkingRouteValidation configuration={value} />)) }
async function validate() { await act(async () => container.querySelector('button')!.click()) }

test('explicit validation shows ordered route, estimates and advisory safety copy without changing geography', async () => {
  const before = structuredClone(configuration)
  render()
  expect(fetch).not.toHaveBeenCalled()
  await validate()
  expect(container.textContent).toContain('Walking route validated')
  expect(container.textContent).toContain('1.4 km')
  expect(container.textContent).toContain('15 min')
  expect([...container.querySelectorAll('li')].map(el => el.textContent)).toEqual(['CP1', '→ FinishPoint'])
  expect(map.props.walkingRoute).toEqual(response.routes[0].geometry)
  expect(map.props.finishPoint).toEqual(configuration.finishPoint)
  expect(container.textContent).toContain('manual geographic verification')
  expect(configuration).toEqual(before)
})

test.each(['checkpoint', 'finishPoint', 'count'])('changing %s immediately removes metrics and route until recalculated', async field => {
  render(); await validate()
  const next = structuredClone(configuration)
  if (field === 'checkpoint') next.checkpointPositions[0].latitude = 47
  else if (field === 'finishPoint') next.finishPoint.longitude = 24
  else next.normalCheckpointCount = 2
  render(next)
  expect(container.textContent).toContain('Walking route not validated')
  expect(container.textContent).not.toContain('1.4 km')
  expect(map.props.walkingRoute).toBeUndefined()
  if (field !== 'count') { await validate(); expect(container.textContent).toContain('Walking route validated') }
})

test('aborts pending directions on geography change and ignores late responses', async () => {
  let resolve!: (value: Response) => void
  vi.mocked(fetch).mockImplementation(() => new Promise(done => { resolve = done }))
  render(); await validate()
  const signal = vi.mocked(fetch).mock.calls[0][1]!.signal!
  render({ ...configuration, finishPoint: { ...configuration.finishPoint, latitude: 47 } })
  expect(signal.aborted).toBe(true)
  await act(async () => resolve(new Response(JSON.stringify(response))))
  expect(container.textContent).not.toContain('1.4 km')
  expect(map.props.walkingRoute).toBeUndefined()
})

test('radius, name and gameplay edits preserve estimates without writes or new requests', async () => {
  render(); await validate()
  render({ ...configuration, checkpointPositions: [{ ...point, name: 'Renamed', radiusMeters: 50 }], scoring: { model: 'platform' }, finishPointGameplay: { role: 'terminal' } })
  expect(container.textContent).toContain('Walking route validated')
  expect(fetch).toHaveBeenCalledTimes(1)
})

test('routing failure shows an actionable error and no estimate', async () => {
  vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ code: 'NoRoute', routes: [] })))
  render(); await validate()
  expect(container.textContent).toContain('Walking route validation failed')
  expect(container.querySelector('[role="alert"]')?.textContent).toContain('Review checkpoint and FinishPoint')
  expect(map.props.walkingRoute).toBeUndefined()
  expect(container.querySelector('dl')).toBeNull()
})

test('legacy geography stays incomplete without invented locations or requests', () => {
  render({ durationMinutes: 45 })
  expect(container.querySelector('button')!.disabled).toBe(true)
  expect(fetch).not.toHaveBeenCalled()
  expect(map.props.checkpoints).toEqual([])
  expect(map.props.finishPoint).toBeUndefined()
})

test('malformed checkpoint entries show validation errors instead of crashing the map', () => {
  render({ ...configuration, checkpointPositions: [null] })
  expect(container.querySelector('[role="alert"]')?.textContent).toContain('numbering')
  expect(map.props.checkpoints).toEqual([])
  expect(fetch).not.toHaveBeenCalled()
})

function renderInspection(value: Record<string, unknown> = configuration) { act(() => root.render(<WalkingRouteInspection configuration={value} />)) }
async function action(text: string) {
  const button = [...container.querySelectorAll('button')].find(button => button.textContent === text)!
  expect(button).toBeDefined()
  await act(async () => button.click())
}

test('inspection mounts no map initially, opens exactly one, cleans up on close and reopens fresh', async () => {
  const input = { ...structuredClone(configuration), scoring: { solved: 20 }, finishPointGameplay: { role: 'terminal' }, checkpoints: [{ kind: 'challenge' }] }
  const before = structuredClone(input)
  renderInspection(input)
  expect(map.mounts).toBe(0)
  expect(container.querySelector('[aria-label="Map"]')).toBeNull()
  expect(fetch).not.toHaveBeenCalled()
  expect(container.querySelector('button')!.getAttribute('aria-expanded')).toBe('false')
  await action('Inspect walking route')
  expect(map.mounted).toBe(1)
  expect(map.mounts).toBe(1)
  expect(container.querySelectorAll('[aria-label="Map"]')).toHaveLength(1)
  await action('Validate walking route')
  expect(container.textContent).toContain('1.4 km')
  expect(map.mounts).toBe(1)
  renderInspection(input)
  expect(map.mounts).toBe(1)
  await action('Close inspection')
  expect(map.mounted).toBe(0)
  expect(map.unmounts).toBe(1)
  expect(container.querySelector('[aria-label="Map"]')).toBeNull()
  await action('Inspect walking route')
  expect(map.mounted).toBe(1)
  expect(map.mounts).toBe(2)
  expect(container.textContent).toContain('Walking route not validated')
  expect(container.textContent).not.toContain('1.4 km')
  await action('Validate walking route')
  expect(container.textContent).toContain('Walking route validated')
  expect(fetch).toHaveBeenCalledTimes(2)
  expect(input).toEqual(before)
})

test.each(['success', 'failure'])('close cancels pending routing and ignores stale %s after reopening', async outcome => {
  let resolve!: (value: Response) => void
  let reject!: (reason: Error) => void
  vi.mocked(fetch).mockImplementationOnce(() => new Promise((done, fail) => { resolve = done; reject = fail }))
  renderInspection()
  await action('Inspect walking route')
  await action('Validate walking route')
  const signal = vi.mocked(fetch).mock.calls[0][1]!.signal!
  await action('Close inspection')
  expect(signal.aborted).toBe(true)
  expect(map.mounted).toBe(0)
  await action('Inspect walking route')
  await action('Validate walking route')
  expect(container.textContent).toContain('Walking route validated')
  await act(async () => {
    if (outcome === 'success') resolve(new Response(JSON.stringify({ ...response, routes: [{ ...response.routes[0], distance: 9999 }] })))
    else reject(new Error('old request failed'))
  })
  expect(container.textContent).toContain('1.4 km')
  expect(container.textContent).not.toContain('10.0 km')
  expect(container.textContent).not.toContain('validation failed')
  expect(map.mounted).toBe(1)
})
