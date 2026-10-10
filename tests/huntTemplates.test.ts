import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { ApiClient, ApiError } from '../src/services/api/client.ts';
import { HuntTemplatesApi } from '../src/services/api/huntTemplates.ts';
import type { SessionStore } from '../src/services/api/session.ts';

const session: SessionStore = {
  getAccessToken: () => 'access-token', getRefreshToken: () => null,
  saveSession: () => undefined, clearSession: () => undefined,
};

test('approved geography uses authenticated GET, encodes catalog keys and preserves optional saved fields', async () => {
  const controller = new AbortController();
  const geography = { key: 'trail /?#', version: 3, configuration: { checkpointPositions: [{ checkpointNumber: 5, name: '  Saved  ', latitude: 0 }], finishPoint: {} } };
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  const api = new HuntTemplatesApi(new ApiClient('https://api.example.test', session, async (url, init) => {
    calls.push({ url: String(url), init });
    return new Response(JSON.stringify(geography), { headers: { 'Content-Type': 'application/json' } });
  }));
  assert.deepEqual(await api.getApprovedGeography(geography.key, controller.signal), geography);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://api.example.test/api/hunt-templates/trail%20%2F%3F%23/geography');
  assert.equal(calls[0].init?.method, 'GET');
  assert.equal(new Headers(calls[0].init?.headers).get('Authorization'), 'Bearer access-token');
  assert.equal(calls[0].init?.signal, controller.signal);
  assert.equal(calls[0].init?.body, undefined);
});

for (const status of [401, 404, 409]) test(`approved geography retains API error status ${status}`, async () => {
  const api = new HuntTemplatesApi(new ApiClient('https://api.example.test', session, async () => new Response(JSON.stringify({ error: status === 409 ? 'template_geography_unavailable' : 'not_found' }), { status, headers: { 'Content-Type': 'application/json' } })));
  await assert.rejects(api.getApprovedGeography('trail'), (error: unknown) => error instanceof ApiError && error.status === status);
});

test('listHuntTemplates gets the authenticated backend catalog', async () => {
  const calls: Array<{ url: string; method: string }> = [];
  const catalog = [
    { key: 'signal-cluj', version: 2, displayName: 'Signal: Cluj Napoca', theme: 'Signal' },
    { key: 'creator-math-trail', version: 3, displayName: 'Math Trail', theme: 'Mathematics' },
  ];
  const fetcher: typeof fetch = async (input, init) => {
    calls.push({ url: String(input), method: init?.method ?? 'GET' });
    return new Response(JSON.stringify(catalog), { headers: { 'Content-Type': 'application/json' } });
  };
  const api = new HuntTemplatesApi(new ApiClient('https://api.example.test', session, fetcher));
  assert.deepEqual(await api.listHuntTemplates(), catalog);
  assert.deepEqual(calls, [{ url: 'https://api.example.test/api/hunt-templates', method: 'GET' }]);
  assert.equal(catalog.some(template => template.key === 'creator-math-trail' && template.displayName === 'Math Trail' && template.version === 3), true);
  assert.equal(catalog.some(template => template.displayName === 'The City Code'), false);
});

test('Organizer Quick Setup renders only the approved catalog and its safe states', () => {
  const editor = readFileSync(new URL('../src/pages/CustomHuntEditor.tsx', import.meta.url), 'utf8');
  const legacySetup = readFileSync(new URL('../src/pages/OrganizerSetupFlow.tsx', import.meta.url), 'utf8');

  assert.match(editor, /huntTemplatesApi\.listHuntTemplates\(\)/);
  assert.match(editor, /templates\.map\(template=><option key=\{template\.key\} value=\{template\.key\}>\{template\.displayName\}/);
  assert.match(editor, /Loading Hunt templates/);
  assert.match(editor, /We couldn't load Hunt templates/);
  assert.match(editor, /onClick=\{onRetryTemplates\}/);
  assert.match(editor, /No approved Competition Templates are currently available/);
  assert.match(editor, /Saved template · no longer available/);
  assert.match(editor, /savedTemplateSnapshot\.displayName/);
  assert.doesNotMatch(legacySetup, /The City Code/);
  assert.doesNotMatch(legacySetup, /<option>Signal: Cluj Napoca<\/option>/);
});
