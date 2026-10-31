import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { CreatorTemplateEditorPage } from '../../src/pages/CreatorStudio'
import { AuthProvider } from '../../src/app/providers/AuthProvider'
import { creatorTemplatesApi, type CreatorTemplate, type CreatorTemplateContent } from '../../src/services/api/creatorTemplates'
import { geographyApi } from '../../src/services/api/geography'
import { teamExamples } from '../../src/features/creator/exercises/teamExamples'
import { toPersistence } from '../../src/features/creator/exercises/persistenceAdapter'
import '../../src/index.css'
import '../../src/shared/theme/theme.css'
import '../../src/shared/theme/global.css'
const scope = window as any
let record: CreatorTemplate | null = null
scope.fixtureCalls = []; scope.fixtureRecord = () => structuredClone(record)
scope.examples = teamExamples.map(example => toPersistence(example))
function save(content: CreatorTemplateContent, category: CreatorTemplate['category']) {
  const saved = structuredClone(content)
  for (const cp of saved.checkpoints as any[]) for (const exercise of Object.values(cp.customExercises ?? {}) as any[]) { exercise.id = crypto.randomUUID(); exercise.owner = { templateKey: saved.key, version: saved.version } }
  record = { key: content.key, version: content.version, status: 'draft', category, content: saved }
  return structuredClone(record)
}
creatorTemplatesApi.get = async () => structuredClone(record!)
creatorTemplatesApi.create = async (content, category) => { scope.fixtureCalls.push({ method: 'create', content: structuredClone(content) }); return save(content, category) }
creatorTemplatesApi.createVersion = async (_, content) => { scope.fixtureCalls.push({ method: 'version', content: structuredClone(content) }); return save(content, record?.category) }
creatorTemplatesApi.submit = async () => { throw new Error('This fixture does not submit') }
geographyApi.countries = async () => ({ countries: [] })
let root = createRoot(document.getElementById('root')!)
const mount = () => root.render(<MemoryRouter initialEntries={[record ? `/create?template=${record.key}` : '/create?category=universal']}><AuthProvider><CreatorTemplateEditorPage /></AuthProvider></MemoryRouter>)
scope.fixtureReopen = () => { root.unmount(); root = createRoot(document.getElementById('root')!); mount() }
mount()
