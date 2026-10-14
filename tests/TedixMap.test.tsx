import { act, StrictMode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { TedixMap } from '../src/components/TedixMap'

const mocks = vi.hoisted(() => ({
  createMap: vi.fn(),
  remove: vi.fn(),
  resize: vi.fn(),
  setStyle: vi.fn(),
  flyTo: vi.fn(),
  observe: vi.fn(),
  disconnect: vi.fn(),
}))
vi.mock('mapbox-gl', () => ({
  default: {
    Map: class {
      constructor(options: unknown) { mocks.createMap(options) }
      remove = mocks.remove
      resize = mocks.resize
      setStyle = mocks.setStyle
      flyTo = mocks.flyTo
    },
  },
}))

let container: HTMLDivElement
let root: Root
let onResize: ResizeObserverCallback

beforeEach(() => {
  vi.clearAllMocks()
  vi.useFakeTimers()
  vi.stubEnv('VITE_MAPBOX_ACCESS_TOKEN', 'test-public-token')
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  vi.stubGlobal('ResizeObserver', class {
    constructor(callback: ResizeObserverCallback) { onResize = callback }
    observe = mocks.observe
    disconnect = mocks.disconnect
  })
  container = document.createElement('div')
  document.body.append(container)
  root = createRoot(container)
})

afterEach(() => {
  act(() => root.unmount())
  container.remove()
  vi.useRealTimers()
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

function render(props = {}) {
  act(() => root.render(<TedixMap initialLongitude={23.59} initialLatitude={46.77} {...props} />))
}

test('initializes Mapbox with the configured public token and initial camera', () => {
  render({ initialZoom: 9 })
  expect(mocks.createMap).toHaveBeenCalledExactlyOnceWith({
    container: container.querySelector('[aria-label="Map"]'),
    accessToken: 'test-public-token',
    center: [23.59, 46.77],
    zoom: 9,
    style: 'mapbox://styles/mapbox/streets-v12',
  })
  expect(mocks.observe).toHaveBeenCalledWith(container.querySelector('[aria-label="Map"]'))
})

test('supports zero coordinates and zoom, a custom style and container class', () => {
  render({ initialLongitude: 0, initialLatitude: 0, initialZoom: 0, mapStyle: 'mapbox://styles/mapbox/dark-v11', className: 'custom-map' })
  expect(mocks.createMap.mock.calls[0][0]).toMatchObject({ center: [0, 0], zoom: 0, style: 'mapbox://styles/mapbox/dark-v11' })
  expect(container.firstElementChild?.classList.contains('custom-map')).toBe(true)
})

test('defaults zoom and preserves the interactive camera on rerender', () => {
  render()
  expect(mocks.createMap.mock.calls[0][0].zoom).toBe(12)
  render({ initialLongitude: -74, initialLatitude: 40, initialZoom: 4 })
  expect(mocks.createMap).toHaveBeenCalledTimes(1)
  expect(mocks.remove).not.toHaveBeenCalled()
})

test('updates the style without recreating the map', () => {
  render()
  render({ mapStyle: 'mapbox://styles/mapbox/light-v11' })
  expect(mocks.setStyle).toHaveBeenCalledExactlyOnceWith('mapbox://styles/mapbox/light-v11')
  expect(mocks.createMap).toHaveBeenCalledTimes(1)
})

test.each([undefined, '', '   '])('handles a missing or blank token (%s)', (token) => {
  vi.stubEnv('VITE_MAPBOX_ACCESS_TOKEN', token)
  render()
  expect(container.querySelector('[role="status"]')?.textContent).toContain('Configure VITE_MAPBOX_ACCESS_TOKEN')
  expect(mocks.createMap).not.toHaveBeenCalled()
  expect(mocks.observe).not.toHaveBeenCalled()
})

test('uses the environment token after trimming whitespace', () => {
  vi.stubEnv('VITE_MAPBOX_ACCESS_TOKEN', '  another-test-public-token  ')
  render()
  expect(mocks.createMap.mock.calls[0][0].accessToken).toBe('another-test-public-token')
})

test('resizes for container changes and cleans up on unmount', () => {
  render()
  onResize([], {} as ResizeObserver)
  expect(mocks.resize).toHaveBeenCalledOnce()
  act(() => root.unmount())
  expect(mocks.disconnect).toHaveBeenCalledOnce()
  expect(mocks.remove).toHaveBeenCalledOnce()
  root = createRoot(container)
})

test('cleans up each map instance during StrictMode remounts', () => {
  act(() => root.render(<StrictMode><TedixMap initialLongitude={23} initialLatitude={46} /></StrictMode>))
  expect(mocks.createMap).toHaveBeenCalledTimes(2)
  expect(mocks.remove).toHaveBeenCalledTimes(1)
  act(() => root.unmount())
  expect(mocks.remove).toHaveBeenCalledTimes(2)
  expect(mocks.disconnect).toHaveBeenCalledTimes(2)
  root = createRoot(container)
})

async function search(query: string) {
  const input = container.querySelector('input')!
  act(() => input.focus())
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, query)
    input.dispatchEvent(new Event('input', { bubbles: true }))
  })
  await act(async () => { await vi.advanceTimersByTimeAsync(300) })
  return input
}

const suggestions = [{ mapbox_id: 'place-1', name: 'Cluj', place_formatted: 'Romania' }]

test.each(['city', 'street', 'address', 'landmark'])('searches %s and selects by touch/click without replacing the map', async (query) => {
  const fetchMock = vi.fn()
    .mockResolvedValueOnce({ ok: true, json: async () => ({ suggestions }) })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ features: [{ geometry: { coordinates: [23.6, 46.8] } }] }) })
  vi.stubGlobal('fetch', fetchMock)
  render({ locationSearch: true })
  const input = await search(query)
  expect(fetchMock.mock.calls[0][0]).toContain(`q=${query}`)
  expect(container.textContent).toContain('Romania')
  await act(async () => container.querySelector('button')!.click())
  expect(mocks.flyTo).toHaveBeenCalledExactlyOnceWith({ center: [23.6, 46.8], zoom: 16 })
  expect(mocks.createMap).toHaveBeenCalledTimes(1)
  expect(mocks.remove).not.toHaveBeenCalled()
  expect(input.value).toBe('Cluj')
  const suggestUrl = new URL(fetchMock.mock.calls[0][0])
  const retrieveUrl = new URL(fetchMock.mock.calls[1][0])
  expect(retrieveUrl.searchParams.get('session_token')).toBe(suggestUrl.searchParams.get('session_token'))
  expect(suggestUrl.searchParams.get('access_token')).toBe('test-public-token')
  expect(suggestUrl.searchParams.get('proximity')).toBe('23.59,46.77')
  expect(fetchMock.mock.calls.every(([url]) => url.startsWith('https://api.mapbox.com/search/searchbox/v1/'))).toBe(true)
})

test('selects a location with arrow keys and Enter', async () => {
  vi.stubGlobal('fetch', vi.fn()
    .mockResolvedValueOnce({ ok: true, json: async () => ({ suggestions }) })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ features: [{ geometry: { coordinates: [1, 2] } }] }) }))
  render({ locationSearch: true })
  const input = await search('Cluj')
  act(() => input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })))
  expect(input.getAttribute('aria-activedescendant')).toBeTruthy()
  await act(async () => input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })))
  expect(mocks.flyTo).toHaveBeenCalledWith({ center: [1, 2], zoom: 16 })
})

test.each([
  { ok: true, json: async () => ({ suggestions: [] }), message: 'No locations found.' },
  { ok: false, message: 'Location search unavailable.' },
])('shows empty/error state without moving the map', async (response) => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response))
  render({ locationSearch: true })
  const input = container.querySelector('input')!
  act(() => input.focus())
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, 'unknown')
    input.dispatchEvent(new Event('input', { bubbles: true }))
  })
  expect(container.textContent).toContain('Searching…')
  await act(async () => { await vi.advanceTimersByTimeAsync(300) })
  expect(container.textContent).toContain(response.message)
  expect(mocks.flyTo).not.toHaveBeenCalled()
})

test('handles retrieval failure and Escape without moving the map', async () => {
  vi.stubGlobal('fetch', vi.fn()
    .mockResolvedValueOnce({ ok: true, json: async () => ({ suggestions }) })
    .mockResolvedValueOnce({ ok: false }))
  render({ locationSearch: true })
  const input = await search('Cluj')
  await act(async () => container.querySelector('button')!.click())
  expect(container.textContent).toContain('Location search unavailable.')
  act(() => input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })))
  expect(container.querySelector('[role="listbox"]')).toBeNull()
  expect(mocks.flyTo).not.toHaveBeenCalled()
})

test('cancels stale searches and keeps optional search independent of map lifecycle', async () => {
  let resolveOld: (response: unknown) => void = () => {}
  const fetchMock = vi.fn()
    .mockImplementationOnce(() => new Promise((resolve) => { resolveOld = resolve }))
    .mockResolvedValueOnce({ ok: true, json: async () => ({ suggestions }) })
  vi.stubGlobal('fetch', fetchMock)
  render({ locationSearch: true })
  await search('old query')
  await search('new query')
  expect(fetchMock.mock.calls[0][1].signal.aborted).toBe(true)
  await act(async () => resolveOld({ ok: true, json: async () => ({ suggestions: [{ mapbox_id: 'old', name: 'Old result' }] }) }))
  expect(container.textContent).toContain('Cluj')
  expect(container.textContent).not.toContain('Old result')
  render({ locationSearch: false })
  expect(container.querySelector('input')).toBeNull()
  expect(mocks.createMap).toHaveBeenCalledTimes(1)
  expect(mocks.remove).not.toHaveBeenCalled()
})

test.each([401, 403, 429])('search reports Mapbox HTTP %s explicitly', async status => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status }))
  render({ locationSearch: true }); await search('piata mihai')
  expect(container.textContent).toContain(status === 429 ? 'Mapbox search limit reached' : 'Mapbox search authorization failed')
  expect(mocks.flyTo).not.toHaveBeenCalled()
})

test('invalid retrieved coordinates never move the camera', async () => {
  vi.stubGlobal('fetch', vi.fn()
    .mockResolvedValueOnce({ ok: true, json: async () => ({ suggestions }) })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ features: [{ geometry: { coordinates: [200, 100] } }] }) }))
  render({ locationSearch: true }); await search('piata mihai')
  await act(async () => container.querySelector('button')!.click())
  expect(container.textContent).toContain('Location search unavailable')
  expect(mocks.flyTo).not.toHaveBeenCalled()
})

test.each([{}, { features: [] }, { features: [{}] }, { features: [{ geometry: { coordinates: [null, 2] } }] }])('missing or invalid geometry fails safely: %j', async response => {
  vi.stubGlobal('fetch', vi.fn()
    .mockResolvedValueOnce({ ok: true, json: async () => ({ suggestions }) })
    .mockResolvedValueOnce({ ok: true, json: async () => response }))
  render({ locationSearch: true }); await search('Cluj')
  await act(async () => container.querySelector('button')!.click())
  expect(mocks.flyTo).not.toHaveBeenCalled()
  expect(container.textContent).toContain('Location search unavailable')
  expect(container.querySelector('input')!.readOnly).toBe(false)
})

test('pending selection keeps focus and ignores repeated Enter before retrieval completes', async () => {
  let resolve: (value: unknown) => void = () => {}
  const fetchMock = vi.fn()
    .mockResolvedValueOnce({ ok: true, json: async () => ({ suggestions }) })
    .mockImplementationOnce(() => new Promise(done => { resolve = done }))
  vi.stubGlobal('fetch', fetchMock)
  render({ locationSearch: true })
  const input = await search('Cluj')
  act(() => input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })))
  await act(async () => {
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
  })
  expect(fetchMock).toHaveBeenCalledTimes(2)
  expect(document.activeElement).toBe(input)
  expect(input.disabled).toBe(false)
  expect(input.readOnly).toBe(true)
  expect(container.textContent).toContain('Loading location')
  await act(async () => resolve({ ok: true, json: async () => ({ features: [{ geometry: { coordinates: [23.6, 46.8] } }] }) }))
  expect(mocks.flyTo).toHaveBeenCalledExactlyOnceWith({ center: [23.6, 46.8], zoom: 16 })
  expect(container.querySelector('[role="listbox"]')).toBeNull()
})


test.each(['click', 'keyboard'])('selected retrieval survives blur, proximity changes and suggest cleanup (%s)', async interaction => {
  let resolve: (value: unknown) => void = () => {}
  const fetchMock = vi.fn()
    .mockResolvedValueOnce({ ok: true, json: async () => ({ suggestions }) })
    .mockImplementationOnce(() => new Promise(done => { resolve = done }))
  vi.stubGlobal('fetch', fetchMock)
  render({ locationSearch: true })
  const input = await search('Statuia Mihai Viteazul, Cluj-Napoca')
  if (interaction === 'click') act(() => container.querySelector('button')!.click())
  else {
    act(() => input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })))
    act(() => input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })))
  }
  act(() => input.blur())
  render({ locationSearch: true, initialLongitude: 24, initialLatitude: 47 })
  expect(fetchMock.mock.calls[1][1].signal.aborted).toBe(false)
  expect(container.textContent).toContain('Loading location')
  await act(async () => resolve({ ok: true, json: async () => ({ features: [{ geometry: { coordinates: [23.5905, 46.7742] } }] }) }))
  expect(mocks.flyTo).toHaveBeenCalledExactlyOnceWith({ center: [23.5905, 46.7742], zoom: 16 })
  expect(container.textContent).toContain('Location selected.')
  expect(mocks.createMap).toHaveBeenCalledOnce()
})

test.each([401, 403, 500])('retrieve HTTP %s remains visibly reported after blur and permits retry', async status => {
  let resolve: (value: unknown) => void = () => {}
  vi.stubGlobal('fetch', vi.fn()
    .mockResolvedValueOnce({ ok: true, json: async () => ({ suggestions }) })
    .mockImplementationOnce(() => new Promise(done => { resolve = done })))
  render({ locationSearch: true })
  const input = await search('statuia')
  act(() => container.querySelector('button')!.click())
  act(() => input.blur())
  await act(async () => resolve({ ok: false, status }))
  expect(container.textContent).toContain(status === 500 ? 'Location search unavailable' : 'Mapbox search authorization failed')
  expect(input.readOnly).toBe(false)
  expect(mocks.flyTo).not.toHaveBeenCalled()
})

test.each(['Escape', 'unmount'])('explicit %s cancels pending retrieval and ignores late results', async action => {
  let resolve: (value: unknown) => void = () => {}
  const fetchMock = vi.fn()
    .mockResolvedValueOnce({ ok: true, json: async () => ({ suggestions }) })
    .mockImplementationOnce(() => new Promise(done => { resolve = done }))
  vi.stubGlobal('fetch', fetchMock)
  render({ locationSearch: true }); const input = await search('statuia')
  act(() => container.querySelector('button')!.click())
  if (action === 'Escape') act(() => input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })))
  else render({ locationSearch: false })
  expect(fetchMock.mock.calls[1][1].signal.aborted).toBe(true)
  await act(async () => resolve({ ok: true, json: async () => ({ features: [{ geometry: { coordinates: [23.5905, 46.7742] } }] }) }))
  expect(mocks.flyTo).not.toHaveBeenCalled()
})
