import { intendedExperiments, experimentalEntries, discardExperiment } from '../src/features/creator/exercises/experimentDrafts'
import { act, useState } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { prototypes, personalTypes, schemas, validateExercise, checkAnswer, independentExercise, emptyAttempt, teamNames, type Exercise, type Attempt } from '../src/features/creator/exercises/catalog'
import { ExerciseRenderer } from '../src/features/creator/exercises/ExerciseRenderer'
import { ExercisePreview } from '../src/features/creator/exercises/ExercisePreview'
import { ChallengeAuthoring, type AuthoringDraft } from '../src/features/creator/exercises/ChallengeAuthoring'
import { ExerciseContentEditor } from '../src/features/creator/exercises/ExerciseContentEditor'
import { savedExercise } from '../src/features/creator/exercises/savedExercises'
import { checkpointExercises } from '../src/data/templateOne'
import { hydrateGameplay, serializeGameplay } from '../src/features/creator/checkpointGameplay'

let container: HTMLDivElement, root: Root
beforeEach(() => {
  vi.spyOn(window, 'confirm').mockReturnValue(true)
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  container = document.createElement('div'); document.body.append(container); root = createRoot(container)
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', '') }
  HTMLDialogElement.prototype.close = function () { this.removeAttribute('open') }
})
afterEach(() => { act(() => root.unmount()); container.remove(); vi.useRealTimers(); vi.restoreAllMocks(); vi.unstubAllGlobals() })
async function render(node: React.ReactNode) { await act(async () => root.render(node)) }
async function click(label: string) {
  const button = [...container.querySelectorAll('button')].find(b => b.textContent === label || b.getAttribute('aria-label') === label)
  expect(button, label).toBeDefined(); await act(async () => button!.click())
}
async function input(element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement, value: string) {
  await act(async () => {
    const prototype = element instanceof HTMLSelectElement ? HTMLSelectElement.prototype : element instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype
    Object.getOwnPropertyDescriptor(prototype, 'value')!.set!.call(element, value)
    element.dispatchEvent(new Event(element instanceof HTMLSelectElement || element.type === 'range' ? 'change' : 'input', { bubbles: true }))
  })
}
function correctAttempt(e: Exercise): Attempt {
  const a = emptyAttempt(), d = e.data
  a.text = String(e.type === 'number-line' ? d.target : e.type === 'find-mistake' ? d.mistake : d.answer ?? '')
  a.selected = (d.answers as string[]) ?? []
  a.order = (d.order ?? d.construction ?? []) as string[]
  a.rule = String(d.rule ?? ''); a.explanation = String(d.explanation ?? '')
  if (['tap-pair', 'match-columns'].includes(e.type)) (d.right as string[]).forEach((v, i) => { a.values[i] = v })
  if (e.type === 'drag-drop') (d.assignments as string[]).forEach((v, i) => { a.values[i] = v })
  if (['fill-blank', 'legacy-fields'].includes(e.type)) (d.answers as string[]).forEach((v, i) => { a.values[i] = v })
  return a
}

test('canonical names, levels and stable type IDs are complete and independent of story names', () => {
  expect(personalTypes.map(row => row[1])).toEqual(['Tap & pair the relevant', 'Single choice', 'True / False', 'Memory card', 'Number line', 'Multiple choice', 'Match the columns', 'Drag & drop', 'Fill in the blank', 'Sequence', 'Find the mistake', 'Build the problem (LEGO-like)', 'Number pattern', 'Shape pattern', 'Rule discovery'])
  expect(personalTypes.map(row => row[2])).toEqual([...Array(5).fill('Easy'), ...Array(4).fill('Medium'), ...Array(6).fill('Hard')])
  expect(new Set(prototypes.map(e => e.type)).size).toBe(15)
})
for (const e of prototypes) {
  test(`${e.type}: valid concrete prototype accepts correct and rejects incorrect/incomplete answers`, () => {
    expect(validateExercise(e)).toEqual([])
    expect(checkAnswer(e, correctAttempt(e))).toBe(true)
    expect(checkAnswer(e, emptyAttempt())).toBe(false)
    const incorrect = correctAttempt(e); incorrect.text = 'incorrect'; incorrect.selected = ['incorrect']; incorrect.order = ['incorrect']; incorrect.values = {}; incorrect.rule = 'incorrect'; incorrect.explanation = 'incorrect'
    expect(checkAnswer(e, incorrect)).toBe(false)
    expect(e.hint.trim()).not.toBe(''); expect(e.solution.trim()).not.toBe('')
  })
  test(`${e.type}: rejects malformed type-specific data`, () => {
    for (const field of schemas[e.type]) {
      const bad = structuredClone(e); bad.data[field.key] = field.format === 'number' ? NaN : field.format === 'boolean' ? 'not a boolean' : field.format === 'lines' ? [] : ''
      expect(validateExercise(bad).length, field.key).toBeGreaterThan(0)
    }
  })
  test(`${e.type}: renders intended controls, checks answers, hint, solution and reset`, async () => {
    await render(<ExerciseRenderer exercise={e} />)
    await click('Check answer'); expect(container.querySelector('[role="status"]')?.textContent).toBe(e.incorrectFeedback)
    const d = e.data, textInput = () => container.querySelector('input:not([type="radio"]):not([type="checkbox"])') as HTMLInputElement
    switch (e.type) {
      case 'tap-pair': {
        const buttons = () => [...container.querySelectorAll('[aria-label="Tap and pair cards"] button')] as HTMLButtonElement[]
        for (let i = 0; i < (d.left as string[]).length; i++) {
          await act(async () => buttons()[i].click())
          await act(async () => buttons()[buttons().length - 1 - i].click())
        }
        break
      }
      case 'single-choice': case 'shape-pattern': await click(String(d.answer)); break
      case 'true-false': await click('false'); break
      case 'multiple-choice': {
        const checks = [...container.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')]
        for (const [i, option] of (d.options as string[]).entries()) if ((d.answers as string[]).includes(option)) await act(async () => checks[i].click())
        break
      }
      case 'match-columns': for (const [i, answer] of (d.right as string[]).entries()) await input(container.querySelectorAll('select')[i], answer); break
      case 'drag-drop': for (const [i, answer] of (d.assignments as string[]).entries()) await input(container.querySelectorAll('select')[i], answer); break
      case 'fill-blank': for (const [i, answer] of (d.answers as string[]).entries()) await input(container.querySelectorAll('input')[i], answer); break
      case 'sequence': case 'build-problem': for (const piece of (d.order ?? d.construction) as string[]) {
        const candidates = [...container.querySelectorAll<HTMLButtonElement>('button')].filter(b => b.textContent === piece && !b.disabled && !b.getAttribute('aria-label')?.startsWith('Remove'))
        await act(async () => candidates[0].click())
      } break
      case 'find-mistake': {
        await act(async () => (container.querySelectorAll('input[type="radio"]')[Number(d.mistake) - 1] as HTMLInputElement).click())
        await click('Check answer'); expect(container.textContent).toContain('Now explain')
        await click(String(d.explanation)); break
      }
      case 'rule-discovery': await click(String(d.rule)); await input(textInput(), String(d.answer)); break
      default: await input(textInput(), String(e.type === 'number-line' ? d.target : d.answer))
    }
    await click('Check answer'); expect(container.querySelector('[role="status"]')?.textContent).toBe(e.correctFeedback)
    await click('Hint'); expect(container.querySelector('[aria-label="Exercise hint"]')?.textContent).toBe(e.hint)
    await click('Solution'); expect(container.querySelector('[aria-label="Exercise solution"]')?.textContent).toBe(e.solution)
    await click('Reset'); expect(container.querySelector('[role="status"]')).toBeNull(); expect(container.querySelector('[aria-label="Exercise hint"]')).toBeNull(); expect(container.querySelector('[aria-label="Exercise solution"]')).toBeNull()
    await click('Check answer'); expect(container.querySelector('[role="status"]')?.textContent).toBe(e.incorrectFeedback)
  })
  test(`${e.type}: editor exposes its own schema and retains edited content`, async () => {
    let latest = structuredClone(e)
    function Harness() { const [exercise, update] = useState(e); return <ExerciseContentEditor exercise={exercise} onChange={next => { latest = next; update(next) }} /> }
    await render(<Harness />)
    expect(container.querySelector('fieldset')?.querySelectorAll('label').length).toBe(schemas[e.type].length)
    const title = container.querySelector('textarea')!; await input(title, 'Independent title'); expect(latest.title).toBe('Independent title'); expect(e.title).not.toBe('Independent title')
  })
}
test('number line validates target reachability, range, tolerance and finite numbers', () => {
  const e = structuredClone(prototypes.find(e => e.type === 'number-line')!)
  for (const data of [{ min: 12 }, { target: 13 }, { tolerance: -1 }, { step: 4, target: 6 }, { max: Infinity }]) expect(validateExercise({ ...e, data: { ...e.data, ...data } }).length).toBeGreaterThan(0)
})
test('relational validation rejects invalid options, pair lengths, orders, assignments, blanks and explanations', () => {
  const cases: [string, Record<string, any>][] = [
    ['single-choice', { answer: 'missing' }], ['multiple-choice', { answers: ['missing'] }], ['tap-pair', { right: ['4'] }], ['match-columns', { right: ['4'] }], ['sequence', { order: ['8', '8', '2'] }], ['drag-drop', { assignments: ['Invalid', 'Odd', 'Even'] }], ['fill-blank', { parts: ['no blank', '___'] }], ['find-mistake', { mistake: 0 }], ['build-problem', { construction: ['missing'] }], ['rule-discovery', { rule: 'missing' }], ['shape-pattern', { terms: ['●', '▲'] }], ['number-pattern', { terms: ['1', '___', '___'] }], ['memory-card', { revealDelayMs: 500 }],
  ]
  for (const [type, data] of cases) { const e = prototypes.find(e => e.type === type)!; expect(validateExercise({ ...e, data: { ...e.data, ...data } }), type).not.toEqual([]) }
})
test('Memory card preserves reference recall/reveal delay and resets the recall stage', async () => {
  vi.useFakeTimers(); const exercise = prototypes.find(e => e.type === 'memory-card')!
  await render(<ExerciseRenderer exercise={exercise} />)
  expect((container.querySelectorAll('button')[0] as HTMLButtonElement).disabled).toBe(true)
  await act(async () => vi.advanceTimersByTime(1000)); await click('Reveal recall card')
  expect(container.querySelector('[aria-label="Recall card answer"]')?.textContent).toBe('81')
  await click('Reset'); expect(container.querySelector('[aria-label="Recall card answer"]')).toBeNull()
  expect((container.querySelectorAll('button')[0] as HTMLButtonElement).disabled).toBe(true)
})
test('all seven Team mechanics preserve identifiers, concrete Signal content and answer validation', () => {
  const before = structuredClone(checkpointExercises)
  expect(Object.keys(teamNames)).toEqual(checkpointExercises.map(e => e.teamKind))
  expect(Object.values(teamNames)).toEqual(['Word Reconstruction', 'Shared Information Puzzle', 'Collaborative Deduction', 'Sequence Assembly', 'Clue Synthesis', 'Information Filtering', 'Shared Code Assembly'])
  for (const row of checkpointExercises) {
    const e = savedExercise(row, 'teamKind')!
    expect(e.type).toBe(row.teamKind); expect(e.instructions).toBe(row.teamPrompt); expect(validateExercise(e), e.type).toEqual([])
    expect(checkAnswer(e, correctAttempt(e)), e.type).toBe(true)
    expect(checkAnswer(e, emptyAttempt()), e.type).toBe(false)
    const personal = savedExercise(row, 'kind')!
    expect(validateExercise(personal), row.kind).toEqual([]); expect(checkAnswer(personal, correctAttempt(personal)), row.kind).toBe(true)
  }
  expect(checkpointExercises).toEqual(before)
})
for (const row of checkpointExercises) test(`${row.teamKind}: Team controls, answer check, hint, solution and reset`, async () => {
  const e = savedExercise(row, 'teamKind')!
  await render(<ExerciseRenderer exercise={e} />)
  expect(container.textContent).toContain(row.publicContributions[0])
  await click('Check answer'); expect(container.textContent).toContain(e.incorrectFeedback)
  if (e.type === 'filter-noise') {
    for (const [i, text] of row.publicContributions.entries()) if ((e.data.answers as string[]).includes(text.split(':')[0].toUpperCase())) await act(async () => (container.querySelectorAll('input[type="checkbox"]')[i] as HTMLInputElement).click())
  } else if (row.teamOptions.length) await click(row.teamAnswer)
  else await input(container.querySelector('input')!, row.teamAnswer)
  await click('Check answer'); expect(container.querySelector('[role="status"]')?.textContent).toBe(e.correctFeedback)
  await click('Hint'); await click('Solution'); expect(container.textContent).toContain(e.solution)
  await click('Reset'); expect(container.querySelector('[role="status"]')).toBeNull()
})
test('saved overrides are simulated without replacing them with local story defaults', () => {
  const saved = { kind: 'hidden-rule', prompt: 'Saved question', correctAnswers: { x: '42' }, hint: 'Saved hint', solutionIntro: 'Saved solution', solutionSteps: ['Use saved data'], personalChallenge: { question: 'Nested saved question', answer: '99', hints: ['Nested hint'], solution: 'Nested solution' } }
  const before = structuredClone(saved), e = savedExercise(saved, 'kind')!
  expect(e.instructions).toBe('Nested saved question'); expect(e.data.answers).toEqual(['99']); expect(e.hint).toBe('Nested hint'); expect(e.solution).toBe('Nested solution'); expect(saved).toEqual(before)
})
function AuthoringHarness({ field = 'kind' }: { field?: 'kind' | 'teamKind' }) {
  const [draft, setDraft] = useState<AuthoringDraft>({ source: 'saved', assignment: 'predefined' })
  return <><output>{intendedExperiments({ current: draft }) ? 'Submission blocked' : 'Supported submission'}</output><ChallengeAuthoring field={field} value={{ kind: 'hidden-rule', teamKind: 'scrambled-word' }} onChange={() => {}} draft={draft} onDraftChange={setDraft} /></>
}
test('custom copy, inline testing and toggling preserve independent editor state', async () => {
  const before = structuredClone(prototypes)
  await render(<AuthoringHarness />); await click('Create Your Own')
  await input(container.querySelector('textarea')!, 'Unsaved title')
  await click('Apply to Hunt'); expect(container.textContent).toContain('Submission blocked')
  await click('Test Challenge'); expect(container.querySelector('[aria-label="Test Challenge"]')?.textContent).toContain('Unsaved title')
  await click('Return to Edit'); expect(container.querySelector('textarea')?.value).toBe('Unsaved title')
  await click('Predefined'); expect(container.textContent).toContain('Submission blocked')
  await click('Create Your Own'); expect(container.querySelector('textarea')?.value).toBe('Unsaved title')
  expect(prototypes).toEqual(before)
})
test('Predefined selection is read-only and custom copies never mutate shared examples', async () => {
  const before = structuredClone(prototypes)
  await render(<AuthoringHarness />)
  await input(container.querySelector('select')!, 'true-false')
  expect(container.textContent).toContain('Even product'); expect(container.querySelector('textarea')).toBeNull()
  expect(container.textContent).toContain('Supported submission')
  await click('Create Your Own'); expect(container.querySelector('select')?.value).toBe('true-false')
  await input(container.querySelector('textarea')!, 'Independent statement'); expect(prototypes).toEqual(before)
  const first = independentExercise(prototypes[0]), second = independentExercise(prototypes[0]); expect(first.id).not.toBe(second.id)
})
test('Team custom editor offers exactly the seven existing mechanics', async () => {
  await render(<AuthoringHarness field="teamKind" />); await click('Create Your Own')
  expect([...container.querySelector('select')!.options].map(o => o.value)).toEqual(Object.keys(teamNames))
  expect(container.textContent).toContain('Letter contributions'); expect(container.textContent).toContain('Submission blocked')
})
test('invalid unsaved configurations cannot launch a crashing simulator', async () => {
  await render(<ExercisePreview exercise={{ ...prototypes[0], data: { left: [], right: [] } }} onClose={() => {}} />)
  expect(container.querySelector('[role="alert"]')?.textContent).toContain('Fix the configuration')
  expect(container.querySelector('[aria-label="tap-pair interactive exercise"]')).toBeNull()
})
test('supported saved payloads including FinishPoint round-trip without migration', () => {
  const normal = checkpointExercises.slice(0, 6).map(row => ({ ...structuredClone(row), role: 'normal' as const }))
  const terminal = { ...structuredClone(checkpointExercises[6]), role: 'terminal' as const }
  delete (terminal as any).checkpoint
  const checkpoints = [...normal, terminal]
  const content = { key: 'fixture', version: 3, displayName: 'Signal', theme: 'City', mission: 'Go', configuration: {}, scoring: {}, checkpoints }
  const hydrated = hydrateGameplay(content)
  expect(serializeGameplay(hydrated.normal, 6, hydrated.terminal, checkpoints)).toEqual(checkpoints)
})


test('viewing Predefined retains custom content and only explicit actions change assignment', async () => {
  await render(<AuthoringHarness />); await click('Create Your Own')
  await input(container.querySelector('textarea')!, 'Retained experiment')
  expect(container.textContent).toContain('Supported submission')
  await click('Apply to Hunt'); await click('Predefined'); expect(container.textContent).toContain('Submission blocked')
  await click('Use this challenge'); expect(container.textContent).toContain('Supported submission')
  await click('Create Your Own'); expect(container.querySelector('textarea')?.value).toBe('Retained experiment')
  await click('Discard changes'); await click('Create Your Own'); expect(container.querySelector('textarea')?.value).not.toBe('Retained experiment')
})
test('discard targets a single checkpoint/classification slot and includes retained inactive examples', () => {
  const e = independentExercise(prototypes[0])
  const drafts = { 'kind:0': { source: 'saved' as const, assignment: 'custom' as const, custom: e }, 'kind:terminal': { source: 'example' as const, assignment: 'custom' as const, exercise: prototypes[1] }, 'teamKind:0': { source: 'custom' as const, custom: e, assignment: 'predefined' as const } }
  expect(experimentalEntries(drafts)).toHaveLength(3)
  expect(intendedExperiments(drafts)).toBe(true)
  const next = discardExperiment(drafts, 'kind:0')
  expect(Object.keys(next)).toEqual(['kind:terminal', 'teamKind:0']); expect(drafts['kind:0'].custom).toBe(e)
  expect(next['kind:terminal']).toBe(drafts['kind:terminal']); expect(next['teamKind:0']).toBe(drafts['teamKind:0'])
  expect(intendedExperiments(discardExperiment(next, 'kind:terminal'))).toBe(false)
})

test('choosing another exercise type retains authored type variants until explicit discard', async () => {
  await render(<AuthoringHarness />); await click('Create Your Own')
  const chooseType = async (type: string) => input(container.querySelector('select')!, type)
  await chooseType('true-false'); await input(container.querySelector('textarea')!, 'Retained truth statement')
  await chooseType('number-line'); await input(container.querySelector('textarea')!, 'Retained numeric exercise')
  await chooseType('true-false'); expect(container.querySelector('textarea')?.value).toBe('Retained truth statement')
  await chooseType('number-line'); expect(container.querySelector('textarea')?.value).toBe('Retained numeric exercise')
  await click('Discard changes'); await click('Create Your Own'); await chooseType('true-false')
  expect(container.querySelector('textarea')?.value).not.toBe('Retained truth statement')
})
