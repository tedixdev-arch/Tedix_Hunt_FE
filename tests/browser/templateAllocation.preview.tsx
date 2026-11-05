import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../../src/app/providers/AuthProvider'
import { CreatorTemplateEditorPage } from '../../src/pages/CreatorStudio'
import { libraryPayload } from '../../src/features/creator/content/libraryAdapter'
import { authorPrototype } from '../../src/features/creator/exercises/persistenceAdapter'
import { prototypes } from '../../src/features/creator/exercises/catalog'
import { teamExample } from '../../src/features/creator/exercises/teamExamples'
import '../../src/index.css'
import '../../src/shared/theme/theme.css'
import '../../src/shared/theme/global.css'
// Fixture construction only. The product editor and every save/reload use the real API.
Object.assign(window, { allocationFixture: (type: string) => libraryPayload({ source: 'custom', assignment: 'custom', custom: authorPrototype(prototypes.find(e => e.type === type) ?? teamExample(type)) }, { category: 'Mathematics', grade: '9', scope: { country: '', region: '', city: '' } }) })
const key = new URLSearchParams(location.search).get('template')
createRoot(document.getElementById('root')!).render(<MemoryRouter initialEntries={[`/create?template=${encodeURIComponent(key ?? '')}`]}><AuthProvider><CreatorTemplateEditorPage /></AuthProvider></MemoryRouter>)
