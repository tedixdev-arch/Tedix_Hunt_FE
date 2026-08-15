export type ExerciseKind = 'hidden-rule' | 'find-sabotage' | 'square' | 'build-key' | 'radial' | 'identify-signal' | 'shared-final-key'
export type TeamPuzzleKind = 'missing-letter' | 'distributed-information' | 'hypothesis' | 'assemble-machine' | 'clue-synthesis' | 'consensus-transmitter' | 'shared-final-key'
export type NavigationMode = 'compass' | 'map' | 'landmark' | 'decoded-route' | 'signal-strength' | 'none'
export type MistakeSegment = { id: string; content: string; mistake?: boolean }
export type MistakeExplanation = { id: string; text: string; correct?: boolean }

export type CheckpointExercise = {
  id: string
  kind: ExerciseKind
  checkpoint: number
  location: string
  title: string
  label: string
  prompt: string
  answerKeys: readonly string[]
  correctAnswers: Readonly<Record<string, string>>
  hint: string
  solutionIntro: string
  solutionSteps: readonly string[]
  successText: string
  personalContribution: string
  personalMask: string
  publicContributions: readonly string[]
  teamKind: TeamPuzzleKind
  teamPrompt: string
  teamDisplay: string
  teamAnswer: string
  teamOptions: readonly string[]
  teamRule?: string
  nextLocation: string
  direction: string
  distance: string
  navigationClue: string
  navigationMode: NavigationMode
  storyStage: string
  storyObjective: string
  storyProblem: string
  storyPlan: string
  teamInstruction: string
  storyRisk: string
  storySuccess: string
  mistakeSegments?: readonly MistakeSegment[]
  mistakeExplanations?: readonly MistakeExplanation[]
  correctedExpression?: string
}

export const checkpointExercises: readonly CheckpointExercise[] = [
  {
    id: 'hidden-rule', kind: 'hidden-rule', checkpoint: 1, location: 'MATTHIAS REX STATUE', title: 'Find the missing output', label: 'Number pattern',
    prompt: 'The same rule connects every input to its output. Find the output for 3416.', answerKeys: ['x'], correctAnswers: { x: '72' },
    hint: 'Look at the digits separately. What operation turns 2 and 3 into 6?', solutionIntro: 'Multiply all the digits in each input.',
    solutionSteps: ['2 x 3 = 6', '4 x 2 x 5 = 40', '1 x 2 x 3 x 4 = 24', '3 x 4 x 1 x 6 = 72'], successText: 'You found the rule: multiply the digits.',
    personalContribution: 'C', personalMask: '_ _ _ _ C _', publicContributions: ['Maya: U', 'Liam: L O', 'You: C', 'Zara: K'],
    teamKind: 'missing-letter', teamPrompt: 'Complete the command.', teamDisplay: 'U _ L O C K', teamAnswer: 'UNLOCK', teamOptions: [],
    nextLocation: 'STONE GATE', direction: 'NW', distance: '80 m', navigationClue: 'Follow the narrow lane toward the weathered stone gateway.', navigationMode: 'compass',
    storyStage: 'ACCESS', storyObjective: 'Find the first relay.', storyProblem: 'The statue marks the starting transmitter. It can reveal the route to the first relay at Stone Gate.', storyPlan: 'Solve the number pattern to reveal your part of its access command.', teamInstruction: 'Combine all four parts and enter the command that unlocks the route.', storyRisk: 'Without the command, the relay network stays hidden.', storySuccess: 'Route unlocked. Move to the Stone Gate relay.',
  },
  {
    id: 'find-sabotage', kind: 'find-sabotage', checkpoint: 2, location: 'STONE GATE', title: 'Find the mistake', label: 'Corrupted transmission',
    prompt: 'Select the first incorrect step.', answerKeys: ['x'], correctAnswers: { x: 'step-3' },
    hint: 'Check what happens when 15 is moved to the other side.', solutionIntro: 'The third line is the first incorrect step.',
    solutionSteps: ['From 6x - 15 = 27, add 15 to both sides.', 'That gives 6x = 42, then x = 7.'], successText: 'You found the first broken step and repaired the trace.',
    mistakeSegments: [{ id: 'step-1', content: '3(2x - 5) = 27' }, { id: 'step-2', content: '6x - 15 = 27' }, { id: 'step-3', content: '6x = 12', mistake: true }, { id: 'step-4', content: 'x = 2' }],
    mistakeExplanations: [{ id: 'move-term', text: '15 was subtracted again instead of added to both sides.', correct: true }, { id: 'expand', text: 'The brackets were expanded incorrectly.' }, { id: 'divide', text: 'Both sides were divided by the wrong number.' }],
    correctedExpression: '6x = 42, then x = 7',
    personalContribution: 'Opposite the fountain', personalMask: 'YOUR FACT: OPPOSITE THE FOUNTAIN', publicContributions: ['Maya: The tower is not north.', 'Liam: The fountain is east of the gate.', 'You: The target is opposite the fountain.', 'Zara: We are standing at the gate.'],
    teamKind: 'distributed-information', teamPrompt: 'Where did the true trace go?', teamDisplay: 'Combine four location facts', teamAnswer: 'WEST', teamOptions: ['WEST', 'NORTH', 'EAST'],
    nextLocation: 'CLOCK TOWER', direction: 'W', distance: '120 m', navigationClue: 'Find the clock face shown in the recovered visual fragment.', navigationMode: 'landmark',
    storyStage: 'TRACE', storyObjective: 'Repair the route relay.', storyProblem: 'Stone Gate controls the city routes, but someone fed it a false direction.', storyPlan: 'Find the first incorrect algebra step to recover one true location fact.', teamInstruction: 'Combine the four facts and choose where the real signal went.', storyRisk: 'The false route sends the team away from the signal.', storySuccess: 'Route relay repaired. The signal reached the Clock Tower receiver.',
  },
  {
    id: 'square', kind: 'square', checkpoint: 3, location: 'CLOCK TOWER', title: 'Complete the square', label: 'Square pattern',
    prompt: 'Use the two completed squares to find the missing value in the first square.', answerKeys: ['x'], correctAnswers: { x: '4' },
    hint: 'Compare the products of the numbers in opposite sections of each completed square.', solutionIntro: 'Opposite products are equal.',
    solutionSteps: ['In the final square, 8 x 6 = 48.', '12 x x must also equal 48.', '48 / 12 = 4.'], successText: '12 x 4 = 8 x 6.',
    personalContribution: '14 1', personalMask: '_ _ / _ / 14 1 / _', publicContributions: ['Maya / packet 1: 19 9', 'Liam / packet 2: 7', 'You / packet 3: 14 1', 'Zara / packet 4: 12'],
    teamKind: 'hypothesis', teamPrompt: 'Decode the intercepted message.', teamDisplay: '19 9 / 7 / 14 1 / 12', teamAnswer: 'SIGNAL', teamOptions: [], teamRule: 'A = 1, B = 2 ... Z = 26',
    nextLocation: 'FOUNTAIN COURT', direction: 'E', distance: '95 m', navigationClue: 'Cross into the open court where water masks the street noise.', navigationMode: 'compass',
    storyStage: 'IDENTIFY', storyObjective: 'Read the signal.', storyProblem: 'The Clock Tower receives the transmission, but its message is still coded.', storyPlan: 'Solve the square pattern to recover your numbered message packet.', teamInstruction: 'Join packets 1-4 and decode the message with A=1 through Z=26.', storyRisk: 'Without the message, the next relay cannot be identified.', storySuccess: 'Message decoded. It reports a damaged relay at Fountain Court.',
  },
  {
    id: 'build-key', kind: 'build-key', checkpoint: 4, location: 'FOUNTAIN COURT', title: 'Build the key', label: 'Relay construction',
    prompt: 'Use three number blocks to build exactly 24.', answerKeys: ['x'], correctAnswers: { x: '234' },
    hint: 'Use 2, 3 and 4. Multiplication connects the blocks.', solutionIntro: 'Connect the three required blocks.',
    solutionSteps: ['2 x 3 x 4 = 24.', 'The key sequence is 2, 3, 4.'], successText: 'Key created. Your relay component is powered.',
    personalContribution: '+4', personalMask: 'YOUR COMPONENT: +4', publicContributions: ['Maya: START 3', 'Liam: x2', 'You: +4', 'Zara: x3'],
    teamKind: 'assemble-machine', teamPrompt: 'Which frequency restarts the relay?', teamDisplay: 'START 3 / x2 / +4 / x3', teamAnswer: '30', teamOptions: ['30', '28', '48'],
    nextLocation: 'LANTERN LANE', direction: 'SE', distance: '70 m', navigationClue: 'Face east, turn 45 degrees right, then follow the lanterns.', navigationMode: 'decoded-route',
    storyStage: 'REPAIR', storyObjective: 'Restart the damaged relay.', storyProblem: 'Fountain Court forwards the signal, but its relay machine has been dismantled.', storyPlan: 'Choose three number blocks that multiply to 24 and recover your machine operation.', teamInstruction: 'Use every team contribution once. Try different operation orders and select the result that matches a relay frequency.', storyRisk: 'A wrong operation leaves the relay offline.', storySuccess: 'Relay restarted. It sends an encrypted message toward Lantern Lane.',
  },
  {
    id: 'radial', kind: 'radial', checkpoint: 5, location: 'LANTERN LANE', title: 'Complete the radial pattern', label: 'Radial pattern',
    prompt: 'Compare the completed opposite endpoints, then find the missing value.', answerKeys: ['x'], correctAnswers: { x: '15' },
    hint: 'Compare the sums of the numbers at opposite ends of each straight line.', solutionIntro: 'Opposite endpoints have the same total.',
    solutionSteps: ['6 + 20 = 26 and 17 + 9 = 26.', 'x + 11 must equal 26.', '26 - 11 = 15.'], successText: '15 + 11 = 17 + 9 = 6 + 20.',
    personalContribution: 'Contains PH', personalMask: '_ _ P H _ _', publicContributions: ['Maya: Six letters', 'Liam: Begins with C', 'You: Contains PH', 'Zara: Hides a message'],
    teamKind: 'clue-synthesis', teamPrompt: 'Identify the term that satisfies every clue.', teamDisplay: '6 letters / C... / ...PH... / hidden message', teamAnswer: 'CIPHER', teamOptions: ['CIPHER', 'CIRCLE', 'COPPER'],
    nextLocation: 'NORTH PASSAGE', direction: 'NNW', distance: '140 m', navigationClue: 'Find the covered passage beyond the old shopfronts.', navigationMode: 'compass',
    storyStage: 'DECODE', storyObjective: 'Open the encrypted channel.', storyProblem: 'Lantern Lane carries the relay message, but the channel is protected by a cipher.', storyPlan: 'Solve the radial pattern to reveal one clue about the cipher.', teamInstruction: 'Combine all four clues and name the six-letter cipher.', storyRisk: 'Without the cipher, the signal trail ends here.', storySuccess: 'Channel opened. The message points to the router in North Passage.',
  },
  {
    id: 'identify-signal', kind: 'identify-signal', checkpoint: 6, location: 'NORTH PASSAGE', title: 'Identify the signal', label: 'Frequency verification',
    prompt: 'Only the prime frequency can carry the restored signal.', answerKeys: ['x'], correctAnswers: { x: '29' },
    hint: 'A prime number has exactly two positive divisors.', solutionIntro: '29 is the only prime frequency.',
    solutionSteps: ['24 is divisible by 2 and 3.', '35 is divisible by 5 and 7.', '29 is prime.'], successText: 'Frequency 29 verified. The final channel is safe.',
    personalContribution: 'Channel 29 is safe', personalMask: 'YOUR FINDING: CHANNEL 29 IS SAFE', publicContributions: ['Maya: The source is west.', 'Liam: The wall channel is active.', 'You: Channel 29 is safe.', 'Zara: Holds the transmitter.'],
    teamKind: 'consensus-transmitter', teamPrompt: 'What should Zara transmit?', teamDisplay: 'One decision / one transmitter', teamAnswer: 'RESTORE AT CITY WALL', teamOptions: ['RESTORE AT CITY WALL', 'RETURN TO THE FOUNTAIN', 'SHUT DOWN CHANNEL 29'],
    nextLocation: 'FINISHPOINT / CITY WALL', direction: 'W', distance: '110 m', navigationClue: 'Follow the strengthening signal west until the city wall fills your view.', navigationMode: 'signal-strength',
    storyStage: 'LOCATE', storyObjective: 'Route the signal to the source.', storyProblem: 'North Passage is the final router. Only one frequency reaches the City Wall transmitter.', storyPlan: 'Identify the prime frequency to reveal the safe channel.', teamInstruction: 'Use all four findings and choose the message Zara should transmit.', storyRisk: 'The wrong channel sends the signal away from its source.', storySuccess: 'Safe channel confirmed. The source is the City Wall transmitter.',
  },
  {
    id: 'shared-final-key', kind: 'shared-final-key', checkpoint: 7, location: 'FINISHPOINT / CITY WALL', title: 'Complete the prime sequence', label: 'Final frequency lock',
    prompt: 'Find the next number in the sequence to reveal your final key digit.', answerKeys: ['x'], correctAnswers: { x: '13' },
    hint: 'Every number shown has exactly two positive divisors.', solutionIntro: 'The sequence lists consecutive prime numbers.',
    solutionSteps: ['2, 3, 5, 7 and 11 are consecutive primes.', 'The next prime is 13.'], successText: 'Final lock open. Your key digit is ready.',
    personalContribution: '9', personalMask: 'YOUR FINAL KEY: 9 _ _ _', publicContributions: ['Maya: digit 7', 'Liam: digit 3', 'You: digit 9', 'Zara: digit 2'],
    teamKind: 'shared-final-key', teamPrompt: 'Order the four digits: lowest even, lowest odd, highest, remaining.', teamDisplay: 'Digits: 7 / 3 / 9 / 2', teamAnswer: '2397', teamOptions: [],
    nextLocation: 'MISSION COMPLETE', direction: '', distance: '', navigationClue: '', navigationMode: 'none',
    storyStage: 'RESTORE', storyObjective: 'Restore the city signal.', storyProblem: 'Every relay now reaches the City Wall, but four locks still protect the main transmitter.', storyPlan: 'Complete the prime sequence to reveal your final key digit.', teamInstruction: 'Combine the four digits, follow the ordering rule and enter the final key.', storyRisk: 'The transmitter needs all four Hunters; no single key can open it.', storySuccess: 'All six relays connected. SIGNAL: CLUJ NAPOCA is restored.',
  },
] as const

export const missionData = {
  signal: 'SIGNAL: CLUJ NAPOCA',
  team: 'NIGHT SHIFT',
  finishLocation: 'FINISHPOINT / CITY WALL',
} as const
