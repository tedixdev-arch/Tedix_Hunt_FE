import { useSimulation } from '../../hooks/useSimulation'
import { MissionShell } from '../../components/MissionShell'
import { Invitation } from './Invitation'
import { EventPreview } from './EventPreview'
import { TeamSetup } from './TeamSetup'
import { MissionBriefing } from './MissionBriefing'
import { DifficultyChoice } from './DifficultyChoice'
import { DeviceReadiness } from './DeviceReadiness'
import { NavigateCheckpoint } from './NavigateCheckpoint'
import { CheckpointChallenge } from './CheckpointChallenge'
import { ClueReward } from './ClueReward'
import { TeamProgress } from './TeamProgress'
import { FinalPuzzle } from './FinalPuzzle'
import { Results } from './Results'

export function StudentExperience() {
  const sim = useSimulation()
  const { state, stepIndex, totalSteps } = sim

  const renderStep = () => {
    switch (state.step) {
      case 'invitation':
        return <Invitation onContinue={() => sim.goTo('event-preview')} />
      case 'event-preview':
        return <EventPreview onContinue={() => sim.goTo('team-setup')} />
      case 'team-setup':
        return <TeamSetup onContinue={() => sim.goTo('briefing')} />
      case 'briefing':
        return <MissionBriefing onContinue={() => sim.goTo('difficulty')} />
      case 'difficulty':
        return (
          <DifficultyChoice
            selected={state.difficulty}
            onSelect={sim.setDifficulty}
            onConfirm={() => sim.goTo('device-readiness')}
          />
        )
      case 'device-readiness':
        return <DeviceReadiness onContinue={() => sim.goTo('navigate')} />
      case 'navigate':
        return <NavigateCheckpoint onContinue={() => sim.goTo('challenge')} />
      case 'challenge':
        if (state.challengeSolved) {
          return (
            <CheckpointChallenge
              input={state.challengeInput}
              onInputChange={() => {}}
              onSubmit={() => sim.goTo('clue-reward')}
              onHint={() => {}}
              hintUsed={state.hintUsed}
              solved={true}
              attempts={state.challengeAttempts}
            />
          )
        }
        return (
          <CheckpointChallenge
            input={state.challengeInput}
            onInputChange={sim.setChallengeInput}
            onSubmit={() => sim.submitChallenge(state.challengeInput)}
            onHint={sim.useHint}
            hintUsed={state.hintUsed}
            solved={false}
            attempts={state.challengeAttempts}
          />
        )
      case 'clue-reward':
        return <ClueReward onContinue={() => sim.goTo('team-progress')} />
      case 'team-progress':
        return <TeamProgress onContinue={() => sim.goTo('final-puzzle')} />
      case 'final-puzzle':
        if (state.finalSolved) {
          return (
            <FinalPuzzle
              input={state.finalInput}
              onInputChange={() => {}}
              onSubmit={() => sim.goTo('results')}
              solved={true}
            />
          )
        }
        return (
          <FinalPuzzle
            input={state.finalInput}
            onInputChange={sim.setFinalInput}
            onSubmit={() => sim.submitFinal(state.finalInput)}
            solved={false}
          />
        )
      case 'results':
        return <Results difficulty={state.difficulty} onRestart={sim.reset} />
    }
  }

  const showProgress = state.step !== 'results'

  return (
    <MissionShell
      currentStep={stepIndex}
      totalSteps={totalSteps}
      onBack={sim.goBack}
      onRestart={sim.reset}
      showProgress={showProgress}
    >
      {renderStep()}
    </MissionShell>
  )
}
