/** Completion contracts, independent of the order/position of navigation items.
 * Setup numbers and feature IDs retain their existing meaning. They are session
 * acknowledgements, not new persisted metadata or substitutes for validation.
 */
export const requiredSetupIds = [0, 1, 2, 3] as const
export const requiredFeatureIds = ['count', 'personal', 'team', 'navigation', 'map', 'results', 'rewards'] as const
export type SaveIntent = 'draft' | 'complete'

export function hasRequiredCompletion<T>(completed: ReadonlySet<T>, required: readonly T[]) {
  return required.every(id => completed.has(id))
}

// Historically every successfully loaded Template restores all acknowledgements,
// even an incomplete draft. Keep that behavior; content validation is separate.
export function restoredCompletion() {
  return { setup: new Set<number>(requiredSetupIds), features: new Set<string>(requiredFeatureIds) }
}

export function completionAllowsSave(intent: SaveIntent, classified: boolean, setup: ReadonlySet<number>, features: ReadonlySet<string>, routeSafe: boolean) {
  return intent === 'draft' || classified || (
    hasRequiredCompletion(setup, requiredSetupIds) &&
    hasRequiredCompletion(features, requiredFeatureIds) && routeSafe
  )
}
