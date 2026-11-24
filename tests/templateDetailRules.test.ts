import assert from 'node:assert/strict'
import { test } from 'node:test'
import { agePresets, formatRange, parseRange, participantPresets, presetKey, validateTemplateDetails } from '../src/features/creator/templateDetailRules.ts'

const valid = { age: '12–16', duration: '90', participants: '16–40', teamSize: '4', format: 'Team Hunters' }

test('standard presets: 5 age groups and 5 participant ranges, each with min ≤ max', () => {
  assert.equal(agePresets.length, 5); assert.equal(participantPresets.length, 5)
  for (const preset of [...agePresets, ...participantPresets]) assert.ok(preset.min <= preset.max)
})
test('ranges read the stored text forms and write them back unchanged', () => {
  assert.deepEqual(parseRange('12–16'), { min: 12, max: 16 })
  assert.deepEqual(parseRange('12-16'), { min: 12, max: 16 })
  assert.deepEqual(parseRange('18+'), { min: 18, max: 99 })
  assert.deepEqual(parseRange('4'), { min: 4, max: 4 })
  assert.equal(parseRange('twelve'), null); assert.equal(parseRange('1–2–3'), null)
  assert.equal(formatRange({ min: 12, max: 16 }), '12–16'); assert.equal(formatRange({ min: 18, max: 99 }, 99), '18+'); assert.equal(formatRange({ min: 4, max: 4 }), '4')
  assert.equal(presetKey(parseRange('16–40'), participantPresets), '2'); assert.equal(presetKey(parseRange('3–7'), participantPresets), 'custom')
})
test('the Signal starter defaults are valid', () => assert.deepEqual(validateTemplateDetails(valid), {}))
test('age: min ≤ max and within 4–99', () => {
  assert.match(validateTemplateDetails({ ...valid, age: '16–12' }).age!, /cannot be greater/)
  assert.match(validateTemplateDetails({ ...valid, age: '2–5' }).age!, /between 4 and 99/)
  assert.deepEqual(validateTemplateDetails({ ...valid, age: '18+' }), {})
})
test('duration: whole minutes between 15 and 480', () => {
  for (const duration of ['5', '481', '90.5', 'abc']) assert.ok(validateTemplateDetails({ ...valid, duration }).duration, duration)
  for (const duration of ['15', '480']) assert.equal(validateTemplateDetails({ ...valid, duration }).duration, undefined)
})
test('participants: 1–1000 with min ≤ max', () => {
  assert.ok(validateTemplateDetails({ ...valid, participants: '40–16' }).participants)
  assert.ok(validateTemplateDetails({ ...valid, participants: '10–2000' }).participants)
})
test('team size: 2–10, never above the participant maximum, and one full team must fit', () => {
  assert.ok(validateTemplateDetails({ ...valid, teamSize: '1' }).teamSize)
  assert.ok(validateTemplateDetails({ ...valid, teamSize: '12' }).teamSize)
  assert.match(validateTemplateDetails({ ...valid, participants: '2–5', teamSize: '6' }).teamSize!, /cannot exceed the maximum number of participants/)
  assert.match(validateTemplateDetails({ ...valid, participants: '2–10', teamSize: '4' }).teamSize!, /at least one full team/)
  assert.deepEqual(validateTemplateDetails({ ...valid, teamSize: '3–5' }), {})
})
test('Single Hunters ignore team size; mixed formats still validate it', () => {
  assert.deepEqual(validateTemplateDetails({ ...valid, format: 'Single Hunters', teamSize: '' }), {})
  assert.ok(validateTemplateDetails({ ...valid, format: 'Single and Team Hunters', teamSize: '' }).teamSize)
})
test('a draft may leave fields blank; submission requires them', () => {
  const blank = { age: '', duration: '', participants: '', teamSize: '', format: 'Team Hunters' }
  assert.deepEqual(validateTemplateDetails(blank, false), {})
  assert.deepEqual(Object.keys(validateTemplateDetails(blank, true)).sort(), ['age', 'duration', 'participants', 'teamSize'])
  assert.ok(validateTemplateDetails({ ...blank, age: '16–12' }, false).age)
})
