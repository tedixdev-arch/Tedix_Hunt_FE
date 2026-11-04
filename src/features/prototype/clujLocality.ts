import { organizerLocalApi, type City, type Country, type Region } from '../../services/api/organizerLocal'
import { geographyApi, type Locality, type GeographicCity } from '../../services/api/geography'
import { prototypeLocation } from './PrototypeLocationSelector'

/** Labels match the backend catalog case- and accent-insensitively ("Cluj-Napoca" == "Cluj Napoca"). */
const same = (a: string, b: string) => a.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[\s-]+/g, '').toLowerCase()
  === b.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[\s-]+/g, '').toLowerCase()

async function find<T>(kind: 'countries' | 'regions' | 'cities', filters: Record<string, string>, match: (item: T) => boolean): Promise<T | undefined> {
  let cursor: string | undefined
  do {
    const page = await organizerLocalApi.page<T>(kind, filters, cursor)
    const hit = page.items.find(match)
    if (hit) return hit
    cursor = page.nextCursor ?? undefined
  } while (cursor)
  return undefined
}

/** Resolves the TEMPORARY Cluj default to the canonical Organizer locality UUID through the real catalog. */
export async function resolveOrganizerClujLocality(): Promise<City> {
  const country = await find<Country>('countries', {}, item => item.countryCode === prototypeLocation.countryCode)
  if (!country) throw new Error('location_unavailable')
  const region = await find<Region>('regions', { countryCode: country.countryCode }, item => same(item.label, prototypeLocation.county))
  if (!region) throw new Error('location_unavailable')
  const city = await find<City>('cities', { countryCode: country.countryCode, regionId: region.regionId }, item => same(item.name, prototypeLocation.city))
  if (!city) throw new Error('location_unavailable')
  return city
}

/** Resolves the TEMPORARY Cluj default to an active, registered Creator locality (registering it from the catalog if needed). */
export async function resolveCreatorClujLocation(): Promise<{ locality: Locality; geography: GeographicCity }> {
  let after: string | undefined
  do {
    const page = await geographyApi.cities(prototypeLocation.countryCode, prototypeLocation.city, undefined, after)
    const city = page.cities.find(item => item.countryCode === prototypeLocation.countryCode && same(item.name, prototypeLocation.city)
      && same(item.regionDisplayName ?? item.administrativeContext, prototypeLocation.county))
    if (city) {
      const resolved = city.localityId && city.registeredActive ? city : await geographyApi.resolveCity(city.geographicId)
      if (resolved.geographicId !== city.geographicId || !resolved.localityId || !resolved.registeredActive) throw new Error('location_unavailable')
      const locality = await geographyApi.get(resolved.localityId)
      if (locality.id !== resolved.localityId || !locality.active) throw new Error('location_unavailable')
      return { locality, geography: { ...city, ...resolved } }
    }
    after = page.nextAfter ?? undefined
  } while (after)
  throw new Error('location_unavailable')
}
