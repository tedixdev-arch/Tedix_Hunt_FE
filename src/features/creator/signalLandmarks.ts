import type { MultiLineString } from 'geojson'
import type { CheckpointDraft } from './checkpointGeography.ts'
import { createFinishPointDraft, type FinishPointDraft } from './finishPoint.ts'
import { candidateReference, type RouteProposal } from './routeResearch.ts'

export type LandmarkReference = { checkpointNumber: number; name: string; latitude: number; longitude: number; selected?: boolean; origin?: 'research' | 'address' }

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
