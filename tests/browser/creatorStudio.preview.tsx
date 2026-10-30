import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { CreatorStudioPage } from '../../src/pages/CreatorStudio'
import { AuthProvider } from '../../src/app/providers/AuthProvider'
import { authApi } from '../../src/services/api'
import { creatorTemplatesApi } from '../../src/services/api/creatorTemplates'
import '../../src/index.css'
import '../../src/shared/theme/theme.css'
import '../../src/shared/theme/global.css'
// Local browser fixture only: no real account, backend or runtime calls.
authApi.bootstrapSession = async () => null
const state = new URLSearchParams(location.search).get('state')
creatorTemplatesApi.list = async () => {
  if (state === 'loading') return new Promise(() => {})
  if (state === 'error') throw new Error('Fixture list unavailable')
  if (state !== 'populated') return []
  return [
    { key: 'reusable', category: 'universal' as const, status: 'draft' as const, name: 'City riddles' },
    { key: 'local', category: 'local' as const, status: 'submitted' as const, name: 'Old town trail' },
    { key: 'legacy', category: null, status: 'changes_requested' as const, name: 'Signal: Cluj Napoca' },
  ].map(item => ({ ...item, version: 3, content: { key: item.key, version: 3, displayName: item.name, theme: 'City', mission: 'Story', configuration: {}, scoring: {}, checkpoints: [] } }))
}
for (const method of ['create', 'createVersion', 'submit', 'delete', 'createStarterDraft'] as const) {
  creatorTemplatesApi[method] = async () => { throw new Error(`Unexpected mutation: ${method}`) }
}
window.history.replaceState(null, '', '/creator')
createRoot(document.getElementById('root')!).render(<BrowserRouter><AuthProvider><CreatorStudioPage /></AuthProvider></BrowserRouter>)
