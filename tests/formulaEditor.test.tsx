import { act, useState } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, expect, test } from 'vitest'
import { PersonalMechanicEditor } from '../src/features/creator/exercises/PersonalMechanicEditor'
import { PersonalChallengeAuthoring } from '../src/features/creator/exercises/PersonalChallengeAuthoring'
import { personalExamples } from '../src/features/creator/exercises/personalExamples'
import { fromPersistence, toPersistence } from '../src/features/creator/exercises/persistenceAdapter'
import { validateExercise, type Exercise } from '../src/features/creator/exercises/catalog'
import { applyFormula, formulaRanges } from '../src/features/creator/exercises/formulaEditing'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true
HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', '') }
let node: HTMLDivElement, root: Root, current: Exercise
beforeEach(() => { node = document.createElement('div'); document.body.append(node); root = createRoot(node) })
afterEach(async () => { await act(async () => root.unmount()); node.remove() })
const button = (name: string) => [...document.querySelectorAll('button')].find(b => b.getAttribute('aria-label') === name || b.textContent === name)!
const frame = () => new Promise(resolve => requestAnimationFrame(resolve))
const click = async (name: string) => { await act(async () => button(name).click()); await frame() }
const write = async (field: HTMLInputElement | HTMLTextAreaElement, value: string) => {
  await act(async () => {
    Object.getOwnPropertyDescriptor(field.tagName === 'INPUT' ? HTMLInputElement.prototype : HTMLTextAreaElement.prototype, 'value')!.set!.call(field, value)
    field.dispatchEvent(new Event('input', { bubbles: true }))
  })
}
const formulaInput = () => document.querySelector<HTMLTextAreaElement>('dialog textarea')!
const card = () => node.querySelector<HTMLInputElement>('[aria-label="Pair cards editor"] input')!
const formula = String.raw`\frac{x^2-1}{x-1}`
async function mount(type = 'tap-pair') {
  const initial = structuredClone(personalExamples.find(e => e.type === type)!)
  function Harness() { const [e, set] = useState(initial); current = e; return <PersonalMechanicEditor exercise={e} onChange={set} /> }
  await act(async () => root.render(<Harness />))
  expect(document.querySelector('.formula-trigger')).toBeNull()
  await click('Complex / LaTeX')
  return initial
}
test('insert, reopen and edit a fraction, preserve mixed text, matching IDs, modes and persistence', async () => {
  const initial = await mount()
  const text = 'Calculate the value of  when x = 2. Other $y_1$.'
  await write(card(), text)
  card().setSelectionRange(23, 23)
  await click('LaTeX for Card 1')
  expect(document.querySelectorAll('dialog')).toHaveLength(1)
  await write(formulaInput(), formula)
  expect(document.querySelector('dialog .katex .mfrac')).not.toBeNull()
  expect((current.authored!.activity as any).left[0].text).toBe(text)
  await click('Insert')
  const inserted = text.slice(0, 23) + '$' + formula + '$' + text.slice(23)
  expect((current.authored!.activity as any).left[0].text).toBe(inserted)
  expect(node.querySelector('.math-field-preview .katex')).not.toBeNull()
  card().setSelectionRange(25, 25)
  await click('LaTeX for Card 1')
  expect(formulaInput().value).toBe(formula)
  await write(formulaInput(), String.raw`\sqrt{x}`)
  await click('Apply')
  const edited = inserted.replace(formula, String.raw`\sqrt{x}`)
  expect((current.authored!.activity as any).left[0].text).toBe(edited)
  expect(current.authored!.expected).toEqual(initial.authored!.expected)
  expect(validateExercise(current)).toEqual([])
  await click('Edit with Preview')
  expect(node.querySelector('.katex')).not.toBeNull()
  await click('Complex / LaTeX')
  expect(card().value).toBe(edited)
  const reopened = fromPersistence(JSON.parse(JSON.stringify(toPersistence(current))))
  expect(toPersistence(reopened)).toEqual(toPersistence(current))
  await act(async () => root.render(<PersonalMechanicEditor exercise={reopened} onChange={() => {}} />))
  expect(node.querySelector('.katex')).not.toBeNull()
})
test('cancel discards changes and restores focus to the field control', async () => {
  await mount()
  const before = toPersistence(current)
  await click('LaTeX for Matching card 1')
  await write(formulaInput(), formula)
  await click('Cancel')
  expect(toPersistence(current)).toEqual(before)
  expect(document.activeElement).toBe(button('LaTeX for Matching card 1'))
  expect(document.querySelector('dialog')).toBeNull()
})
test('Escape cancels the native modal without changing content', async () => {
  await mount()
  const before = toPersistence(current)
  await click('LaTeX for Card 1')
  await write(formulaInput(), formula)
  await act(async () => document.querySelector('dialog')!.dispatchEvent(new Event('cancel', { cancelable: true })))
  expect(toPersistence(current)).toEqual(before)
  await frame()
  expect(document.activeElement).toBe(button('LaTeX for Card 1'))
})
test('shortcuts insert at selection and preserve other formula input', async () => {
  await mount()
  await click('LaTeX for Card 1')
  await write(formulaInput(), '1++z')
  formulaInput().setSelectionRange(2, 2)
  await click('Fraction')
  expect(formulaInput().value).toBe(String.raw`1+\frac{a}{b}+z`)
  await new Promise(resolve => requestAnimationFrame(resolve))
  expect(formulaInput().value.slice(formulaInput().selectionStart, formulaInput().selectionEnd)).toBe('a')
  expect(document.querySelectorAll('[aria-label="Formula shortcuts"] button')).toHaveLength(8)
})
test('invalid formulas show a useful error and remain editable or cancellable', async () => {
  await mount()
  await click('LaTeX for Card 1')
  await write(formulaInput(), String.raw`\frac{`)
  expect(document.querySelector('dialog .math-error')?.textContent).toContain('Check LaTeX commands and braces')
  await write(formulaInput(), formula)
  expect(document.querySelector('dialog .math-error')).toBeNull()
  expect(document.querySelector('dialog .katex')).not.toBeNull()
})
test('existing formula chooser edits the selected formula and keeps display delimiters', async () => {
  await mount()
  await write(card(), 'Before $x$ between $$y^2$$ after')
  card().setSelectionRange(0, 0)
  await click('LaTeX for Card 1')
  await click('Edit formula 2')
  expect(formulaInput().value).toBe('y^2')
  await write(formulaInput(), 'y^3')
  await click('Apply')
  expect(card().value).toBe('Before $x$ between $$y^3$$ after')
})
test('field length limit also applies to inserted formulas', async () => {
  await mount()
  await write(card(), 'a'.repeat(1999))
  card().setSelectionRange(1999, 1999)
  await click('LaTeX for Card 1')
  await write(formulaInput(), 'x')
  expect(button('Insert').disabled).toBe(true)
  expect(document.querySelector('dialog [role="status"]')?.textContent).toContain('2000')
  await click('Cancel')
  expect(card().value).toHaveLength(1999)
})
test('title/instructions above the original steps and guided feedback/hints/solution have controls', async () => {
  const e = structuredClone(personalExamples.find(e => e.type === 'tap-pair')!)
  function Harness() {
    const [draft, set] = useState<any>({ source: 'custom', assignment: 'predefined', custom: e })
    return <PersonalChallengeAuthoring value={{}} draft={draft} onChange={() => {}} onDraftChange={set} />
  }
  await act(async () => root.render(<Harness />))
  await click('Complex / LaTeX')
  expect(button('LaTeX for Title')).toBeDefined()
  expect(button('LaTeX for Instructions / Question')).toBeDefined()
  await click('LaTeX for Title')
  await write(formulaInput(), 'x^2'); await click('Insert')
  expect(node.querySelector<HTMLTextAreaElement>('[aria-label="Title"]')!.value).toContain('$x^2$')
  for (let i = 0; i < (e.authored!.activity as any).left.length; i++) await click('Next')
  await click('Add hint')
  expect(button('LaTeX for Hint 1')).toBeDefined()
  // Complete the optional hint to keep the existing step validation unchanged.
  const hint = [...node.querySelectorAll<HTMLTextAreaElement>('[aria-label="Guided challenge editor"] textarea')].at(-1)!
  await write(hint, 'A clue')
  await click('Next')
  expect(button('LaTeX for Correct feedback')).toBeDefined()
  expect(button('LaTeX for Try again feedback')).toBeDefined()
  await click('Next')
  expect(button('LaTeX for Solution explanation')).toBeDefined()
})
for (const e of personalExamples.filter(e => !['tap-pair', 'single-choice', 'fill-blank'].includes(e.type))) test(`${e.type}: shared textual pencils expose formula controls in complex mode only`, async () => {
  await mount(e.type)
  expect(button('LaTeX for Title')).toBeDefined()
  await click('Next')
  expect(node.querySelector('input[type="number"]')?.parentElement?.querySelector('.formula-trigger')).toBeFalsy()
  for (const field of node.querySelectorAll('.challenge-editable')) expect(field.querySelector('.formula-trigger')).not.toBeNull()
  await click('Edit with Preview')
  expect(document.querySelector('.formula-trigger')).toBeNull()
})
test('range parsing preserves escaped dollars, other formulas and pasted delimiter normalization', async () => {
  expect(formulaRanges(String.raw`Cost \$5 and $x$ then $$y$$`).map(x => x.formula)).toEqual(['x', 'y'])
  expect(applyFormula('a  b $y$', 2, 2, 'x').value).toBe('a $x$ b $y$')
  await mount()
  await write(card(), '')
  await click('LaTeX for Card 1')
  await write(formulaInput(), '$x^2$')
  await click('Insert')
  expect(card().value).toBe('$x^2$')
})
