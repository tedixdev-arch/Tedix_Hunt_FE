import { useState } from 'react'
import { PersonalChallengeAuthoring } from '../../src/features/creator/exercises/PersonalChallengeAuthoring'
import type { AuthoringDraft } from '../../src/features/creator/exercises/experimentDrafts'
import { createRoot } from 'react-dom/client'
import { createMemoryRouter, RouterProvider, Link } from 'react-router-dom'
import { CreatorStudioPage } from '../../src/pages/CreatorStudio'
import { AuthProvider } from '../../src/app/providers/AuthProvider'
import { authApi } from '../../src/services/api'
import { creatorTemplatesApi } from '../../src/services/api/creatorTemplates'
authApi.bootstrapSession = async () => null
creatorTemplatesApi.list = async () => []
import { geographyApi } from '../../src/services/api/geography'
import '../../src/index.css'
import '../../src/shared/theme/theme.css'
import '../../src/shared/theme/global.css'
// Explicit browser fixtures, never production fallback records.
geographyApi.countries = async () => ({ countries: [{ code: 'RO', displayName: 'Romania' }, { code: 'FR', displayName: 'France' }] })
geographyApi.regions = async country => ({ regions: [{ countryCode: country, admin1Code: 'fixture-region', displayName: 'Fixture region' }], regionLabel: 'Region', metadataStatus: 'ready', nextAfter: null })
geographyApi.cities = async country => ({ cities: [{ geographicId: 'fixture-city', countryCode: country, countryDisplayName: 'Fixture country', name: 'Fixture city', admin1Code: 'fixture-region', regionDisplayName: 'Fixture region', regionStatus: 'resolved', administrativeContext: 'Fixture', latitude: 0, longitude: 0, localityId: null, registeredActive: false, registrationState: 'fixture', nextAction: 'fixture' }], nextAfter: null })
function TemplatePredefined() { const [draft, setDraft] = useState<AuthoringDraft>({ source: 'saved', assignment: 'predefined' }); return <main className="mx-auto max-w-7xl p-4"><h1>Template Personal Challenge</h1><PersonalChallengeAuthoring value={{}} draft={draft} onDraftChange={setDraft} onChange={() => { throw new Error('Example assignment is forbidden') }} /></main> }
const router = createMemoryRouter([{ path: '/', element: <AuthProvider><CreatorStudioPage /><Link to="/away">Leave Content</Link></AuthProvider> }, { path: '/away', element: <p>Left Content</p> }, { path: '/template', element: <TemplatePredefined /> }], { initialEntries: [new URLSearchParams(window.location.search).has('template') ? '/template' : '/?studio=content'] })
createRoot(document.getElementById('root')!).render(<RouterProvider router={router} />)
