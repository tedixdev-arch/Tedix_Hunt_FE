import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { CreatorTemplateEditorPage } from '../../src/pages/CreatorStudio'
import { AuthProvider } from '../../src/app/providers/AuthProvider'
import { authApi } from '../../src/services/api'
import { creatorTemplatesApi, type CreatorTemplate } from '../../src/services/api/creatorTemplates'
import '../../src/index.css'
import '../../src/shared/theme/theme.css'
import '../../src/shared/theme/global.css'
// Local lifecycle fixture; no real account, backend or publication mutations.
authApi.bootstrapSession = async () => null
const scope = window as typeof window & { fixtureCalls: unknown[] }
scope.fixtureCalls = []
let record: CreatorTemplate | null = JSON.parse(sessionStorage.getItem('universal-authoring-fixture') ?? 'null')
const store = (value: CreatorTemplate) => { record = value; sessionStorage.setItem('universal-authoring-fixture', JSON.stringify(record)); return structuredClone(record) }
creatorTemplatesApi.create = async (content, category) => { scope.fixtureCalls.push({ method: 'create', category, content }); await new Promise(done => setTimeout(done, 100)); return store({ key: content.key, version: 1, category, status: 'draft', content }) }
creatorTemplatesApi.get = async key => { scope.fixtureCalls.push({ method: 'get', key }); if (!record) throw new Error('Missing fixture'); return structuredClone(record) }
creatorTemplatesApi.createVersion = async (key, content) => { scope.fixtureCalls.push({ method: 'version', key, content }); return store({ ...record!, version: content.version, content, status: 'draft' }) }
creatorTemplatesApi.submit = async (key, version) => { scope.fixtureCalls.push({ method: 'submit', key, version }); return store({ ...record!, status: 'submitted', submittedVersion: version }) }
const initial = new URLSearchParams(location.search).has('open') && record ? `/create?template=${record.key}` : '/create?category=universal'
createRoot(document.getElementById('root')!).render(<MemoryRouter initialEntries={[initial]}><AuthProvider><CreatorTemplateEditorPage /></AuthProvider></MemoryRouter>)
