import { fromPersistence } from './persistenceAdapter.ts'
import { signalFeatureDefaults } from '../../../data/organizerTemplates.ts'
import { checkpointExercises } from '../../../data/templateOne.ts'
import type { CheckpointGameplay } from '../checkpointGameplay.ts'
import { prototypes, type Exercise, type TeamType, teamNames } from './catalog.ts'

const object = (value: unknown): Record<string, unknown> => value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}
const text = (value: unknown, fallback = '') => typeof value === 'string' ? value : fallback
const strings = (value: unknown): string[] => Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
/** Read saved overrides before immutable defaults. Never writes or migrates the assignment. */
export function savedExercise(value: CheckpointGameplay, field: 'kind' | 'teamKind'): Exercise | undefined {
  const custom = value.customExercises?.[field === 'kind' ? 'personal' : 'team']
  if (custom) return fromPersistence(custom)
  const base = checkpointExercises.find(row => row[field] === value[field])
  if (!base) return undefined
  const nested = object(value[field === 'kind' ? 'personalChallenge' : 'teamChallenge'] ?? value[field === 'kind' ? 'challenge' : 'teamPuzzle'])
  const source = { ...base, ...value, ...nested } as Record<string, unknown>
  const team = field === 'teamKind'
  const instructions = text(nested.question, text(source.question, text(source[team ? 'teamPrompt' : 'prompt'])))
  const answerMap = object(source.correctAnswers)
  const keys = Object.keys(answerMap)
  const answer = text(nested.answer, text(source.answer, team ? text(source.teamAnswer) : text(answerMap[keys[0]])))
  const hint = text(nested.hint, strings(nested.hints).join('\n') || (team ? text(source.teamHint, text(source.teamInstruction)) : text(source.hint)))
  const solution = text(nested.solution, text(source.solution, team ? `${text(source.teamInstruction)}\nAnswer: ${answer}` : [text(source.solutionIntro), ...strings(source.solutionSteps)].join('\n')))
  const exercise: Exercise = { id: text(source.id, String(value[field])), type: team ? value.teamKind as TeamType : 'legacy-fields', title: text(nested.title, text(source.title)), instructions, hint, solution, correctFeedback: text(source.successText, 'Correct!'), incorrectFeedback: 'Not quite. Review the content and try again.', data: {} }
  if (team) {
    exercise.title = text(nested.title, text(source.teamTitle, signalFeatureDefaults.team[checkpointExercises.indexOf(base)]?.name ?? teamNames[value.teamKind as TeamType]))
    exercise.data = { evidence: strings(source.publicContributions), answer }
    if (['distributed-information', 'assemble-machine'].includes(exercise.type)) exercise.data.options = strings(source.teamOptions)
    if (exercise.type === 'hypothesis') exercise.data.rule = text(source.teamRule)
    if (exercise.type === 'clue-synthesis') exercise.data.pattern = text(source.teamDisplay)
    if (exercise.type === 'filter-noise') exercise.data.answers = answer.split('|')
    return exercise
  }
  const customAnswer = nested.answer !== undefined || source.answer !== undefined
  if (value.kind === 'find-sabotage' && !customAnswer) {
    const segments = Array.isArray(source.mistakeSegments) ? source.mistakeSegments.map(object) : []
    const explanations = Array.isArray(source.mistakeExplanations) ? source.mistakeExplanations.map(object) : []
    exercise.type = 'find-mistake'
    exercise.data = { steps: segments.map(s => text(s.content)), mistake: segments.findIndex(s => s.id === answer) + 1, explanations: explanations.map(s => text(s.text)), explanation: text(explanations.find(s => s.correct)?.text) }
  } else if (value.kind === 'build-key' && !customAnswer) {
    exercise.type = 'build-problem'; exercise.data = { pieces: ['2', '3', '4', '5'], construction: answer.split('') }
  } else if (value.kind === 'identify-signal' && !customAnswer) {
    exercise.type = 'single-choice'; exercise.data = { options: ['24', '29', '35'], answer }
  } else {
    // These legacy diagrams carry fixed example data in the existing participant source.
    const context: Record<string, string> = {
      'hidden-rule': 'Input → output\n23 → 6\n425 → 40\n1234 → 24\n3416 → ___',
      square: 'Squares (top, left, right, bottom):\n(8, 12, ___, 6)\n(6, 2, 3, 1)\n(3, 2, 9, 6)',
      radial: 'Opposite endpoint pairs:\n6 ↔ 20\n17 ↔ 9\n___ ↔ 11',
      'shared-final-key': '2, 3, 5, 7, 11, ___',
    }
    exercise.data = { context: text(nested.content, text(source.context, customAnswer ? instructions : context[value.kind!] ?? instructions)), keys: customAnswer ? ['Answer'] : keys, answers: customAnswer ? [answer] : keys.map(key => text(answerMap[key])) }
  }
  return exercise
}
export const defaultCustomPersonal = () => structuredClone(prototypes[0])
