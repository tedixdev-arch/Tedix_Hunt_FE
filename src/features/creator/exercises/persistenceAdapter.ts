import { personalTypes, type Exercise } from './catalog.ts'
import type { AuthoredContent, CustomExercise, CustomType, Item } from './persistenceTypes.ts'
import { validateCustomExercises } from './persistenceValidation.ts'
import { exerciseSchema, type Schema } from './persistenceSchema.ts'

export class ExerciseConversionError extends Error {}
const fail = (message: string): never => { throw new ExerciseConversionError(message) }
const id = () => `item-${crypto.randomUUID()}`
/** Copy only declared fields after validation, never spread an untrusted prototype into a request. */
function project(schema: Schema, value: any): any {
  if (schema.type === 'object') return Object.fromEntries(Object.entries(schema.properties!).filter(([key]) => Object.hasOwn(value, key)).map(([key, s]) => [key, project(s, value[key])]))
  if (schema.type === 'array') return value.map((v: unknown) => project(schema.items!, v))
  return value
}
export function exerciseIssues(exercise: unknown): string[] {
  const e = exercise as CustomExercise
  const slot = e?.classification === 'team' ? 'team' : 'personal'
  return validateCustomExercises({ checkpoints: [{ checkpoint: 1, customExercises: { [slot]: e } }] }).map(i => `${i.path.replace('content.checkpoints[0].customExercises.', '')}: ${i.message}`)
}
export function toPersistence(exercise: Exercise): CustomExercise {
  const content = exercise.authored
  if (!content || content.mechanic !== exercise.type) return fail('Convert the exercise content before saving.')
  const result = {
    type: content.mechanic, classification: personalTypes.some(([t]) => t === content.mechanic) ? 'personal' : 'team', schemaVersion: 1,
    title: exercise.title, instructions: exercise.instructions, interaction: content.activity, answer: content.expected,
    hints: content.hints, solution: exercise.solution, feedback: { correct: exercise.correctFeedback, incorrect: exercise.incorrectFeedback },
    ...(exercise.persistedIdentity ? { id: exercise.persistedIdentity.id, owner: exercise.persistedIdentity.owner } : {}),
  } as CustomExercise
  const errors = exerciseIssues(result)
  if (errors.length) return fail(errors.join('\n'))
  return project(exerciseSchema(result.type), result)
}
export function fromPersistence(value: CustomExercise): Exercise {
  const errors = exerciseIssues(value)
  if (errors.length) return fail(errors.join('\n'))
  const e = project(exerciseSchema(value.type), value) as CustomExercise
  return {
    id: `custom:${crypto.randomUUID()}`, type: e.type, title: e.title, instructions: e.instructions, hint: e.hints[0] ?? '',
    solution: e.solution, correctFeedback: e.feedback.correct, incorrectFeedback: e.feedback.incorrect, data: {},
    authored: { mechanic: e.type, activity: e.interaction, expected: e.answer, hints: e.hints } as AuthoredContent,
    ...(e.id && e.owner ? { persistedIdentity: { id: e.id, owner: e.owner } } : {}),
  }
}
/** One-time upgrade of a chosen local example. Ambiguous legacy content requires explicit correction. */
export function authorPrototype(e: Exercise): Exercise {
  if (e.authored) return structuredClone(e)
  if (e.type === 'legacy-fields') return fail('Choose a supported custom mechanic; the saved Signal assignment is preserved.')
  const d = e.data
  const list = (key: string): string[] => Array.isArray(d[key]) ? d[key] as string[] : fail(`${key}: expected a list`)
  const items = (key: string) => list(key).map(text => ({ id: id(), text }))
  const ref = (xs: Item[], value: unknown) => {
    const matches = xs.filter(x => x.text === value)
    return matches.length === 1 ? matches[0].id : fail(`Answer ${String(value)} needs one unambiguous item.`)
  }
  const numeric = (v: unknown) => typeof v === 'number' ? v : typeof v === 'string' && v.trim() && Number.isFinite(Number(v)) ? Number(v) : fail(`Invalid numeric content: ${String(v)}`)
  let activity: any, expected: any
  const textAnswer = () => ({ value: String(d.answer), caseSensitive: false })
  switch (e.type) {
    case 'tap-pair': case 'match-columns': {
      const left = items('left'), right = items('right'); activity = { left, right }
      if (left.length !== right.length) return fail('Each left item needs a right item.')
      expected = { pairs: left.map((x, i) => ({ leftId: x.id, rightId: right[i].id })) }; break
    }
    case 'single-choice': case 'multiple-choice': case 'distributed-information': {
      const options = items('options'); activity = { options, ...(e.type === 'distributed-information' ? { facts: items('evidence') } : {}) }
      expected = e.type === 'multiple-choice' ? { optionIds: list('answers').map(v => ref(options, v)) } : { optionId: ref(options, d.answer) }; break
    }
    case 'true-false': activity = {}; expected = { value: d.answer }; break
    case 'memory-card': activity = { card: String(d.answer), revealDelayMs: d.revealDelayMs }; expected = textAnswer(); break
    case 'number-line': activity = { min: d.min, max: d.max, step: d.step }; expected = { target: d.target, tolerance: d.tolerance }; break
    case 'drag-drop': {
      const choices = items('items'), targets = items('targets'); activity = { items: choices, targets }
      expected = { assignments: choices.map((x, i) => ({ itemId: x.id, targetId: ref(targets, list('assignments')[i]) })) }; break
    }
    case 'fill-blank': {
      const blanks = list('parts').map(prompt => ({ id: id(), prompt })); activity = { blanks }
      expected = { values: blanks.map((b, i) => ({ blankId: b.id, value: list('answers')[i] })), caseSensitive: false }; break
    }
    case 'sequence': { const elements = items('items'); activity = { elements }; expected = { order: list('order').map(v => ref(elements, v)) }; break }
    case 'find-mistake': {
      const steps = items('steps'), explanations = items('explanations'); activity = { steps, explanations }
      expected = { stepId: steps[Number(d.mistake) - 1]?.id, explanationId: ref(explanations, d.explanation) }; break
    }
    case 'build-problem': {
      const pieces = items('pieces'), remaining = [...pieces], construction = list('construction').map(v => {
        const index = remaining.findIndex(x => x.text === v); if (index < 0) return fail(`Unavailable inventory piece: ${v}`)
        return remaining.splice(index, 1)[0].id
      })
      activity = { pieces, slots: construction.map((_, i) => ({ id: id(), text: `Position ${i + 1}` })) }; expected = { construction }; break
    }
    case 'number-pattern': {
      const terms = list('terms').map(v => ({ id: id(), ...(v === '___' ? {} : { value: numeric(v) }) })); activity = { terms, missingId: terms.find(t => !('value' in t))?.id }; expected = { value: numeric(d.answer) }; break
    }
    case 'shape-pattern': {
      const shapes = items('options'), terms = list('terms').map(v => ({ id: id(), ...(v === '___' ? {} : { shapeId: ref(shapes, v) }) })); activity = { terms, missingId: terms.find(t => !('shapeId' in t))?.id, shapes }; expected = { shapeId: ref(shapes, d.answer) }; break
    }
    case 'rule-discovery': {
      const rules = items('rules'), examples = list('examples').map(v => { const parts = v.split('→'); if (parts.length !== 2) return fail('Use numeric input → output examples.'); return { input: numeric(parts[0]), output: numeric(parts[1]) } })
      // The old prototype omitted this semantic input. Do not infer it from prose.
      activity = { examples, rules, predictionInput: typeof d.predictionInput === 'number' ? d.predictionInput : NaN }; expected = { ruleId: ref(rules, d.rule), predictedOutput: numeric(d.answer) }; break
    }
    case 'scrambled-word': activity = { contributions: items('evidence') }; expected = { word: String(d.answer), caseSensitive: false }; break
    case 'hypothesis': activity = { packets: items('evidence'), decoderKey: String(d.rule) }; expected = textAnswer(); break
    case 'assemble-machine': {
      const frequencies = items('options').map(x => ({ ...x, value: numeric(x.text.replace(/\s*Hz\s*$/i, '')) })); activity = { contributions: items('evidence'), frequencies }; expected = { frequencyId: ref(frequencies, d.answer) }; break
    }
    case 'clue-synthesis': activity = { clues: items('evidence'), answerPattern: String(d.pattern) }; expected = textAnswer(); break
    case 'filter-noise': {
      const signals = items('evidence'); activity = { signals }; expected = { trustedSignalIds: list('answers').map(v => ref(signals.map(s => ({ ...s, text: s.text.split(':')[0].trim() })), v)) }; break
    }
    case 'shared-final-key': {
      const contributions = list('evidence').map(digits => ({ id: id(), digits })); activity = { contributions, orderingInstructions: '' }; expected = { order: contributions.map(x => x.id), code: String(d.answer) }; break
    }
    default: return fail('Unsupported exercise mechanic.')
  }
  return { ...structuredClone(e), id: `custom:${crypto.randomUUID()}`, authored: { mechanic: e.type as CustomType, activity, expected, hints: e.hint ? [e.hint] : [] } as AuthoredContent }
}
