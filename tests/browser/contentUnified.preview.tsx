import { createRoot } from 'react-dom/client'
import { createMemoryRouter, RouterProvider, Link } from 'react-router-dom'
import { ContentLibrary } from '../../src/features/creator/content/ContentLibrary'
import { geographyApi } from '../../src/services/api/geography'
import '../../src/index.css'
import '../../src/shared/theme/theme.css'
import '../../src/shared/theme/global.css'
// Explicit browser fixtures, never production fallback records.
geographyApi.countries = async () => ({ countries: [{ code: 'RO', displayName: 'Romania' }, { code: 'FR', displayName: 'France' }] })
geographyApi.regions = async country => ({ regions: [{ countryCode: country, admin1Code: 'fixture-region', displayName: 'Fixture region' }], regionLabel: 'Region', metadataStatus: 'ready', nextAfter: null })
geographyApi.cities = async country => ({ cities: [{ geographicId: 'fixture-city', countryCode: country, countryDisplayName: 'Fixture country', name: 'Fixture city', admin1Code: 'fixture-region', regionDisplayName: 'Fixture region', regionStatus: 'resolved', administrativeContext: 'Fixture', latitude: 0, longitude: 0, localityId: null, registeredActive: false, registrationState: 'fixture', nextAction: 'fixture' }], nextAfter: null })
const router = createMemoryRouter([{ path: '/', element: <main className="mx-auto max-w-7xl p-4"><Link to="/away">Leave Content</Link><ContentLibrary /></main> }, { path: '/away', element: <p>Left Content</p> }])
createRoot(document.getElementById('root')!).render(<RouterProvider router={router} />)
