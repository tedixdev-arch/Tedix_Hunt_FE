import assert from 'node:assert/strict';
import { test } from 'node:test';
import { HuntsApi, type HuntListItem, type HuntStatus } from '../src/services/api/hunts.ts';
import { ApiClient } from '../src/services/api/client.ts';
import type { SessionStore } from '../src/services/api/session.ts';
import { canContinueSetup, huntSummary, lifecycleActions, mergeLifecycleResult, statusLabels } from '../src/pages/organizerHunts.ts';
import { capacityInput, general2Input, general3Input, generalSetupProgressFromNavigationState, huntDetailsInput, newHuntDefaults, optionSupported, settingsFromHunt, settingsWithTemplate, templateInput } from '../src/pages/generalSetup.ts';
import type { HuntOptions } from '../src/services/api/huntOptions.ts';

const pilotOptions: HuntOptions = {
  formats: [{ key: 'team', label: 'Team Hunters' }], teamSizes: [4],
  accessModes: [{ key: 'invitation_only', label: 'Invitation-only' }],
  difficulties: [{ key: 'easy', label: 'Easy' }],
  checkpointOrders: [{ key: 'recommended', label: 'Recommended route' }],
};

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
    format: null,
    teamSize: null,
    accessMode: null,
    difficulty: null,
    checkpointOrder: null,
    templateKey: null,
    templateVersion: null,
    templateSnapshot: null,
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

test('publish sends one POST to the encoded Hunt publish endpoint', async () => {
  const { api, calls } = apiWithCalls();
  const published = await api.publish('hunt /1');
  assert.equal(published.status, 'published');
  assert.deepEqual(calls, [{ url: 'https://api.example.test/api/hunts/hunt%20%2F1/publish', method: 'POST' }]);
});

test('updateDraft sends only templateKey for a template selection', async () => {
  const calls: string[] = [];
  const fetcher: typeof fetch = async (_input, init) => {
    calls.push(String(init?.body));
    return new Response(JSON.stringify(detailHunt('draft')), { headers: { 'Content-Type': 'application/json' } });
  };
  const api = new HuntsApi(new ApiClient('https://api.example.test', session, fetcher));
  await api.updateDraft('hunt-1', templateInput('backend-template'));
  assert.deepEqual(JSON.parse(calls[0]), { templateKey: 'backend-template' });
  for (const excluded of ['templateVersion', 'templateSnapshot', 'theme', 'mission']) {
    assert.equal(excluded in JSON.parse(calls[0]), false);
  }
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

test('saved pilot settings restore through backend option metadata and null values keep form defaults', () => {
  const saved = settingsFromHunt({
    ...detailHunt('draft'), format: 'team', teamSize: 4, accessMode: 'invitation_only',
    difficulty: 'easy', checkpointOrder: 'recommended',
  }, newHuntDefaults, pilotOptions);
  assert.deepEqual({
    format: saved.format, teamSize: saved.teamSize, access: saved.access,
    difficulty: saved.difficulty, checkpointOrder: saved.checkpointOrder,
  }, {
    format: 'Team Hunters', teamSize: '4', access: 'Invitation-only',
    difficulty: 'Easy', checkpointOrder: 'Recommended route',
  });
  const empty = settingsFromHunt(detailHunt('draft'), newHuntDefaults, pilotOptions);
  assert.equal(empty.format, newHuntDefaults.format);
  assert.equal(empty.teamSize, newHuntDefaults.teamSize);
});

test('General 2 and 3 map labels to exact backend-key payloads', () => {
  const general2 = general2Input({ ...newHuntDefaults, participants: '31', teamSize: '4' }, pilotOptions);
  const general3 = general3Input(newHuntDefaults, pilotOptions);
  assert.deepEqual(general2, { capacity: 31, format: 'team', teamSize: 4, accessMode: 'invitation_only' });
  assert.deepEqual(general3, { difficulty: 'easy', checkpointOrder: 'recommended' });
  assert.equal(typeof general2.capacity, 'number');
  assert.equal(typeof general2.teamSize, 'number');
  for (const excluded of ['mission', 'theme', 'templateKey', 'Team Hunters', 'Invitation-only']) {
    assert.equal(excluded in general2, false);
    assert.equal(excluded in general3, false);
  }
});

test('backend catalog support leaves future prototype choices unavailable', () => {
  assert.equal(optionSupported(pilotOptions.formats, 'Team Hunters'), true);
  assert.equal(optionSupported(pilotOptions.formats, 'Single Hunters'), false);
  assert.equal(pilotOptions.teamSizes.includes(5), false);
  for (const label of ['Open to everyone', 'Medium', 'Advanced', 'User set', 'Short route']) {
    assert.equal([
      ...pilotOptions.accessModes, ...pilotOptions.difficulties, ...pilotOptions.checkpointOrders,
    ].some(option => option.label === label), false);
  }
  assert.throws(() => general2Input({ ...newHuntDefaults, teamSize: '5' }, pilotOptions), /not available/);
  assert.throws(() => general3Input({ ...newHuntDefaults, difficulty: 'Medium' }, pilotOptions), /not available/);
});

test('template selection derives display metadata without overwriting the Hunt name', () => {
  const selected = settingsWithTemplate({ ...newHuntDefaults, name: 'Organizer name' }, {
    key: 'backend-template', version: 3, displayName: 'Backend Template', theme: 'Backend Theme',
  });
  assert.equal(selected.name, 'Organizer name');
  assert.equal(selected.mission, 'Backend Template');
  assert.equal(selected.theme, 'Backend Theme');
  assert.deepEqual(templateInput('backend-template'), { templateKey: 'backend-template' });
});

test('saved template snapshot restores its display identity when absent from the catalog', () => {
  const restored = settingsFromHunt({
    ...detailHunt('draft'), templateKey: 'retired-template', templateVersion: 2,
    templateSnapshot: { key: 'retired-template', version: 2, displayName: 'Retired Template', theme: 'Retired Theme', checkpointNames: [] },
  });
  assert.equal(restored.mission, 'Retired Template');
  assert.equal(restored.theme, 'Retired Theme');
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
