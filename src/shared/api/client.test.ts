import { describe, expect, it, vi } from 'vitest';
import { ApiClient } from './client';
import { readApiBaseUrl } from './config';

const user = { id: 'user-1', email: 'person@example.test', displayName: 'Person' };
const session = (token = 'a'.repeat(43)) => ({ user, accessToken: token, tokenType: 'Bearer', expiresIn: 900 });
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
const setup = () => { const send = vi.fn<typeof fetch>(); return { send, api: new ApiClient({ fetch: send }) }; };
function deferred<T>() { let resolve!: (value: T) => void; const promise = new Promise<T>((done) => { resolve = done; }); return { promise, resolve }; }

describe('API configuration', () => {
  it('defaults to same-origin /api and accepts a development backend', () => {
    expect(readApiBaseUrl(undefined)).toBe('/api');
    expect(readApiBaseUrl('http://localhost:3001/api/')).toBe('http://localhost:3001/api');
  });
  it.each(['//attacker.test', 'https://user:password@example.test/api', 'https://example.test/api?key=secret', 'javascript:alert(1)', '/api/../outside'])('rejects unsafe base URLs: %s', (base) => {
    expect(() => readApiBaseUrl(base)).toThrow();
  });
  it('requires HTTPS for absolute production endpoints', () => {
    expect(() => readApiBaseUrl('http://example.test/api', true)).toThrow();
    expect(readApiBaseUrl('https://api.example.test/api', true)).toBe('https://api.example.test/api');
  });
});

describe('API and session handling', () => {
  it('logs in without persisting tokens and sends the BE contract', async () => {
    const { api, send } = setup(); send.mockResolvedValueOnce(json(session()));
    const changed = vi.fn(); const unsubscribe = api.subscribe(changed);
    expect(await api.login({ email: user.email, password: 'a long test password' })).toEqual(user);
    expect(api.getUser()).toEqual(user); expect(changed).toHaveBeenCalledTimes(1 + 1);
    const [url, options] = send.mock.calls[0];
    expect(url).toBe('/api/auth/login');
    expect(options).toMatchObject({ credentials: 'include', cache: 'no-store', redirect: 'error', headers: { 'X-TedixHunt-CSRF': '1', 'Content-Type': 'application/json' } });
    expect(JSON.parse(options!.body as string)).toEqual({ email: user.email, password: 'a long test password' });
    unsubscribe();
  });
  it('registers using the canonical endpoint', async () => {
    const { api, send } = setup(); send.mockResolvedValueOnce(json(session(), 201));
    await api.register({ email: user.email, password: 'a long test password', displayName: 'Person' });
    expect(send.mock.calls[0][0]).toBe('/api/auth/register');
  });
  it('restores with the cookie and treats no session as signed out', async () => {
    const { api, send } = setup(); send.mockResolvedValueOnce(json({ error: 'unauthorized' }, 401));
    expect(await api.restore()).toBeNull(); expect(api.getUser()).toBeNull();
    expect(send.mock.calls[0][1]?.credentials).toBe('include');
    expect(send.mock.calls[0][1]?.headers).not.toHaveProperty('Authorization');
  });
  it('shares a single refresh across concurrent authenticated requests', async () => {
    const { api, send } = setup();
    send.mockResolvedValueOnce(json(session())).mockImplementation(async () => json({ ok: true }));
    await Promise.all([api.request('/one'), api.request('/two')]);
    expect(send.mock.calls.filter(([url]) => url === '/api/auth/refresh')).toHaveLength(1);
    for (const [, options] of send.mock.calls.slice(1)) expect(options?.headers).toHaveProperty('Authorization', `Bearer ${'a'.repeat(43)}`);
  });
  it('refreshes and retries a GET once after 401', async () => {
    const { api, send } = setup();
    send.mockResolvedValueOnce(json(session())).mockResolvedValueOnce(json({ error: 'unauthorized' }, 401)).mockResolvedValueOnce(json(session('b'.repeat(43)))).mockResolvedValueOnce(json({ ok: true }));
    await api.login({ email: user.email, password: 'password' });
    expect(await api.request('/protected')).toEqual({ ok: true });
    expect(send.mock.calls[3][1]?.headers).toHaveProperty('Authorization', `Bearer ${'b'.repeat(43)}`);
  });
  it('never loops on a repeated 401', async () => {
    const { api, send } = setup();
    send.mockResolvedValueOnce(json(session())).mockResolvedValueOnce(json({}, 401)).mockResolvedValueOnce(json(session('b'.repeat(43)))).mockResolvedValueOnce(json({}, 401));
    await api.login({ email: user.email, password: 'password' });
    await expect(api.request('/protected')).rejects.toMatchObject({ status: 401 }); expect(send).toHaveBeenCalledTimes(4);
  });
  it('does not replay writes after a 401', async () => {
    const { api, send } = setup(); send.mockResolvedValueOnce(json(session())).mockResolvedValueOnce(json({}, 401));
    await api.login({ email: user.email, password: 'password' });
    await expect(api.request('/hunts', { method: 'POST', body: {} })).rejects.toMatchObject({ status: 401 });
    expect(send).toHaveBeenCalledTimes(2);
  });
  it('does not refresh public requests', async () => {
    const { api, send } = setup(); send.mockResolvedValueOnce(json({}, 401));
    await expect(api.request('/public', { auth: false })).rejects.toMatchObject({ status: 401 }); expect(send).toHaveBeenCalledTimes(1);
  });
  it('clears memory and revokes on logout with the cookie and bearer token', async () => {
    const { api, send } = setup(); send.mockResolvedValueOnce(json(session())).mockResolvedValueOnce(new Response(null, { status: 204 }));
    await api.login({ email: user.email, password: 'password' }); await api.logout();
    expect(api.getUser()).toBeNull(); expect(send.mock.calls[1][0]).toBe('/api/auth/logout');
    expect(send.mock.calls[1][1]?.headers).toHaveProperty('Authorization', `Bearer ${'a'.repeat(43)}`);
  });
  it('reports logout failure instead of claiming server revocation', async () => {
    const { api, send } = setup(); send.mockResolvedValueOnce(json(session())).mockRejectedValueOnce(new TypeError('offline'));
    await api.login({ email: user.email, password: 'password' });
    await expect(api.logout()).rejects.toMatchObject({ code: 'network_error' }); expect(api.getUser()).toBeNull();
  });
  it('does not resurrect a session when logout races with refresh', async () => {
    const { api, send } = setup(); const pending = deferred<Response>(); const started = deferred<void>();
    send.mockImplementationOnce(() => { started.resolve(); return pending.promise; }).mockResolvedValueOnce(new Response(null, { status: 204 }));
    const restoring = api.restore(); const failure = expect(restoring).rejects.toMatchObject({ code: 'session_changed' });
    await started.promise; const logout = api.logout(); pending.resolve(json(session()));
    await failure; await logout; expect(api.getUser()).toBeNull();
    expect(send.mock.calls.map(([url]) => url)).toEqual(['/api/auth/refresh', '/api/auth/logout']);
  });
  it('serializes auth work through the supplied cross-tab lock', async () => {
    const send = vi.fn<typeof fetch>().mockImplementation(async () => json(session()));
    const lock = vi.fn();
    const api = new ApiClient({ fetch: send, withAuthLock: async (work) => { lock(); return work(); } });
    await api.restore(); expect(lock).toHaveBeenCalledTimes(1);
  });
  it('rejects malformed session responses', async () => {
    const { api, send } = setup(); send.mockResolvedValueOnce(json({ ...session(), accessToken: 'wrong' }));
    await expect(api.restore()).rejects.toMatchObject({ code: 'invalid_response' }); expect(api.getUser()).toBeNull();
  });
  it.each(['https://attacker.test', '//attacker.test', '/../outside', '/%2e%2e/outside', '/auth/refresh'])('blocks unsafe/generic auth request paths: %s', async (path) => {
    const { api, send } = setup(); await expect(api.request(path, { auth: false })).rejects.toMatchObject({ code: 'invalid_path' }); expect(send).not.toHaveBeenCalled();
  });
  it('does not expose HTML proxy errors or server details', async () => {
    const { api, send } = setup(); send.mockResolvedValueOnce(new Response('<h1>private hostname</h1>', { status: 502 }));
    await expect(api.request('/health', { auth: false })).rejects.toMatchObject({ status: 502, message: 'The service is temporarily unavailable.' });
  });
  it('rejects non-JSON success responses', async () => {
    const { api, send } = setup(); send.mockResolvedValueOnce(new Response('<html>frontend fallback</html>', { status: 200 }));
    await expect(api.request('/health', { auth: false })).rejects.toMatchObject({ code: 'invalid_response' });
  });
  it('preserves meaningful login errors', async () => {
    const { api, send } = setup(); send.mockResolvedValueOnce(json({ error: 'invalid_credentials', message: 'internal detail' }, 401));
    await expect(api.login({ email: user.email, password: 'wrong' })).rejects.toMatchObject({ code: 'invalid_credentials', message: 'Email or password is incorrect.' });
  });
  it('does not send an already-cancelled request', async () => {
    const { api, send } = setup(); const controller = new AbortController(); controller.abort();
    await expect(api.request('/private', { signal: controller.signal })).rejects.toMatchObject({ code: 'cancelled' }); expect(send).not.toHaveBeenCalled();
  });
  it('bounds network waits with a timeout', async () => {
    const send = vi.fn<typeof fetch>().mockImplementation((_url, options) => new Promise((_resolve, reject) => { options?.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError'))); }));
    const api = new ApiClient({ fetch: send, timeoutMs: 10 });
    await expect(api.request('/health', { auth: false })).rejects.toMatchObject({ code: 'timeout' });
  });
});
