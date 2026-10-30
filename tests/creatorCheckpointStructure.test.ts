import assert from 'node:assert/strict'
import { test } from 'node:test'
import { organizerFeatures, signalCheckpointNames, signalFeatureDefaults, signalNormalCheckpointNames } from '../src/data/organizerTemplates.ts'
import { hydrateGameplay, serializeGameplay } from '../src/features/creator/checkpointGameplay.ts'

test('seven Creator features preserve the approved order', () => {
  assert.deepEqual(organizerFeatures.filter(item => !['positions', 'final'].includes(item.id)).map(item => item.name), ['Number of Checkpoints', 'Personal Challenge', 'Team Challenge', 'Next Checkpoint / Navigation', 'Mission History', 'Results Display', 'Rewards'])
})
test('six regular checkpoints and terminal gameplay round trip without numbering the terminal', () => {
  const checkpoints = [...Array.from({length: 6}, (_, i) => ({checkpoint: i + 1, role: 'normal', navigationMode: 'compass'})), {role:'terminal',kind:'radial',teamKind:'assemble-machine',navigationMode:'none',custom:{keep:true}}]
  const hydrated = hydrateGameplay({checkpoints} as any)
  assert.equal(hydrated.normal.length + 1, 7)
  assert.deepEqual(serializeGameplay(hydrated.normal, 6, hydrated.terminal, checkpoints), checkpoints)
})
test('Signal canonical runtime defaults remain six checkpoints plus FinishPoint', () => {
  assert.deepEqual(signalNormalCheckpointNames, signalCheckpointNames.slice(0,6))
  assert.equal(signalFeatureDefaults.personal.length, 7)
  assert.equal(signalFeatureDefaults.team.length, 7)
  assert.equal(signalFeatureDefaults.navigation[6].name, 'Signal Strength')
})
