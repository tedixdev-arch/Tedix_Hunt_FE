export const prototypeCompetition = {
  durationMs: 2 * 60 * 60 * 1000,
  teammateScoreOffsets: [120, 190, 80],
  leaderboard: [
    { name: 'RED CIRCUIT', scoreOffset: 180, award: 'Overall prize' },
    { name: 'NIGHT SHIFT', scoreOffset: 0, award: 'Teamwork prize' },
    { name: 'NORTHLINE', scoreOffset: -140, award: 'Speed prize' },
    { name: 'ECHO UNIT', scoreOffset: -310, award: null },
  ],
  awards: [
    { name: 'Overall prize', condition: 'Highest team total when competition closes.' },
    { name: 'Speed prize', condition: 'Fastest verified FinishPoint arrival.' },
    { name: 'Teamwork prize', condition: 'Every member contributes, with the strongest support record.' },
  ],
} as const
