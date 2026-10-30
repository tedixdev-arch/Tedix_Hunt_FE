import assert from 'node:assert/strict'
import { test } from 'node:test'
import { localContentValidation, localBindingValidation } from '../src/features/creator/localValidation.ts'
import type { CreatorTemplateContent } from '../src/services/api/creatorTemplates.ts'
const point = { checkpointNumber: 1, name: 'Museum', latitude: 46, longitude: 23, radiusMeters: 15 }
const content = (count = 1): CreatorTemplateContent => ({ key: 'test', version: 1, displayName: 'Test', theme: 'City', mission: { name: 'Story' }, configuration: { normalCheckpointCount: count, checkpointPositions: Array.from({ length: count }, (_, i) => ({ ...point, checkpointNumber: i + 1 })), finishPoint: { name: 'Finish', latitude: 46.1, longitude: 23.1, radiusMeters: 15 } }, scoring: { model: 'platform' }, checkpoints: [...Array.from({ length: count }, (_, i) => ({ checkpoint: i + 1, role: 'normal' })), { role: 'terminal' }] })
test('12 complete 1 and 20 checkpoint Local snapshots validate, with separate terminal gameplay', () => { for (const count of [1,20]) assert.equal(Object.values(localContentValidation(content(count))).some(Boolean),false) })
test('12 missing, duplicate, out-of-range and incomplete geography produce relevant section errors', () => {
  for (const count of [0,21]) assert.ok(localContentValidation(content(count)).count)
  const c = content(2); c.configuration.checkpointPositions[1].checkpointNumber = 1; assert.ok(localContentValidation(c).positions)
  c.configuration.checkpointPositions = [{ ...point, longitude: 181 }]; assert.ok(localContentValidation(c).positions)
  c.configuration.finishPoint = { name: '', latitude: 46, longitude: 23, radiusMeters: 15 }; assert.ok(localContentValidation(c).finish)
  c.checkpoints = [{ checkpoint: 1 }]; assert.ok(localContentValidation(c).gameplay)
})
test('12 material locality changes gate submission while descriptive corrections do not', () => {
  const place = { id: 'place', countryCode: 'RO', countryDisplayName: 'Romania', name: 'Town', administrativeContext: 'North', latitude: 46, longitude: 23, active: true }
  assert.equal(localBindingValidation(place.id,place,{ ...place, name: 'Renamed', administrativeContext: 'Correction' }), '')
  for (const patch of [{ active:false }, { latitude:47 }, { countryCode:'US' }, { id:'other' }]) assert.ok(localBindingValidation(place.id,place,{ ...place,...patch }))
  assert.ok(localBindingValidation(null,null,place))
})
