import { useEffect, useRef, useState } from 'react'
import { ApiError } from '../../services/api/client'
import { universalLibraryApi, type PublishedUniversal, type PublishedUniversalDetail } from '../../services/api/universalLibrary'
import { gameplayPresentation } from './CheckpointGameplayEditor'
import { gameplayFields, hydrateGameplay } from './checkpointGameplay'
import { missionStoryFields } from './mission'

const action = 'min-h-12 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 disabled:opacity-50'
const labels = { kind: 'Personal Challenge', teamKind: 'Team Challenge', navigationMode: 'Onward navigation' }

function libraryError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401) return 'Your session has expired. Please sign in again.'
    if (error.status === 403) return 'Your account is not authorized to browse the Universal Library.'
    if (error.status === 404) return 'This Universal Template is no longer available. Refresh the Library.'
  }
  return 'The Universal Library could not be refreshed. Please try again.'
}

function hasReference(item: PublishedUniversal): boolean {
  return !!item && typeof item.id === 'string' && typeof item.key === 'string'
    && typeof item.displayName === 'string' && typeof item.theme === 'string'
    && !!item.creator && typeof item.creator.id === 'string'
    && (item.creator.name === null || typeof item.creator.name === 'string')
    && item.publishedReference?.templateId === item.id
    && Number.isInteger(item.publishedReference.version) && item.publishedReference.version > 0
}

/** Read-only C3 products. Candidate status and owner APIs never establish publication. */
export function UniversalLibrary() {
  const [items, setItems] = useState<PublishedUniversal[]>([])
  const [detail, setDetail] = useState<PublishedUniversalDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [opening, setOpening] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [detailError, setDetailError] = useState('')
  const [changed, setChanged] = useState(false)
  const listSequence = useRef(0), detailSequence = useRef(0)
  const heading = useRef<HTMLHeadingElement>(null)
  const detailHeading = useRef<HTMLHeadingElement>(null)

  async function load() {
    const sequence = ++listSequence.current
    ++detailSequence.current
    setLoading(true); setError(''); setDetailError(''); setItems([]); setDetail(null); setOpening(null)
    try {
      const result = await universalLibraryApi.list()
      if (sequence !== listSequence.current) return
      if (!Array.isArray(result.items) || !result.items.every(hasReference)
        || new Set(result.items.map(item => item.id)).size !== result.items.length) throw new Error('Invalid publication projection')
      setItems(result.items)
    } catch (failure) {
      if (sequence !== listSequence.current) return
      setError(libraryError(failure))
    } finally { if (sequence === listSequence.current) setLoading(false) }
  }

  async function open(item: PublishedUniversal) {
    const sequence = ++detailSequence.current
    setOpening(item.key); setDetail(null); setDetailError(''); setChanged(false)
    try {
      const current = await universalLibraryApi.get(item.key)
      if (sequence !== detailSequence.current) return
      if (!hasReference(current) || current.key !== item.key || current.id !== item.id
        || current.content?.key !== current.key || current.content.version !== current.publishedReference.version
        || !Array.isArray(current.content.checkpoints) || !current.content.configuration) throw new Error('Invalid published content')
      setChanged(current.publishedReference.version !== item.publishedReference.version)
      setDetail(current)
      // The detail response is the current authority, including republication since list load.
      setItems(previous => previous.map(product => product.id === current.id ? current : product))
    } catch (failure) {
      if (sequence !== detailSequence.current) return
      setDetailError(libraryError(failure))
      if (failure instanceof ApiError && [401, 403].includes(failure.status ?? 0)) {
        ++listSequence.current; setLoading(false); setItems([]); setError(libraryError(failure))
      } else if (failure instanceof ApiError && failure.status === 404) {
        setItems(previous => previous.filter(product => product.id !== item.id))
      }
    } finally { if (sequence === detailSequence.current) setOpening(null) }
  }

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    heading.current?.focus()
    void load()
    return () => { ++listSequence.current; ++detailSequence.current; queueMicrotask(() => { if (previous?.isConnected) previous.focus() }) }
  }, [])
  useEffect(() => { if (detail) detailHeading.current?.focus() }, [detail])

  const gameplay = detail ? hydrateGameplay(detail.content) : null
  return <section className="mt-8 min-w-0" aria-label="Universal Library">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 ref={heading} tabIndex={-1} className="text-2xl font-bold outline-none">Universal Library</h2>
      <button type="button" className={action} disabled={loading} onClick={() => void load()}>Refresh Library</button>
    </div>
    <p className="mt-2 text-sm text-slate-600">Approved stories and challenges shared by Creators. Approval covers reusable content; it does not approve a physical route or make a Template available to Organizers. Shipped starters remain in Create Template.</p>
    <div aria-busy={loading} className="mt-4">
      {loading ? <p role="status">Loading Universal Library…</p> : error ? <p role="alert">{error}</p>
        : items.length === 0 ? <p>No approved Universal Templates are available.</p>
          : <div className="grid gap-4 sm:grid-cols-2">{items.map(item => <article key={item.id} className="min-w-0 break-words rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-xl font-bold">{item.displayName}</h3>
            <p className="mt-2 text-sm text-slate-600">{item.theme}</p>
            <p className="mt-2 text-sm">By {item.creator.name ?? 'Creator'} · Published version {item.publishedReference.version}</p>
            <button type="button" className={`${action} mt-4`} disabled={opening === item.key} onClick={() => void open(item)}>View approved Template</button>
          </article>)}</div>}
    </div>
    {opening && <p role="status" className="mt-4">Loading approved Template…</p>}
    {detailError && <p role="alert" className="mt-4">{detailError}</p>}
    {detail && gameplay && <article aria-label="Approved Universal Template" className="mt-5 min-w-0 break-words rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      {changed && <p role="status" className="mb-3 text-sm">Publication changed since the Library was loaded. Showing the current approved version.</p>}
      <h3 ref={detailHeading} tabIndex={-1} className="text-2xl font-bold outline-none">{detail.displayName}</h3>
      <p className="mt-2 text-sm">By {detail.creator.name ?? 'Creator'} · Published version {detail.publishedReference.version}</p>
      <p className="mt-2 text-sm text-slate-600">{detail.theme}</p>
      {typeof detail.content.configuration.summary === 'string' && <p className="mt-4 whitespace-pre-wrap">{detail.content.configuration.summary}</p>}
      <section className="mt-5 space-y-3" aria-label="Approved story"><h4 className="text-lg font-bold">Mission &amp; story</h4>
        {missionStoryFields(detail.content.mission).map(([key, value]) => <p key={key} className="whitespace-pre-wrap">{value}</p>)}
      </section>
      <section className="mt-5" aria-label="Approved gameplay"><h4 className="text-lg font-bold">Checkpoints &amp; FinishPoint</h4>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">{[...gameplay.normal, ...(gameplay.terminal ? [gameplay.terminal] : [])].map((checkpoint, index) => <div key={index} className="rounded-xl bg-slate-50 p-4">
          <h5 className="font-bold">{checkpoint.role === 'terminal' ? 'FinishPoint' : `Checkpoint ${checkpoint.checkpoint ?? index + 1}`}</h5>
          {gameplayFields.map(field => typeof checkpoint[field] === 'string' ? <p key={field} className="mt-2 text-sm">{labels[field]}: {gameplayPresentation(field, checkpoint[field]).name}</p> : null)}
        </div>)}</div>
      </section>
    </article>}
  </section>
}
