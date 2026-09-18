import assert from 'node:assert/strict';
import { test } from 'node:test';
import { HuntsApi, type HuntListItem, type HuntStatus } from '../src/services/api/hunts.ts';
import { ApiClient } from '../src/services/api/client.ts';
import type { SessionStore } from '../src/services/api/session.ts';
import { canContinueSetup, huntSummary, lifecycleActions, mergeLifecycleResult, statusLabels } from '../src/pages/organizerHunts.ts';
import { capacityInput, generalSetupProgressFromNavigationState, huntDetailsInput, newHuntDefaults, settingsFromHunt } from '../src/pages/generalSetup.ts';

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
    country: null,
    region: null,
    city: null,
    startDate: null,
    startTime: null,
    timezone: null,
    durationMinutes: null,
    capacity: null,
    contactName: null,
  };
}

function detailHunt(status: HuntStatus) {
  const { huntRoles: _huntRoles, ...detail } = hunt(status);
  return detail;
}

function apiWithCalls() {
  const calls: Array<{ url: string; method: string }> = [];
  const fetcher: typeof fetch = async (input, init) => {
    calls.push({ url: String(input), method: init?.method ?? 'GET' });
    return new Response(JSON.stringify(detailHunt('published')), { headers: { 'Content-Type': 'application/json' } });
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

test('draft API methods use POST, GET, and PATCH with encoded Hunt routes', async () => {
  const calls: Array<{ url: string; method: string; body?: string }> = [];
  const fetcher: typeof fetch = async (input, init) => {
    calls.push({ url: String(input), method: init?.method ?? 'GET', body: init?.body?.toString() });
    return new Response(JSON.stringify(detailHunt('draft')), { headers: { 'Content-Type': 'application/json' } });
  };
  const api = new HuntsApi(new ApiClient('https://api.example.test', session, fetcher));
  await api.createDraft({ organizationId: 'org-1', name: 'My Hunt' });
  await api.getHunt('hunt /1');
  await api.updateDraft('hunt /1', { capacity: 24 });
  assert.deepEqual(calls, [
    { url: 'https://api.example.test/api/hunts', method: 'POST', body: JSON.stringify({ organizationId: 'org-1', name: 'My Hunt' }) },
    { url: 'https://api.example.test/api/hunts/hunt%20%2F1', method: 'GET', body: undefined },
    { url: 'https://api.example.test/api/hunts/hunt%20%2F1', method: 'PATCH', body: JSON.stringify({ capacity: 24 }) },
  ]);
});

test('General Setup maps backend values and normalizes time without prototype fallbacks', () => {
  const restored = settingsFromHunt({
    ...hunt('draft'), name: 'Saved Hunt', country: null, region: null, city: 'Iași', startDate: null,
    startTime: '10:00:00', timezone: null, durationMinutes: null, capacity: null, contactName: null,
  });
  assert.equal(restored.name, 'Saved Hunt');
  assert.equal(restored.time, '10:00');
  assert.equal(restored.country, '');
  assert.equal(restored.duration, '');
  assert.equal(restored.participants, '');
});

test('General Setup converts numeric strings and sends only D1 section fields', () => {
  const details = huntDetailsInput({ ...newHuntDefaults, duration: '105' });
  const capacity = capacityInput({ ...newHuntDefaults, participants: '31' });
  assert.equal(details.durationMinutes, 105);
  assert.equal(typeof details.durationMinutes, 'number');
  assert.deepEqual(Object.keys(details).sort(), ['city', 'contactName', 'country', 'durationMinutes', 'name', 'region', 'startDate', 'startTime', 'timezone'].sort());
  assert.deepEqual(capacity, { capacity: 31 });
  assert.throws(() => capacityInput({ ...newHuntDefaults, participants: '0' }), /at least 1/);
});

test('new-Hunt navigation state resumes at General 2 with General 1 complete', () => {
  const resumed = generalSetupProgressFromNavigationState({ resumeGeneralSection: 1 });
  assert.equal(resumed.activeSection, 1);
  assert.deepEqual([...resumed.completedSections], [0]);

  const reopened = generalSetupProgressFromNavigationState(null);
  assert.equal(reopened.activeSection, 0);
  assert.deepEqual([...reopened.completedSections], []);
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

test('only draft organizers can continue setup', () => {
  assert.equal(canContinueSetup(hunt('draft', ['organizer'])), true);
  assert.equal(canContinueSetup(hunt('draft', ['supervisor'])), false);
  assert.equal(canContinueSetup(hunt('published', ['organizer'])), false);
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
