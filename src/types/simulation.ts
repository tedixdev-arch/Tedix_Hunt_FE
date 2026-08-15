export type Step =
  | 'invitation'
  | 'event-preview'
  | 'team-setup'
  | 'briefing'
  | 'difficulty'
  | 'device-readiness'
  | 'navigate'
  | 'challenge'
  | 'clue-reward'
  | 'team-progress'
  | 'final-puzzle'
  | 'results'

export type Difficulty = 'easy' | 'medium' | 'hard'

export type SimulationState = {
  step: Step
  difficulty: Difficulty | null
  score: number
  collectedClues: string[]
  challengeInput: string
  challengeSolved: boolean
  challengeAttempts: number
  hintUsed: boolean
  finalInput: string
  finalSolved: boolean
}

export const STEP_ORDER: Step[] = [
  'invitation',
  'event-preview',
  'team-setup',
  'briefing',
  'difficulty',
  'device-readiness',
  'navigate',
  'challenge',
  'clue-reward',
  'team-progress',
  'final-puzzle',
  'results',
]
