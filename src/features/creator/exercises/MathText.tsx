import { memo, type ReactNode } from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import './mathText.css'

/** Only KaTeX-generated markup enters HTML. Source text always remains React text. */
export const MathText = memo(function MathText({ text }: { text: string | number }) {
  const source = String(text)
  const parts: ReactNode[] = []
  let start = 0, cursor = 0
  const escaped = (at: number) => { let n = 0; while (at > 0 && source[--at] === '\\') n++; return n % 2 === 1 }
  while (cursor < source.length) {
    if (source[cursor] !== '$' || escaped(cursor)) { cursor++; continue }
    const delimiter = source.startsWith('$$', cursor) ? '$$' : '$'
    let end = cursor + delimiter.length
    while (end < source.length && (!source.startsWith(delimiter, end) || escaped(end))) end++
    if (end >= source.length) break // Unfinished delimiters remain editable ordinary text.
    parts.push(source.slice(start, cursor))
    const formula = source.slice(cursor + delimiter.length, end)
    try {
      const html = katex.renderToString(formula, { displayMode: delimiter === '$$', throwOnError: true, trust: () => { throw new Error('Unsafe LaTeX command') }, strict: 'error', maxExpand: 200, maxSize: 20, output: 'htmlAndMathml' })
      parts.push(<span key={cursor} className={delimiter === '$$' ? 'math-display' : 'math-inline'} dangerouslySetInnerHTML={{ __html: html }} />)
    } catch {
      parts.push(<span key={cursor} className="math-error" title="Invalid or unsupported LaTeX. Check commands and braces.">{source.slice(cursor, end + delimiter.length)}<span className="math-error-message"> (Check LaTeX commands and braces)</span></span>)
    }
    cursor = end + delimiter.length; start = cursor
  }
  parts.push(source.slice(start))
  return <span className="math-text">{parts}</span>
})

export function MathFieldPreview({ value }: { value: string }) {
  return value.includes('$') ? <span className="math-field-preview" aria-label="Mathematical preview"><MathText text={value} /></span> : null
}

export function MathHelp() {
  return <p className="text-sm text-slate-600">Use ordinary text, $x^2$ for inline math, or {'$$\\frac{a}{b}$$'} for display math. Preview updates as you type. Answers are checked as before; formulas are not evaluated.</p>
}
