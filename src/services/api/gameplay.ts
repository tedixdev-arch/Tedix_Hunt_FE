import { apiClient, ApiError, type ApiClient } from './client.ts'

/** Server-authoritative pilot Solo gameplay. The browser never holds answers, scores or completion. */
export type PlayStage = 'navigate' | 'personal' | 'team' | 'waiting' | 'finished'
export interface GeoTarget { latitude: number; longitude: number; radiusMeters: number }
export interface Navigation {
  location: string | null
  target: GeoTarget | null
  clue: { nextLocation: string | null; direction: string | null; distance: string | null; navigationClue: string | null; navigationMode: string | null } | null
}
export interface PersonalChallenge {
  id?: string; kind?: string; title?: string; label?: string; prompt?: string; location?: string
  storyStage?: string; storyObjective?: string; storyProblem?: string; storyPlan?: string; storyRisk?: string; teamInstruction?: string
  answerKeys: string[]
  mistakeSegments?: Array<{ id: string; content: string }>
}
export interface TeamChallenge {
  teamKind?: string; teamPrompt?: string; teamRule?: string; teamInstruction?: string; personalMask?: string; teamDisplay?: string
  teamOptions: string[]; publicContributions: string[]
}
/**
 * A Creator or Library exercise as sent to participants: no answers, hints or solutions. `interaction` is the
 * per-mechanic participant view (docs/Custom_Exercise_Gameplay.md in the backend).
 */
export interface CustomExercisePlay {
  type: string; classification: 'personal' | 'team'; title: string; instructions: string
  interaction: Record<string, any>
}
/** Response for a custom exercise: the shape of its answer, without authoring flags. */
export type CustomExerciseResponse = Record<string, unknown>
export interface PersonalReveal { successText?: string; personalContribution?: string; personalMask?: string; correctedExpression?: string; mistakeContent?: string | null; recallCard?: string }
export interface TeamReveal { storySuccess?: string; teamAnswer: string | null }
export interface CurrentCheckpoint {
  checkpointId: string; ordinal: number; kind: 'regular' | 'finish'
  navigation: Navigation
  playable: boolean
  story?: PersonalChallenge; personalAttempts?: number
  personalReveal?: PersonalReveal; team?: TeamChallenge; teamAttempts?: number
  /** Present when the current stage is a custom exercise instead of predefined content. */
  personalExercise?: CustomExercisePlay; teamExercise?: CustomExercisePlay
}
export interface PlayState {
  huntId: string; participantId: string; huntName: string
  huntStatus: 'published' | 'active' | 'paused'
  policyRevision: string
  mission: { displayName: string; theme: string | null; name: string | null; signal: string | null; briefing: string | null; finishLocation: string | null }
  score: number; startedAt: string | null; finishedAt: string | null; durationMinutes: number | null
  checkpoints: Array<{ checkpointId: string; ordinal: number; kind: 'regular' | 'finish'; accessState: 'not_yet_accessible' | 'eligible_for_proximity' | 'proximity_verified'; completed: boolean }>
  stage: PlayStage
  current: CurrentCheckpoint | null
  history: Array<{ checkpointId: string; ordinal: number; kind: string; location: string | null; storyObjective: string | null; storySuccess?: string | null; teamAnswer?: string | null; completedAt: string | null }>
  /** Platform Settings shown to participants. */
  safety?: { emergencyNumber: string; notice: string }
}
export interface AnswerResult {
  correct: boolean; stage: 'personal' | 'team'; checkpointCompleted: boolean
  reveal?: PersonalReveal & TeamReveal
  state: PlayState
}
export interface LeaderboardEntry { rank: number; displayName: string; score: number; checkpointsCompleted: number; checkpointsTotal: number; finishedAt: string | null; isYou: boolean }

export class GameplayApi {
  constructor(private readonly client: ApiClient = apiClient) {}
  state(huntId: string) { return this.client.get<PlayState>(`/api/hunts/${encodeURIComponent(huntId)}/participants/me/play`) }
  arrive(huntId: string, checkpointId: string, position: { latitude: number; longitude: number; accuracyMeters: number; observedAt: string }) {
    return this.client.post(`/api/hunts/${encodeURIComponent(huntId)}/checkpoints/${encodeURIComponent(checkpointId)}/proximity`, position)
  }
  answerPersonal(huntId: string, checkpointId: string, answers: Record<string, string>) {
    return this.client.post<AnswerResult>(`/api/hunts/${encodeURIComponent(huntId)}/checkpoints/${encodeURIComponent(checkpointId)}/answer`, { stage: 'personal', answers })
  }
  answerTeam(huntId: string, checkpointId: string, answer: string) {
    return this.client.post<AnswerResult>(`/api/hunts/${encodeURIComponent(huntId)}/checkpoints/${encodeURIComponent(checkpointId)}/answer`, { stage: 'team', answer })
  }
  answerCustom(huntId: string, checkpointId: string, stage: 'personal' | 'team', response: CustomExerciseResponse) {
    return this.client.post<AnswerResult>(`/api/hunts/${encodeURIComponent(huntId)}/checkpoints/${encodeURIComponent(checkpointId)}/answer`, { stage, response })
  }
  requestHelp(huntId: string, kind: 'help' | 'emergency', message: string) {
    return this.client.post(`/api/hunts/${encodeURIComponent(huntId)}/participants/me/help`, { kind, message })
  }
  leaderboard(huntId: string) { return this.client.get<{ huntId: string; entries: LeaderboardEntry[] }>(`/api/hunts/${encodeURIComponent(huntId)}/leaderboard`) }
}
export const gameplayApi = new GameplayApi()

export function gameplayError(error: unknown): string {
  if (error instanceof ApiError) {
    const code = (error.details as { error?: unknown } | undefined)?.error
    if (error.kind === 'network') return "Couldn't connect. Check your signal and try again."
    if (error.status === 401) return 'Your session has expired. Please sign in again.'
    if (error.status === 429) return 'Too many tries. Wait a moment and try again.'
    switch (code) {
      case 'proximity_outside_radius': return "You're not close enough yet. Move closer to the checkpoint and try again."
      case 'proximity_inaccurate': return 'Your location is not precise enough. Step into the open and try again.'
      case 'proximity_stale': return 'Your location reading is too old. Try again.'
      case 'checkpoint_geography_unavailable': return "This checkpoint has no GPS position. Ask your Organizer to confirm your arrival."
      case 'invalid_hunt_state': return 'The Hunt is not running right now.'
      case 'checkpoint_not_current': case 'stage_already_solved': return 'This step was already completed. Refreshing…'
      case 'challenge_unsupported': return "This checkpoint's challenge can't be played in the app yet. Contact your Organizer."
    }
  }
  return 'Something went wrong. Try again.'
}
