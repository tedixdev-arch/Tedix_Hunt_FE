import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { CreatorTemplateEditorPage } from '../../src/pages/CreatorStudio'
import { AuthProvider } from '../../src/app/providers/AuthProvider'
import { creatorTemplatesApi, type CreatorTemplate, type CreatorTemplateContent } from '../../src/services/api/creatorTemplates'
import { geographyApi } from '../../src/services/api/geography'
import { personalExamples } from '../../src/features/creator/exercises/personalExamples'
import { toPersistence } from '../../src/features/creator/exercises/persistenceAdapter'
import '../../src/index.css'
import '../../src/shared/theme/theme.css'
import '../../src/shared/theme/global.css'
const city = { id: '11111111-1111-4111-8111-111111111111', name: 'Paris', countryCode: 'FR', countryDisplayName: 'France', administrativeContext: 'Île-de-France', latitude: 48.8566, longitude: 2.3522, active: true }
const scope = window as any
let record: CreatorTemplate | null = null
scope.fixtureCalls = []; scope.fixtureRecord = () => structuredClone(record)
scope.examples = personalExamples.map(example => toPersistence(example))
function save(content: CreatorTemplateContent, category: CreatorTemplate['category']) {
  const saved = structuredClone(content)
  for (const cp of saved.checkpoints as any[]) for (const exercise of Object.values(cp.customExercises ?? {}) as any[]) { exercise.id = crypto.randomUUID(); exercise.owner = { templateKey: saved.key, version: saved.version } }
  record = { key: content.key, version: content.version, status: 'draft', category, content: saved, localityId: city.id, localitySnapshot: city }
  return structuredClone(record)
}
creatorTemplatesApi.get = async () => structuredClone(record!)
creatorTemplatesApi.create = async (content, category) => { scope.fixtureCalls.push({ method: 'create', content: structuredClone(content) }); return save(content, category) }
creatorTemplatesApi.createVersion = async (_, content) => { scope.fixtureCalls.push({ method: 'version', content: structuredClone(content) }); return save(content, record?.category) }
creatorTemplatesApi.submit = async () => { throw new Error('This fixture does not submit') }
geographyApi.countries = async () => ({ countries: [{ code: 'FR', displayName: 'France' }] })
geographyApi.search = async () => ({ localities: [city], providerStatus: 'not_requested' })
geographyApi.get = async () => city
let root = createRoot(document.getElementById('root')!)
const mount = () => root.render(<MemoryRouter initialEntries={[record ? `/create?template=${record.key}` : '/create?category=local']}><AuthProvider><CreatorTemplateEditorPage /></AuthProvider></MemoryRouter>)
scope.fixtureReopen = () => { root.unmount(); root = createRoot(document.getElementById('root')!); mount() }
mount()
