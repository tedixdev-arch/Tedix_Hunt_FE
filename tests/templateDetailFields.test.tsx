import { act, useState } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { AgeRangeField, DurationField, ParticipantRangeField, TeamSizeField } from '../src/features/creator/TemplateDetailFields'
import { validateTemplateDetails } from '../src/features/creator/templateDetailRules'
let root: Root, container: HTMLDivElement, latest: Record<string, string>
beforeEach(() => { vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true); container = document.createElement('div'); document.body.append(container); root = createRoot(container) })
afterEach(() => { act(() => root.unmount()); container.remove(); vi.unstubAllGlobals() })
function Harness({ initial }: { initial: Record<string, string> }) {
  const [d, setD] = useState(initial); latest = d
  const errors = validateTemplateDetails({ age: d.age, duration: d.duration, participants: d.participants, teamSize: d.teamSize, format: d.format }, false)
  const set = (key: string) => (value: string) => setD(current => ({ ...current, [key]: value }))
  return <><AgeRangeField value={d.age} onChange={set('age')} error={errors.age} /><DurationField value={d.duration} onChange={set('duration')} error={errors.duration} />
    <ParticipantRangeField value={d.participants} onChange={set('participants')} error={errors.participants} /><TeamSizeField format={d.format} participants={d.participants} value={d.teamSize} onChange={set('teamSize')} error={errors.teamSize} /></>
}
const start = { age: '12–16', duration: '90', participants: '16–40', teamSize: '4', format: 'Team Hunters' }
const el = (selector: string) => container.querySelector(selector) as HTMLSelectElement & HTMLInputElement
async function set(selector: string, value: string) { await act(async () => { const node = el(selector); Object.getOwnPropertyDescriptor(node.tagName === 'SELECT' ? HTMLSelectElement.prototype : HTMLInputElement.prototype, 'value')!.set!.call(node, value); node.dispatchEvent(new Event(node.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true })) }) }

test('age and participant ranges offer standard choices plus a custom minimum/maximum', async () => {
  await act(async () => root.render(<Harness initial={start} />))
  expect([...el('#template-age-range').options].map(o => o.text)).toEqual(['Choose age range', '6–9 years', '10–12 years', '12–16 years', '16–18 years', '18+ (adults)', 'Custom range'])
  expect(el('#template-age-range').selectedOptions[0].text).toBe('12–16 years')
  expect(el('#template-participant-range').options).toHaveLength(7)
  await set('#template-age-range', '4'); expect(latest.age).toBe('18+')
  await set('#template-participant-range', 'custom')
  await set('[aria-label="Minimum participant"]', '50'); await set('[aria-label="Maximum participant"]', '20')
  expect(latest.participants).toBe('50–20'); expect(container.textContent).toContain('cannot be greater than the maximum')
  await set('[aria-label="Maximum participant"]', '80'); expect(latest.participants).toBe('50–80'); expect(container.querySelector('[role=alert]')).toBeNull()
})
test('duration and team size limits are enforced with inline messages', async () => {
  await act(async () => root.render(<Harness initial={start} />))
  expect(el('[aria-describedby="template-duration-error"]').min).toBe('15'); expect(el('[aria-describedby="template-duration-error"]').max).toBe('480')
  await set('[aria-describedby="template-duration-error"]', '600'); expect(container.textContent).toContain('between 15 and 480')
  await set('[aria-describedby="template-duration-error"]', '120')
  await set('[aria-label="Maximum team size"]', '60'); expect(container.textContent).toContain('team size range must be between 2 and 10')
  await set('[aria-label="Maximum team size"]', '6'); expect(latest.teamSize).toBe('4–6'); expect(container.querySelector('[role=alert]')).toBeNull()
})
test('Single Hunters have no team size', async () => {
  await act(async () => root.render(<Harness initial={{ ...start, format: 'Single Hunters', teamSize: '' }} />))
  expect(container.textContent).toContain('Not applicable: Single Hunters play individually')
  expect(container.querySelector('[aria-label="Minimum team size"]')).toBeNull()
})
test('team size choices are generated from the participant range, with a custom range option', async () => {
  await act(async () => root.render(<Harness initial={{ ...start, teamSize: '3–5' }} />))
  expect([...el('#template-team-size').options].map(o => o.text)).toEqual(['Choose team size range', '2–3 members', '2–4 members', '3–4 members', '3–5 members',
    '4–5 members', '4–6 members', '5–6 members', '5–8 members', '6–8 members', '6–10 members', '8–10 members', 'Custom range'])
  expect(el('#template-team-size').selectedOptions[0].text).toBe('3–5 members')
  await set('#template-participant-range', '0')
  // 2–10 participants: no team larger than 10 and no minimum team above 2; 3–5 no longer fits and is replaced.
  expect([...el('#template-team-size').options].map(o => o.text)).toEqual(['Choose team size range', '2–3 members', '2–4 members', 'Custom range'])
  expect(latest.teamSize).toBe('2–4'); expect(el('#template-team-size').selectedOptions[0].text).toBe('2–4 members')
  await set('#template-team-size', '0'); expect(latest.teamSize).toBe('2–3')
  await set('#template-team-size', 'custom'); expect(el('[aria-label="Maximum team size"]').max).toBe('10')
})
test('an empty team size is filled in automatically and impossible participant ranges are explained', async () => {
  await act(async () => root.render(<Harness initial={{ ...start, teamSize: '' }} />))
  expect(latest.teamSize).toBe('3–5')
  await set('#template-participant-range', 'custom')
  await set('[aria-label="Minimum participant"]', '1'); await set('[aria-label="Maximum participant"]', '6')
  expect(container.textContent).toContain('Team Hunters need a participant minimum of at least 2')
})
