import { expect, test, vi } from 'vitest'
import { prototypes } from '../src/features/creator/exercises/catalog'
import { personalExamples } from '../src/features/creator/exercises/personalExamples'
import { teamExamples } from '../src/features/creator/exercises/teamExamples'
import { authorPrototype, toPersistence } from '../src/features/creator/exercises/persistenceAdapter'
import { libraryPayload, libraryEditor } from '../src/features/creator/content/libraryAdapter'
import { CreatorContentApi, contentError, type LibraryContent } from '../src/services/api/creatorContent'
import { ApiClient, ApiError } from '../src/services/api/client'
import { LocalSessionStore } from '../src/services/api/session'
const metadata = { category: 'Mathematics', grade: '7', scope: { country: 'RO', region: '', city: '683506' } }
function record(exercise: LibraryContent['exercise']): LibraryContent { return { ...libraryPayload({ source: 'custom', custom: authorPrototype(prototypes[0]) }, metadata), exercise, contentId: 'content', revisionId: 'revision', ownerId: 'creator', version: 1, status: 'draft', createdAt: '', updatedAt: '' } }
for (const example of [...personalExamples, ...teamExamples]) test(`canonical Library round trip: ${example.type}/${example.id}`, () => {
  const exercise = authorPrototype(example)
  exercise.instructions += ' \\(x^2\\) '
  exercise.authored!.hints = ['first', '\\frac{a}{b}', 'third']
  exercise.persistedIdentity = { id: 'template-copy', owner: 'creator' }
  const payload = libraryPayload({ source: 'custom', custom: exercise }, metadata)
  expect(payload.exercise).not.toHaveProperty('id'); expect(payload.exercise).not.toHaveProperty('owner')
  const restored = libraryEditor({ ...record(payload.exercise), ...payload })
  expect(toPersistence(restored.draft.custom!)).toEqual(payload.exercise)
  expect(libraryPayload(restored.draft, restored.metadata)).toEqual(payload)
})
test('reject unsupported categories, grades, Navigation and unresolved specific locations', () => {
  const draft = { source: 'custom' as const, custom: authorPrototype(prototypes[0]) }
  for (const patch of [{ category: 'Starter' }, { grade: '4' }, { scope: { country: 'Romania', region: '', city: '' } }, { scope: { country: '', region: 'Cluj', city: '' } }, { scope: { country: 'RO', region: '', city: 'Cluj-Napoca' } }]) expect(() => libraryPayload(draft, { ...metadata, ...patch })).toThrow()
  expect(() => libraryPayload({ ...draft, custom: { ...draft.custom, type: 'navigation' as any } }, metadata)).toThrow()
})
test('all six API operations use existing authentication, exact revisions and baseRevisionId', async () => {
  const calls: { url: string; init?: RequestInit }[] = []
  const session = new LocalSessionStore(); session.saveSession({ accessToken: 'fixture-token' })
  const client = new ApiClient('https://fixture.test', session, async (url, init) => { calls.push({ url: String(url), init }); return new Response('{}', { headers: { 'Content-Type': 'application/json' } }) })
  const api = new CreatorContentApi(client), payload = libraryPayload({ source: 'custom', custom: authorPrototype(prototypes[0]) }, metadata)
  await api.create(payload); await api.list('cursor'); await api.get('content'); await api.update('content', 'revision', payload); await api.clone('content', 'revision'); await api.revision('content', 'revision')
  expect(calls.map(c => c.init?.method)).toEqual(['POST', 'GET', 'GET', 'PUT', 'POST', 'GET'])
  expect(calls[1].url).toContain('limit=20&after=cursor'); expect(calls[5].url).toContain('/content/revisions/revision')
  expect(JSON.parse(calls[3].init!.body as string)).toEqual({ ...payload, baseRevisionId: 'revision' })
  expect(JSON.parse(calls[4].init!.body as string)).toEqual({ baseRevisionId: 'revision' })
  for (const call of calls) expect(new Headers(call.init?.headers).get('Authorization')).toBe('Bearer fixture-token')
  session.clearSession()
})
for (const status of [400,401,403,404,409,413,500,null]) test(`contextual error ${status} hides backend details`, () => {
  expect(contentError(new ApiError('private database dump', status, 'http'))).not.toContain('private database dump')
})
