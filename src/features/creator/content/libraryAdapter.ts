import { fromPersistence, toPersistence } from '../exercises/persistenceAdapter.ts'
import type { AuthoringDraft } from '../exercises/experimentDrafts.ts'
import { contentCategories, type LibraryContent, type LibraryDraft, type LibraryGeography } from '../../../services/api/creatorContent.ts'
import type { GeographicCity } from '../../../services/api/geography.ts'
import type { ContentScope } from './ContentGeography.tsx'
export interface LibraryMetadata { category: string; grade: string; scope: ContentScope; curriculum?: LibraryDraft['curriculum'] }
export function libraryPayload(draft: AuthoringDraft, metadata: LibraryMetadata): LibraryDraft {
  if (draft.emptySelection || !draft.custom) throw new Error('Choose an exercise type.')
  if (metadata.category && !contentCategories.some(c => c === metadata.category)) throw new Error('Choose Mathematics, History, Science or Mixed.')
  if (metadata.grade && !/^(?:[5-9]|1[0-2])$/.test(metadata.grade)) throw new Error('Choose a grade from 5 to 12.')
  const { country, region, city } = metadata.scope
  if ((country && !/^[A-Z]{2}$/.test(country)) || (region && (!country || !/^[A-Za-z0-9-]{1,40}$/.test(region))) || (city && (!country || !/^[1-9][0-9]{0,17}$/.test(city)))) throw new Error('Choose a valid location from the catalog, or explicitly choose Universal.')
  // Library assets must never carry a Template identity.
  let canonical
  try { canonical = toPersistence({ ...draft.custom, persistedIdentity: undefined }) }
  catch { throw new Error('Review the exercise fields before saving.') }
  const { id: _id, owner: _owner, ...exercise } = canonical
  return { exercise, category: metadata.category || null,
    curriculum: metadata.curriculum ?? (metadata.category === 'Mathematics' ? { subject: 'math', ...(metadata.grade ? { grade: metadata.grade } : {}) } : {}),
    geography: city ? { scope: 'city', countryCode: country, geographicId: city } : region ? { scope: 'region', countryCode: country, admin1Code: region } : country ? { scope: 'country', countryCode: country } : { scope: 'universal' } }
}
export function libraryEditor(record: LibraryContent): { draft: AuthoringDraft; metadata: LibraryMetadata } {
  // C2a city envelopes intentionally omit region. Resolve hierarchy separately without changing saved metadata.
  const g = record.geography
  return { draft: { source: 'custom', assignment: 'predefined', custom: fromPersistence(record.exercise) }, metadata: {
    category: record.category ?? '', grade: record.curriculum.grade ?? '', curriculum: record.curriculum,
    scope: { country: g.scope === 'universal' ? '' : g.countryCode, region: g.scope === 'region' ? g.admin1Code : '', city: g.scope === 'city' ? g.geographicId : '' },
  } }
}

/** City membership comes only from the catalog, never the selector's display or a stale region. */
export function libraryGeographyMatches(g: LibraryGeography, scope?: ContentScope, city?: GeographicCity | null): boolean {
  if (!scope || (!scope.country && !scope.region && !scope.city)) return true
  if (g.scope === 'universal') return true
  if (!scope.country || g.countryCode !== scope.country) return false
  if (g.scope === 'country') return true
  if (scope.city) {
    if (g.scope === 'city') return g.geographicId === scope.city
    const resolved = city?.geographicId === scope.city && city.countryCode === scope.country && city.regionStatus === 'resolved' && !!city.admin1Code && city.admin1Code !== '00'
    return !!resolved && g.admin1Code === city!.admin1Code
  }
  if (!scope.region) return true
  return g.scope === 'region' && g.admin1Code === scope.region
}
