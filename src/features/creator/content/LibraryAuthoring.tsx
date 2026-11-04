import { useRef, useState } from 'react'
import { validateExercise } from '../exercises/catalog'
import { PersonalChallengeAuthoring } from '../exercises/PersonalChallengeAuthoring'
import { TeamChallengeAuthoring } from '../exercises/TeamChallengeAuthoring'
import type { AuthoringDraft } from '../exercises/experimentDrafts'
import { control } from '../exercises/ExerciseRenderer'
import { creatorContentApi, contentError, type LibraryContent } from '../../../services/api/creatorContent'
import { ApiError } from '../../../services/api/client'
import { libraryPayload, type LibraryMetadata } from './libraryAdapter'

/** The Content parent owns retained drafts and navigation protection. */
export function LibraryAuthoring({ team, draft, metadata, record, onDraftChange, onDiscard, onSaved, onViewLibrary, onReload, onBusy }: {
  team: boolean; metadata: LibraryMetadata; draft: AuthoringDraft; record?: LibraryContent
  onDraftChange: (draft: AuthoringDraft) => void; onDiscard: () => void
  onSaved: (record: LibraryContent, persisted?: boolean) => void; onBusy: (busy: boolean) => void; onViewLibrary: () => void; onReload: () => void
}) {
  const [result, setResult] = useState<{ snapshot: string; message: string; success?: boolean; conflict?: boolean } | null>(null)
  const [saving, setSaving] = useState(false), busy = useRef(false)
  const snapshot = JSON.stringify({ draft, metadata })
  const save = async () => {
    if (busy.current) return
    let payload
    try {
      if (draft.custom && validateExercise(draft.custom).length) throw new Error('Review the highlighted exercise fields.')
      payload = libraryPayload(draft, metadata)
    } catch (error) { setResult({ snapshot, message: error instanceof Error ? error.message : 'Review the exercise.' }); return }
    busy.current = true; setSaving(true); onBusy(true); setResult(null)
    try {
      // Submitted/approved history can only be continued through the cloning endpoint.
      let head = record
      if (head && head.status !== 'draft') {
        head = await creatorContentApi.clone(head.contentId, head.revisionId)
        onSaved(head, false)
      }
      const saved = head ? await creatorContentApi.update(head.contentId, head.revisionId, payload) : await creatorContentApi.create(payload)
      onSaved(saved)
      setResult({ snapshot, message: 'Saved to Library.', success: true })
    } catch (error) { setResult({ snapshot, message: contentError(error), conflict: error instanceof ApiError && error.status === 409 }) }
    finally { busy.current = false; setSaving(false); onBusy(false) }
  }
  return <section aria-label="Library exercise draft">
    <fieldset disabled={saving} className="min-w-0">
      {team ? <TeamChallengeAuthoring standalone value={{}} onChange={() => {}} draft={draft} onDraftChange={onDraftChange} legacy={null} /> : <PersonalChallengeAuthoring standalone value={{}} onChange={() => {}} draft={draft} onDraftChange={onDraftChange} />}
    </fieldset>
    <button type="button" disabled={saving} aria-busy={saving} className={`${control} mt-6 w-full bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-60`} onClick={() => void save()}>{saving ? 'Saving…' : record ? 'Save Changes' : 'Add Exercise'}</button>
    {result && (result.snapshot === snapshot || result.conflict) && <div className="mt-3 text-sm"><p role={result.success ? 'status' : 'alert'}>{result.message}</p>{result.success && <button type="button" className={`${control} mt-2`} onClick={onViewLibrary}>View in Library</button>}{result.conflict && <button type="button" className={`${control} mt-2`} onClick={onReload}>Reload saved version</button>}</div>}
    <p className="mt-2 text-xs text-slate-600">Unsaved session drafts are kept while switching sections. Leaving or reloading loses them.</p>
    <button type="button" disabled={saving} className={`${control} mt-2 border-transparent px-0 text-sm text-slate-500 underline underline-offset-4`} onClick={() => { if (window.confirm('Discard this unsaved session draft and its mechanic variants?')) onDiscard() }}>Discard session draft</button>
  </section>
}
