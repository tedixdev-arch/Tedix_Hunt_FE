import { useCallback, useEffect, useState } from 'react'
import {
  type Difficulty,
  type SimulationState,
  type Step,
  STEP_ORDER,
} from '../types/simulation'

const STORAGE_KEY = 'tedixhunt-demo-state'

const initialState: SimulationState = {
  step: 'invitation',
  difficulty: null,
  score: 0,
  collectedClues: [],
  challengeInput: '',
  challengeSolved: false,
  challengeAttempts: 0,
  hintUsed: false,
  finalInput: '',
  finalSolved: false,
}

function loadState(): SimulationState {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return initialState
    return { ...initialState, ...JSON.parse(raw) }
  } catch {
    return initialState
  }
}

export function useSimulation() {
  const [state, setState] = useState<SimulationState>(loadState)

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // ignore write errors
    }
  }, [state])

  const reset = useCallback(() => {
    setState(initialState)
    try {
      sessionStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore
    }
  }, [])

  const goTo = useCallback((step: Step) => {
    setState((prev) => ({ ...prev, step }))
  }, [])

  const goBack = useCallback(() => {
    setState((prev) => {
      const idx = STEP_ORDER.indexOf(prev.step)
      if (idx <= 0) return prev
      return { ...prev, step: STEP_ORDER[idx - 1] }
    })
  }, [])

  const setDifficulty = useCallback((difficulty: Difficulty) => {
    setState((prev) => ({ ...prev, difficulty }))
  }, [])

  const setChallengeInput = useCallback((value: string) => {
    setState((prev) => ({ ...prev, challengeInput: value }))
  }, [])

  const submitChallenge = useCallback((answer: string) => {
    const normalized = answer.trim().toLowerCase()
    setState((prev) => {
      const correct = normalized === 'clock'
      const newClues = correct && !prev.challengeSolved
        ? [...prev.collectedClues, 'L']
        : prev.collectedClues
      const newScore = correct && !prev.challengeSolved
        ? prev.score + 100
        : prev.score
      return {
        ...prev,
        challengeInput: answer,
        challengeSolved: correct,
        challengeAttempts: prev.challengeAttempts + 1,
        collectedClues: newClues,
        score: newScore,
      }
    })
  }, [])

  const useHint = useCallback(() => {
    setState((prev) => ({ ...prev, hintUsed: true }))
  }, [])

  const resetChallenge = useCallback(() => {
    setState((prev) => ({
      ...prev,
      challengeInput: '',
      challengeSolved: false,
      challengeAttempts: 0,
      hintUsed: false,
    }))
  }, [])

  const setFinalInput = useCallback((value: string) => {
    setState((prev) => ({ ...prev, finalInput: value }))
  }, [])

  const submitFinal = useCallback((answer: string) => {
    const normalized = answer.trim().toLowerCase()
    setState((prev) => {
      const correct = normalized === 'bell'
      const newClues = correct && !prev.finalSolved && !prev.collectedClues.includes('B')
        ? [...prev.collectedClues, 'B']
        : prev.collectedClues
      const newScore = correct && !prev.finalSolved
        ? prev.score + 200
        : prev.score
      return {
        ...prev,
        finalInput: answer,
        finalSolved: correct,
        collectedClues: newClues,
        score: newScore,
      }
    })
  }, [])

  const collectLastClue = useCallback(() => {
    setState((prev) => {
      if (prev.collectedClues.length >= 4) return prev
      return { ...prev, collectedClues: ['B', 'E', 'L', 'L'] }
    })
  }, [])

  const stepIndex = STEP_ORDER.indexOf(state.step)

  return {
    state,
    stepIndex,
    totalSteps: STEP_ORDER.length,
    reset,
    goTo,
    goBack,
    setDifficulty,
    setChallengeInput,
    submitChallenge,
    useHint,
    resetChallenge,
    setFinalInput,
    submitFinal,
    collectLastClue,
  }
}
