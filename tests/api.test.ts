import assert from 'node:assert/strict';
import { test } from 'node:test';
import { AuthApi } from '../src/services/api/auth.ts';
import { ApiClient, ApiError } from '../src/services/api/client.ts';
import { buildApiUrl } from '../src/services/api/config.ts';
import type { SessionStore, SessionTokens } from '../src/services/api/session.ts';

class MemorySession implements SessionStore {
  tokens: SessionTokens | null = null;
  clearCount = 0;

  getAccessToken() { return this.tokens?.accessToken ?? null; }
  getRefreshToken() { return this.tokens?.refreshToken ?? null; }
  saveSession(tokens: SessionTokens) { this.tokens = tokens; }
  clearSession() { this.tokens = null; this.clearCount += 1; }
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function user(overrides: Record<string, unknown> = {}) {
  return {
    id: 'user-1',
    email: 'user@example.test',
    name: 'Test User',
    role: 'participant',
    isGuest: false,
    tedixUserId: null,
    createdAt: '2026-09-17T00:00:00.000Z',
    ...overrides,
  };
}

function mockClient(responses: Response[], session = new MemorySession()) {
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  const fetcher: typeof fetch = async (url, init) => {
    calls.push({ url: String(url), init });
    const response = responses.shift();
    assert.ok(response, 'unexpected fetch call');
    return response;
  };
  return { client: new ApiClient('https://api.example.test/', session, fetcher), session, calls };
}

test('buildApiUrl joins base URLs and paths without duplicate slashes', () => {
  assert.equal(buildApiUrl('api/auth/me', 'https://api.example.test/'), 'https://api.example.test/api/auth/me');
});

test('POST sends and parses JSON', async () => {
  const { client, calls } = mockClient([json({ ok: true })]);
  assert.deepEqual(await client.post('/items', { name: 'hunt' }, { authenticated: false }), { ok: true });
  assert.equal(new Headers(calls[0].init?.headers).get('content-type'), 'application/json');
  assert.equal(calls[0].init?.body, JSON.stringify({ name: 'hunt' }));
});

test('access token is attached when available', async () => {
  const session = new MemorySession();
  session.tokens = { accessToken: 'access' };
  const { client, calls } = mockClient([json({})], session);
  await client.get('/private');
  assert.equal(new Headers(calls[0].init?.headers).get('authorization'), 'Bearer access');
});

test('Authorization is omitted without an access token', async () => {
  const { client, calls } = mockClient([json({})]);
  await client.get('/public');
  assert.equal(new Headers(calls[0].init?.headers).has('authorization'), false);
});

test('successful login stores registered-session tokens', async () => {
  const payload = { user: user({ role: 'creator' }), tokens: { accessToken: 'a', refreshToken: 'r' } };
  const { client, session } = mockClient([json(payload)]);
  assert.deepEqual(await new AuthApi(client, session).loginCreator({ email: 'a@b.test', password: 'password' }), payload);
  assert.deepEqual(session.tokens, { accessToken: 'a', refreshToken: 'r' });
});

test('participant login stores nested response tokens', async () => {
  const payload = { user: user(), tokens: { accessToken: 'participant-a', refreshToken: 'participant-r' } };
  const { client, session } = mockClient([json(payload)]);
  await new AuthApi(client, session).loginParticipant({ email: 'participant@example.test', password: 'password' });
  assert.deepEqual(session.tokens, { accessToken: 'participant-a', refreshToken: 'participant-r' });
});

test('guest session stores only its access token', async () => {
  const payload = {
    user: user({ id: 'guest', email: null, name: 'Guest', role: 'guest', isGuest: true }),
    tokens: { accessToken: 'guest-a' },
  };
  const { client, session } = mockClient([json(payload)]);
  await new AuthApi(client, session).createGuestSession({ name: 'Guest' });
  assert.deepEqual(session.tokens, { accessToken: 'guest-a' });
});

test('registration sends name using the backend field name', async () => {
  const payload = { user: user({ role: 'creator' }), tokens: { accessToken: 'a', refreshToken: 'r' } };
  const { client, session, calls } = mockClient([json(payload)]);
  await new AuthApi(client, session).registerCreator({
    email: 'creator@example.test', password: 'password', name: 'Creator Name',
  });
  assert.deepEqual(JSON.parse(String(calls[0].init?.body)), {
    email: 'creator@example.test', password: 'password', name: 'Creator Name',
  });
  assert.equal('displayName' in JSON.parse(String(calls[0].init?.body)), false);
});

test('explicit refresh updates stored tokens', async () => {
  const session = new MemorySession();
  session.tokens = { accessToken: 'old-a', refreshToken: 'old-r' };
  const payload = { accessToken: 'new-a', refreshToken: 'new-r' };
  const { client } = mockClient([json(payload)], session);
  await new AuthApi(client, session).refresh();
  assert.deepEqual(session.tokens, { accessToken: 'new-a', refreshToken: 'new-r' });
});

test('401 refreshes once and retries with the new access token', async () => {
  const session = new MemorySession();
  session.tokens = { accessToken: 'old-a', refreshToken: 'refresh' };
  const { client, calls } = mockClient([
    json({ message: 'expired' }, 401),
    json({ accessToken: 'new-a', refreshToken: 'new-r' }),
    json({ id: 'user' }),
  ], session);
  assert.deepEqual(await client.get('/api/auth/me'), { id: 'user' });
  assert.equal(calls.length, 3);
  assert.equal(new Headers(calls[2].init?.headers).get('authorization'), 'Bearer new-a');
});

test('failed refresh clears the session and surfaces authentication error', async () => {
  const session = new MemorySession();
  session.tokens = { accessToken: 'old-a', refreshToken: 'refresh' };
  const { client, calls } = mockClient([json({}, 401), json({}, 401)], session);
  await assert.rejects(client.get('/private'), (error: unknown) => {
    assert.ok(error instanceof ApiError);
    assert.equal(error.status, 401);
    return true;
  });
  assert.equal(calls.length, 2);
  assert.equal(session.tokens, null);
});

test('refresh endpoint does not recursively refresh', async () => {
  const session = new MemorySession();
  session.tokens = { accessToken: 'old-a', refreshToken: 'refresh' };
  const { client, calls } = mockClient([json({}, 401)], session);
  await assert.rejects(client.post('/api/auth/refresh', { refreshToken: 'refresh' }));
  assert.equal(calls.length, 1);
});

test('logout clears local session even when the backend rejects it', async () => {
  const session = new MemorySession();
  session.tokens = { accessToken: 'a', refreshToken: 'r' };
  const { client } = mockClient([json({}, 500)], session);
  await assert.rejects(new AuthApi(client, session).logout());
  assert.equal(session.tokens, null);
});

test('guest logout clears locally without calling the backend', async () => {
  const session = new MemorySession();
  session.tokens = { accessToken: 'guest-a' };
  const { client, calls } = mockClient([], session);
  await new AuthApi(client, session).logout();
  assert.equal(session.tokens, null);
  assert.equal(calls.length, 0);
});

test('/me returns current-user data', async () => {
  const currentUser = user({ id: '7' });
  const { client, session } = mockClient([json(currentUser)]);
  assert.deepEqual(await new AuthApi(client, session).me(), currentUser);
});
