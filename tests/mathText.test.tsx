import { act, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { renderToStaticMarkup } from 'react-dom/server'
import { expect, test } from 'vitest'
import { MathText } from '../src/features/creator/exercises/MathText'
import { PersonalMechanicEditor } from '../src/features/creator/exercises/PersonalMechanicEditor'
import { ExerciseRenderer } from '../src/features/creator/exercises/ExerciseRenderer'
import { personalExamples } from '../src/features/creator/exercises/personalExamples'
import { fromPersistence, toPersistence } from '../src/features/creator/exercises/persistenceAdapter'
import { validateExercise, emptyAttempt, type Exercise } from '../src/features/creator/exercises/catalog'
import { checkAuthoredAnswer } from '../src/features/creator/exercises/AuthoredExerciseRenderer'
const html = (text: string | number) => renderToStaticMarkup(<MathText text={text} />)
test('ordinary strings and numbers remain literal', () => {
  for (const text of ['Ordinary text 123', 42, 'Price $5', String.raw`Escaped \$x$`]) expect(html(text)).not.toContain('class="katex"')
  expect(html('<script>alert(1)</script>')).toContain('&lt;script&gt;')
})
test('mixed inline and display formulas include accessible math', () => {
  const result = html(String.raw`Solve $x_1^2+\alpha$ then $$\frac{1}{\sqrt{x}}=\int_0^1 t\,dt$$ and $$\begin{pmatrix}1&2\\3&4\end{pmatrix}$$`)
  expect(result).toContain('Solve '); expect(result).toContain(' then ')
  expect(result.match(/class="katex"/g)).toHaveLength(3)
  expect(result).toContain('math-display'); expect(result).toContain('<math')
})
test('invalid, untrusted and expansion-heavy commands fail safely', () => {
  for (const value of [String.raw`$\frac{$`, String.raw`$\href{javascript:alert(1)}{click}$`, String.raw`$\htmlStyle{color:red}{x}$`, String.raw`$\def\a{\a}\a$`]) {
    const result = html(value)
    expect(result).toContain('Check LaTeX'); expect(result).not.toContain('<a '); expect(result).not.toContain('<script')
  }
  expect(html('Unfinished $$x')).toContain('Unfinished $$x')
})
for (const example of personalExamples) test(`${example.type}: math survives persistence, mode switches and playable preview`, async () => {
  ;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true
  const initial = structuredClone(example)
  initial.title = String.raw`Title $x^2$`; initial.instructions = String.raw`Find $$\frac{1}{2}$$`; initial.solution = String.raw`Use $\alpha$`
  expect(validateExercise(initial)).toEqual([])
  const reopened = fromPersistence(JSON.parse(JSON.stringify(toPersistence(initial))))
  expect(toPersistence(reopened)).toEqual(toPersistence(initial))
  let current: Exercise = reopened
  function Harness() { const [e, set] = useState(reopened); current = e; return <PersonalMechanicEditor exercise={e} onChange={set} /> }
  const node = document.createElement('div'), root = createRoot(node)
  try {
    await act(async () => root.render(<Harness />))
    expect(node.querySelector('[aria-pressed="true"]')?.textContent).toBe('Edit with Preview')
    const click = async (name: string) => { await act(async () => [...node.querySelectorAll('button')].find(b => b.textContent === name)!.click()) }
    await click('Complex / LaTeX'); await click('Edit with Preview')
    expect(toPersistence(current)).toEqual(toPersistence(initial))
    await act(async () => root.render(<ExerciseRenderer exercise={reopened} />))
    expect(node.querySelectorAll('.katex').length).toBeGreaterThanOrEqual(2)
  } finally { await act(async () => root.unmount()) }
})
test('matching pair correctness uses unchanged IDs despite mathematical labels', () => {
  const e = structuredClone(personalExamples.find(x => x.type === 'tap-pair')!)
  const d: any = e.authored!.activity, a: any = e.authored!.expected
  d.left[0].text = '$x^2$'; d.right[0].text = '$\\sqrt{4}$'
  const attempt = emptyAttempt()
  for (const pair of a.pairs) attempt.values[pair.leftId] = pair.rightId
  expect(checkAuthoredAnswer(e, attempt)).toBe(true)
  attempt.values[a.pairs[0].leftId] = a.pairs[1].rightId
  expect(checkAuthoredAnswer(e, attempt)).toBe(false)
})
test('structured card input previews edits immediately and retains pair references', async () => {
  ;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true
  const initial = structuredClone(personalExamples.find(x => x.type === 'tap-pair')!)
  let current = initial
  function Harness() { const [e, set] = useState(initial); current = e; return <PersonalMechanicEditor exercise={e} onChange={set} /> }
  const node = document.createElement('div'), root = createRoot(node)
  try {
    await act(async () => root.render(<Harness />))
    await act(async () => [...node.querySelectorAll('button')].find(b => b.textContent === 'Complex / LaTeX')!.click())
    const input = node.querySelector('input')!
    await act(async () => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, 'Area $x^2$'); input.dispatchEvent(new Event('input', { bubbles: true })) })
    expect(node.querySelector('[aria-label="Mathematical preview"] .katex')).not.toBeNull()
    expect(current.authored!.expected).toEqual(initial.authored!.expected)
    await act(async () => [...node.querySelectorAll('button')].find(b => b.textContent === 'Edit with Preview')!.click())
    expect((current.authored!.activity as any).left[0].text).toBe('Area $x^2$')
    expect(node.querySelector('.katex')).not.toBeNull()
  } finally { await act(async () => root.unmount()) }
})
