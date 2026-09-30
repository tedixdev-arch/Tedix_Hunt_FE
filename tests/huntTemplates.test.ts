import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
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
