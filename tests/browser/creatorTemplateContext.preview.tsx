import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { CreatorStudioPage } from '../../src/pages/CreatorStudio'
import { AuthProvider } from '../../src/app/providers/AuthProvider'
import { authApi } from '../../src/services/api'
import { creatorTemplatesApi } from '../../src/services/api/creatorTemplates'
import { projection } from '../fixtures/creatorTemplateProjections'
import '../../src/index.css'
import '../../src/shared/theme/theme.css'
import '../../src/shared/theme/global.css'
// Local browser fixture only: no real account, backend or runtime calls.
authApi.bootstrapSession = async () => null
creatorTemplatesApi.list = async () => {
  const local = projection('local', 'submitted', 3)
  local.content.displayName = 'A very long owned Local Template name with route and approval context for responsive verification'
  local.localSuspension = { at: '2026-10-29T00:00:00Z', byUserId: 'admin', version: 1, reason: 'Route access is temporarily restricted pending an independent safety review.' }
  return [projection('universal'), local, projection(null, 'approved')]
}
for (const method of ['create', 'createVersion', 'submit', 'delete', 'createStarterDraft'] as const) {
  creatorTemplatesApi[method] = async () => { throw new Error(`Unexpected mutation: ${method}`) }
}
createRoot(document.getElementById('root')!).render(<MemoryRouter initialEntries={['/creator']}><AuthProvider><CreatorStudioPage /></AuthProvider></MemoryRouter>)
