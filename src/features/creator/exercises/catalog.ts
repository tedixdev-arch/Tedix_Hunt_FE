/** Local authoring vocabulary. Never substitute these IDs for persisted Signal kinds. */
export const personalTypes = [
  ['tap-pair', 'Tap & pair the relevant', 'Easy'], ['single-choice', 'Single choice', 'Easy'],
  ['true-false', 'True / False', 'Easy'], ['memory-card', 'Memory card', 'Easy'], ['number-line', 'Number line', 'Easy'],
  ['multiple-choice', 'Multiple choice', 'Medium'], ['match-columns', 'Match the columns', 'Medium'],
  ['drag-drop', 'Drag & drop', 'Medium'], ['fill-blank', 'Fill in the blank', 'Medium'],
  ['sequence', 'Sequence', 'Hard'], ['find-mistake', 'Find the mistake', 'Hard'],
  ['build-problem', 'Build the problem (LEGO-like)', 'Hard'], ['number-pattern', 'Number pattern', 'Hard'],
  ['shape-pattern', 'Shape pattern', 'Hard'], ['rule-discovery', 'Rule discovery', 'Hard'],
] as const
export type PersonalType = typeof personalTypes[number][0]
export const teamNames = {
  'scrambled-word': 'Word Reconstruction', 'distributed-information': 'Shared Information Puzzle',
  hypothesis: 'Collaborative Deduction', 'assemble-machine': 'Sequence Assembly',
  'clue-synthesis': 'Clue Synthesis', 'filter-noise': 'Information Filtering', 'shared-final-key': 'Shared Code Assembly',
} as const
export type TeamType = keyof typeof teamNames
export type Mechanic = PersonalType | TeamType | 'legacy-fields'
export interface Exercise {
  id: string
  type: Mechanic
  title: string
  instructions: string
  hint: string
  solution: string
  correctFeedback: string
  incorrectFeedback: string
  data: Record<string, string | number | boolean | string[]>
}
export const typeName = (type: Mechanic) => personalTypes.find(row => row[0] === type)?.[1] ?? teamNames[type as TeamType] ?? 'Saved Signal exercise'

const example = (type: PersonalType, title: string, instructions: string, data: Exercise['data'], hint: string, solution: string): Exercise => ({
  id: `local-example:${type}`, type, title, instructions, data, hint, solution,
  correctFeedback: 'Correct! Well done.', incorrectFeedback: 'Not quite. Review the content and try again.',
})
export const prototypes: readonly Exercise[] = [
  example('tap-pair', 'Equivalent expressions', 'Reveal two cards at a time. Pair each expression with its value.', { left: ['2 + 2', '3 × 3', '5 − 2'], right: ['4', '9', '3'] }, 'Work out each expression before pairing.', '2 + 2 = 4; 3 × 3 = 9; 5 − 2 = 3.'),
  example('single-choice', 'One prime', 'Which number is prime?', { options: ['21', '29', '35'], answer: '29' }, 'A prime has exactly two positive divisors.', '29 is prime; 21 = 3 × 7 and 35 = 5 × 7.'),
  example('true-false', 'Even product', 'The product of two odd integers is always even.', { answer: false }, 'Try 3 × 5.', 'False: 3 × 5 = 15, which is odd.'),
  example('memory-card', 'Recall a square', 'Recall the square of 9 before revealing the card. Type your recalled answer, then check.', { answer: '81', revealDelayMs: 1000 }, 'A square multiplies a number by itself.', '9 × 9 = 81.'),
  example('number-line', 'Locate six', 'Move the marker to 6 on the number line.', { min: 0, max: 12, target: 6, tolerance: 0, step: 1 }, 'Six is halfway between zero and twelve.', 'The midpoint of [0, 12] is 6.'),
  example('multiple-choice', 'Select the primes', 'Select every prime number.', { options: ['2', '9', '11', '15'], answers: ['2', '11'] }, 'One even number is prime.', '2 and 11 have exactly two divisors. 9 and 15 are composite.'),
  example('match-columns', 'Double the input', 'Match each input to its doubled output.', { left: ['2', '4', '6'], right: ['4', '8', '12'] }, 'Multiply each input by two.', '2 → 4, 4 → 8, 6 → 12.'),
  example('drag-drop', 'Sort the numbers', 'Drag each number to Even or Odd. You can also select a target from its menu.', { items: ['2', '3', '6'], targets: ['Even', 'Odd'], assignments: ['Even', 'Odd', 'Even'] }, 'Even numbers divide exactly by two.', '2 and 6 are even; 3 is odd.'),
  example('fill-blank', 'Complete the sum', 'Fill each blank.', { parts: ['3 + ___ = 7', '___ × 2 = 10'], answers: ['4', '5'] }, 'Use subtraction for the first blank and division for the second.', '7 − 3 = 4 and 10 ÷ 2 = 5.'),
  example('sequence', 'Increasing order', 'Arrange these values from smallest to largest.', { items: ['8', '2', '5'], order: ['2', '5', '8'] }, 'Find the smallest value first.', '2 < 5 < 8.'),
  example('find-mistake', 'Repair the trace', 'Select the first incorrect step, then explain the error.', { steps: ['3(2x − 5) = 27', '6x − 15 = 27', '6x = 12', 'x = 2'], mistake: 3, explanations: ['15 was subtracted instead of added.', 'The brackets were expanded incorrectly.'], explanation: '15 was subtracted instead of added.' }, 'Check the sign when moving 15 across the equals sign.', 'Step 3 is wrong: add 15 to get 6x = 42, then x = 7.'),
  example('build-problem', 'Build twenty-four', 'Snap the pieces into an expression equal to 24. Use each piece at most once.', { pieces: ['2', '×', '3', '×', '4', '+'], construction: ['2', '×', '3', '×', '4'] }, 'Use multiplication between 2, 3 and 4.', '2 × 3 × 4 = 24. The two multiplication pieces occupy separate slots.'),
  example('number-pattern', 'Repeated multiplication', 'Complete the missing term.', { terms: ['3', '12', '48', '192', '___'], answer: '768' }, 'Compare each term with the term before it.', 'Each term is four times the previous term: 192 × 4 = 768.'),
  example('shape-pattern', 'Alternating shapes', 'Select the next shape in the pattern.', { terms: ['●', '▲', '●', '▲', '___'], options: ['■', '●', '▲'], answer: '●' }, 'The pattern repeats every two shapes.', 'The shapes alternate circle and triangle. A circle follows the triangle.'),
  example('rule-discovery', 'Discover the machine', 'Find the rule and predict the output for 5.', { examples: ['1 → 3', '2 → 5', '3 → 7'], rules: ['Double, then add one', 'Add two', 'Triple'], rule: 'Double, then add one', answer: '11' }, 'Compare twice the input with each output.', 'The rule is y = 2x + 1, so 5 → 11.'),
]
export function independentExercise(exercise: Exercise): Exercise {
  return { ...structuredClone(exercise), id: `custom:${crypto.randomUUID()}` }
}

/** Each schema describes content fields only; no executable rules or code are accepted. */
export type ContentField = { key: string; label: string; format: 'text' | 'lines' | 'number' | 'boolean' }
const f = (key: string, label: string, format: ContentField['format'] = 'text'): ContentField => ({ key, label, format })
export const schemas: Record<Mechanic, ContentField[]> = {
  'tap-pair': [f('left', 'Concept cards (one per line)', 'lines'), f('right', 'Matching example cards in corresponding order', 'lines')],
  'single-choice': [f('options', 'Answer options', 'lines'), f('answer', 'Correct option')],
  'true-false': [f('answer', 'Correct truth value', 'boolean')],
  'memory-card': [f('answer', 'Recall answer'), f('revealDelayMs', 'Recall delay in milliseconds', 'number')],
  'number-line': [f('min', 'Range minimum', 'number'), f('max', 'Range maximum', 'number'), f('target', 'Target', 'number'), f('tolerance', 'Tolerance', 'number'), f('step', 'Tick interval', 'number')],
  'multiple-choice': [f('options', 'Answer options', 'lines'), f('answers', 'Correct options', 'lines')],
  'match-columns': [f('left', 'Left column items', 'lines'), f('right', 'Matching right column items in corresponding order', 'lines')],
  'drag-drop': [f('items', 'Draggable items', 'lines'), f('targets', 'Drop targets', 'lines'), f('assignments', 'Correct target for each item in corresponding order', 'lines')],
  'fill-blank': [f('parts', 'Prompts (one ___ per line)', 'lines'), f('answers', 'Correct answers in corresponding order', 'lines')],
  sequence: [f('items', 'Available elements', 'lines'), f('order', 'Correct order', 'lines')],
  'find-mistake': [f('steps', 'Ordered steps', 'lines'), f('mistake', 'First incorrect step number (starts at 1)', 'number'), f('explanations', 'Explanation options', 'lines'), f('explanation', 'Correct explanation')],
  'build-problem': [f('pieces', 'Available pieces (each line is a separate piece)', 'lines'), f('construction', 'Valid construction in order', 'lines')],
  'number-pattern': [f('terms', 'Pattern terms (one ___)', 'lines'), f('answer', 'Missing term')],
  'shape-pattern': [f('terms', 'Shape pattern (one ___)', 'lines'), f('options', 'Available shapes', 'lines'), f('answer', 'Correct shape')],
  'rule-discovery': [f('examples', 'Input → output examples', 'lines'), f('rules', 'Rule options', 'lines'), f('rule', 'Correct rule'), f('answer', 'Correct predicted output')],
  'scrambled-word': [f('evidence', 'Letter contributions', 'lines'), f('answer', 'Reconstructed word')],
  'distributed-information': [f('evidence', 'Shared facts', 'lines'), f('options', 'Answer options', 'lines'), f('answer', 'Correct conclusion')],
  hypothesis: [f('evidence', 'Message packets', 'lines'), f('rule', 'Decoder key'), f('answer', 'Decoded answer')],
  'assemble-machine': [f('evidence', 'Machine contributions', 'lines'), f('options', 'Frequency options', 'lines'), f('answer', 'Correct frequency')],
  'clue-synthesis': [f('evidence', 'Clue fragments', 'lines'), f('pattern', 'Answer pattern'), f('answer', 'Riddle answer')],
  'filter-noise': [f('evidence', 'Named signals (Name: content)', 'lines'), f('answers', 'Names of trusted signals', 'lines')],
  'shared-final-key': [f('evidence', 'Digit contributions', 'lines'), f('answer', 'Combined code')],
  'legacy-fields': [f('context', 'Saved puzzle context'), f('keys', 'Answer fields', 'lines'), f('answers', 'Answers in field order', 'lines')],
}
const norm = (value: string) => value.trim().toLocaleLowerCase()
export const textEqual = (a: string, b: string) => norm(a) === norm(b)
export function validateExercise(value: Exercise): string[] {
  const errors: string[] = []
  const data = value.data
  const fail = (condition: boolean, message: string) => { if (condition) errors.push(message) }
  for (const key of ['title', 'instructions', 'hint', 'solution', 'correctFeedback', 'incorrectFeedback'] as const) fail(typeof value[key] !== 'string' || !value[key].trim(), `${key} is required.`)
  const schema = schemas[value.type]
  if (!schema) return [...errors, 'Unsupported mechanic.']
  for (const field of schema) {
    const v = data[field.key]
    fail(field.format === 'lines' ? !Array.isArray(v) || !v.length || v.some(s => typeof s !== 'string' || !s.trim()) : field.format === 'number' ? typeof v !== 'number' || !Number.isFinite(v) : field.format === 'boolean' ? typeof v !== 'boolean' : typeof v !== 'string' || !v.trim(), `${field.label} must contain valid ${field.format} content.`)
  }
  if (errors.length) return errors
  const list = (key: string) => data[key] as string[]
  const has = (key: string, answer: string) => list(key).some(option => textEqual(option, answer))
  const unique = (key: string) => new Set(list(key).map(norm)).size === list(key).length
  for (const key of ['options', 'left', 'right', 'items', 'targets', 'rules', 'explanations', 'answers', 'order']) {
    // Blank answers may repeat, and independent pieces can share a visible symbol.
    if (Array.isArray(data[key]) && !(key === 'answers' && ['fill-blank', 'legacy-fields'].includes(value.type))) fail(!unique(key), `${key} must be distinct.`)
  }
  const paired = ['tap-pair', 'match-columns'].includes(value.type)
  if (paired) fail(list('left').length < (value.type === 'tap-pair' ? 3 : 2) || list('left').length !== list('right').length, 'Provide corresponding pairs of equal length.')
  if (['single-choice', 'shape-pattern', 'distributed-information', 'assemble-machine'].includes(value.type)) fail(list('options').length < 2 || !has('options', String(data.answer)), 'Correct answer must be one of at least two options.')
  if (value.type === 'multiple-choice') fail(list('options').length < 2 || list('answers').some(a => !has('options', a)), 'Every correct answer must be an available option.')
  if (value.type === 'memory-card') fail(!Number.isInteger(data.revealDelayMs) || Number(data.revealDelayMs) < 1000 || Number(data.revealDelayMs) > 10000, 'Recall delay must be 1000–10000 ms.')
  if (value.type === 'number-line') {
    const { min, max, target, tolerance, step } = data as Record<string, number>
    fail(min >= max || target < min || target > max || tolerance < 0 || tolerance >= (max - min) / 2 || step <= 0 || step > max - min, 'Use an increasing range, reachable target, positive tick interval and bounded tolerance.')
    fail(Math.abs((target - min) / step - Math.round((target - min) / step)) * step > tolerance + 1e-8, 'The target must be reachable with the tick interval and tolerance.')
  }
  if (value.type === 'drag-drop') fail(list('items').length !== list('assignments').length || list('assignments').some(a => !has('targets', a)), 'Every draggable item needs a valid target.')
  if (value.type === 'fill-blank') fail(list('parts').length !== list('answers').length || list('parts').some(p => p.split('___').length !== 2), 'Each prompt needs one blank and one answer.')
  if (value.type === 'sequence') fail(list('items').length < 2 || list('items').length !== list('order').length || list('order').some(a => !has('items', a)), 'Correct order must use each element exactly once.')
  if (value.type === 'find-mistake') fail(list('steps').length < 3 || !Number.isInteger(data.mistake) || Number(data.mistake) < 1 || Number(data.mistake) > list('steps').length || list('explanations').length < 2 || !has('explanations', String(data.explanation)), 'Choose a valid first incorrect step and explanation.')
  if (value.type === 'build-problem') {
    const remaining = [...list('pieces')]
    fail(list('construction').some(piece => { const index = remaining.indexOf(piece); if (index < 0) return true; remaining.splice(index, 1); return false }), 'Construction must use available pieces at most once.')
  }
  if (['number-pattern', 'shape-pattern'].includes(value.type)) fail(list('terms').filter(t => t === '___').length !== 1 || list('terms').length < 3, 'A pattern needs at least three terms and exactly one blank.')
  if (value.type === 'rule-discovery') fail(list('examples').length < 2 || list('rules').length < 2 || !has('rules', String(data.rule)), 'Provide examples and a correct rule among at least two options.')
  if (value.type === 'filter-noise') {
    const names = list('evidence').map(s => s.split(':')[0].trim())
    fail(list('evidence').some(s => !s.includes(':') || !s.split(':').slice(1).join(':').trim()) || new Set(names.map(norm)).size !== names.length || list('answers').some(a => !names.some(n => textEqual(n, a))), 'Trusted signals must reference distinct named contributions.')
  }
  return errors
}
export type Attempt = { text: string; selected: string[]; values: Record<string, string>; order: string[]; rule: string; explanation: string; stage: number }
export const emptyAttempt = (): Attempt => ({ text: '', selected: [], values: {}, order: [], rule: '', explanation: '', stage: 0 })
export function checkAnswer(exercise: Exercise, attempt: Attempt): boolean {
  const d = exercise.data
  const list = (key: string) => d[key] as string[]
  const sameOrder = (actual: string[], expected: string[]) => actual.length === expected.length && expected.every((v, i) => textEqual(v, actual[i]))
  const sameSet = (actual: string[], expected: string[]) => actual.length === expected.length && expected.every(v => actual.some(a => textEqual(v, a)))
  switch (exercise.type) {
    case 'true-false': return attempt.text === String(d.answer)
    case 'number-line': return attempt.text !== '' && Math.abs(Number(attempt.text) - Number(d.target)) <= Number(d.tolerance)
    case 'tap-pair': case 'match-columns': return list('left').every((_, i) => attempt.values[i] === list('right')[i])
    case 'drag-drop': return list('items').every((_, i) => attempt.values[i] === list('assignments')[i])
    case 'fill-blank': case 'legacy-fields': return list('answers').every((a, i) => textEqual(a, attempt.values[i] ?? ''))
    case 'multiple-choice': case 'filter-noise': return sameSet(attempt.selected, list('answers'))
    case 'sequence': return sameOrder(attempt.order, list('order'))
    case 'build-problem': return sameOrder(attempt.order, list('construction'))
    case 'find-mistake': return attempt.text === String(d.mistake) && textEqual(attempt.explanation, String(d.explanation))
    case 'rule-discovery': return textEqual(attempt.rule, String(d.rule)) && textEqual(attempt.text, String(d.answer))
    default: return textEqual(attempt.text, String(d.answer))
  }
}
