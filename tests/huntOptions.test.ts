import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ApiClient } from '../src/services/api/client.ts';
import { HuntOptionsApi } from '../src/services/api/huntOptions.ts';
import type { SessionStore } from '../src/services/api/session.ts';

const session: SessionStore = {
  getAccessToken: () => 'access-token', getRefreshToken: () => null,
  saveSession: () => undefined, clearSession: () => undefined,
};

test('listHuntOptions gets the authenticated backend catalog', async () => {
  const calls: Array<{ url: string; method: string }> = [];
  const catalog = {
    formats: [{ key: 'team', label: 'Team Hunters' }], teamSizes: [4],
    accessModes: [{ key: 'invitation_only', label: 'Invitation-only' }],
    difficulties: [{ key: 'easy', label: 'Easy' }],
    checkpointOrders: [{ key: 'recommended', label: 'Recommended route' }],
  };
  const fetcher: typeof fetch = async (input, init) => {
    calls.push({ url: String(input), method: init?.method ?? 'GET' });
    return new Response(JSON.stringify(catalog), { headers: { 'Content-Type': 'application/json' } });
  };
  const api = new HuntOptionsApi(new ApiClient('https://api.example.test', session, fetcher));
  assert.deepEqual(await api.listHuntOptions(), catalog);
  assert.deepEqual(calls, [{ url: 'https://api.example.test/api/hunt-options', method: 'GET' }]);
});
