import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { PersonalChallengeAuthoring } from '../../src/features/creator/exercises/PersonalChallengeAuthoring'
import { ChallengeAllocation } from '../../src/features/creator/content/ChallengeAllocation'
import { starterContent, type ContentRecord } from '../../src/features/creator/content/catalog'
import { geographyApi } from '../../src/services/api/geography'
import { applyExerciseDrafts } from '../../src/features/creator/exercises/templateExercises'
import type { AuthoringDraft } from '../../src/features/creator/exercises/experimentDrafts'
import '../../src/index.css'
geographyApi.cities = async () => ({ cities: [{ geographicId: 'fixture-city', localityId: 'fixture-locality', countryCode: 'RO', admin1Code: 'CJ', regionStatus: 'resolved' } as any], nextAfter: null })
const location = { id: 'fixture-locality', countryCode: 'RO', countryDisplayName: 'Romania', name: 'Cluj-Napoca', administrativeContext: 'Cluj', latitude: 46.77, longitude: 23.59 }
const defaults = { category: 'Mathematics', location }
const approved: ContentRecord = { ...starterContent[0], id: 'fixture-approved', activityCategory: 'Mathematics', approvalStatus: 'approved', revision: { kind: 'backend', id: 'fixture-revision' }, collection: { id: 'fixture-library', name: 'Fixture library' }, geography: { country: 'RO', region: 'CJ', city: 'fixture-city' } }
function Fixture() {
  const [draft, setDraft] = useState<AuthoringDraft>({ source: 'saved', assignment: 'predefined' })
  const [checkpoint, setCheckpoint] = useState({ checkpoint: 1, kind: 'hidden-rule', points: 37 })
  ;(window as any).fixtureRecord = () => applyExerciseDrafts([checkpoint], { 'kind:0': draft }).checkpoints
  const withRecords = new URLSearchParams(locationSearch()).has('approved')
  return <main className="mx-auto max-w-3xl bg-white p-4"><h1 className="text-xl font-bold">Personal Challenge · Predefined</h1><p className="mt-2 text-xs text-slate-500">Browser verification fixture{withRecords ? ' · Injected approved test record; not live library data' : ' · No backend exercise records'}</p>{withRecords ? <div className="mt-4"><ChallengeAllocation items={[approved, ...starterContent]} mechanic={approved.mechanic} defaults={defaults} /></div> : <PersonalChallengeAuthoring context={{ mode: 'modern', poolDefaults: defaults }} value={checkpoint} onChange={value => setCheckpoint({ ...checkpoint, ...value })} draft={draft} onDraftChange={setDraft} />}</main>
}
function locationSearch() { return window.location.search }
createRoot(document.getElementById('root')!).render(<Fixture />)
