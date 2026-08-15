import { useEffect, useReducer } from 'react'
import { checkpointExercises } from '../data/templateOne'

export type MissionPhase = 'invitation' | 'onboarding' | 'navigation' | 'arrival' | 'individual' | 'contribution' | 'team-waiting' | 'team-ready' | 'team-unlocked' | 'team-celebration' | 'reward' | 'complete'
export type AttemptStatus = 'active' | 'incorrect' | 'hint' | 'solution' | 'correct'
export type Difficulty = 'easy' | 'medium' | 'hard'
export type MistakeStage = 'search' | 'explain' | 'resolved'
export type CheckpointAttempt = { answers: Record<string, string>; status: AttemptStatus; wrongAttempts: number; assistanceUnlocked: boolean; hintUsed: boolean; solutionUsed: boolean; skipped: boolean; accuracyBonus: number; mistakeStage: MistakeStage }
export type ScoreEvent = { id: string; checkpoint: number; label: string; points: number }
export type TeamChallengeRecord = { checkpoint: number; prompt: string; answer: string; resolvedWithSolution: boolean }
export type MissionState = { phase: MissionPhase; difficulty: Difficulty | null; checkpointIndex: number; attempts: CheckpointAttempt[]; huntScore: number; scoreEvents: ScoreEvent[]; teamAnswer: string; teamIncorrect: boolean; teamSolutionUsed: boolean[]; teamRecords: TeamChallengeRecord[]; completedCheckpoints: number; completionBonusAwarded: boolean; finalPuzzleBonus: number }
export type MissionAction =
  | { type: 'ACCEPT_MISSION' } | { type: 'SELECT_DIFFICULTY'; difficulty: Difficulty } | { type: 'START_HUNT' } | { type: 'ARRIVE' } | { type: 'OPEN_CHECKPOINT' }
  | { type: 'SET_ANSWER'; key: string; value: string } | { type: 'VERIFY' } | { type: 'RETRY' }
  | { type: 'SHOW_HINT' } | { type: 'CLOSE_HINT' } | { type: 'REVEAL_SOLUTION' } | { type: 'SKIP' }
  | { type: 'CLAIM_CONTRIBUTION' } | { type: 'OPEN_TEAM_PROGRESS' } | { type: 'TEAM_CONTRIBUTIONS_READY' } | { type: 'OPEN_TEAM_CHALLENGE' }
  | { type: 'SET_TEAM_ANSWER'; value: string } | { type: 'VERIFY_TEAM' } | { type: 'REVEAL_TEAM_SOLUTION' } | { type: 'REVEAL_ROUTE' } | { type: 'OPEN_NAVIGATION' }
  | { type: 'RESTART' }

const newAttempt = (): CheckpointAttempt => ({ answers: {}, status: 'active', wrongAttempts: 0, assistanceUnlocked: false, hintUsed: false, solutionUsed: false, skipped: false, accuracyBonus: 0, mistakeStage: 'search' })
const createInitialState = (): MissionState => ({ phase: 'invitation', difficulty: null, checkpointIndex: 0, attempts: checkpointExercises.map(newAttempt), huntScore: 500, scoreEvents: [], teamAnswer: '', teamIncorrect: false, teamSolutionUsed: checkpointExercises.map(() => false), teamRecords: [], completedCheckpoints: 0, completionBonusAwarded: false, finalPuzzleBonus: 0 })

function addScoreEvent(state: MissionState, event: ScoreEvent): MissionState {
  if (state.scoreEvents.some(item => item.id === event.id)) return state
  return { ...state, huntScore: state.huntScore + event.points, scoreEvents: [...state.scoreEvents, event] }
}

function updateAttempt(state: MissionState, update: (attempt: CheckpointAttempt) => CheckpointAttempt): MissionState {
  return { ...state, attempts: state.attempts.map((attempt, index) => index === state.checkpointIndex ? update(attempt) : attempt) }
}

function recordTeamChallenge(state: MissionState, resolvedWithSolution: boolean): MissionState {
  const exercise = checkpointExercises[state.checkpointIndex]
  const record: TeamChallengeRecord = { checkpoint: exercise.checkpoint, prompt: exercise.teamPrompt, answer: exercise.teamAnswer, resolvedWithSolution }
  return { ...state, teamRecords: [...state.teamRecords.filter(item => item.checkpoint !== exercise.checkpoint), record] }
}

function reducer(state: MissionState, action: MissionAction): MissionState {
  if (action.type === 'RESTART') return createInitialState()
  const exercise = checkpointExercises[state.checkpointIndex]
  const attempt = state.attempts[state.checkpointIndex]

  switch (action.type) {
    case 'ACCEPT_MISSION': return state.phase === 'invitation' ? { ...state, phase: 'onboarding' } : state
    case 'SELECT_DIFFICULTY': return state.phase === 'onboarding' ? { ...state, difficulty: action.difficulty } : state
    case 'START_HUNT': return state.phase === 'onboarding' && state.difficulty ? { ...state, phase: 'navigation' } : state
    case 'ARRIVE':
      if (state.phase !== 'navigation') return state
      if (state.checkpointIndex === 0 && state.completedCheckpoints === 0) return { ...state, phase: 'arrival' }
      return { ...state, checkpointIndex: Math.min(6, state.checkpointIndex + 1), phase: 'arrival', teamAnswer: '', teamIncorrect: false }
    case 'OPEN_CHECKPOINT': return state.phase === 'arrival' ? { ...state, phase: 'individual' } : state
    case 'SET_ANSWER':
      return state.phase === 'individual' && attempt.status === 'active'
        ? updateAttempt(state, current => ({ ...current, answers: { ...current.answers, [action.key]: exercise.kind === 'find-sabotage' ? action.value : action.value.replace(/\D/g, '').slice(0, 4) } }))
        : state
    case 'VERIFY': {
      if (state.phase !== 'individual' || attempt.status !== 'active' || !exercise.answerKeys.every(key => attempt.answers[key]?.length)) return state
      const correct = exercise.kind === 'find-sabotage' && attempt.mistakeStage === 'explain'
        ? exercise.mistakeExplanations?.some(option => option.id === attempt.answers.x && option.correct) === true
        : exercise.answerKeys.every(key => attempt.answers[key] === exercise.correctAnswers[key])
      if (!correct) {
        const wrongNumber = attempt.wrongAttempts + 1
        return addScoreEvent(updateAttempt(state, current => ({ ...current, status: 'incorrect', wrongAttempts: wrongNumber, assistanceUnlocked: true })), {
          id: `stage-${exercise.checkpoint}-wrong-${wrongNumber}`, checkpoint: exercise.checkpoint, label: 'Failed verified attempt', points: -25,
        })
      }
      if (exercise.kind === 'find-sabotage' && attempt.mistakeStage === 'search') {
        return updateAttempt(state, current => ({ ...current, mistakeStage: 'explain', answers: {} }))
      }
      const bonus = exercise.checkpoint <= 6 && attempt.wrongAttempts === 0 && !attempt.hintUsed && !attempt.solutionUsed ? 100 : 0
      let next = updateAttempt(state, current => ({ ...current, status: 'correct', accuracyBonus: bonus, mistakeStage: exercise.kind === 'find-sabotage' ? 'resolved' : current.mistakeStage }))
      if (bonus) next = addScoreEvent(next, { id: `stage-${exercise.checkpoint}-accuracy`, checkpoint: exercise.checkpoint, label: 'First-attempt accuracy', points: bonus })
      return next
    }
    case 'RETRY': return attempt.status === 'incorrect' ? updateAttempt(state, current => ({ ...current, status: 'active', answers: {} })) : state
    case 'SHOW_HINT': {
      if (state.phase !== 'individual' || attempt.status !== 'active' || !attempt.assistanceUnlocked) return state
      const next = updateAttempt(state, current => ({ ...current, status: 'hint', hintUsed: true }))
      return attempt.hintUsed ? next : addScoreEvent(next, { id: `stage-${exercise.checkpoint}-hint`, checkpoint: exercise.checkpoint, label: 'Hint used', points: -50 })
    }
    case 'CLOSE_HINT': return attempt.status === 'hint' ? updateAttempt(state, current => ({ ...current, status: 'active' })) : state
    case 'REVEAL_SOLUTION': {
      if (state.phase !== 'individual' || !attempt.assistanceUnlocked || !['active', 'hint'].includes(attempt.status)) return state
      const next = updateAttempt(state, current => ({ ...current, status: 'solution', solutionUsed: true, answers: { ...exercise.correctAnswers }, mistakeStage: exercise.kind === 'find-sabotage' ? 'resolved' : current.mistakeStage }))
      return addScoreEvent(next, { id: `stage-${exercise.checkpoint}-solution`, checkpoint: exercise.checkpoint, label: 'Solution revealed', points: -100 })
    }
    case 'SKIP': {
      if (state.phase !== 'individual' || attempt.status !== 'active' || !attempt.assistanceUnlocked) return state
      const next = updateAttempt(state, current => ({ ...current, status: 'solution', solutionUsed: true, skipped: true, answers: { ...exercise.correctAnswers }, mistakeStage: exercise.kind === 'find-sabotage' ? 'resolved' : current.mistakeStage }))
      return addScoreEvent(next, { id: `stage-${exercise.checkpoint}-solution`, checkpoint: exercise.checkpoint, label: 'Challenge skipped', points: -100 })
    }
    case 'CLAIM_CONTRIBUTION': return state.phase === 'individual' && ['correct', 'solution'].includes(attempt.status) ? { ...state, phase: 'contribution' } : state
    case 'OPEN_TEAM_PROGRESS': return state.phase === 'contribution' ? { ...state, phase: 'team-waiting' } : state
    case 'TEAM_CONTRIBUTIONS_READY': return state.phase === 'team-waiting' ? { ...state, phase: 'team-ready' } : state
    case 'OPEN_TEAM_CHALLENGE': return state.phase === 'team-ready' ? { ...state, phase: 'team-unlocked' } : state
    case 'SET_TEAM_ANSWER': return state.phase === 'team-unlocked' ? { ...state, teamAnswer: action.value.toUpperCase(), teamIncorrect: false } : state
    case 'VERIFY_TEAM': {
      if (state.phase !== 'team-unlocked' || !state.teamAnswer.trim()) return state
      if (state.teamAnswer.trim().toUpperCase() !== exercise.teamAnswer) return { ...state, teamIncorrect: true }
      if (state.checkpointIndex < 6) return addScoreEvent(recordTeamChallenge({ ...state, phase: 'team-celebration', completedCheckpoints: Math.max(state.completedCheckpoints, exercise.checkpoint), teamIncorrect: false }, false), { id: `stage-${exercise.checkpoint}-team`, checkpoint: exercise.checkpoint, label: 'Team challenge solved', points: 50 })
      let next = addScoreEvent(recordTeamChallenge({ ...state, phase: 'complete', completedCheckpoints: 7, finalPuzzleBonus: 250, teamIncorrect: false }, false), { id: 'finishpoint-puzzle', checkpoint: 7, label: 'FinishPoint puzzle', points: 250 })
      if (!next.completionBonusAwarded) next = addScoreEvent({ ...next, completionBonusAwarded: true }, { id: 'completion-bonus', checkpoint: 7, label: 'Mission completion', points: 100 })
      return next
    }
    case 'REVEAL_TEAM_SOLUTION': {
      if (state.phase !== 'team-unlocked' || state.teamSolutionUsed[state.checkpointIndex]) return state
      const used = state.teamSolutionUsed.map((value, index) => index === state.checkpointIndex ? true : value)
      let next: MissionState = recordTeamChallenge({ ...state, teamAnswer: exercise.teamAnswer, teamIncorrect: false, teamSolutionUsed: used, completedCheckpoints: Math.max(state.completedCheckpoints, exercise.checkpoint), phase: state.checkpointIndex < 6 ? 'team-celebration' : 'complete' }, true)
      next = addScoreEvent(next, { id: `stage-${exercise.checkpoint}-team-solution`, checkpoint: exercise.checkpoint, label: 'Team solution revealed', points: -100 })
      if (state.checkpointIndex === 6 && !next.completionBonusAwarded) next = addScoreEvent({ ...next, completionBonusAwarded: true }, { id: 'completion-bonus', checkpoint: 7, label: 'Mission completion', points: 100 })
      return next
    }
    case 'REVEAL_ROUTE': return state.phase === 'team-celebration' ? { ...state, phase: 'navigation', teamAnswer: '', teamIncorrect: false } : state
    case 'OPEN_NAVIGATION': return state.phase === 'reward' ? { ...state, phase: 'navigation', teamAnswer: '', teamIncorrect: false } : state
  }
}

const STORAGE_KEY = 'tedixhunt-signal-cluj-diverse-story-v1'
function loadState(): MissionState {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY)
    if (!saved) return createInitialState()
    const parsed = JSON.parse(saved) as MissionState
    if (!Array.isArray(parsed.attempts) || parsed.attempts.length !== 7) return createInitialState()
    return { ...createInitialState(), ...parsed, phase: parsed.phase === 'reward' ? 'navigation' : parsed.phase, attempts: parsed.attempts.map(attempt => ({ ...newAttempt(), ...attempt })), teamRecords: Array.isArray(parsed.teamRecords) ? parsed.teamRecords : [] }
  } catch { return createInitialState() }
}

export function useTemplateOneMission(startNewMission = false) {
  const [state, dispatch] = useReducer(reducer, startNewMission ? { ...createInitialState(), phase: 'onboarding' } : loadState())
  useEffect(() => { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state)) }, [state])
  return { state, dispatch }
}
