import { memo, type ReactNode } from 'react'
import katex from 'katex'
import { formulaRanges } from './formulaEditing'
import 'katex/dist/katex.min.css'
import './mathText.css'

/** Shared safe rendering for both raw formula authoring and delimited challenge text. */
export function MathFormula({ formula, display = false, source = formula }: { formula: string; display?: boolean; source?: string }) {
  try {
    const html = katex.renderToString(formula, { displayMode: display, throwOnError: true, trust: () => { throw new Error('Unsafe LaTeX command') }, strict: 'error', maxExpand: 200, maxSize: 20, output: 'htmlAndMathml' })
    return <span className={display ? 'math-display' : 'math-inline'} dangerouslySetInnerHTML={{ __html: html }} />
  } catch {
    return <span className="math-error" title="Invalid or unsupported LaTeX. Check commands and braces.">{source}<span className="math-error-message"> (Check LaTeX commands and braces)</span></span>
  }
}

/** Only KaTeX-generated markup enters HTML. Source text always remains React text. */
export const MathText = memo(function MathText({ text }: { text: string | number }) {
  const source = String(text), parts: ReactNode[] = []
  let start = 0
  for (const range of formulaRanges(source)) {
    parts.push(source.slice(start, range.start))
    parts.push(<MathFormula key={range.start} formula={range.formula} display={range.delimiter === '$$'} source={source.slice(range.start, range.end)} />)
    start = range.end
  }
  parts.push(source.slice(start))
  return <span className="math-text">{parts}</span>
})

export function MathFieldPreview({ value }: { value: string }) {
  return value.includes('$') ? <span className="math-field-preview" aria-label="Mathematical preview"><MathText text={value} /></span> : null
}

export function MathHelp() {
  return <p className="text-sm text-slate-600">Use ∑ LaTeX beside a field to insert or edit a formula. Your surrounding text stays in place.</p>
}
