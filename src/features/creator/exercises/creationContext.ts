import type { CreatorTemplate } from '../../../services/api/creatorTemplates.ts'
import { hydrateGameplay } from '../checkpointGameplay.ts'

export type PersonalCreationContext = { mode: 'modern' } | { mode: 'legacy' | 'unresolved'; kinds: string[] }
export const modernContext: PersonalCreationContext = { mode: 'modern' }
/** Category is immutable server classification, not a description of checkpoint contents.
 * Explicit null is the unclassified/Legacy contract. Owner projections currently omit that
 * null, so omission is unresolved: origin, copy-looking keys and version pins cannot repair it.
 */
export function personalCreationContext(record: CreatorTemplate | null): PersonalCreationContext {
  if (!record || record.category === 'universal' || record.category === 'local') return modernContext
  const gameplay = hydrateGameplay(record.content)
  // Inventory only; these identifiers never decide the Template's classification.
  const kinds = [...new Set([...gameplay.normal, ...(gameplay.terminal ? [gameplay.terminal] : [])].flatMap(cp => typeof cp.kind === 'string' && cp.kind ? [cp.kind] : []))]
  return { mode: record.category === null ? 'legacy' : 'unresolved', kinds }
}
