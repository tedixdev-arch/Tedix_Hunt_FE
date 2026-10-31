import type { PersonalType, TeamType } from './catalog.ts'
export interface Item { id: string; text: string }
type TextAnswer = { value: string; caseSensitive: boolean }
type Pairs = { pairs: { leftId: string; rightId: string }[] }
export interface MechanicContent {
  'tap-pair': [{ left: Item[]; right: Item[] }, Pairs]
  'single-choice': [{ options: Item[] }, { optionId: string }]
  'true-false': [Record<string, never>, { value: boolean }]
  'memory-card': [{ card: string; revealDelayMs: number }, TextAnswer]
  'number-line': [{ min: number; max: number; step: number }, { target: number; tolerance: number }]
  'multiple-choice': [{ options: Item[] }, { optionIds: string[] }]
  'match-columns': [{ left: Item[]; right: Item[] }, Pairs]
  'drag-drop': [{ items: Item[]; targets: Item[] }, { assignments: { itemId: string; targetId: string }[] }]
  'fill-blank': [{ blanks: { id: string; prompt: string }[] }, { values: { blankId: string; value: string }[]; caseSensitive: boolean }]
  sequence: [{ elements: Item[] }, { order: string[] }]
  'find-mistake': [{ steps: Item[]; explanations: Item[] }, { stepId: string; explanationId: string }]
  'build-problem': [{ pieces: Item[]; slots: Item[] }, { construction: string[] }]
  'number-pattern': [{ terms: { id: string; value?: number }[]; missingId: string }, { value: number }]
  'shape-pattern': [{ terms: { id: string; shapeId?: string }[]; missingId: string; shapes: Item[] }, { shapeId: string }]
  'rule-discovery': [{ examples: { input: number; output: number }[]; rules: Item[]; predictionInput: number }, { ruleId: string; predictedOutput: number }]
  'scrambled-word': [{ contributions: Item[] }, { word: string; caseSensitive: boolean }]
  'distributed-information': [{ facts: Item[]; options: Item[] }, { optionId: string }]
  hypothesis: [{ packets: Item[]; decoderKey: string }, TextAnswer]
  'assemble-machine': [{ contributions: Item[]; frequencies: (Item & { value: number })[] }, { frequencyId: string }]
  'clue-synthesis': [{ clues: Item[]; answerPattern: string }, TextAnswer]
  'filter-noise': [{ signals: Item[] }, { trustedSignalIds: string[] }]
  'shared-final-key': [{ contributions: { id: string; digits: string }[]; orderingInstructions: string }, { order: string[]; code: string }]
}
export type CustomType = keyof MechanicContent
export interface PersistedIdentity { id: string; owner: { templateKey: string; version: number } }
export type AuthoredContent = { [K in CustomType]: {
  mechanic: K; activity: MechanicContent[K][0]; expected: MechanicContent[K][1]; hints: string[]
} }[CustomType]
export type CustomExercise = { [K in CustomType]: {
  type: K; classification: K extends PersonalType ? 'personal' : K extends TeamType ? 'team' : never
  schemaVersion: 1; title: string; instructions: string
  interaction: MechanicContent[K][0]; answer: MechanicContent[K][1]
  hints: string[]; solution: string; feedback: { correct: string; incorrect: string }
  id?: string; owner?: PersistedIdentity['owner']
} }[CustomType]
export interface CustomSlots { personal?: CustomExercise; team?: CustomExercise }
