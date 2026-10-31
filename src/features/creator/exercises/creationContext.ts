import type { CreatorTemplate } from '../../../services/api/creatorTemplates.ts'
import { hydrateGameplay } from '../checkpointGameplay.ts'

export type PersonalCreationContext = { mode: 'modern' } | { mode: 'legacy'; kinds: string[] }
export const modernContext: PersonalCreationContext = { mode: 'modern' }
/** Resolve once from the creation path or explicit saved assignments, never names/counts.
 * Old classified copies can contain legacy assignments too; preserve them without migration.
 */
export function personalCreationContext(record: CreatorTemplate | null): PersonalCreationContext {
  if (!record) return modernContext
  const gameplay = hydrateGameplay(record.content)
  const kinds = [...new Set([...gameplay.normal, ...(gameplay.terminal ? [gameplay.terminal] : [])].flatMap(cp => typeof cp.kind === 'string' && cp.kind ? [cp.kind] : []))]
  return kinds.length || !record.category ? { mode: 'legacy', kinds } : modernContext
}
