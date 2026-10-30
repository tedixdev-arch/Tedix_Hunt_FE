import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ApiError } from '../../services/api/client'
import { creatorTemplatesApi } from '../../services/api/creatorTemplates'
import type { PublishedUniversalDetail } from '../../services/api/universalLibrary'

/** The inspected publication is held fixed until the Creator explicitly reselects it. */
export function UseUniversalAsLocal({ source }: { source: PublishedUniversalDetail }) {
  const navigate = useNavigate()
  const lock = useRef(false)
  const [choosing, setChoosing] = useState(false), [key, setKey] = useState('')
  const [pending, setPending] = useState(false), [blocked, setBlocked] = useState(false), [error, setError] = useState('')
  async function copy(event: React.FormEvent) {
    event.preventDefault()
    if (lock.current || blocked || !key.trim()) return
    lock.current = true; setPending(true); setError('')
    try {
      const result = await creatorTemplatesApi.fromUniversal(source.key, key.trim(), source.publishedReference)
      navigate(`/create?template=${encodeURIComponent(result.key)}`)
    } catch (failure) {
      const code = failure instanceof ApiError && failure.details && typeof failure.details === 'object' && 'error' in failure.details ? failure.details.error : undefined
      if (failure instanceof ApiError && failure.status === 409 && code === 'template_key_conflict') setError('That key is already in use. Choose a different destination key.')
      else if (failure instanceof ApiError && (failure.status === 409 || failure.status === 404)) { setBlocked(true); setError('This publication is no longer the selected approved version. Refresh the Library and reselect an approved Template before copying.') }
      else if (failure instanceof ApiError && failure.status === 400) setError('The destination key or selection is invalid. Check the key and try again.')
      else if (failure instanceof ApiError && [401, 403].includes(failure.status ?? 0)) { setBlocked(true); setError(failure.status === 401 ? 'Your session has expired. Please sign in again.' : 'Your account is not authorized to create this Local Template.') }
      else { setBlocked(true); setError('Creation could not be confirmed. Check My Templates and reopen the draft before creating another.') }
    } finally { lock.current = false; setPending(false) }
  }
  return <section className="mt-5 border-t border-slate-200 pt-5" aria-label="Create Local from Universal">
    <button type="button" className="min-h-12 rounded-xl bg-emerald-500 px-4 font-bold" disabled={pending} onClick={() => setChoosing(true)}>Use as Local Template</button>
    {choosing && <form onSubmit={copy} className="mt-4 space-y-3">
      <p className="text-sm">Create your own Local draft from published version {source.publishedReference.version}. Later source changes will not update your copy. Local approval is a separate Admin decision.</p>
      <label className="block text-sm font-bold">New destination key<input required maxLength={120} value={key} disabled={pending || blocked} onChange={event => setKey(event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-3" placeholder="my-local-hunt" /></label>
      <button disabled={pending || blocked || !key.trim()} className="min-h-12 rounded-xl bg-emerald-500 px-4 font-bold disabled:opacity-50">{pending ? 'Creating…' : 'Create Local draft'}</button>
    </form>}
    {error && <p role="alert" className="mt-3 text-sm text-red-800">{error} {blocked && <Link to="/creator" className="underline">Check My Templates</Link>}</p>}
  </section>
}
