/** BE #65: informational content.routeResearch.proposal, never gameplay geography. */
export interface RouteCandidate {
  order: number
  role: 'normal' | 'terminal'
  checkpoint?: number
  terminalRole?: 'FinishPoint'
  landmark: string
  address: string
  arrivalArea: string
  confidence: string
  physicalVerification: string
  sourceIds: string[]
  unresolvedIssues: string[]
  candidateGps: {
    latitude: number
    longitude: number
    scope: string
    sourceId: string
    arrivalLocation: boolean
  } | null
}

export interface RouteProposal {
  schemaVersion: 1
  sources: { id: string; url: string; supports: string }[]
  candidates: RouteCandidate[]
  physicalVerification: string
  walkingAssessment: {
    status: string
    sourceIds: string[]
    orderRationale: string
    legs: { from: number; to: number; proposal: string; unresolved: string }[]
    access: string
    accessibility: string
    construction: string
    fieldChecklist: string[]
  }
}

const object = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value)
const strings = (value: unknown): value is string[] => Array.isArray(value) && value.every(item => typeof item === 'string')

/** Check the read-only view without modifying or serializing the original metadata. */
export function readRouteProposal(research: unknown): RouteProposal | undefined {
  if (!object(research) || !object(research.proposal)) return
  const proposal = research.proposal
  if (proposal.schemaVersion !== 1 || typeof proposal.physicalVerification !== 'string'
    || !Array.isArray(proposal.sources) || !proposal.sources.every(source => object(source) && ['id', 'url', 'supports'].every(key => typeof source[key] === 'string'))
    || !Array.isArray(proposal.candidates) || !proposal.candidates.length) return
  if (!proposal.candidates.every(candidate => object(candidate) && Number.isInteger(candidate.order)
    && (candidate.role === 'normal' ? Number.isInteger(candidate.checkpoint) && Number(candidate.checkpoint) > 0 : candidate.role === 'terminal' && candidate.terminalRole === 'FinishPoint')
    && ['landmark', 'address', 'arrivalArea', 'confidence', 'physicalVerification'].every(key => typeof candidate[key] === 'string')
    && strings(candidate.sourceIds) && strings(candidate.unresolvedIssues))) return
  const walking = proposal.walkingAssessment
  if (!object(walking) || !['status', 'orderRationale', 'access', 'accessibility', 'construction'].every(key => typeof walking[key] === 'string')
    || !strings(walking.sourceIds) || !strings(walking.fieldChecklist) || !Array.isArray(walking.legs)
    || !walking.legs.every(leg => object(leg) && Number.isInteger(leg.from) && Number.isInteger(leg.to) && typeof leg.proposal === 'string' && typeof leg.unresolved === 'string')) return
  return proposal as unknown as RouteProposal
}

export const candidateLabel = (candidate: RouteCandidate) => candidate.role === 'terminal' ? 'FinishPoint' : `CP${candidate.checkpoint}`

export function supportingSourceUrl(url: string): string | undefined {
  try { const parsed = new URL(url); return ['https:', 'http:'].includes(parsed.protocol) ? parsed.href : undefined } catch { return }
}

/** Only explicitly sourced landmark references may move the camera. */
export function candidateReference(candidate: RouteCandidate, proposal: RouteProposal) {
  const gps = candidate.candidateGps
  if (!gps || gps.scope !== 'landmark-reference-only' || gps.arrivalLocation !== false
    || !candidate.sourceIds.includes(gps.sourceId)
    || !proposal.sources.some(source => source.id === gps.sourceId && supportingSourceUrl(source.url))
    || !Number.isFinite(gps.latitude) || Math.abs(gps.latitude) > 90
    || !Number.isFinite(gps.longitude) || Math.abs(gps.longitude) > 180) return
  return { latitude: gps.latitude, longitude: gps.longitude, name: candidate.landmark }
}
