import type { RouteCandidate } from './routeResearch.ts'
import type { LandmarkReference } from './signalLandmarks.ts'

export type ReferenceResolution = { reference?: LandmarkReference; reason?: string }
const cache = new Map<string, Promise<ReferenceResolution>>()
const normalize = (text: string) => text.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '')

/** Geocoding v6 resolves addresses, not POIs. Accept only one exact researched street-address match. */
export async function resolveLandmarkAddress(candidate: RouteCandidate, token?: string, request: typeof fetch = fetch): Promise<ReferenceResolution> {
  if (!token?.trim()) return { reason: 'Mapbox token unavailable' }
  // A square without a street number is too broad to identify the monument.
  if (!/\d/.test(candidate.address)) return { reason: 'Research address does not identify a unique numbered frontage' }
  const key = JSON.stringify([token, candidate.landmark, candidate.address])
  const previous = cache.get(key)
  if (previous) return previous
  const pending = (async (): Promise<ReferenceResolution> => {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 8000)
    try {
      const params = new URLSearchParams({ q: candidate.address, country: 'ro', types: 'address', autocomplete: 'false', limit: '5', access_token: token, permanent: 'false' })
      const response = await request(`https://api.mapbox.com/search/geocode/v6/forward?${params}`, { signal: controller.signal })
      if (!response.ok) return { reason: response.status === 429 ? 'Mapbox rate limit reached' : 'Mapbox address lookup unavailable' }
      const data = await response.json()
      if (!Array.isArray(data.features) || data.features.length !== 1) return { reason: 'No unambiguous address match' }
      const feature = data.features[0], properties = feature.properties
      const code = properties?.match_code, coordinates = feature.geometry?.coordinates
      const address = properties?.context?.address
      const expected = candidate.address.split(',')[0]
      if (properties?.feature_type !== 'address' || code?.confidence !== 'exact'
        || ['address_number', 'street', 'place'].some(key => code[key] !== 'matched')
        || typeof address?.name !== 'string' || normalize(address.name) !== normalize(expected)
        || !/cluj.?napoca/i.test(properties?.context?.place?.name ?? '')
        || !Array.isArray(coordinates) || coordinates.length !== 2 || !coordinates.every(Number.isFinite)
        || coordinates[0] < 23.5 || coordinates[0] > 23.7 || coordinates[1] < 46.7 || coordinates[1] > 46.85) return { reason: 'Address match is uncertain or outside Cluj-Napoca' }
      return { reference: { checkpointNumber: candidate.role === 'terminal' ? 0 : candidate.checkpoint!, name: candidate.landmark, latitude: coordinates[1], longitude: coordinates[0], origin: 'address' } }
    } catch { return { reason: 'Mapbox address lookup unavailable' } } finally { clearTimeout(timer) }
  })()
  cache.set(key, pending)
  return pending
}
