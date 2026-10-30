// Reused from tedix-variable-rewards @ 29e34f9, src/pages/memoryCardCountdown.ts.
export type RecallCountdownState = {
  stage: 'waiting' | 'ready_to_reveal';
  remainingSeconds: number;
};

export function getInitialCountdownSeconds(revealDelayMs: number): number {
  return Math.max(1, Math.ceil(revealDelayMs / 1000));
}

export function getRecallCountdownState(remainingMs: number): RecallCountdownState {
  if (remainingMs <= 0) {
    return { stage: 'ready_to_reveal', remainingSeconds: 0 };
  }

  return {
    stage: 'waiting',
    remainingSeconds: getInitialCountdownSeconds(remainingMs),
  };
}

export function getNextCountdownTickDelay(remainingMs: number): number {
  const { remainingSeconds } = getRecallCountdownState(remainingMs);
  if (remainingSeconds === 0) return 0;
  return remainingMs - ((remainingSeconds - 1) * 1000);
}
