import assert from 'node:assert/strict'
import { test } from 'node:test'
import { ApiClient, ApiError } from '../src/services/api/client.ts'
import { CreatorTemplatesApi } from '../src/services/api/creatorTemplates.ts'
import { creatorTemplateError } from '../src/features/creator/templatePersistence.ts'
import { readRouteProposal } from '../src/features/creator/routeResearch.ts'
import { prefillSignalLandmarks, signalLandmarkReferences, landmarkSequence } from '../src/features/creator/signalLandmarks.ts'
import { createCheckpointDrafts, buildGeographyConfiguration } from '../src/features/creator/checkpointGeography.ts'
import { signalOverloadRouteProposal } from './fixtures/signalOverloadRouteProposal.ts'
import { signalClujRouteProposal } from './fixtures/signalClujRouteProposal.ts'

const session = { getAccessToken: () => 'creator-token', getRefreshToken: () => null, saveSession: () => {}, clearSession: () => {} }
test('Overload uses its authenticated POST only, deduplicates and retries with no original starter fallback', async () => {
  const calls: { url: string; init?: RequestInit }[] = []
  let complete!: (response: Response) => void
  const api = new CreatorTemplatesApi(new ApiClient('https://api.test', session, async (url, init) => {
    calls.push({ url: String(url), init }); return new Promise(resolve => { complete = resolve })
  }))
  const first = api.createSignalOverloadClujDraft()
  assert.equal(first, api.createSignalOverloadClujDraft())
  assert.equal(calls[0].url, 'https://api.test/api/creator/templates/starters/signal-overload-cluj-napoca')
  assert.equal(calls[0].init?.method, 'POST')
  assert.equal(new Headers(calls[0].init?.headers).get('Authorization'), 'Bearer creator-token')
  complete(new Response('{}', { status: 404 }))
  await assert.rejects(first, error => error instanceof ApiError && error.status === 404)
  assert.equal(calls.length, 1)
  assert.match(creatorTemplateError(new ApiError('Missing', 404, 'http'), 'starter'), /starter is unavailable/)
  const retry = api.createSignalOverloadClujDraft()
  complete(new Response(JSON.stringify({ key: 'independent', version: 1, status: 'draft', origin: 'starter', content: {} }), { status: 201, headers: { 'content-type': 'application/json' } }))
  assert.equal((await retry).origin, 'starter')
  assert.equal(calls.length, 2)
  assert.ok(calls.every(call => call.url.endsWith('/signal-overload-cluj-napoca')))
})

test('Overload keeps BE order, all seven identity references, sources and terminal monument mapping', () => {
  const proposal = readRouteProposal({ proposal: signalOverloadRouteProposal })!
  const original = structuredClone(proposal)
  const refs = signalLandmarkReferences(proposal)
  const old = signalLandmarkReferences(readRouteProposal({ proposal: signalClujRouteProposal })!)
  assert.equal(refs.length, 7)
  assert.deepEqual(refs.map(ref => ref.checkpointNumber), [1, 2, 3, 4, 5, 6, 0])
  assert.deepEqual(refs.map(ref => ref.name), proposal.candidates.map(candidate => candidate.landmark))
  assert.match(refs[0].name, /Tailors/); assert.match(refs[6].name, /Matthias/)
  for (const ref of refs) {
    const previous = old.find(point => point.name === ref.name)!
    assert.equal(ref.latitude, previous.latitude); assert.equal(ref.longitude, previous.longitude)
    assert.deepEqual(ref.metadata, previous.metadata)
  }
  assert.deepEqual(landmarkSequence(proposal, refs)?.coordinates, refs.slice(1).map((ref, i) => [[refs[i].longitude, refs[i].latitude], [ref.longitude, ref.latitude]]))
  const prefilled = prefillSignalLandmarks('Signal Overload - Cluj Napoca', proposal, createCheckpointDrafts(6, []))
  assert.deepEqual(prefilled.drafts.map(point => point.name), refs.slice(0, 6).map(ref => ref.name))
  assert.equal(prefilled.finish?.name, refs[6].name)
  assert.deepEqual(buildGeographyConfiguration(6, prefilled.drafts).checkpointPositions, [])
  assert.equal(prefilled.finish?.latitude, undefined)
  assert.deepEqual(proposal, original)
})

test('supplement identity reuse includes new terminal F; valid BE coordinates take precedence', () => {
  const proposal = readRouteProposal({ proposal: structuredClone(signalOverloadRouteProposal) })!
  assert.equal(signalLandmarkReferences(proposal).length, 7)
  proposal.candidates[0].candidateGps = { latitude: 47, longitude: 24, scope: 'landmark-reference-only', sourceId: 'tower', arrivalLocation: false }
  assert.equal(signalLandmarkReferences(proposal)[0].latitude, 47)
})
