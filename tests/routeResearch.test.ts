import assert from 'node:assert/strict'
import test from 'node:test'
import { candidateLabel, candidateReference, readRouteProposal, supportingSourceUrl } from '../src/features/creator/routeResearch.ts'
import { signalClujRouteProposal } from './fixtures/signalClujRouteProposal.ts'

test('actual BE #65 contract exposes six normal roles and terminal FinishPoint without rewriting metadata', () => {
  const research = { proposal: structuredClone(signalClujRouteProposal), futureField: { retain: true } }
  const before = structuredClone(research)
  const proposal = readRouteProposal(research)!
  assert.equal(proposal, research.proposal)
  assert.deepEqual(proposal.candidates.map(candidateLabel), ['CP1', 'CP2', 'CP3', 'CP4', 'CP5', 'CP6', 'FinishPoint'])
  assert.deepEqual(proposal.candidates.map(candidate => candidate.role), ['normal', 'normal', 'normal', 'normal', 'normal', 'normal', 'terminal'])
  assert.deepEqual(proposal.candidates.map(candidate => !!candidateReference(candidate, proposal)), [false, false, false, false, false, true, true])
  assert.deepEqual(research, before)
})

test('camera inspection requires a sourced, finite, bounded reference explicitly excluding arrival use', () => {
  const proposal = readRouteProposal({ proposal: structuredClone(signalClujRouteProposal) })!
  const candidate = proposal.candidates[5]
  const reference = candidate.candidateGps!
  for (const change of [{ latitude: NaN }, { longitude: Infinity }, { latitude: 91 }, { longitude: 181 }, { latitude: '46' }, { scope: 'arrival' }, { arrivalLocation: true }, { sourceId: 'missing' }]) {
    candidate.candidateGps = { ...reference, ...change } as typeof reference
    assert.equal(candidateReference(candidate, proposal), undefined)
  }
  candidate.candidateGps = reference
  candidate.sourceIds = []
  assert.equal(candidateReference(candidate, proposal), undefined)
})

test('legacy and unsupported metadata remain untouched and unsafe links cannot become supporting references', () => {
  for (const value of [undefined, null, {}, { proposal: null }, { proposal: { schemaVersion: 2 } }]) assert.equal(readRouteProposal(value), undefined)
  const raw = { proposal: { schemaVersion: 2, preserve: ['unknown'] } }
  assert.equal(readRouteProposal(raw), undefined)
  assert.deepEqual(raw, { proposal: { schemaVersion: 2, preserve: ['unknown'] } })
  assert.equal(supportingSourceUrl('javascript:alert(1)'), undefined)
  assert.equal(supportingSourceUrl('https://visitcluj.ro/'), 'https://visitcluj.ro/')
})
