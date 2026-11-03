import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../../src/app/providers/AuthProvider'
import { CreatorTemplateEditorPage } from '../../src/pages/CreatorStudio'
import { LocalSetupFoundation } from '../../src/features/organizer/LocalSetupFoundation'
import { authApi, huntOptionsApi, organizationsApi } from '../../src/services/api'
import '../../src/index.css'
import '../../src/shared/theme/theme.css'
import '../../src/shared/theme/global.css'
// FE-only acceptance fixture: metadata outage must not gate either transition.
authApi.bootstrapSession = async () => null
huntOptionsApi.listHuntOptions = async () => { throw new Error('Fixture metadata outage') }
organizationsApi.listAccessible = async () => []
const organizer = new URLSearchParams(location.search).has('organizer')
createRoot(document.getElementById('root')!).render(<MemoryRouter initialEntries={['/create?category=local']}><AuthProvider>{organizer ? <LocalSetupFoundation /> : <CreatorTemplateEditorPage />}</AuthProvider></MemoryRouter>)
