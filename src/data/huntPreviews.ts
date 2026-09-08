import { checkpointExercises, missionData } from './templateOne'

export type HuntPreviewData = {
  id: string
  eyebrow: string
  title: string
  mission: string
  location: string
  description: string
  imageUrl: string
  imageAlt: string
  joinPath: string
  organizerPath: string
  sampleLoop: {
    checkpoint: string
    personalChallenge: { title: string; prompt: string }
    teamChallenge: { prompt: string; sharedInformation: string }
    direction: { destination: string; bearing: string; distance: string; clue: string }
  }
}

const firstCheckpoint = checkpointExercises[0]

export const signalClujPreview: HuntPreviewData = {
  id: 'signal-cluj',
  eyebrow: 'TedixHunt // Live city mission',
  title: missionData.signal,
  mission: 'Restore the Signal',
  location: 'Cluj Napoca',
  description: 'Restore six linked relay points, trace the signal to its source, and restart the final transmitter together.',
  imageUrl: 'https://images.pexels.com/photos/1309688/pexels-photo-1309688.jpeg?auto=compress&cs=tinysrgb&w=1920',
  imageAlt: 'City street at night',
  joinPath: '/participant/sign-in',
  organizerPath: '/organizer/sign-in',
  sampleLoop: {
    checkpoint: `Checkpoint ${String(firstCheckpoint.checkpoint).padStart(2, '0')} · ${firstCheckpoint.location}`,
    personalChallenge: { title: firstCheckpoint.title, prompt: firstCheckpoint.prompt },
    teamChallenge: { prompt: firstCheckpoint.teamPrompt, sharedInformation: firstCheckpoint.teamDisplay },
    direction: {
      destination: firstCheckpoint.nextLocation,
      bearing: firstCheckpoint.direction,
      distance: firstCheckpoint.distance,
      clue: firstCheckpoint.navigationClue,
    },
  },
}
