import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { beforeEach, afterEach, test, expect, vi } from 'vitest'
import { NavigationPreview } from '../src/features/creator/NavigationPreview'
import { supportedGameplay } from '../src/features/creator/checkpointGameplay'
let host: HTMLDivElement, root: Root
beforeEach(() => { vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true); host = document.createElement('div'); document.body.append(host); root = createRoot(host) })
afterEach(() => { act(() => root.unmount()); host.remove(); vi.unstubAllGlobals() })
const render = (value: any, destinationName = 'Museum') => act(() => root.render(<NavigationPreview value={value} checkpointName="Checkpoint 2" destinationName={destinationName} />))
test('every canonical navigation mode renders automatically without invented readings or active controls', () => {
 for (const navigationMode of supportedGameplay.navigationMode) {
  render({ navigationMode })
  expect(host.querySelector('[aria-label="Mobile navigation preview"]')).toBeTruthy()
  expect(host.textContent).not.toMatch(/80 m|Stone Gate|STRONG|RISING|in range/)
  expect(host.querySelector('input,select,textarea,a')).toBeNull()
  expect([...host.querySelectorAll('button')].every(b => b.disabled)).toBe(true)
 }
})
test('saved data drives direction, distance, destination and clue without mutating it', () => {
 const value = Object.freeze({ navigationMode: 'compass', direction: 'SE', distance: '42 m', nextLocation: 'Saved gate', navigationClue: 'Find the red arch.' })
 render(value)
 expect(host.textContent).toContain('Saved gate'); expect(host.textContent).toContain('42 m'); expect(host.textContent).toContain('Find the red arch.')
 expect(host.querySelector('svg')?.getAttribute('aria-label')).toBe('Configured story direction: SE')
 expect(host.textContent).toContain('no live readings')
 render({ navigationMode: 'landmark', navigationClue: 'Look for the bell.' }, 'Library')
 expect(host.querySelector('svg')).toBeNull(); expect(host.textContent).toContain('Library'); expect(host.textContent).toContain('Look for the bell.')
 expect(host.textContent).not.toContain('42 m')
})
test('omitted, none, unknown and prototype content have explicit states', () => {
 render({}); expect(host.textContent).toContain('Choose a Navigation type')
 render({ navigationMode: 'none' }); expect(host.textContent).toContain('No onward navigation')
 render({ navigationMode: 'future' }); expect(host.textContent).toContain('Preview unavailable')
 act(() => root.render(<NavigationPreview value={{}} checkpointName="Checkpoint 1" prototype={{name:'Our trail', instructions:'Find our arch'}} />))
 expect(host.textContent).toContain('Prototype · not saved'); expect(host.textContent).toContain('Find our arch')
 expect(host.querySelector('button')).toBeNull()
})
