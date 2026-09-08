export type OrganizerTemplate = { name: string; note: string; example: string }
export type OrganizerFeature = { id: string; name: string; templates: OrganizerTemplate[] }

export const signalCheckpointNames = ['Matthias Rex Statue', 'Stone Gate', 'Clock Tower', 'Fountain Court', 'Lantern Lane', 'North Passage', 'City Wall · FinishPoint']

export const signalFeatureDefaults: Record<string, OrganizerTemplate[]> = {
  personal: [
    { name: 'Find the missing output', note: 'Multiply every digit to find the missing output.', example: '3416 → 72 because 3 × 4 × 1 × 6 = 72.' },
    { name: 'Find the mistake', note: 'Choose the first incorrect step in the calculation.', example: 'In 3(2x−5)=27, 6x=12 is wrong; it should be 6x=42.' },
    { name: 'Complete the square', note: 'Use the relationship in the completed square.', example: '12 × ? = 8 × 6, so the missing number is 4.' },
    { name: 'Build the key', note: 'Use every number once to create the target.', example: 'Use 2, 3 and 4 to make 24: 2 × 3 × 4.' },
    { name: 'Complete the radial pattern', note: 'Study the completed arms and calculate the missing value.', example: 'The repeating radial rule reveals 15.' },
    { name: 'Identify the signal', note: 'Choose the only frequency satisfying the condition.', example: '24 / 29 / 35 → 29 is the only prime frequency.' },
    { name: 'Complete the prime sequence', note: 'Complete the sequence to recover your final key digit.', example: '2, 3, 5, 7, 11, ? → 13. Your contribution digit is 9.' },
  ],
  team: [
    { name: 'Scrambled Contributions', note: 'Use every Hunter’s letters once.', example: 'LK / OD / CN / UE → UNLOCKED.' },
    { name: 'Distributed Information', note: 'Combine four route facts to identify the destination.', example: 'The shared clues reveal WEST / Clock Tower.' },
    { name: 'Number-Code Synthesis', note: 'Join the packets and decode them with A=1.', example: '19 9 / 7 / 14 1 / 12 → SIGNAL.' },
    { name: 'Assemble the Machine', note: 'Apply the operation cards in the correct order.', example: 'START 3 → ×2 → +4 → ×3 = 30.' },
    { name: 'Clue Synthesis', note: 'Combine each Hunter’s clue to solve one riddle.', example: 'The shared clues reveal CIPHER.' },
    { name: 'Filter the Noise', note: 'Keep only the messages satisfying all shared rules.', example: 'The valid signals point to CITY WALL / WEST.' },
    { name: 'Shared Final Key', note: 'Order every Hunter’s essential digit.', example: '7 / 3 / 9 / 2 → 2397 → SIGNAL RESTORED.' },
  ],
  navigation: [
    { name: 'Starting Map', note: 'Show the first landmark and confirm arrival in range.', example: 'Matthias Rex Statue · simulated 30 m range check.' },
    { name: 'Compass + Distance', note: 'Show direction, distance and a short clue.', example: 'NW · 80 m → Stone Gate.' },
    { name: 'Landmark Recognition', note: 'Use a recognizable detail to identify the destination.', example: 'W · 120 m → Clock Tower.' },
    { name: 'Compass + Distance', note: 'Show direction, distance and a short clue.', example: 'E · 95 m → Fountain Court.' },
    { name: 'Decoded Route', note: 'Interpret the movement instruction before walking.', example: 'SE · 70 m → Lantern Lane.' },
    { name: 'Compass + Distance', note: 'Show direction, distance and a short clue.', example: 'NNW · 140 m → North Passage.' },
    { name: 'Signal Strength', note: 'Follow the strengthening signal to the FinishPoint.', example: 'W · 110 m → City Wall FinishPoint.' },
  ],
}

export const organizerFeatures: OrganizerFeature[] = [
  { id: 'count', name: 'Number of Checkpoints', templates: [{ name: '6 checkpoints + FinishPoint', note: 'Six relay checkpoints and one final stage.', example: '01 → 02 → 03 → 04 → 05 → 06 → FinishPoint.' }] },
  { id: 'positions', name: 'Checkpoint Positions', templates: [{ name: 'Signal verified route', note: 'Seven Creator-verified positions with a 30 m arrival radius.', example: signalCheckpointNames.join(' → ') }] },
  { id: 'personal', name: 'Personal Challenge', templates: signalFeatureDefaults.personal },
  { id: 'team', name: 'Team Challenge', templates: signalFeatureDefaults.team },
  { id: 'navigation', name: 'Next Checkpoint / Navigation', templates: [...signalFeatureDefaults.navigation, { name: 'Decoded Route', note: 'Interpret a route instruction before walking.', example: 'Decode a direction, then follow the revealed route.' }, { name: 'Signal Strength', note: 'Use the simulated signal meter.', example: 'The signal grows stronger as the team approaches.' }] },
  { id: 'final', name: 'Final Checkpoint', templates: [
    { name: 'Shared Final Key · Signal default', note: 'Complete the prime sequence, collect every digit and order the final key.', example: '7 / 3 / 9 / 2 → 2397 → SIGNAL RESTORED.' },
    { name: 'Multi-Stage Boss Challenge', note: 'Complete linked stages before entering the final answer.', example: 'Restore power, align the relays, then activate the transmitter.' },
    { name: 'Final Decision', note: 'Make one team choice that changes the ending.', example: 'Save the archive or restore the city signal.' },
  ]},
  { id: 'map', name: 'Mission History', templates: [{ name: 'Mission History', note: 'Show completed locations and team discoveries while private answers stay hidden.', example: 'Matthias Rex Statue: UNLOCKED → Stone Gate: route recovered.' }] },
  { id: 'results', name: 'Results Display', templates: [
    { name: 'Progressive reveal + Final Top 10', note: 'Reveal rankings progressively, then show the complete board.', example: '10th–6th first, 5th–4th next, podium last, then the final Top 10.' },
    { name: 'Final Results Board', note: 'Show all final positions together.', example: 'Final position, score and accuracy appear on one board.' },
  ]},
  { id: 'rewards', name: 'Rewards', templates: [{ name: 'Reward setup', note: 'Add leaderboard and special rewards.', example: 'Rewards are configured individually.' }] },
]
