import { signalClujReferences } from './signalClujReferences.ts'
import type { MultiLineString } from 'geojson'
import type { CheckpointDraft } from './checkpointGeography.ts'
import { createFinishPointDraft, type FinishPointDraft } from './finishPoint.ts'
import { candidateReference, type RouteProposal } from './routeResearch.ts'

export type ReferenceMetadata = { identifier: string; sourceUrls: readonly string[]; method: string; confidence: string; uncertainty: string; attribution: string }
export type LandmarkReference = { checkpointNumber: number; name: string; latitude: number; longitude: number; selected?: boolean; origin?: 'research' | 'supplement'; metadata?: ReferenceMetadata }

export function isSignalClujProposal(name: string, proposal?: RouteProposal): boolean {
  return !!proposal && (/signal\s*:?\s*cluj[ -]napoca/i.test(name) || proposal.candidates.every(candidate => /cluj[ -]napoca/i.test(candidate.address)))
}

/** Initial hydration only. Saved positions and non-default Creator labels are authoritative. */
export function prefillSignalLandmarks(name: string, proposal: RouteProposal | undefined, drafts: CheckpointDraft[], finish?: FinishPointDraft, defaultNames: string[] = []) {
  if (!isSignalClujProposal(name, proposal)) return { drafts, finish }
  const missing = (point: { name: string; latitude?: number; longitude?: number }, defaults: string[]) => point.latitude === undefined && point.longitude === undefined && (!point.name.trim() || defaults.includes(point.name))
  return {
    drafts: drafts.map(point => {
      const candidate = proposal!.candidates.find(candidate => candidate.role === 'normal' && candidate.checkpoint === point.checkpointNumber)
      return candidate && missing(point, [`Checkpoint ${point.checkpointNumber}`, defaultNames[point.checkpointNumber - 1]]) ? { ...point, name: candidate.landmark } : point
    }),
    finish: (() => {
      const candidate = proposal!.candidates.find(candidate => candidate.role === 'terminal' && candidate.terminalRole === 'FinishPoint')
      const point = finish ?? createFinishPointDraft()
      return candidate && missing(point, ['FinishPoint']) ? { ...point, name: candidate.landmark } : finish
    })(),
  }
}

export function researchReferences(proposal: RouteProposal): LandmarkReference[] {
  return [...proposal.candidates].sort((a, b) => a.order - b.order).flatMap(candidate => {
    const reference = candidateReference(candidate, proposal)
    return reference ? [{ ...reference, checkpointNumber: candidate.role === 'terminal' ? 0 : candidate.checkpoint!, origin: 'research' as const }] : []
  })
}

/** Backend coordinates take precedence. Supplements require exact existing research identity,
 * source registry association and Cluj context; unknown/replaced landmarks remain unresolved.
 */
export function signalLandmarkReferences(proposal: RouteProposal): LandmarkReference[] {
  if (!isSignalClujProposal('', proposal)) return researchReferences(proposal)
  return [...proposal.candidates].sort((a, b) => a.order - b.order).flatMap<LandmarkReference>(candidate => {
    const checkpointNumber = candidate.role === 'terminal' ? 0 : candidate.checkpoint!
    const reference = candidateReference(candidate, proposal)
    if (reference) {
      const source = proposal.sources.find(source => source.id === candidate.candidateGps!.sourceId)!
      return [{ ...reference, checkpointNumber, origin: 'research' as const, metadata: {
        identifier: `Backend research source: ${source.id}`,
        sourceUrls: [source.url], method: 'Existing explicitly sourced landmark-reference-only backend coordinate.',
        confidence: candidate.confidence, uncertainty: candidate.unresolvedIssues.join(' '), attribution: 'VisitCluj · backend route research',
      } }]
    }
    const supplement = signalClujReferences.find(item => item.landmark === candidate.landmark
      && candidate.sourceIds.includes(item.researchSourceId)
      && proposal.sources.some(source => source.id === item.researchSourceId && (item.sourceUrls as readonly string[]).includes(source.url)))
    // A malformed or conflicting backend coordinate must not be silently replaced.
    if (!supplement || candidate.candidateGps != null) return []
    const { latitude, longitude, identifier, sourceUrls, method, confidence, uncertainty, attribution } = supplement
    return [{ checkpointNumber, name: candidate.landmark, latitude, longitude, origin: 'supplement' as const,
      metadata: { identifier, sourceUrls, method, confidence, uncertainty, attribution } }]
  })
}

/** Connect adjacent proposed entries only; a missing intermediate entry breaks the line. */
export function landmarkSequence(proposal: RouteProposal, references: LandmarkReference[]): MultiLineString | undefined {
  const candidates = [...proposal.candidates].sort((a, b) => a.order - b.order)
  const coordinates: number[][][] = []
  for (let index = 1; index < candidates.length; index++) {
    const pair = candidates.slice(index - 1, index + 1).map(candidate => references.find(reference => reference.checkpointNumber === (candidate.role === 'terminal' ? 0 : candidate.checkpoint)))
    if (pair[0] && pair[1]) coordinates.push(pair.map(point => [point!.longitude, point!.latitude]))
  }
  return coordinates.length ? { type: 'MultiLineString', coordinates } : undefined
}
