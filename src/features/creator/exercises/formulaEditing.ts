export type FormulaRange = { start: number; end: number; formula: string; delimiter: string }

/** Match the shared renderer's inline/display delimiters, including escaped dollars. */
export function formulaRanges(source: string): FormulaRange[] {
  const ranges: FormulaRange[] = []
  const escaped = (at: number) => { let n = 0; while (at > 0 && source[--at] === '\\') n++; return n % 2 === 1 }
  let cursor = 0
  while (cursor < source.length) {
    if (source[cursor] !== '$' || escaped(cursor)) { cursor++; continue }
    const delimiter = source.startsWith('$$', cursor) ? '$$' : '$'
    let end = cursor + delimiter.length
    while (end < source.length && (!source.startsWith(delimiter, end) || escaped(end))) end++
    if (end >= source.length) break
    ranges.push({ start: cursor, end: end + delimiter.length, formula: source.slice(cursor + delimiter.length, end), delimiter })
    cursor = end + delimiter.length
  }
  return ranges
}

export function applyFormula(source: string, start: number, end: number, formula: string, delimiter = '$') {
  const insertion = `${delimiter}${formula}${delimiter}`
  return { value: source.slice(0, start) + insertion + source.slice(end), caret: start + insertion.length }
}
