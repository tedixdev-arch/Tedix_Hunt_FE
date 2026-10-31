import { authorPrototype } from './persistenceAdapter'
import type { Exercise, TeamType } from './catalog'

export const teamMechanics: Record<TeamType, string> = {
  'scrambled-word': 'Scrambled Word', 'distributed-information': 'Distributed Information', hypothesis: 'Hypothesis',
  'assemble-machine': 'Assemble Machine', 'clue-synthesis': 'Clue Synthesis', 'filter-noise': 'Filter Noise', 'shared-final-key': 'Shared Final Key',
}
const samples: Record<TeamType, { instructions: string; data: Exercise['data']; solution: string }> = {
  'scrambled-word': { instructions: 'Combine the letter fragments to name something you open with a key.', data: { evidence: ['LO', 'CK'], answer: 'LOCK' }, solution: 'LO + CK spells LOCK.' },
  'distributed-information': { instructions: 'Share what you know. Which door should the team open?', data: { evidence: ['The safe door is not red.', 'The safe door is not blue.'], options: ['Red door', 'Blue door', 'Green door'], answer: 'Green door' }, solution: 'Eliminate red and blue together. Open the green door.' },
  hypothesis: { instructions: 'Combine the packets and decode the message.', data: { evidence: ['12 15', '3 11'], rule: 'A = 1, B = 2, … Z = 26', answer: 'LOCK' }, solution: '12 15 3 11 decodes to LOCK.' },
  'assemble-machine': { instructions: 'Combine the machine instructions. Choose the resulting frequency.', data: { evidence: ['Start at 3, then double.', 'Next add 4, then triple.'], options: ['30', '28', '48'], answer: '30' }, solution: '(3 × 2 + 4) × 3 = 30.' },
  'clue-synthesis': { instructions: 'Combine the clues. What protects the door?', data: { evidence: ['I keep a door closed.', 'A matching key opens me.'], pattern: 'L _ _ K', answer: 'LOCK' }, solution: 'A lock keeps a door closed and is opened with a key.' },
  'filter-noise': { instructions: 'Keep only signals that name a place.', data: { evidence: ['A: CITY WALL', 'B: static hiss', 'C: CLOCK TOWER'], answers: ['A', 'C'] }, solution: 'A and C name places; B is noise.' },
  'shared-final-key': { instructions: 'Arrange the team contributions from smallest to largest, then enter the combined key.', data: { evidence: ['7', '2', '3'], answer: '237' }, solution: 'Order 2, 3, 7 to make 237.' },
}
/** Local examples have no approved predefined wire identity. Always copy before editing. */
export const teamExamples: readonly Exercise[] = Object.entries(teamMechanics).map(([type, title]) => {
  const sample = samples[type as TeamType]
  const e = authorPrototype({ id: `team-example:${type}`, type: type as TeamType, title, instructions: sample.instructions, data: sample.data, hint: 'Share the information and combine your findings.', solution: sample.solution, correctFeedback: 'Team objective complete!', incorrectFeedback: 'Try again together.' })
  e.id = `team-example:${type}`
  if (e.authored?.mechanic === 'shared-final-key') {
    e.authored.activity.orderingInstructions = 'Arrange the contributions from smallest to largest.'
    e.authored.expected.order = [e.authored.activity.contributions[1].id, e.authored.activity.contributions[2].id, e.authored.activity.contributions[0].id]
  }
  return e
})
export const teamExample = (type: string) => teamExamples.find(e => e.type === type) ?? teamExamples[0]
