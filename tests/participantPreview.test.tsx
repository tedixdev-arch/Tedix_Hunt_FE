import { act, useEffect } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { beforeEach, afterEach, test, expect, vi } from 'vitest'
import { ParticipantPreview } from '../src/features/creator/ParticipantPreview'
import type { CreatorTemplateContent } from '../src/services/api/creatorTemplates'

const map = vi.hoisted(() => ({ props: {} as any, mounts: 0, unmounts: 0 }))
vi.mock('../src/components/TedixMap', () => ({ TedixMap: (props: any) => {
  map.props = props
  useEffect(() => { map.mounts++; return () => { map.unmounts++ } }, [])
  return <div aria-label="Shared map" />
} }))
const point = { checkpointNumber: 1, name: 'Museum', latitude: 46.77, longitude: 23.59, radiusMeters: 30 }
const finish = { name: 'Secret Finish', latitude: 46.78, longitude: 23.64, radiusMeters: 17 }
let root: Root, container: HTMLDivElement, content: CreatorTemplateContent
const exit = vi.fn()
beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  vi.stubGlobal('fetch', vi.fn(() => { throw new Error('Preview attempted a network request') }))
  vi.stubGlobal('navigator', { geolocation: { getCurrentPosition: vi.fn(), watchPosition: vi.fn() } })
  map.mounts = 0; map.unmounts = 0; exit.mockReset()
  content = { key: 'trail', version: 1, displayName: 'Trail', theme: 'City', mission: 'Go', scoring: { model: 'platform', startingScore: 500 },
    configuration: { normalCheckpointCount: 2, checkpointPositions: [point, { ...point, checkpointNumber: 2, name: 'Secret CP2' }], finishPoint: finish },
    checkpoints: [{ checkpoint: 1, kind: 'square', teamKind: 'hypothesis', navigationMode: 'compass', custom: { prompt: 'Saved prompt only' } }, { checkpoint: 2 }, { role: 'terminal', kind: 'radial', teamKind: 'clue-synthesis' }] }
  container = document.createElement('div'); document.body.append(container); root = createRoot(container)
})
afterEach(() => { act(() => root.unmount()); container.remove(); vi.unstubAllGlobals() })
function render() { act(() => root.render(<ParticipantPreview content={content} onExit={exit} />)) }
async function click(label: string) {
  const button = [...container.querySelectorAll('button')].find(button => button.textContent === label)!
  expect(button, label).toBeDefined()
  await act(async () => button.click())
}
async function resolve(label: string) { await click(`Inspect ${label}`); await click(`Simulate ${label} completion`) }

test('manual full journey gates progression and completion, hides future details, keeps one map, and has no side effects', async () => {
  const before = structuredClone(content)
  const writes = vi.spyOn(Storage.prototype, 'setItem')
  render()
  expect(map.mounts).toBe(0)
  expect(container.textContent).toContain('Visibility approximation')
  await click('Start preview')
  expect(container.textContent).toContain('CP1')
  expect(container.textContent).not.toContain('Secret CP2')
  expect(container.textContent).not.toContain('Secret Finish')
  expect(map.props.checkpoints).toHaveLength(1)
  expect(map.props.finishPoint).toBeUndefined()
  expect(map.props.cameraTarget).toEqual(point)
  expect(map.props.onMapClick).toBeUndefined()
  expect(map.props.locationSearch).toBeUndefined()
  expect(container.textContent).toContain('Discovery radius: 30 m')
  expect(container.textContent).toContain('Saved mode: compass')
  expect(container.querySelector('[aria-label="Checkpoint activities"]')).toBeNull()
  await click('Simulate arrival')
  const continueButton = [...container.querySelectorAll('button')].find(button => button.textContent === 'Continue to next checkpoint')!
  expect(continueButton.disabled).toBe(true)
  await click('Inspect Personal Challenge')
  expect(container.querySelector('[aria-label="Saved checkpoint configuration"]')!.textContent).toContain('Saved prompt only')
  expect(map.mounts).toBe(1)
  await click('Simulate Personal Challenge completion')
  expect(continueButton.disabled).toBe(true)
  await resolve('Team Challenge')
  expect(continueButton.disabled).toBe(false)
  await click('Continue to next checkpoint')
  expect(container.textContent).toContain('Secret CP2')
  expect(container.textContent).not.toContain('Secret Finish')
  expect(map.props.checkpoints[0].checkpointNumber).toBe(2)
  await click('Simulate arrival'); await click('Continue to next checkpoint')
  expect(container.textContent).toContain('Secret Finish')
  expect(map.props.checkpoints).toEqual([])
  expect(map.props.finishPoint).toEqual(finish)
  await click('Simulate arrival')
  expect(container.textContent).not.toContain('Simulated Hunt complete')
  const completeButton = [...container.querySelectorAll('button')].find(button => button.textContent === 'Simulate Hunt completion')!
  expect(completeButton.disabled).toBe(true)
  await resolve('Personal Challenge'); expect(completeButton.disabled).toBe(true)
  await resolve('Team Challenge'); expect(completeButton.disabled).toBe(false)
  await click('Simulate Hunt completion')
  expect(container.textContent).toContain('Simulated Hunt complete')
  expect(map.mounts).toBe(1)
  expect(content).toEqual(before)
  expect(fetch).not.toHaveBeenCalled()
  expect(navigator.geolocation.getCurrentPosition).not.toHaveBeenCalled()
  expect(navigator.geolocation.watchPosition).not.toHaveBeenCalled()
  expect(writes).not.toHaveBeenCalled()
  writes.mockRestore()
  await click('← Exit preview'); expect(exit).toHaveBeenCalledOnce()
})

test('restart clears progress and open activities; a new session begins fresh', async () => {
  render(); await click('Start preview'); await click('Simulate arrival'); await resolve('Personal Challenge'); await click('Inspect Team Challenge')
  await click('Restart preview')
  expect(container.querySelector('[aria-label="Team Challenge simulation"]')).toBeNull()
  expect(container.textContent).not.toContain('Simulated activity resolved')
  await click('Start preview'); await click('Simulate arrival')
  expect(container.textContent).toContain('Awaiting manual simulation')
  expect([...container.querySelectorAll('button')].find(button => button.textContent === 'Continue to next checkpoint')!.disabled).toBe(true)
  act(() => root.render(null)); render()
  expect(container.textContent).toContain('Start preview')
  expect(container.textContent).not.toContain('Simulated arrival')
})

test('unsupported configuration and missing locations stay inspectable without mock questions or repaired geography', async () => {
  content.configuration.checkpointPositions = []
  delete content.configuration.finishPoint
  content.checkpoints[0] = { checkpoint: 1, kind: { future: true }, teamKind: '', actual: ['saved'] }
  render(); await click('Start preview')
  expect(container.textContent).toContain('missing or invalid geography')
  expect(container.textContent).toContain('Feature 2')
  expect(map.props.cameraTarget).toBeUndefined()
  expect(map.props.checkpoints).toEqual([])
  await click('Simulate arrival'); await click('Inspect Personal Challenge')
  expect(container.textContent).toContain('Unsupported saved value')
  expect(container.querySelector('pre')!.textContent).toContain('future')
  expect(container.querySelector('input')).toBeNull()
  await click('Simulate Personal Challenge completion')
  await resolve('Team Challenge'); await click('Continue to next checkpoint')
})

test('Escape closes activity first, then exits; keyboard navigation remains in preview', async () => {
  render()
  expect(document.activeElement).toBe(container.querySelector('button'))
  await click('Start preview'); await click('Simulate arrival'); await click('Inspect Personal Challenge')
  act(() => container.querySelector('main')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })))
  expect(container.querySelector('pre')).toBeNull()
  expect(exit).not.toHaveBeenCalled()
  const first = container.querySelector('button')!
  first.focus()
  act(() => first.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true })))
  expect(document.activeElement).toBe([...container.querySelectorAll('button:not(:disabled)')].at(-1))
  act(() => container.querySelector('main')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })))
  expect(exit).toHaveBeenCalledOnce()
})
