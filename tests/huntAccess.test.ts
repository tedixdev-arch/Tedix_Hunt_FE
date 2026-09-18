import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ApiClient, ApiError } from '../src/services/api/client.ts';
import { HuntAccessApi } from '../src/services/api/huntAccess.ts';
import { HuntsApi } from '../src/services/api/hunts.ts';
import type { SessionStore } from '../src/services/api/session.ts';
import { accessCreationError, accessStatusLabels, copyParticipantLink, participantLink, shareParticipantLink } from '../src/pages/participantAccess.ts';

const session: SessionStore = {
  getAccessToken: () => 'organizer-token', getRefreshToken: () => null,
  saveSession: () => undefined, clearSession: () => undefined,
};

test('organizer access POSTs to the encoded Hunt endpoint and returns the real code', async () => {
  const calls: Array<{ url: string; method?: string }> = [];
  const fetcher: typeof fetch = async (input, init) => {
    calls.push({ url: String(input), method: init?.method });
    return new Response(JSON.stringify({ huntId: 'hunt /1', code: '7KPM4XQ2' }), { headers: { 'Content-Type': 'application/json' } });
  };
  const result = await new HuntsApi(new ApiClient('https://api.example.test', session, fetcher)).createOrGetAccess('hunt /1');
  assert.deepEqual(result, { huntId: 'hunt /1', code: '7KPM4XQ2' });
  assert.equal(typeof result.code, 'string');
  assert.deepEqual(calls, [{ url: 'https://api.example.test/api/hunts/hunt%20%2F1/access', method: 'POST' }]);
});

test('public resolver encodes the code and never authenticates', async () => {
  let authorization: string | null = 'not-called';
  const fetcher: typeof fetch = async (input, init) => {
    authorization = new Headers(init?.headers).get('authorization');
    assert.equal(String(input), 'https://api.example.test/api/hunt-access/A%2FB');
    return new Response(JSON.stringify({ huntId: 'h', code: 'A/B', name: 'Saved Hunt', status: 'published' }), { headers: { 'Content-Type': 'application/json' } });
  };
  const result = await new HuntAccessApi(new ApiClient('https://api.example.test', session, fetcher)).resolve('A/B');
  assert.equal(result.name, 'Saved Hunt');
  assert.equal(authorization, null);
});

test('participant link uses its supplied current origin and encodes the backend code', () => {
  assert.equal(participantLink('https://current.example', 'A B/C'), 'https://current.example/join/A%20B%2FC');
  assert.equal(participantLink('https://current.example', '7KPM4XQ2').includes('tedixhunt.app'), false);
  assert.equal(participantLink('https://current.example', '7KPM4XQ2').includes('tedixhunt-fe-dev.anainfo.ai'), false);
});

test('access errors use safe status-specific messages', () => {
  assert.equal(accessCreationError(new ApiError('raw', 403, 'http')), "You don't have access to create participant access for this Hunt.");
  assert.equal(accessCreationError(new ApiError('raw', 404, 'http')), 'This Hunt could not be found.');
  assert.equal(accessCreationError(new ApiError('raw', 409, 'conflict')), 'Participant access cannot be created for the Hunt in its current state.');
  assert.equal(accessCreationError(new Error('raw')), "We couldn't create participant access. Please try again.");
});

test('copy and share use the real link and saved Hunt name', async () => {
  const copied: string[] = [];
  const clipboard = { writeText: async (value: string) => { copied.push(value); } };
  const shared: ShareData[] = [];
  assert.equal(await copyParticipantLink('https://current.example/join/CODE', clipboard), 'Link copied');
  assert.equal(await shareParticipantLink('https://current.example/join/CODE', 'Saved Hunt', async data => { shared.push(data); }, clipboard), '');
  assert.deepEqual(shared, [{ title: 'Join Saved Hunt', text: 'Join my TedixHunt: Saved Hunt', url: 'https://current.example/join/CODE' }]);
  assert.equal(await shareParticipantLink('https://current.example/join/CODE', 'Saved Hunt', undefined, clipboard), 'Link copied');
  assert.deepEqual(copied, ['https://current.example/join/CODE', 'https://current.example/join/CODE']);
  assert.equal(await copyParticipantLink('link', undefined), "Couldn't copy the link. Select and copy it manually.");
});

test('share cancellation is a safe status and lifecycle labels are explicit', async () => {
  assert.equal(await shareParticipantLink('link', 'Hunt', async () => { throw new DOMException('cancel', 'AbortError'); }, undefined), 'Share cancelled');
  assert.deepEqual(accessStatusLabels, {
    published: 'Ready to join', active: 'Hunt in progress', paused: 'Hunt temporarily paused',
    cancelled: 'Hunt cancelled', finished: 'Hunt finished',
  });
});
