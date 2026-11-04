import { createRoot } from 'react-dom/client'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { AuthProvider } from '../../src/app/providers/AuthProvider'
import { CreatorStudioPage } from '../../src/pages/CreatorStudio'
import { AdminContentReviewPage } from '../../src/pages/AdminContentReview'
import { libraryPayload } from '../../src/features/creator/content/libraryAdapter'
import { authorPrototype } from '../../src/features/creator/exercises/persistenceAdapter'
import { prototypes } from '../../src/features/creator/exercises/catalog'
import { teamExample } from '../../src/features/creator/exercises/teamExamples'
import '../../src/index.css'
import '../../src/shared/theme/theme.css'
import '../../src/shared/theme/global.css'
// Only fixture construction is exposed. All persistence/review uses the real API.
Object.assign(window, { reviewFixture: (team = false) => libraryPayload({ source: 'custom', assignment: 'predefined', custom: authorPrototype(team ? teamExample('scrambled-word') : prototypes[0]) }, { category: 'Science', grade: '', scope: { country: '', region: '', city: '' } }) })
const admin = new URLSearchParams(location.search).has('admin')
const router = createMemoryRouter([{ path: '/', element: <AuthProvider>{admin ? <AdminContentReviewPage /> : <CreatorStudioPage />}</AuthProvider> }])
createRoot(document.getElementById('root')!).render(<RouterProvider router={router} />)

Object.assign(window, { approvedFixture: (type: string) => libraryPayload({source:'custom',custom:authorPrototype(prototypes.find(e=>e.type===type) ?? teamExample(type as Parameters<typeof teamExample>[0]))},{category:'Mathematics',grade:'7',scope:{country:'',region:'',city:''}}) })
