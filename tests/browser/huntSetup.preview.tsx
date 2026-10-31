import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import mapboxgl from 'mapbox-gl'
import { CreatorTemplateEditorPage } from '../../src/pages/CreatorStudio'
import { AuthProvider } from '../../src/app/providers/AuthProvider'
import { creatorTemplatesApi, type CreatorTemplate } from '../../src/services/api/creatorTemplates'
import { geographyApi } from '../../src/services/api/geography'
import '../../src/index.css'
import '../../src/shared/theme/theme.css'
import '../../src/shared/theme/global.css'
const scope = window as any
const OriginalMap = mapboxgl.Map
mapboxgl.Map = class extends OriginalMap { constructor(options: any) { super(options); scope.fixtureMap = this } } as typeof OriginalMap
const paris = { id: '11111111-1111-4111-8111-111111111111', name: 'Paris', countryCode: 'FR', countryDisplayName: 'France', administrativeContext: 'Île-de-France', latitude: 48.8566, longitude: 2.3522, active: true }
const berlin = { ...paris, id: '22222222-2222-4222-8222-222222222222', name: 'Berlin', countryCode: 'DE', countryDisplayName: 'Germany', administrativeContext: 'Berlin', latitude: 52.52, longitude: 13.405 }
const params = new URLSearchParams(location.search), universal = params.get('mode') === 'universal', existing = params.has('existing')
let record: CreatorTemplate | null = existing ? { key: 'paris-route', version: 2, status: 'draft', category: 'local', localityId: paris.id, localitySnapshot: paris, content: { key: 'paris-route', version: 2, displayName: 'Paris adventure', theme: 'Mixed', mission: { name: 'Find the hidden story' }, configuration: { normalCheckpointCount: 2, checkpointPositions: [{ checkpointNumber: 1, name: 'Louvre', latitude: 48.8606, longitude: 2.3376, radiusMeters: 15 }, { checkpointNumber: 2, name: 'Tuileries', latitude: 48.8635, longitude: 2.3275, radiusMeters: 15 }], finishPoint: { name: 'Finish', latitude: 48.8656, longitude: 2.3212, radiusMeters: 15 } }, scoring: { model: 'platform' }, checkpoints: [{ checkpoint: 1 }, { checkpoint: 2 }, { role: 'terminal' }] } } : null
if (params.has('missing') && record) { record.localityId = null; record.localitySnapshot = null }
scope.fixtureCalls = []; scope.fixtureRecord = () => structuredClone(record)
creatorTemplatesApi.get = async () => structuredClone(record!)
creatorTemplatesApi.create = async (content,category,localityId) => { scope.fixtureCalls.push({ content, category, localityId }); record = { key: content.key, version: content.version, status: 'draft', category, content: structuredClone(content), localityId, localitySnapshot: localityId === paris.id ? paris : localityId === berlin.id ? berlin : null }; return structuredClone(record) }
creatorTemplatesApi.createVersion = async (_,content,localityId) => { record = { ...record!, content: structuredClone(content), version: content.version, ...(localityId !== undefined ? { localityId, localitySnapshot: localityId === paris.id ? paris : localityId === berlin.id ? berlin : null } : {}) }; return structuredClone(record) }
creatorTemplatesApi.submit = async () => { throw new Error('Fixture does not submit') }
geographyApi.countries = async () => { if (params.has('offline')) throw new Error('Fixture registry outage'); return { countries: [{ code: 'FR', displayName: 'France' }, { code: 'DE', displayName: 'Germany' }] } }
geographyApi.get = async id => { if (params.has('offline')) throw new Error('Fixture registry outage'); return id === paris.id ? paris : berlin }
geographyApi.search = async (country,query) => { scope.fixtureCalls.push({ country, query }); if (scope.failSearch) throw new Error('Fixture outage'); return { localities: [paris,paris,berlin].filter(place => place.countryCode === country && place.name.toLowerCase().includes(query.toLowerCase())), providerStatus:'not_requested' } }
createRoot(document.getElementById('root')!).render(<MemoryRouter initialEntries={[existing ? '/create?template=paris-route' : `/create?category=${universal ? 'universal' : 'local'}`]}><AuthProvider><CreatorTemplateEditorPage /></AuthProvider></MemoryRouter>)
