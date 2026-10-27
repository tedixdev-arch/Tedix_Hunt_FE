import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, afterEach, test, expect, vi } from 'vitest'
import { TemplateOneExperience } from '../src/pages/template-one/TemplateOneExperience'
import { ParticipantReadinessPage } from '../src/pages/ParticipantReadinessPage'
import { OrganizerMonitorPage } from '../src/pages/OrganizerMonitor'

vi.mock('../src/pages/OrganizerFlow', () => ({ OrganizerHeader: () => <header>Organizer</header> }))
let root: Root, container: HTMLDivElement
beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  vi.stubGlobal('fetch', vi.fn(() => { throw new Error('Unexpected notification') }))
  sessionStorage.clear()
  container = document.createElement('div'); document.body.append(container); root = createRoot(container)
})
afterEach(() => { act(() => root.unmount()); container.remove(); vi.useRealTimers(); vi.unstubAllGlobals() })
function button(label: string) {
  const found = [...container.querySelectorAll('button')].find(b => b.textContent === label || b.getAttribute('aria-label') === label)
  expect(found, label).toBeDefined(); return found!
}
function click(label: string) { act(() => button(label).click()) }
function play() {
  act(() => root.render(<MemoryRouter initialEntries={[{ pathname: '/play/template-1', state: { startNewMission: true, difficulty: 'easy' } }]}><TemplateOneExperience /></MemoryRouter>))
  click('Get help')
}
function guidance() {
  expect(container.textContent).toContain('simulation only')
  expect(container.textContent).toContain('does not notify an Organizer, Supervisor or emergency service')
  expect(container.textContent).toContain('contact your Organizer or Supervisor directly')
  expect(container.textContent).toContain('contact local emergency services')
  expect(container.textContent).not.toMatch(/Request sent|Organizer received|Cancel request|700 123 456/)
}
test.each([' ', 'Enter'])('accessible HELP control and %s hold never acknowledge delivery; close/reopen and scoring still work', key => {
  vi.useFakeTimers(); play(); guidance()
  const dialog = container.querySelector('[role="dialog"]')!
  expect(dialog.getAttribute('aria-modal')).toBe('true')
  expect(document.getElementById(dialog.getAttribute('aria-labelledby')!)).not.toBeNull()
  const hold = button('Press and hold to simulate'); hold.focus(); expect(document.activeElement).toBe(hold)
  act(() => hold.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })))
  act(() => vi.advanceTimersByTime(2100)); guidance()
  expect(container.textContent).toContain('Simulation ended — nothing was sent')
  expect(container.textContent).toContain('Nobody was notified')
  expect(fetch).not.toHaveBeenCalled()
  click('Try simulation again'); click('Cancel'); expect(container.querySelector('[role="dialog"]')).toBeNull()
  click('Get help'); click('Cancel'); click('Hunt Score 500. How scoring works'); click('Back to hunt')
  expect(container.querySelector('[role="dialog"]')).toBeNull()
})
test('pointer hold, release, cancellation, blur and unmount clean up local timers', () => {
  vi.useFakeTimers(); play()
  const hold = button('Press and hold to simulate'); hold.setPointerCapture = vi.fn()
  const pointer = (event: string) => act(() => hold.dispatchEvent(new Event(event, { bubbles: true })))
  for (const cancel of ['pointerup', 'pointercancel', 'pointerout']) {
    pointer('pointerdown'); act(() => vi.advanceTimersByTime(500)); pointer(cancel)
    act(() => vi.advanceTimersByTime(2200)); expect(container.textContent).not.toContain('Simulation ended')
  }
  hold.focus(); pointer('pointerdown'); act(() => hold.blur()); act(() => vi.advanceTimersByTime(2200))
  expect(container.textContent).not.toContain('Simulation ended')
  pointer('pointerdown'); act(() => vi.advanceTimersByTime(2100)); pointer('pointerup'); guidance()
  click('Return to the Hunt'); click('Get help'); const reopened = button('Press and hold to simulate'); reopened.setPointerCapture = vi.fn(); act(() => reopened.dispatchEvent(new Event('pointerdown', { bubbles: true })))
  act(() => root.render(null)); expect(vi.getTimerCount()).toBe(0); expect(fetch).not.toHaveBeenCalled()
})
test('readiness gives truthful guidance and still starts the chosen difficulty', () => {
  act(() => root.render(<MemoryRouter initialEntries={['/ready']}><Routes><Route path="/ready" element={<ParticipantReadinessPage />} /><Route path="/play/template-1" element={<TemplateOneExperience />} /></Routes></MemoryRouter>))
  expect(container.textContent).toContain('does not send HELP/PANIC requests, location or hunt status')
  expect(container.textContent).not.toContain('It sends your location')
  expect(button('Begin the Hunt').disabled).toBe(true)
  click('Hard×2'); act(() => container.querySelector('input')!.click()); click('Begin the Hunt')
  click('Get help'); guidance(); expect(fetch).not.toHaveBeenCalled()
})
test('monitor labels sample requests and local dismissal; unrelated controls remain usable', () => {
  act(() => root.render(<MemoryRouter initialEntries={['/monitor?mode=independent']}><OrganizerMonitorPage /></MemoryRouter>))
  expect(container.textContent).toContain('Monitoring prototype — simulated data')
  expect(container.textContent).toContain('not real Participant requests')
  expect(container.textContent).toContain('Demo · Simulated help alert')
  click('Dismiss demo alert')
  expect(container.textContent).toContain('real safety status unknown')
  expect(container.textContent).not.toContain('No active safety alerts')
  click('Restore demo alert'); click('Pause Hunt'); click('Resume Hunt'); click('Message everyone')
  expect(container.textContent).toContain('no Participants were notified')
  click('End Hunt'); expect(container.textContent).toContain('Completed'); expect(fetch).not.toHaveBeenCalled()
})
