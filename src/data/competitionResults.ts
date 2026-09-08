type SpecialAward = { name: string; team: string; result: string; condition: string }

export const prototypeCompetition = {
  durationMs: 10 * 1000,
  teammateScoreOffsets: [120, 190, 80],
  leaderboard: [
    { name: 'RED CIRCUIT', scoreOffset: 180, prize: 'Champion prize', accuracy: null },
    { name: 'NIGHT SHIFT', scoreOffset: 0, prize: 'Second-place prize', accuracy: null },
    { name: 'NORTHLINE', scoreOffset: -140, prize: 'Third-place prize', accuracy: null },
    { name: 'ECHO UNIT', scoreOffset: -310, prize: 'Fourth-place prize', accuracy: null },
    { name: 'LANTERN CREW', scoreOffset: -420, prize: 'Fifth-place prize', accuracy: null },
    { name: 'STONE VECTOR', scoreOffset: -530, prize: 'Team Challenge Accuracy', accuracy: '96%' },
    { name: 'CITY ATLAS', scoreOffset: -640, prize: 'Personal Challenge Accuracy', accuracy: '94%' },
    { name: 'PULSE TEAM', scoreOffset: -760, prize: null, accuracy: null },
    { name: 'NORTH ORBIT', scoreOffset: -890, prize: null, accuracy: null },
    { name: 'STATIC ZERO', scoreOffset: -1020, prize: null, accuracy: null },
  ],
  specialAwards: [
    { name: 'Team Challenge Accuracy', team: 'STONE VECTOR', result: '96%', condition: 'Best first-attempt team challenge accuracy among teams without a position prize.' },
    { name: 'Personal Challenge Accuracy', team: 'CITY ATLAS', result: '94%', condition: 'Best first-attempt personal challenge accuracy among teams without another prize.' },
  ] as readonly SpecialAward[],
} as const
