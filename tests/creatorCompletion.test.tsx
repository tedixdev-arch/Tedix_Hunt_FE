import { expect, test } from 'vitest'
import { completionAllowsSave, hasRequiredCompletion, requiredSetupIds, requiredFeatureIds, restoredCompletion } from '../src/features/creator/completion'
import { organizerFeatures } from '../src/data/organizerTemplates'

test('completion contracts retain existing IDs independently of navigation order', () => {
  expect(requiredFeatureIds).toEqual(organizerFeatures.filter(f => !['positions', 'final'].includes(f.id)).map(f => f.id))
  expect(requiredSetupIds).toEqual([0, 1, 2, 3])
  expect(hasRequiredCompletion(new Set([...requiredFeatureIds].reverse()), requiredFeatureIds)).toBe(true)
  const wrong = new Set<string>(requiredFeatureIds); wrong.delete('personal'); wrong.add('final')
  expect(wrong.size).toBe(requiredFeatureIds.length)
  expect(hasRequiredCompletion(wrong, requiredFeatureIds)).toBe(false)
})

test('saved drafts restore historical acknowledgements with independent sets', () => {
  const a = restoredCompletion(), b = restoredCompletion()
  expect(a).toEqual(b); a.features.clear(); a.setup.clear()
  expect(hasRequiredCompletion(b.features, requiredFeatureIds)).toBe(true)
  expect(hasRequiredCompletion(b.setup, requiredSetupIds)).toBe(true)
})

test('Legacy completion save still requires every setup, feature and route acknowledgement', () => {
  const { setup, features } = restoredCompletion()
  expect(completionAllowsSave('complete', false, setup, features, true)).toBe(true)
  for (const id of requiredSetupIds) expect(completionAllowsSave('complete', false, new Set([...setup].filter(x => x !== id)), features, true)).toBe(false)
  for (const id of requiredFeatureIds) expect(completionAllowsSave('complete', false, setup, new Set([...features].filter(x => x !== id)), true)).toBe(false)
  expect(completionAllowsSave('complete', false, setup, features, false)).toBe(false)
})

test('draft and classified save admission remains independent of acknowledgements; content validators still run in the editor', () => {
  expect(completionAllowsSave('draft', false, new Set(), new Set(), false)).toBe(true)
  expect(completionAllowsSave('complete', true, new Set(), new Set(), false)).toBe(true)
})
