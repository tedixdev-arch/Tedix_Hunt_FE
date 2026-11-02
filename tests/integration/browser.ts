import { authApi } from '../../src/services/api/auth'
import { creatorTemplatesApi } from '../../src/services/api/creatorTemplates'
import { adminTemplateReviewsApi } from '../../src/services/api/adminTemplateReviews'
import { universalLibraryApi } from '../../src/services/api/universalLibrary'
import { geographyApi } from '../../src/services/api/geography'
import { customTemplateFixture, exerciseFixtures } from '../fixtures/customExercises'
import { API_BASE_URL } from '../../src/services/api/config'

if (import.meta.env.CUX_INTEGRATION_HARNESS !== 'enabled' || API_BASE_URL !== ''
  || location.hostname !== '127.0.0.1' || location.protocol !== 'http:') {
  throw new Error('Integration adapter entry requires the dedicated disposable runner.')
}

// Loaded in separate nonpersistent browser contexts. Tokens stay inside each context.
const operations = {
  loginCreator: async (input: Parameters<typeof authApi.loginCreator>[0]) => (await authApi.loginCreator(input)).user,
  loginAdmin: async (input: Parameters<typeof authApi.loginAdmin>[0]) => (await authApi.loginAdmin(input)).user,
  logout: () => authApi.logout(),
  create: (key: string) => creatorTemplatesApi.create(customTemplateFixture(key), 'universal'),
  get: (key: string) => creatorTemplatesApi.get(key),
  save: (key: string, content: Parameters<typeof creatorTemplatesApi.createVersion>[1], localityId?: string) => creatorTemplatesApi.createVersion(key, content, localityId),
  submit: (key: string, version: number) => creatorTemplatesApi.submit(key, version),
  review: (key: string) => adminTemplateReviewsApi.get(key),
  approve: (key: string, version: number) => adminTemplateReviewsApi.approve(key, version),
  approved: (key: string) => adminTemplateReviewsApi.approved(key),
  library: (key: string) => universalLibraryApi.get(key),
  copy: (source: string, key: string, reference: Parameters<typeof creatorTemplatesApi.fromUniversal>[2]) => creatorTemplatesApi.fromUniversal(source, key, reference),
  locality: (id: string) => geographyApi.get(id),
  localContent: (key: string, version: number, latitude: number, longitude: number) => {
    const content = customTemplateFixture(key, version, [exerciseFixtures[1], exerciseFixtures.at(-1)!])
    content.configuration.checkpointPositions = [{ checkpointNumber: 1, name: 'Square', latitude, longitude, radiusMeters: 30 }]
    content.configuration.finishPoint = { name: 'Finish', latitude, longitude, radiusMeters: 5 }
    return content
  },
}
// Return a bounded public failure, never request bodies, tokens or raw adapter errors.
Object.assign(window, { cux: async (operation: keyof typeof operations, args: unknown[]) => {
  try {
    const fn = operations[operation] as (...args: unknown[]) => unknown
    return { ok: true, value: await fn(...args) }
  } catch (error) {
    return { ok: false, status: typeof error === 'object' && error !== null && 'status' in error ? error.status : null }
  }
} })
