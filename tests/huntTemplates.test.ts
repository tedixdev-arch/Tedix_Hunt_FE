import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ApiClient } from '../src/services/api/client.ts';
import { HuntTemplatesApi } from '../src/services/api/huntTemplates.ts';
import type { SessionStore } from '../src/services/api/session.ts';

const session: SessionStore = {
  getAccessToken: () => 'access-token', getRefreshToken: () => null,
  saveSession: () => undefined, clearSession: () => undefined,
};

test('listHuntTemplates gets the authenticated backend catalog', async () => {
  const calls: Array<{ url: string; method: string }> = [];
  const catalog = [{ key: 'backend-only', version: 1, displayName: 'Backend Only', theme: 'Real Theme' }];
  const fetcher: typeof fetch = async (input, init) => {
    calls.push({ url: String(input), method: init?.method ?? 'GET' });
    return new Response(JSON.stringify(catalog), { headers: { 'Content-Type': 'application/json' } });
  };
  const api = new HuntTemplatesApi(new ApiClient('https://api.example.test', session, fetcher));
  assert.deepEqual(await api.listHuntTemplates(), catalog);
  assert.deepEqual(calls, [{ url: 'https://api.example.test/api/hunt-templates', method: 'GET' }]);
  assert.equal(catalog.some(template => template.theme === 'City Secrets Theme'), false);
});
