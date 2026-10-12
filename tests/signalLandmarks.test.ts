import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createCheckpointDrafts, buildGeographyConfiguration } from '../src/features/creator/checkpointGeography.ts'
import { hydratePersistedGeography } from '../src/features/creator/templatePersistence.ts'
import { prefillSignalLandmarks, researchReferences, landmarkSequence } from '../src/features/creator/signalLandmarks.ts'
import { readRouteProposal } from '../src/features/creator/routeResearch.ts'
import { resolveLandmarkAddress } from '../src/features/creator/landmarkGeocoding.ts'
import { signalClujRouteProposal } from './fixtures/signalClujRouteProposal.ts'
const proposal = readRouteProposal({ proposal: signalClujRouteProposal })!

test('prefills six geographic names and one terminal FinishPoint from research, without coordinates or metadata mutation', () => {
  const original = structuredClone(proposal)
  const result = prefillSignalLandmarks('Signal: Cluj Napoca', proposal, createCheckpointDrafts(6, []))
  assert.deepEqual([...result.drafts.map(point => point.name), result.finish!.name], proposal.candidates.map(candidate => candidate.landmark))
  assert.equal(result.drafts.length, 6)
  assert.equal('checkpointNumber' in result.finish!, false)
  assert.ok(result.drafts.every(point => point.latitude === undefined && point.longitude === undefined))
  assert.equal(result.finish!.latitude, undefined)
  assert.deepEqual(buildGeographyConfiguration(6, result.drafts).checkpointPositions, [])
  assert.deepEqual(proposal, original)
})

test('hydrated saved positions, custom labels, radius and FinishPoint are preserved; only defaults prefill', () => {
  const saved = { checkpointNumber: 1, name: 'Checkpoint 1', latitude: 47, longitude: 24, radiusMeters: 40 }
  const hydrated = hydratePersistedGeography({ normalCheckpointCount: 6, checkpointPositions: [saved] })
  hydrated.checkpointDrafts[1].name = 'Creator edited label'
  const finish = { name: 'FinishPoint', latitude: 48, longitude: 25, radiusMeters: 35 }
  const result = prefillSignalLandmarks('Signal: Cluj Napoca', proposal, hydrated.checkpointDrafts, finish)
  assert.deepEqual(result.drafts[0], saved)
  assert.equal(result.drafts[1].name, 'Creator edited label')
  assert.equal(result.drafts[2].name, proposal.candidates[2].landmark)
  assert.deepEqual(result.finish, finish)
  assert.equal(hydrated.verifiedPositions.size, 0)
  assert.deepEqual(buildGeographyConfiguration(6, result.drafts).checkpointPositions, [saved])
})

test('references require trustworthy sourced coordinates and sequence never bridges missing intermediate landmarks', () => {
  const references = researchReferences(proposal)
  assert.deepEqual(references.map(point => point.checkpointNumber), [6, 0])
  assert.deepEqual(landmarkSequence(proposal, references)?.coordinates, [[[23.5955112, 46.7683841], [23.5975153, 46.768014]]])
  const changed = structuredClone(proposal)
  changed.candidates[5].candidateGps!.sourceId = 'unknown'
  assert.deepEqual(researchReferences(changed).map(point => point.checkpointNumber), [0])
  assert.equal(landmarkSequence(changed, researchReferences(changed)), undefined)
  assert.equal(landmarkSequence(proposal, [{ ...references[0], checkpointNumber: 1 }, references[1]]), undefined)
})

const candidate = proposal.candidates[1]
const exact = { geometry: { coordinates: [23.59, 46.77] }, properties: { feature_type: 'address', match_code: { confidence: 'exact', address_number: 'matched', street: 'matched', place: 'matched' }, context: { address: { name: 'Strada Universității 5' }, place: { name: 'Cluj-Napoca' } } } }
let tokenIndex = 0
const token = () => `test-token-${tokenIndex++}`
const response = (features: unknown[]) => async () => new Response(JSON.stringify({ features }))

test('geocoding accepts only an exact single researched address and caches requests without writing geography', async () => {
  let calls = 0
  const accessToken = token()
  const request = (async (url: string) => {
    calls++
    const parsed = new URL(url)
    assert.equal(parsed.pathname, '/search/geocode/v6/forward')
    assert.equal(parsed.searchParams.get('q'), candidate.address)
    assert.equal(parsed.searchParams.get('country'), 'ro')
    assert.equal(parsed.searchParams.get('permanent'), 'false')
    return new Response(JSON.stringify({ features: [exact] }))
  }) as typeof fetch
  const result = await resolveLandmarkAddress(candidate, accessToken, request)
  assert.deepEqual(result.reference, { checkpointNumber: 2, name: candidate.landmark, latitude: 46.77, longitude: 23.59, origin: 'address' })
  assert.deepEqual(await resolveLandmarkAddress(candidate, accessToken, request), result)
  assert.equal(calls, 1)
  assert.equal(candidate.candidateGps, null)
})

test('geocoding rejects ambiguity, weak matches, fabricated/malformed coordinates and wrong city/address', async () => {
  for (const features of [[], [exact, exact], [{ ...exact, geometry: { coordinates: [] } }], [{ ...exact, geometry: { coordinates: [24, 47] } }], [{ ...exact, properties: { ...exact.properties, match_code: { ...exact.properties.match_code, confidence: 'high' } } }], [{ ...exact, properties: { ...exact.properties, context: { ...exact.properties.context, address: { name: 'Wrong street 5' } } } }], [{ ...exact, properties: { ...exact.properties, context: { ...exact.properties.context, place: { name: 'Bucharest' } } } }]]) {
    assert.equal((await resolveLandmarkAddress(candidate, token(), response(features))).reference, undefined)
  }
})

test('token unavailable, broad square address, API errors and rate limits stay unresolved', async () => {
  const unexpected = (() => { throw new Error('should not fetch') }) as typeof fetch
  assert.equal((await resolveLandmarkAddress(candidate, undefined, unexpected)).reason, 'Mapbox token unavailable')
  assert.equal((await resolveLandmarkAddress(proposal.candidates[0], token(), unexpected)).reference, undefined)
  assert.equal((await resolveLandmarkAddress(candidate, token(), unexpected)).reason, 'Mapbox address lookup unavailable')
  assert.equal((await resolveLandmarkAddress(candidate, token(), async () => new Response('', { status: 429 }))).reason, 'Mapbox rate limit reached')
  assert.equal((await resolveLandmarkAddress(candidate, token(), async () => new Response('', { status: 403 }))).reference, undefined)
})
