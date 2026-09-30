import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { organizerFeatures, signalCheckpointNames, signalFeatureDefaults, signalNormalCheckpointNames } from '../src/data/organizerTemplates.ts'

const creatorStudio = readFileSync(new URL('../src/pages/CreatorStudio.tsx', import.meta.url), 'utf8')

test('Feature 1 is structural normal checkpoint configuration', () => {
  const countFeature = organizerFeatures.find(feature => feature.id === 'count')

  assert.equal(countFeature?.templates[0].name, '6 checkpoints')
  assert.match(countFeature?.templates[0].note ?? '', /FinishPoint is configured separately in Feature 6/)
  assert.match(creatorStudio, /feature\.id === 'count' \? <CheckpointCountEditor/)
  assert.match(creatorStudio, /Set the number of route checkpoints before the FinishPoint\./)
  assert.doesNotMatch(countFeature?.templates[0].name ?? '', /FinishPoint/)
})

test('Feature 1 enforces the prototype bounds and has no component-authoring fields', () => {
  const countEditor = creatorStudio.slice(creatorStudio.indexOf('function CheckpointCountEditor'), creatorStudio.indexOf('function RouteEditor'))

  assert.match(creatorStudio, /MIN_NORMAL_CHECKPOINTS = 1/)
  assert.match(creatorStudio, /MAX_NORMAL_CHECKPOINTS = 20/)
  assert.match(countEditor, /disabled=\{count === MIN_NORMAL_CHECKPOINTS\}/)
  assert.match(countEditor, /disabled=\{count === MAX_NORMAL_CHECKPOINTS\}/)
  assert.doesNotMatch(countEditor, /Create new|Component name|Participant behavior|Use Signal default/)
})

test('checkpoint-based Creator sections use the configured normal count without FinishPoint', () => {
  assert.match(creatorStudio, /normalCheckpointNames\(checkpointCount\)/)
  assert.match(creatorStudio, /<CheckpointEditor checkpointCount=\{checkpointCount\}/)
  assert.match(creatorStudio, /<RouteEditor key=\{checkpointCount\} checkpointCount=\{checkpointCount\}/)
  assert.match(creatorStudio, /FinishPoint configured separately in Feature 6/)
  assert.deepEqual(signalNormalCheckpointNames, signalCheckpointNames.slice(0, 6))
  assert.equal(signalNormalCheckpointNames.some(name => name.includes('FinishPoint')), false)
})

test('Signal canonical runtime defaults remain six checkpoints plus FinishPoint', () => {
  assert.deepEqual(signalCheckpointNames, ['Matthias Rex Statue', 'Stone Gate', 'Clock Tower', 'Fountain Court', 'Lantern Lane', 'North Passage', 'City Wall · FinishPoint'])
  assert.equal(signalFeatureDefaults.personal.length, 7)
  assert.equal(signalFeatureDefaults.team.length, 7)
  assert.equal(signalFeatureDefaults.navigation.length, 7)
  assert.equal(signalFeatureDefaults.navigation[6].name, 'Signal Strength')
})
