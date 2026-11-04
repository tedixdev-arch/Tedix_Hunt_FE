import { useRef, useState } from 'react'
import { validateExercise } from '../exercises/catalog'
import { PersonalChallengeAuthoring } from '../exercises/PersonalChallengeAuthoring'
import { TeamChallengeAuthoring } from '../exercises/TeamChallengeAuthoring'
import type { AuthoringDraft } from '../exercises/experimentDrafts'
import { control } from '../exercises/ExerciseRenderer'
import { creatorContentApi, contentError, type LibraryContent } from '../../../services/api/creatorContent'
import { ApiError } from '../../../services/api/client'
import { libraryPayload, type LibraryMetadata } from './libraryAdapter'
import { ContentFeedback, ContentReviewPreview, contentStatus } from './ContentReviewPreview'

/** The Content parent owns retained drafts and navigation protection. */
export function LibraryAuthoring({ team, draft, metadata, record, reviewed, unsaved, onRevised, onDraftChange, onDiscard, onSaved, onViewLibrary, onReload, onBusy }: {
  team: boolean; metadata: LibraryMetadata; draft: AuthoringDraft; record?: LibraryContent; reviewed?: LibraryContent; unsaved: boolean
  onDraftChange: (draft: AuthoringDraft) => void; onDiscard: () => void; onRevised: (record: LibraryContent) => void
  onSaved: (record: LibraryContent, persisted?: boolean) => void; onBusy: (busy: boolean) => void; onViewLibrary: () => void; onReload: () => void
}) {
  const [result, setResult] = useState<{ snapshot: string; message: string; success?: boolean; conflict?: boolean } | null>(null)
  const [saving, setSaving] = useState(false), busy = useRef(false)
  const snapshot = JSON.stringify({ draft, metadata })
  const run = async (action: () => Promise<void>) => {
    if (busy.current) return
    busy.current = true; setSaving(true); onBusy(true); setResult(null)
    try { await action() }
    catch (error) { setResult({ snapshot, message: contentError(error), conflict: error instanceof ApiError && error.status === 409 }) }
    finally { busy.current = false; setSaving(false); onBusy(false) }
  }
  const submit = () => {
    if (!record || record.status !== 'draft') return
    if (unsaved) { setResult({ snapshot, message: 'Save Changes before submitting for approval.' }); return }
    if (!record.category) { setResult({ snapshot, message: 'Choose a category and Save Changes before submitting.' }); return }
    void run(async () => {
      const submitted = await creatorContentApi.submit(record.contentId, record.revisionId)
      onSaved(submitted)
    })
  }
  const revise = () => {
    if (!record || !['approved', 'changes_requested'].includes(record.status)) return
    void run(async () => { onRevised(await creatorContentApi.clone(record.contentId, record.revisionId)) })
  }
  const save = () => {
    if (busy.current || record && record.status !== 'draft') return
    let payload
    try {
      if (draft.custom && validateExercise(draft.custom).length) throw new Error('Review the highlighted exercise fields.')
      payload = libraryPayload(draft, metadata)
    } catch (error) { setResult({ snapshot, message: error instanceof Error ? error.message : 'Review the exercise.' }); return }
    const body = payload
    void run(async () => {
      const saved = record ? await creatorContentApi.update(record.contentId, record.revisionId, body) : await creatorContentApi.create(body)
      onSaved(saved)
      setResult({ snapshot, message: 'Saved to Library.', success: true })
    })
  }
  const feedback = result && (result.snapshot === snapshot || result.conflict) && <div className="mt-3 text-sm"><p role={result.success ? 'status' : 'alert'}>{result.message}</p>{result.success && <button type="button" className={`${control} mt-2`} onClick={onViewLibrary}>View in Library</button>}{result.conflict && <button type="button" disabled={saving} className={`${control} mt-2`} onClick={onReload}>Reload saved version</button>}</div>
  if (record && record.status !== 'draft') return <section aria-label="Saved content" className="min-w-0">
    <p role="status" className="mb-4 text-sm font-semibold text-emerald-800">{record.status === 'submitted' ? 'Submitted for Review' : contentStatus[record.status]}</p>
    <ContentFeedback record={record} />
    {record.status === 'changes_requested' && <button type="button" disabled={saving} className={`${control} mb-4 bg-emerald-600 font-semibold text-white`} onClick={revise}>{saving ? 'Creating Draft…' : 'Revise Exercise'}</button>}
    <ContentReviewPreview record={record} />
    <div className="mt-4 flex flex-wrap gap-2"><button type="button" disabled={saving} className={control} onClick={onViewLibrary}>View in Library</button>{record.status === 'approved' && <button type="button" disabled={saving} className={control} onClick={revise}>{saving ? 'Creating Draft…' : 'Create New Revision'}</button>}</div>
    {feedback}
  </section>
  return <section aria-label="Library exercise draft">
    {record && <p className="mb-3 text-sm font-semibold text-slate-600">Draft</p>}
    {reviewed && <ContentFeedback record={reviewed} />}
    <fieldset disabled={saving} className="min-w-0">
      {team ? <TeamChallengeAuthoring standalone value={{}} onChange={() => {}} draft={draft} onDraftChange={onDraftChange} legacy={null} /> : <PersonalChallengeAuthoring standalone value={{}} onChange={() => {}} draft={draft} onDraftChange={onDraftChange} />}
    </fieldset>
    <button type="button" disabled={saving} aria-busy={saving} className={`${control} mt-6 w-full ${record && !unsaved ? '' : 'bg-emerald-600 text-white font-semibold hover:bg-emerald-700'} disabled:opacity-60`} onClick={save}>{saving ? 'Saving…' : record ? 'Save Changes' : 'Add Exercise'}</button>
    {record && <><button type="button" disabled={saving || unsaved} className={`${control} mt-2 w-full ${unsaved ? 'border-emerald-600 text-emerald-900' : 'bg-emerald-600 text-white font-semibold hover:bg-emerald-700'}`} onClick={submit}>{saving ? 'Please wait…' : 'Submit for Approval'}</button>{unsaved && <p className="mt-2 text-sm text-slate-600">Save Changes before submitting for approval.</p>}</>}
    {feedback}
    <p className="mt-2 text-xs text-slate-600">Unsaved session drafts are kept while switching sections. Leaving or reloading loses them.</p>
    <button type="button" disabled={saving} className={`${control} mt-2 border-transparent px-0 text-sm text-slate-500 underline underline-offset-4`} onClick={() => { if (window.confirm('Discard this unsaved session draft and its mechanic variants?')) onDiscard() }}>Discard session draft</button>
  </section>
}
