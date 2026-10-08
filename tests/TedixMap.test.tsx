import { act, StrictMode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { TedixMap } from '../src/components/TedixMap'

const mocks = vi.hoisted(() => ({
  createMap: vi.fn(),
  remove: vi.fn(),
  resize: vi.fn(),
  setStyle: vi.fn(),
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
    },
  },
}))

let container: HTMLDivElement
let root: Root
let onResize: ResizeObserverCallback

beforeEach(() => {
  vi.clearAllMocks()
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
