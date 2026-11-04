import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { PersonalChallengeAuthoring } from '../../src/features/creator/exercises/PersonalChallengeAuthoring'
import { ContentLibrary } from '../../src/features/creator/content/ContentLibrary'
import { geographyApi } from '../../src/services/api/geography'
import { applyExerciseDrafts } from '../../src/features/creator/exercises/templateExercises'
import type { AuthoringDraft } from '../../src/features/creator/exercises/experimentDrafts'
import '../../src/index.css'
geographyApi.countries = async () => ({ countries: [{ code: 'RO', displayName: 'Romania' }] })
geographyApi.regions = async () => ({ regions: [{ countryCode: 'RO', admin1Code: 'CJ', displayName: 'Cluj' }], regionLabel: 'County', metadataStatus: 'ready', nextAfter: null })
geographyApi.cities = async () => ({ cities: [{ geographicId: 'actual-city', countryCode: 'RO', admin1Code: 'CJ', regionStatus: 'resolved', name: 'Cluj-Napoca' } as any], nextAfter: null })
function Fixture() {
  const [draft, setDraft] = useState<AuthoringDraft>({ source: 'saved', assignment: 'predefined' })
  const [checkpoint, setCheckpoint] = useState({ checkpoint: 1, kind: 'hidden-rule' })
  ;(window as any).fixtureRecord = () => applyExerciseDrafts([checkpoint], { 'kind:0': draft }).checkpoints
  return <main className="mx-auto max-w-3xl bg-white p-4"><PersonalChallengeAuthoring value={checkpoint} onChange={value => setCheckpoint({ ...checkpoint, ...value })} draft={draft} onDraftChange={setDraft} /><ContentLibrary /></main>
}
createRoot(document.getElementById('root')!).render(<Fixture />)
