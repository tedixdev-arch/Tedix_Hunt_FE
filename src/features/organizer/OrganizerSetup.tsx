import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { huntsApi, type Hunt } from '../../services/api'
import { CustomHuntEditorPage } from '../../pages/CustomHuntEditor'
import { LocalSetupFoundation } from './LocalSetupFoundation'

/** Only new registered events and existing C7 Local drafts use the simple setup.
 * Legacy drafts and Independent mode retain their established editor. */
export function OrganizerSetup() {
  const { huntId } = useParams()
  const [params] = useSearchParams()
  const independent = params.get('mode') === 'independent'
  const [ownedDraftId, setOwnedDraftId] = useState<string>()
  const bootId = huntId && huntId !== ownedDraftId ? huntId : undefined
  const [loaded, setLoaded] = useState<Hunt>()
  const [error, setError] = useState(false)
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    if (!bootId || independent) return
    let active = true
    setError(false)
    huntsApi.getHunt(bootId).then(value => {
      if (value.id !== bootId) throw new Error('Unexpected Hunt')
      if (active) setLoaded(value)
    }).catch(() => { if (active) setError(true) })
    return () => { active = false }
  }, [bootId, independent, attempt])
  if (independent) return <CustomHuntEditorPage />
  if (!bootId) return <LocalSetupFoundation key="new" onDraftCreated={setOwnedDraftId} />
  if (error) return <main className="p-8"><p role="alert">We couldn’t load your saved Hunt.</p><button className="my-4 min-h-12 rounded-xl border px-5" type="button" onClick={() => setAttempt(value => value + 1)}>Retry</button><Link className="ml-4 underline" to="/organizer">My Hunts</Link></main>
  if (!loaded || loaded.id !== bootId) return <p className="p-8" role="status">Loading saved Hunt…</p>
  return loaded.templateId && loaded.templateLocalityId ? <LocalSetupFoundation key={loaded.id} initialHunt={loaded} /> : <CustomHuntEditorPage />
}
