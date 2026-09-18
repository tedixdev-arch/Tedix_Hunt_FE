import assert from 'node:assert/strict';
import { test } from 'node:test';
import { HuntsApi, type HuntListItem, type HuntStatus } from '../src/services/api/hunts.ts';
import { ApiClient } from '../src/services/api/client.ts';
import type { SessionStore } from '../src/services/api/session.ts';
import { huntSummary, lifecycleActions, mergeLifecycleResult, statusLabels } from '../src/pages/organizerHunts.ts';

const session: SessionStore = {
  getAccessToken: () => 'access-token',
  getRefreshToken: () => null,
  saveSession: () => undefined,
  clearSession: () => undefined,
};

function hunt(status: HuntStatus, huntRoles: HuntListItem['huntRoles'] = ['organizer']): HuntListItem {
  return {
    id: `hunt-${status}`,
    organizationId: 'organization-1',
    createdByUserId: 'user-1',
    name: `${status} Hunt`,
    status,
    createdAt: '2026-09-01T10:00:00.000Z',
    updatedAt: '2026-09-17T12:30:00.000Z',
    huntRoles,
  };
}

function apiWithCalls() {
  const calls: Array<{ url: string; method: string }> = [];
  const fetcher: typeof fetch = async (input, init) => {
    calls.push({ url: String(input), method: init?.method ?? 'GET' });
    return new Response(JSON.stringify(hunt('published')), { headers: { 'Content-Type': 'application/json' } });
  };
  return { api: new HuntsApi(new ApiClient('https://api.example.test', session, fetcher)), calls };
}

test('listHunts calls the authenticated Hunt list endpoint', async () => {
  const calls: Array<{ url: string; method: string }> = [];
  const fetcher: typeof fetch = async (input, init) => {
    calls.push({ url: String(input), method: init?.method ?? 'GET' });
    return new Response('[]', { headers: { 'Content-Type': 'application/json' } });
  };
  const api = new HuntsApi(new ApiClient('https://api.example.test', session, fetcher));
  assert.deepEqual(await api.listHunts(), []);
  assert.deepEqual(calls, [{ url: 'https://api.example.test/api/hunts', method: 'GET' }]);
});

test('lifecycle methods POST to their matching Hunt endpoints', async () => {
  const { api, calls } = apiWithCalls();
  for (const action of ['publish', 'start', 'pause', 'resume', 'cancel', 'finish'] as const) {
    await api[action]('hunt /1');
  }
  assert.deepEqual(calls, ['publish', 'start', 'pause', 'resume', 'cancel', 'finish'].map((action) => ({
    url: `https://api.example.test/api/hunts/hunt%20%2F1/${action}`,
    method: 'POST',
  })));
});

test('backend Hunt statuses have the expected display labels', () => {
  assert.deepEqual(statusLabels, {
    draft: 'Draft',
    published: 'Ready to start',
    active: 'In progress',
    paused: 'Paused',
    cancelled: 'Cancelled',
    finished: 'Completed',
  });
});

test('summary counts only active Hunts and paused Hunts', () => {
  const summary = huntSummary(['active', 'active', 'paused', 'draft', 'published', 'finished', 'cancelled'].map((status) => hunt(status as HuntStatus)));
  assert.deepEqual(summary, { active: 2, needsAttention: 1 });
});

test('a supervisor never receives lifecycle mutation actions', () => {
  for (const status of Object.keys(statusLabels) as HuntStatus[]) {
    assert.deepEqual(lifecycleActions(hunt(status, ['supervisor'])), []);
  }
});

test('an organizer receives only the lifecycle actions permitted for each status', () => {
  assert.deepEqual(lifecycleActions(hunt('draft')), ['publish', 'cancel']);
  assert.deepEqual(lifecycleActions(hunt('published')), ['start', 'cancel']);
  assert.deepEqual(lifecycleActions(hunt('active')), ['pause', 'finish', 'cancel']);
  assert.deepEqual(lifecycleActions(hunt('paused')), ['resume', 'finish', 'cancel']);
  assert.deepEqual(lifecycleActions(hunt('finished')), []);
  assert.deepEqual(lifecycleActions(hunt('cancelled')), []);
});

test('a successful lifecycle result updates the Hunt while preserving list roles', () => {
  const current = hunt('draft', ['organizer', 'supervisor']);
  const { huntRoles: _ignored, ...published } = hunt('published', ['supervisor']);
  assert.deepEqual(mergeLifecycleResult(current, published), { ...published, huntRoles: ['organizer', 'supervisor'] });
});
