import { createContext, useContext, useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { MathFormula } from './MathText'
import { applyFormula, formulaRanges, type FormulaRange } from './formulaEditing'
import './formulaEditor.css'

type TextField = HTMLInputElement | HTMLTextAreaElement
type Target = { label: string; value: string; onChange: (value: string) => void; field: TextField | null; trigger: HTMLButtonElement; start: number; end: number; range?: FormulaRange; maxLength: number }
type Context = { enabled: boolean; setEnabled: (enabled: boolean) => void; open: (target: Target) => void }
const FormulaContext = createContext<Context | null>(null)

/** One contextual editor for the authoring surface, including fields above the steps. */
export function FormulaScope({ children }: { children: ReactNode }) {
  const parent = useContext(FormulaContext)
  return parent ? children : <FormulaProvider>{children}</FormulaProvider>
}
function FormulaProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(false), [target, setTarget] = useState<Target | null>(null)
  const close = (caret?: number) => {
    setTarget(null)
    if (caret !== undefined && target?.field?.isConnected) {
      const field = target.field
      requestAnimationFrame(() => { field.focus(); field.setSelectionRange(caret, caret) })
    } else requestAnimationFrame(() => target?.trigger.focus())
  }
  return <FormulaContext.Provider value={{ enabled, setEnabled, open: setTarget }}>{children}{target && createPortal(<FormulaDialog target={target} close={close} />, document.body)}</FormulaContext.Provider>
}
export function useFormulaMode(enabled: boolean) {
  const context = useContext(FormulaContext)
  const setEnabled = context?.setEnabled
  useEffect(() => { setEnabled?.(enabled); return () => setEnabled?.(false) }, [enabled, setEnabled])
}

export function FormulaControl({ label, value, onChange, field, maxLength = 2000 }: { label: string; value: string; onChange: (value: string) => void; field: () => TextField | null; maxLength?: number }) {
  const context = useContext(FormulaContext)
  if (!context?.enabled) return null
  return <button type="button" className="formula-trigger" aria-label={`LaTeX for ${label}`} aria-haspopup="dialog" onMouseDown={event => event.preventDefault()} onClick={event => {
    const input = field(), start = input?.selectionStart ?? value.length, end = input?.selectionEnd ?? start
    const range = formulaRanges(value).find(range => start < range.end && end > range.start || start === end && start > range.start && start <= range.end)
    context.open({ label, value, onChange, field: input, trigger: event.currentTarget, start, end, range, maxLength })
  }}><span aria-hidden="true">∑</span> LaTeX</button>
}

/** Keeps existing input, validation and selection behavior intact. */
export function FormulaField({ label, value, onChange, maxLength, children }: { label: string; value: string; onChange: (value: string) => void; maxLength?: number; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  return <div ref={ref} className="formula-field">{children}<FormulaControl label={label} value={value} onChange={onChange} maxLength={maxLength} field={() => ref.current?.querySelector('textarea, input') ?? null} /></div>
}

const shortcuts: [string, string, number, number][] = [
  ['Fraction', String.raw`\frac{a}{b}`, 6, 1], ['Exponent', 'x^{2}', 3, 1], ['Subscript', 'x_{i}', 3, 1],
  ['Square root', String.raw`\sqrt{x}`, 6, 1], ['Greek symbols', '', 0, 0],
  ['Integral', String.raw`\int_{a}^{b} x\,dx`, 6, 1], ['Sum', String.raw`\sum_{i=1}^{n} x_i`, 12, 1],
  ['Matrix', String.raw`\begin{pmatrix}a & b \\ c & d\end{pmatrix}`, 15, 1],
]
const greek = [['α', 'alpha'], ['β', 'beta'], ['γ', 'gamma'], ['θ', 'theta'], ['π', 'pi'], ['σ', 'sigma'], ['ω', 'omega']]
function FormulaDialog({ target, close }: { target: Target; close: (caret?: number) => void }) {
  const [range, setRange] = useState(target.range), [formula, setFormula] = useState(target.range?.formula ?? '')
  const [showGreek, setShowGreek] = useState(false)
  const dialog = useRef<HTMLDialogElement>(null), input = useRef<HTMLTextAreaElement>(null), id = useId()
  useEffect(() => {
    dialog.current?.showModal(); input.current?.focus()
  }, [])
  const insertTemplate = (template: string, offset: number, length: number) => {
    const field = input.current!, start = field.selectionStart, end = field.selectionEnd
    setFormula(formula.slice(0, start) + template + formula.slice(end))
    requestAnimationFrame(() => { field.focus(); field.setSelectionRange(start + offset, start + offset + length) })
  }
  const start = range?.start ?? target.start, end = range?.end ?? target.end
  const pasted = formulaRanges(formula)
  const raw = pasted.length === 1 && pasted[0].start === 0 && pasted[0].end === formula.length ? pasted[0].formula : formula
  const result = applyFormula(target.value, start, end, raw, range?.delimiter)
  const tooLong = result.value.length > target.maxLength
  const formulas = formulaRanges(target.value)
  return <dialog ref={dialog} className="formula-dialog" aria-labelledby={`${id}-title`} onCancel={event => { event.preventDefault(); close() }} onClose={() => close()}>
    <h3 id={`${id}-title`}>{range ? 'Edit formula' : 'Insert formula'} · {target.label}</h3>
    {formulas.length > 0 && <div className="formula-existing" aria-label="Existing formulas">{formulas.map((item, index) => <button type="button" key={item.start} aria-pressed={range?.start === item.start} onClick={() => { setRange(item); setFormula(item.formula); input.current?.focus() }}>Edit formula {index + 1}</button>)}</div>}
    <div className="formula-shortcuts" role="group" aria-label="Formula shortcuts">{shortcuts.map(([name, template, offset, length]) => <button type="button" key={name} aria-expanded={name === 'Greek symbols' ? showGreek : undefined} onMouseDown={event => event.preventDefault()} onClick={() => {
      if (name === 'Greek symbols') setShowGreek(!showGreek)
      else insertTemplate(template, offset, length)
    }}>{name}</button>)}</div>
    {showGreek && <div className="formula-shortcuts" role="group" aria-label="Greek symbols">{greek.map(([symbol, command]) => <button type="button" key={command} aria-label={command} onMouseDown={event => event.preventDefault()} onClick={() => { insertTemplate('\\' + command, 0, command.length + 1); setShowGreek(false) }}>{symbol}</button>)}</div>}
    <label className="formula-input-label" htmlFor={`${id}-input`}>LaTeX formula</label>
    <textarea id={`${id}-input`} ref={input} className="formula-input" rows={3} value={formula} onChange={event => setFormula(event.target.value)} spellCheck={false} placeholder={String.raw`\frac{x^2-1}{x-1}`} aria-describedby={`${id}-preview`} />
    <div id={`${id}-preview`} className="formula-preview" aria-live="polite"><span className="formula-input-label">Live preview</span>{formula.trim() ? <MathFormula formula={raw} display /> : <p>Your formula preview appears here.</p>}</div>
    {tooLong && <p role="status" className="math-error">This field allows {target.maxLength} characters. Shorten the formula or surrounding text.</p>}
    <div className="formula-actions"><button type="button" onClick={() => close()}>Cancel</button><button type="button" disabled={!formula.trim() || tooLong} onClick={() => { target.onChange(result.value); close(result.caret) }}>{range ? 'Apply' : 'Insert'}</button></div>
  </dialog>
}
