import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ApiClient, ApiError } from '../src/services/api/client.ts';
import { AuthApi } from '../src/services/api/auth.ts';
import { LocalSessionStore } from '../src/services/api/session.ts';

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}
const old = { accessToken: 'old-a', refreshToken: 'old-r' };
const rotated = { accessToken: 'new-a', refreshToken: 'new-r' };
const replacement = { accessToken: 'other-a', refreshToken: 'other-r' };
function setup() {
  const values = new Map<string, string>();
  let saves = 0;
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { saves += 1; values.set(key, value); },
    removeItem: (key: string) => { values.delete(key); },
  } as Storage;
  const session = new LocalSessionStore(storage);
  session.saveSession(old);
  const calls: Array<{ url: string; init?: RequestInit; response: ReturnType<typeof deferred<Response>> }> = [];
  const arrivals = new Map<number, ReturnType<typeof deferred<void>>>();
  const fetcher: typeof fetch = (url, init) => {
    const response = deferred<Response>();
    calls.push({ url: String(url), init, response });
    arrivals.get(calls.length)?.resolve();
    return response.promise;
  };
  const client = new ApiClient('https://api.test', session, fetcher);
  const auth = new AuthApi(client, session);
  const waitFor = async (count: number) => {
    if (calls.length >= count) return;
    const arrival = deferred<void>();
    arrivals.set(count, arrival);
    await arrival.promise;
  };
  const bearer = (index: number) => new Headers(calls[index].init?.headers).get('authorization');
  return { storage, session, calls, fetcher, client, auth, waitFor, bearer, saves: () => saves };
}
const unauthorized = (error: unknown) => error instanceof ApiError && error.status === 401;

test('two 401s, explicit refresh and bootstrap share one rotation across two storage wrappers', async () => {
  const h = setup();
  const other = new ApiClient('https://api.test', new LocalSessionStore(h.storage), h.fetcher);
  const first = h.client.get('/first');
  const second = other.get('/second');
  const bootstrap = h.auth.bootstrapSession();
  h.calls[0].response.resolve(json({}, 401));
  h.calls[1].response.resolve(json({}, 401));
  h.calls[2].response.resolve(json({}, 401));
  await h.waitFor(4);
  const explicit = h.auth.refresh();
  assert.equal(h.calls[3].url, 'https://api.test/api/auth/refresh');
  assert.deepEqual(JSON.parse(String(h.calls[3].init?.body)), { refreshToken: old.refreshToken });
  h.calls[3].response.resolve(json(rotated));
  await h.waitFor(7);
  assert.equal(h.calls.filter(c => c.url.endsWith('/refresh')).length, 1);
  for (let i = 4; i < 7; i++) {
    assert.equal(h.bearer(i), 'Bearer new-a');
    h.calls[i].response.resolve(json({ id: 'same-user' }));
  }
  assert.deepEqual(await first, { id: 'same-user' });
  assert.deepEqual(await second, { id: 'same-user' });
  assert.deepEqual(await bootstrap, { id: 'same-user' });
  assert.deepEqual(await explicit, rotated);
  assert.equal(h.session.getRefreshToken(), 'new-r');
  assert.equal(h.saves(), 2, 'initial login plus exactly one rotation save');
});

test('shared definitive refresh failure expires once, including late obsolete 401', async () => {
  const h = setup();
  const a = h.client.get('/a');
  const b = h.client.get('/b');
  const late = h.client.get('/late');
  const settled = Promise.allSettled([a, b, late]);
  h.calls[0].response.resolve(json({}, 401));
  h.calls[1].response.resolve(json({}, 401));
  await h.waitFor(4);
  h.calls[3].response.resolve(json({ error: 'invalid_refresh' }, 401));
  await assert.rejects(a, unauthorized);
  h.calls[2].response.resolve(json({}, 401));
  assert.ok((await settled).every(r => r.status === 'rejected'));
  assert.equal(h.calls.length, 4);
  assert.equal(h.session.getAccessToken(), null);
});

test('stale 401 reuses rotated credentials without another refresh; retry stays bounded', async () => {
  const h = setup();
  const late = h.client.get('/late');
  const explicit = h.auth.refresh();
  h.calls[1].response.resolve(json(rotated));
  await explicit;
  h.calls[0].response.resolve(json({}, 401));
  await h.waitFor(3);
  assert.equal(h.bearer(2), 'Bearer new-a');
  h.calls[2].response.resolve(json({}, 401));
  await assert.rejects(late, unauthorized);
  assert.equal(h.calls.length, 3);
});

for (const outcome of ['success', 'failure'] as const) {
  for (const action of ['logout', 'login', 'same-token-relogin'] as const) {
    test(`${action} during refresh protects replacement on old ${outcome}`, async () => {
      const h = setup();
      const request = h.client.get('/private');
      const rejected = assert.rejects(request, unauthorized);
      h.calls[0].response.resolve(json({}, 401));
      await h.waitFor(2);
      if (action === 'logout') {
        const logout = h.auth.logout();
        assert.equal(h.session.getAccessToken(), null);
        h.calls[2].response.resolve(json({ success: true }));
        await logout;
      } else {
        // Even byte-identical replacement is a new login generation.
        if (action === 'same-token-relogin') h.session.clearSession();
        h.session.saveSession(action === 'login' ? replacement : old);
      }
      h.calls[1].response.resolve(outcome === 'success' ? json(rotated) : json({}, 401));
      await rejected;
      assert.equal(h.session.getAccessToken(), action === 'logout' ? null : action === 'login' ? replacement.accessToken : old.accessToken);
      const expected = action === 'logout' ? 3 : 2;
      assert.equal(h.calls.length, expected + (outcome === 'success' ? 1 : 0));
      if (outcome === 'success') {
        assert.ok(h.calls[expected].url.endsWith('/api/auth/logout'));
        assert.equal(new Headers(h.calls[expected].init?.headers).has('authorization'), false);
        assert.deepEqual(JSON.parse(String(h.calls[expected].init?.body)), { refreshToken: rotated.refreshToken });
        h.calls[expected].response.resolve(json({ success: true }));
      }
    });
  }
}

test('late bootstrap failure and logout failure cannot clear a newer login', async () => {
  const h = setup();
  const bootstrap = h.auth.bootstrapSession();
  const logout = h.auth.logout();
  const rejected = assert.rejects(logout);
  h.session.saveSession(replacement);
  h.calls[0].response.resolve(json({}, 401));
  h.calls[1].response.resolve(json({}, 500));
  assert.equal(await bootstrap, null);
  await rejected;
  assert.equal(h.session.getAccessToken(), replacement.accessToken);
  assert.equal(h.calls.length, 2);
});

for (const body of [null, {}, { accessToken: 'a' }, { accessToken: '', refreshToken: 'r' }, { accessToken: 'a', refreshToken: 7 }]) {
  test(`malformed refresh ${JSON.stringify(body)} expires session`, async () => {
    const h = setup();
    const refresh = h.auth.refresh();
    const rejected = assert.rejects(refresh, unauthorized);
    h.calls[0].response.resolve(json(body));
    await rejected;
    assert.equal(h.session.getAccessToken(), null);
  });
}

test('invalid JSON refresh response cannot store or retain consumed credentials', async () => {
  const h = setup();
  const refresh = h.auth.refresh();
  const rejected = assert.rejects(refresh, unauthorized);
  h.calls[0].response.resolve(new Response('{', { headers: { 'content-type': 'application/json' } }));
  await rejected;
  assert.equal(h.session.getAccessToken(), null);
});

test('network failure is shared, preserves credentials, and permits subsequent explicit retry', async () => {
  const h = setup();
  const a = h.auth.refresh();
  const b = h.auth.refresh();
  const results = Promise.allSettled([a, b]);
  assert.equal(h.calls.length, 1);
  h.calls[0].response.reject(new TypeError('offline'));
  assert.ok((await results).every(r => r.status === 'rejected' && r.reason.kind === 'network'));
  assert.equal(h.session.getRefreshToken(), old.refreshToken);
  const retry = h.auth.refresh();
  assert.equal(h.calls.length, 2);
  h.calls[1].response.resolve(json(rotated));
  await retry;
  assert.equal(h.session.getRefreshToken(), rotated.refreshToken);
});

test('guest 401 expires without refresh and 403 never refreshes or clears credentials', async () => {
  const h = setup();
  h.session.saveSession({ accessToken: 'guest' });
  const guest = h.client.get('/guest');
  const expired = assert.rejects(guest, unauthorized);
  h.calls[0].response.resolve(json({}, 401));
  await expired;
  assert.equal(h.session.getAccessToken(), null);
  h.session.saveSession(replacement);
  const forbidden = h.client.get('/admin');
  const denied = assert.rejects(forbidden, (e: unknown) => e instanceof ApiError && e.status === 403);
  h.calls[1].response.resolve(json({}, 403));
  await denied;
  assert.equal(h.session.getAccessToken(), replacement.accessToken);
  assert.equal(h.calls.length, 2);
});

test('actual organizer login during refresh replaces generation and old failure cannot clear it', async () => {
  const h = setup();
  const refresh = h.auth.refresh();
  const rejected = assert.rejects(refresh, unauthorized);
  const login = h.auth.loginOrganizer({ email: 'organizer@test', password: 'password' });
  h.calls[1].response.resolve(json({ user: { id: 'organizer' }, tokens: replacement }));
  await login;
  h.calls[0].response.resolve(json({}, 401));
  await rejected;
  assert.equal(h.session.getRefreshToken(), replacement.refreshToken);
});

test('obsolete refresh cleanup cannot release a new login refresh flight', async () => {
  const h = setup();
  const oldFlight = h.auth.refresh();
  const rejected = assert.rejects(oldFlight);
  h.session.saveSession(replacement);
  const current = h.auth.refresh();
  h.calls[0].response.resolve(json({}, 401));
  await rejected;
  const waiter = h.auth.refresh();
  assert.equal(h.calls.length, 2);
  h.calls[1].response.resolve(json(rotated));
  await Promise.all([current, waiter]);
  assert.equal(h.session.getAccessToken(), rotated.accessToken);
});

test('automatic refresh network failure preserves session for explicit recovery', async () => {
  const h = setup();
  const request = h.client.get('/private');
  const rejected = assert.rejects(request, (e: unknown) => e instanceof ApiError && e.kind === 'network');
  h.calls[0].response.resolve(json({}, 401));
  await h.waitFor(2);
  h.calls[1].response.reject(new TypeError('offline'));
  await rejected;
  assert.equal(h.session.getRefreshToken(), old.refreshToken);
  const explicit = h.auth.refresh();
  h.calls[2].response.resolve(json(rotated));
  await explicit;
  const retry = h.client.get('/private');
  assert.equal(h.bearer(3), 'Bearer new-a');
  h.calls[3].response.resolve(json({ ok: true }));
  assert.deepEqual(await retry, { ok: true });
});

test('late successful authenticated response cannot supply data for a different login', async () => {
  const h = setup();
  const request = h.client.get('/private');
  const rejected = assert.rejects(request, unauthorized);
  h.session.saveSession(replacement);
  h.calls[0].response.resolve(json({ private: 'old-user-data' }));
  await rejected;
  assert.equal(h.calls.length, 1);
});

test('stale 401 after rotation successfully retries once with current credentials', async () => {
  const h = setup();
  const request = h.client.get('/private');
  const refresh = h.auth.refresh();
  h.calls[1].response.resolve(json(rotated));
  await refresh;
  h.calls[0].response.resolve(json({}, 401));
  await h.waitFor(3);
  h.calls[2].response.resolve(json({ ok: true }));
  assert.deepEqual(await request, { ok: true });
  assert.equal(h.calls.filter(c => c.url.endsWith('/refresh')).length, 1);
});

for (const first of ['A', 'B']) {
  test(`latest intended login B wins across AuthApi/storage wrappers when ${first} completes first`, async () => {
    const h = setup();
    const otherStore = new LocalSessionStore(h.storage);
    const otherAuth = new AuthApi(new ApiClient('https://api.test', otherStore, h.fetcher), otherStore);
    const a = h.auth.loginParticipant({ email: 'a@test', password: 'password' });
    const rejectedA = assert.rejects(a, unauthorized);
    const b = otherAuth.loginOrganizer({ email: 'b@test', password: 'password' });
    if (first === 'A') {
      h.calls[0].response.resolve(json({ user: { id: 'A' }, tokens: rotated }));
      await rejectedA;
      assert.equal(h.session.getAccessToken(), old.accessToken);
      h.calls[1].response.resolve(json({ user: { id: 'B' }, tokens: replacement }));
      await b;
    } else {
      h.calls[1].response.resolve(json({ user: { id: 'B' }, tokens: replacement }));
      await b;
      h.calls[0].response.resolve(json({ user: { id: 'A' }, tokens: rotated }));
      await rejectedA;
    }
    assert.equal(h.session.getAccessToken(), replacement.accessToken);
    assert.equal(h.saves(), 2, 'only initial credentials and winning B are saved');
    assert.ok(h.calls[2].url.endsWith('/logout'));
    assert.deepEqual(JSON.parse(String(h.calls[2].init?.body)), { refreshToken: rotated.refreshToken });
    assert.equal(new Headers(h.calls[2].init?.headers).has('authorization'), false);
    h.calls[2].response.resolve(json({ success: true }));
  });
}

test('logout cancels pending login even when there is no stored session', async () => {
  const h = setup();
  h.session.clearSession();
  const login = h.auth.loginAdmin({ email: 'a@test', password: 'password' });
  const rejected = assert.rejects(login, unauthorized);
  await h.auth.logout();
  assert.equal(h.calls.length, 1, 'credentialless logout needs no server request');
  h.calls[0].response.resolve(json({ user: { id: 'A' }, tokens: rotated }));
  await rejected;
  assert.equal(h.session.getAccessToken(), null);
  assert.equal(h.saves(), 1, 'pending login credentials never persisted');
  h.calls[1].response.resolve(json({ success: true }));
});

for (const newer of [replacement, old]) {
  test(`direct session replacement cancels pending login (${newer.accessToken})`, async () => {
    const h = setup();
    const login = h.auth.loginCreator({ email: 'a@test', password: 'password' });
    const rejected = assert.rejects(login, unauthorized);
    h.session.clearSession();
    h.session.saveSession(newer);
    h.calls[0].response.resolve(json({ user: { id: 'A' }, tokens: rotated }));
    await rejected;
    assert.equal(h.session.getAccessToken(), newer.accessToken);
    assert.equal(h.session.getRefreshToken(), newer.refreshToken);
    h.calls[1].response.resolve(json({ success: true }));
  });
}

test('a failed latest login does not make an earlier successful login eligible again', async () => {
  const h = setup();
  const a = h.auth.loginParticipant({ email: 'a@test', password: 'password' });
  const rejectedA = assert.rejects(a, unauthorized);
  const b = h.auth.loginParticipant({ email: 'b@test', password: 'password' });
  const rejectedB = assert.rejects(b);
  h.calls[1].response.resolve(json({}, 500));
  await rejectedB;
  h.calls[0].response.resolve(json({ user: { id: 'A' }, tokens: rotated }));
  await rejectedA;
  assert.equal(h.session.getRefreshToken(), old.refreshToken);
  assert.equal(h.saves(), 1);
  h.calls[2].response.resolve(json({ success: true }));
});

const authenticationStarts = [
  { name: 'participant registration', start: (auth: AuthApi) => auth.registerParticipant({ email: 'a@test', password: 'password', name: 'A' }) },
  { name: 'admin activation', start: (auth: AuthApi) => auth.activateAdmin({ token: 'activation', password: 'password' }) },
  { name: 'creator activation', start: (auth: AuthApi) => auth.activateCreator({ token: 'activation', password: 'password' }) },
  { name: 'organizer activation', start: (auth: AuthApi) => auth.activateDirectOrganizer({ token: 'activation', password: 'password' }) },
  { name: 'guest creation', start: (auth: AuthApi) => auth.createGuestSession({ name: 'A' }) },
];
for (const operation of authenticationStarts) {
  test(`${operation.name} shares latest-intended authentication ordering`, async () => {
    const h = setup();
    const earlier = operation.start(h.auth);
    const rejected = assert.rejects(earlier, unauthorized);
    const latest = h.auth.loginParticipant({ email: 'b@test', password: 'password' });
    const tokens = operation.name === 'guest creation' ? { accessToken: 'guest' } : rotated;
    h.calls[0].response.resolve(json({ user: { id: 'A' }, tokens }));
    await rejected;
    assert.equal(h.session.getAccessToken(), old.accessToken);
    h.calls[1].response.resolve(json({ user: { id: 'B' }, tokens: replacement }));
    await latest;
    assert.equal(h.session.getAccessToken(), replacement.accessToken);
    if (operation.name !== 'guest creation') h.calls[2].response.resolve(json({ success: true }));
  });
}

test('a current login can commit after the originating session refresh rotates credentials', async () => {
  const h = setup();
  const login = h.auth.loginParticipant({ email: 'b@test', password: 'password' });
  const refresh = h.auth.refresh();
  h.calls[1].response.resolve(json(rotated));
  await refresh;
  h.calls[0].response.resolve(json({ user: { id: 'B' }, tokens: replacement }));
  await login;
  assert.equal(h.session.getAccessToken(), replacement.accessToken);
});
