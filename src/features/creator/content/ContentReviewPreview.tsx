import { fromPersistence } from '../exercises/persistenceAdapter'
import { ChallengeCanvas } from '../exercises/ChallengeCanvas'
import { MathText } from '../exercises/MathText'
import { typeName } from '../exercises/catalog'
import type { LibraryContent } from '../../../services/api/creatorContent'

export const contentStatus = { draft: 'Draft', submitted: 'Submitted', approved: 'Approved', changes_requested: 'Changes Requested', archived: 'Archived' } as const

/** Exact saved payload, played by the existing Personal/Team engine. */
export function ContentReviewPreview({ record }: { record: LibraryContent }) {
  const exercise = fromPersistence(record.exercise)
  const g = record.geography
  return <section aria-label="Saved exercise preview" className="min-w-0 space-y-4 break-words">
    <div><h3 className="text-xl font-semibold"><MathText text={exercise.title} /></h3>
      <p className="mt-1 text-sm text-slate-600">{record.exercise.classification === 'team' ? 'Team' : 'Personal'} · {typeName(exercise.type)} · {record.category || 'Unclassified'}{record.curriculum.grade ? ` · Grade ${record.curriculum.grade}` : ''} · {g.scope === 'universal' ? 'Universal' : g.scope === 'country' ? `Country · ${g.countryCode}` : g.scope === 'region' ? `Region · ${g.countryCode}` : `City · ${g.countryCode}`}</p>
    </div>
    <ChallengeCanvas key={record.revisionId} exercise={exercise} />
    <details className="rounded-lg border border-slate-200 px-3 py-2"><summary className="min-h-8 cursor-pointer text-sm font-medium">Hints &amp; solution</summary><div className="space-y-3 py-3"><div><h4 className="text-sm font-semibold">Hints</h4>{record.exercise.hints.map((hint, index) => <div key={index}><MathText text={hint} /></div>)}</div><div><h4 className="text-sm font-semibold">Solution</h4><MathText text={exercise.solution} /></div></div></details>
  </section>
}

export function ContentFeedback({ record }: { record: LibraryContent }) {
  const comments = record.reviewEvents?.filter(event => event.comment) ?? []
  return comments.length ? <div aria-label="Review feedback" className="my-4 border-l-2 border-amber-400 pl-3 text-sm">{comments.map(event => <div key={event.eventId}><p className="font-semibold">{event.decision === 'changes_requested' ? 'Changes Requested' : 'Review feedback'}</p><p className="whitespace-pre-wrap break-words">{event.comment}</p></div>)}</div> : null
}
