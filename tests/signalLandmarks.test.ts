import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createCheckpointDrafts, buildGeographyConfiguration } from '../src/features/creator/checkpointGeography.ts'
import { hydratePersistedGeography } from '../src/features/creator/templatePersistence.ts'
import { prefillSignalLandmarks, researchReferences, signalLandmarkReferences, landmarkSequence } from '../src/features/creator/signalLandmarks.ts'
import { readRouteProposal } from '../src/features/creator/routeResearch.ts'
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

test('all seven identifiable landmarks have display-only references with source metadata, while backend coordinates retain authority', () => {
  const original = structuredClone(proposal)
  const references = signalLandmarkReferences(proposal)
  assert.deepEqual(references.map(point => point.checkpointNumber), [1, 2, 3, 4, 5, 6, 0])
  assert.deepEqual(references.map(point => point.origin), ['supplement', 'supplement', 'supplement', 'supplement', 'supplement', 'research', 'research'])
  assert.equal(references[0].metadata!.identifier.includes('Q368963'), true)
  assert.equal(references[2].metadata!.identifier.includes('Q42855318'), true)
  assert.ok(references.every(point => point.metadata!.sourceUrls.length > 0 && point.metadata!.uncertainty && point.metadata!.method))
  assert.equal(references[5].latitude, 46.7683841)
  assert.equal(references[6].longitude, 23.5975153)
  assert.equal(landmarkSequence(proposal, references)!.coordinates.length, 6)
  assert.deepEqual(proposal, original)
  assert.ok(references.every(point => !('radiusMeters' in point) && !('verified' in point)))
  const changed = structuredClone(proposal)
  changed.candidates[0].candidateGps = { ...changed.candidates[5].candidateGps!, latitude: 46.77, longitude: 23.59, sourceId: 'unirii' }
  assert.equal(signalLandmarkReferences(changed)[0].origin, 'research')
  assert.equal(signalLandmarkReferences(changed)[0].latitude, 46.77)
})

test('supplements cannot identify changed candidates, missing registry sources, malformed backend coordinates or unrelated cities', () => {
  for (const change of [
    (p: typeof proposal) => { p.candidates[2].landmark = 'Different UBB building' },
    (p: typeof proposal) => { p.sources = p.sources.filter(source => source.id !== 'ubb') },
    (p: typeof proposal) => { p.candidates[2].candidateGps = { ...p.candidates[5].candidateGps!, latitude: NaN } },
    (p: typeof proposal) => { p.candidates[2].address = 'Another city' },
  ]) {
    const changed = structuredClone(proposal)
    change(changed)
    const references = signalLandmarkReferences(changed)
    assert.ok(!references.some(point => point.checkpointNumber === 3))
    const line = landmarkSequence(changed, references)
    assert.ok(!line?.coordinates.some(pair => references.find(point => point.checkpointNumber === 2)?.longitude === pair[0][0] && references.find(point => point.checkpointNumber === 4)?.longitude === pair[1][0]))
  }
})
