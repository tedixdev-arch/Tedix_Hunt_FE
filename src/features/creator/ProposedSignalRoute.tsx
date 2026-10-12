import { useId, useState } from 'react'
import { candidateLabel, candidateReference, supportingSourceUrl, type RouteProposal } from './routeResearch'

interface Props {
  proposal: RouteProposal
  onInspect: (reference: ReturnType<typeof candidateReference>) => void
}

export function ProposedSignalRoute({ proposal, onInspect }: Props) {
  const detailId = useId()
  const [selectedOrder, setSelectedOrder] = useState<number>()
  const candidates = [...proposal.candidates].sort((a, b) => a.order - b.order)
  const selected = candidates.find(candidate => candidate.order === selectedOrder)
  const reference = selected && candidateReference(selected, proposal)
  const stopLabel = (order: number) => {
    const candidate = candidates.find(candidate => candidate.order === order)
    return candidate ? candidateLabel(candidate) : `Stop ${order}`
  }
  const sources = (ids: string[]) => proposal.sources.filter(source => ids.includes(source.id)).map(source => {
    const url = supportingSourceUrl(source.url)
    return <li key={source.id}>{url ? <a href={url} target="_blank" rel="noreferrer" className="underline">{source.id}: {source.supports}</a> : <span>{source.id}: {source.supports}</span>}</li>
  })
  return <aside aria-label="Proposed Signal Route" className="mt-4 min-w-0 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm">
    <h4 className="font-bold">Proposed Signal Route</h4>
    <p className="mt-2 font-bold text-amber-900">These are desk-researched landmark candidates, not physically verified arrival locations.</p>
    <p className="mt-2">Inspect a landmark, then choose a suitable public exterior arrival area. Select the checkpoint in the placement editor and click the map deliberately; review its name, coordinates and radius before saving the draft.</p>
    <p className="mt-2">Proposal physical verification: {proposal.physicalVerification}. Mapbox walking estimates do not certify safety or accessibility.</p>
    <p className="mt-2 font-bold text-amber-900">Check Piața Unirii pedestrian crossings, CP5/CP6 proximity and discovery-radius overlap, Tailors' Tower approach and unnecessary crossings. Accessibility and physical inspection remain pending.</p>
    <ol aria-label="Ordered route candidates" className="mt-3 grid gap-2 sm:grid-cols-2">
      {candidates.map(candidate => <li key={candidate.order} className="min-w-0">
        <button type="button" aria-controls={detailId} aria-expanded={selectedOrder === candidate.order} onClick={() => { setSelectedOrder(candidate.order); onInspect(candidateReference(candidate, proposal)) }} className={`min-h-11 w-full break-words rounded-lg border p-2 text-left ${selectedOrder === candidate.order ? 'border-blue-600 bg-blue-50' : 'border-amber-200 bg-white'}`}>
          <strong>{candidateLabel(candidate)} · {candidate.landmark}</strong>
        </button>
      </li>)}
    </ol>
    {selected && <section id={detailId} aria-label={`${candidateLabel(selected)} research details`} className="mt-3 space-y-2 break-words rounded-lg bg-white p-3">
      <h5 className="font-bold">{candidateLabel(selected)} · {selected.landmark}</h5>
      <p>{selected.role === 'terminal' ? 'Terminal gameplay · FinishPoint is configured in Feature 6.' : 'Normal checkpoint'}</p>
      <p><strong>Address: </strong>{selected.address}</p>
      <p><strong>Proposed exterior arrival area: </strong>{selected.arrivalArea}</p>
      <p><strong>Research confidence: </strong>{selected.confidence}</p>
      <p><strong>Physical verification: </strong>{selected.physicalVerification}</p>
      {reference ? <p role="status" className="font-bold text-blue-900">Landmark reference only: {reference.latitude}, {reference.longitude}. This is not an arrival location. No checkpoint has been placed by this inspection.</p> : <p role="status">No researched reference coordinate available. Use Search locations on the map to find this landmark; search only moves the map.</p>}
      <p className="font-bold">Outstanding verification issues</p>
      <ul className="list-disc space-y-1 pl-5">{selected.unresolvedIssues.map(issue => <li key={issue}>{issue}</li>)}</ul>
      <p className="font-bold">Supporting sources</p>
      <ul className="list-disc space-y-1 pl-5">{sources(selected.sourceIds)}</ul>
    </section>}
    <details className="mt-3">
      <summary className="min-h-11 cursor-pointer py-3 font-bold">Walking research and pending field checks</summary>
      <p>Assessment: {proposal.walkingAssessment.status}</p>
      <p className="mt-2">{proposal.walkingAssessment.orderRationale}</p>
      <ol className="mt-2 space-y-2">{proposal.walkingAssessment.legs.map(leg => <li key={`${leg.from}-${leg.to}`}><strong>{stopLabel(leg.from)} → {stopLabel(leg.to)}: </strong>{leg.proposal}<p className="mt-1">Unresolved: {leg.unresolved}</p></li>)}</ol>
      <p className="mt-2">{proposal.walkingAssessment.access}</p>
      <p className="mt-2">{proposal.walkingAssessment.accessibility}</p>
      <p className="mt-2">{proposal.walkingAssessment.construction}</p>
      <ul className="mt-2 list-disc space-y-1 pl-5">{proposal.walkingAssessment.fieldChecklist.map(item => <li key={item}>{item}</li>)}</ul>
      <ul className="mt-2 list-disc space-y-1 break-words pl-5">{sources(proposal.walkingAssessment.sourceIds)}</ul>
    </details>
  </aside>
}
