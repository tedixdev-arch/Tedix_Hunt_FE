import { MemoryRouter } from 'react-router-dom'
import { createRoot } from 'react-dom/client'
import { UniversalLibrary } from '../../src/features/creator/UniversalLibrary'
import { universalLibraryApi } from '../../src/services/api/universalLibrary'
import type { PublishedUniversal } from '../../src/services/api/universalLibrary'
import '../../src/index.css'
import '../../src/shared/theme/theme.css'
import '../../src/shared/theme/global.css'

// Local read fixture: no real account, backend, publication, copy or write requests.
const product: PublishedUniversal = {
  id: 'approved-source', key: 'shared-story', displayName: 'A shared Universal story with a long title for responsive content review',
  theme: 'Discovery and teamwork', creator: { id: 'another-creator', name: 'A Creator with a long display name' },
  publishedReference: { templateId: 'approved-source', version: 1 },
}
universalLibraryApi.list = async () => ({ items: [product] })
universalLibraryApi.get = async () => ({ ...product, publishedReference: { ...product.publishedReference, version: 3 }, content: {
  key: product.key, version: 3, displayName: product.displayName, theme: product.theme,
  mission: { name: 'Follow the shared story', briefing: 'Work together to restore the signal. This approved story remains independent of private Creator drafts.' },
  configuration: { normalCheckpointCount: 1, summary: 'Reusable content without a fixed locality or mandatory physical route.' },
  scoring: {}, checkpoints: [{ role: 'normal', checkpoint: 1, kind: 'logic-matrix' }, { role: 'terminal' }],
} })
createRoot(document.getElementById('root')!).render(<main className="h-dvh overflow-y-auto bg-slate-100 px-4 py-6 text-slate-950 sm:px-8"><div className="mx-auto max-w-6xl"><MemoryRouter><UniversalLibrary /></MemoryRouter></div></main>)
