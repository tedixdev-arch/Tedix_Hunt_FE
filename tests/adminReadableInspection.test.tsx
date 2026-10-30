import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { TemplateContentInspection } from '../src/features/admin/TemplateContentInspection'
import type { CreatorTemplateContent } from '../src/services/api/creatorTemplates'
vi.mock('../src/components/TedixMap', () => ({ TedixMap: () => <div /> }))
let root: Root, container: HTMLDivElement, content: CreatorTemplateContent
beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true); container = document.createElement('div'); document.body.append(container); root = createRoot(container)
  content = { key: 'exact', version: 4, displayName: 'Submitted mystery', theme: 'City', mission: { name: 'Saved mission', briefing: 'Saved briefing', metadata: { privateSource: 'Raw source metadata' } }, configuration: { durationMinutes: 75, normalCheckpointCount: 2, teamSize: '3–5', equipment: 'Notebook', participantInstructions: 'Follow the marked route.', checkpointPositions: [{ checkpointNumber: 2, name: 'Tower', latitude: 47, longitude: 24, radiusMeters: 25 }, { checkpointNumber: 1, name: 'Museum', latitude: 46, longitude: 23, radiusMeters: 30 }], finishPoint: { name: 'Final garden', latitude: 48, longitude: 25, radiusMeters: 20 }, internalFlag: 'Raw-only setting' }, scoring: { startingScore: 500, hintUsed: -10, customFormula: 'Raw-only formula' }, checkpoints: [{ checkpoint: 2, kind: 'square', name: 'Clock mystery', prompt: 'Saved square question' }, { role: 'terminal', kind: 'shared-final-key', teamKind: 'shared-final-key', teamPrompt: 'Saved final question', teamAnswer: '2397' }, { checkpoint: 1, kind: 'hidden-rule', teamKind: 'scrambled-word', navigationMode: 'compass', prompt: 'Submitted question v4', correctAnswers: { result: 'Submitted answer v4' }, hint: 'Saved hint', solutionSteps: ['Saved solution step'] }] }
})
afterEach(() => { act(() => root.unmount()); container.remove(); vi.unstubAllGlobals() })
async function render(category: 'local' | 'universal' | null = 'local') { await act(async () => root.render(<TemplateContentInspection content={content} version={4} category={category} />)) }
const primary = () => { const clone = container.cloneNode(true) as HTMLElement; clone.querySelectorAll('[aria-label="Technical details"]').forEach(node => node.remove()); return clone }
test('readable exact gameplay orders checkpoint number, name, position and configured activities', async () => {
  const original = structuredClone(content); await render()
  const section = container.querySelector('[aria-label="Submitted checkpoints"]')!
  expect([...section.querySelectorAll('h4')].map(node => node.textContent)).toEqual(['Checkpoint 1', 'Checkpoint 2'])
  const first = section.querySelector('li')!.textContent!
  expect(first.indexOf('Checkpoint 1')).toBeLessThan(first.indexOf('Museum')); expect(first.indexOf('Museum')).toBeLessThan(first.indexOf('Coordinates: 46, 23')); expect(first.indexOf('Coordinates: 46, 23')).toBeLessThan(first.indexOf('Personal Challenge'))
  expect(first).toContain('Find the missing output'); expect(first).toContain('Submitted question v4'); expect(first).toContain('Submitted answer v4'); expect(first).toContain('Saved hint'); expect(first).toContain('Saved solution step')
  expect(content).toEqual(original)
})
test('FinishPoint position and terminal gameplay are separate from numbered checkpoints', async () => {
  await render(); const finish = container.querySelector('[aria-label="Submitted FinishPoint"]')!
  expect(finish.textContent).toContain('Final garden'); expect(finish.textContent).toContain('Coordinates: 48, 25'); expect(finish.textContent).toContain('Terminal gameplay'); expect(finish.textContent).toContain('Saved final question'); expect(finish.textContent).toContain('2397')
  expect(container.querySelector('[aria-label="Submitted checkpoints"]')!.textContent).not.toContain('Saved final question')
})
test('settings and scoring use ordinary labels; raw unknown values are collapsed', async () => {
  await render(); const view = primary().textContent!
  for (const label of ['Duration (minutes)75', 'Team size3–5', 'EquipmentNotebook', 'Participant instructionsFollow the marked route.', 'Starting score500', 'Hint used-10']) expect(view).toContain(label)
  expect(view).not.toMatch(/internalFlag|customFormula|privateSource|Raw-only|Raw source metadata/)
  const technical = container.querySelector<HTMLDetailsElement>('details[aria-label="Technical details"]')!
  expect(technical.open).toBe(false); expect(technical.querySelector('summary')!.textContent).toBe('Technical details'); expect(technical.textContent).toContain('Raw-only setting')
})
test('Universal has no saved geography or fixed position labels, while retaining actual activities', async () => {
  await render('universal'); expect(primary().textContent).not.toContain('Coordinates:'); expect(container.textContent).not.toContain('Final garden'); expect(container.textContent).not.toContain('Saved geography'); expect(primary().textContent).toContain('Find the missing output')
})
test('missing optional fields remain explicit without invented activity, location or settings defaults', async () => {
  content = { ...content, mission: '', configuration: {}, scoring: {}, checkpoints: [{ checkpointNumber: 1, challenge: { prompt: 'Legacy submitted question', answer: 'Saved legacy answer' } }] }
  await render(null); const view = primary().textContent!
  expect(view).toContain('Name not submitted'); expect(view).toContain('Position not submitted or invalid'); expect(view).toContain('Legacy submitted question'); expect(view).toContain('Saved legacy answer'); expect(view).toContain('Activity type not submitted'); expect(view).toContain('No terminal gameplay submitted'); expect(view).not.toMatch(/undefined|null|NaN|Find the missing output|Notebook|500/)
})
test('duplicate or invalid saved positions do not select a convenient alternative', async () => {
  content.configuration.checkpointPositions = [{ checkpointNumber: 1, name: 'A', latitude: 46, longitude: 23, radiusMeters: 30 }, { checkpointNumber: 1, name: 'B', latitude: 47, longitude: 24, radiusMeters: 30 }]
  await render(); expect(primary().querySelector('[aria-label="Submitted checkpoints"]')!.textContent).not.toContain('Coordinates:'); expect(primary().textContent).toContain('Position not submitted or invalid')
})
