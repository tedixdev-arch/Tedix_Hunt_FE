import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { Hunt } from '../src/services/api/hunts.ts';
import type { HuntOptions } from '../src/services/api/huntOptions.ts';
import { formatDate, formatLocation, formatTime, parseHuntNotReady, reviewHunt, reviewOptionLabels, reviewRefreshError } from '../src/pages/huntReview.ts';

const options: HuntOptions = {
  formats: [{ key: 'team', label: 'Team Hunters' }], teamSizes: [4],
  accessModes: [{ key: 'invitation_only', label: 'Invitation-only' }],
  difficulties: [{ key: 'easy', label: 'Easy' }],
  checkpointOrders: [{ key: 'recommended', label: 'Recommended route' }],
};

function completeHunt(): Hunt {
  return {
    id: 'hunt-1', organizationId: 'org-1', createdByUserId: 'user-1', name: 'Saved city quest', status: 'draft', accessCode: null,
    createdAt: '2026-09-01T10:00:00Z', updatedAt: '2026-09-18T10:00:00Z', country: 'Romania', region: 'Cluj', city: 'Cluj-Napoca',
    startDate: '2026-10-12', startTime: '10:30:00', timezone: 'Europe/Bucharest', durationMinutes: 90, capacity: 24,
    contactName: 'Ana Pop', format: 'team', teamSize: 4, accessMode: 'invitation_only', difficulty: 'easy', checkpointOrder: 'recommended',
    templateKey: 'city-signal', templateVersion: 3,
    templateSnapshot: { key: 'city-signal', version: 3, displayName: 'City Signal', theme: 'Urban mystery', checkpointNames: ['Square', 'Gate', 'Tower'] },
  };
}

test('a complete saved Hunt is ready and local prototype state cannot affect readiness', () => {
  const hunt = Object.assign(completeHunt(), { localFeatureCompletion: 0, routeVerified: false });
  assert.deepEqual(reviewHunt(hunt), { ready: true, issues: [] });
  hunt.localFeatureCompletion = 9;
  hunt.routeVerified = true;
  assert.deepEqual(reviewHunt(hunt), { ready: true, issues: [] });
});

test('missing General 1 values produce readable issues in General 1', () => {
  const hunt = { ...completeHunt(), name: ' ', startDate: null, startTime: null, timezone: null, contactName: null };
  const result = reviewHunt(hunt);
  assert.equal(result.ready, false);
  assert.deepEqual(result.issues.map(issue => [issue.field, issue.generalSection, issue.message]), [
    ['name', 1, 'Add a Hunt name'], ['startDate', 1, 'Add a Hunt date'], ['startTime', 1, 'Add a start time'],
    ['timezone', 1, 'Add a timezone'], ['contactName', 1, 'Add a local contact'],
  ]);
});

test('missing capacity and participant options map to General 2', () => {
  const result = reviewHunt({ ...completeHunt(), capacity: 0, format: null, teamSize: null, accessMode: null });
  assert.deepEqual(result.issues.map(issue => [issue.field, issue.generalSection]), [
    ['capacity', 2], ['format', 2], ['teamSize', 2], ['accessMode', 2],
  ]);
});

test('missing experience options map to General 3', () => {
  const result = reviewHunt({ ...completeHunt(), difficulty: null, checkpointOrder: null });
  assert.deepEqual(result.issues.map(issue => [issue.field, issue.generalSection]), [['difficulty', 3], ['checkpointOrder', 3]]);
});

test('missing template identity, version, and snapshot map to General 4', () => {
  const result = reviewHunt({ ...completeHunt(), templateKey: null, templateVersion: 0, templateSnapshot: null });
  assert.deepEqual(result.issues.map(issue => [issue.field, issue.generalSection]), [
    ['templateKey', 4], ['templateVersion', 4], ['templateSnapshot', 4],
  ]);
  assert.ok(result.issues.every(issue => issue.message === 'Select a Hunt template'));
});

test('review display values come only from saved Hunt and option metadata', () => {
  const hunt = completeHunt();
  const labels = reviewOptionLabels(hunt, options);
  assert.equal(hunt.name, 'Saved city quest');
  assert.equal(hunt.templateSnapshot?.displayName, 'City Signal');
  assert.equal(hunt.templateSnapshot?.theme, 'Urban mystery');
  assert.equal(hunt.templateVersion, 3);
  assert.equal(hunt.templateSnapshot?.checkpointNames.length, 3);
  assert.notEqual(hunt.name, hunt.templateSnapshot?.displayName);
  assert.equal(formatLocation(hunt), 'Cluj-Napoca, Cluj, Romania');
  assert.equal(formatDate(hunt.startDate), 'Oct 12, 2026');
  assert.equal(formatTime(hunt.startTime), '10:30');
  assert.equal(hunt.durationMinutes, 90);
  assert.equal(hunt.capacity, 24);
  assert.deepEqual(labels, { format: 'Team Hunters', teamSize: 'Teams of 4', accessMode: 'Invitation-only', difficulty: 'Easy', checkpointOrder: 'Recommended route' });
});

test('unavailable option metadata gets safe readable fallback labels', () => {
  assert.deepEqual(reviewOptionLabels(completeHunt(), null), {
    format: 'Team', teamSize: 'Teams of 4', accessMode: 'Invitation Only', difficulty: 'Easy', checkpointOrder: 'Recommended',
  });
});

test('review refresh errors are safe and status-specific', () => {
  assert.equal(reviewRefreshError({ status: 403 }), "You don't have access to review this Hunt.");
  assert.equal(reviewRefreshError({ status: 404 }), 'This Hunt could not be found.');
  assert.equal(reviewRefreshError(new Error('database secret')), "We couldn't load the latest saved Hunt.");
});

test('backend hunt_not_ready issues are safely parsed and mapped to General sections', () => {
  const issues = parseHuntNotReady({ error: 'hunt_not_ready', issues: [
    { section: 'general', field: 'startTime', message: 'Choose a future start time.' },
    { section: 'options', field: 'capacity', message: 'Capacity is required.' },
    { section: 'options', field: 'difficulty', message: 'Difficulty is required.' },
    { section: 'template', field: 'templateSnapshot', message: 'Select the template again.' },
  ] });
  assert.deepEqual(issues?.map(issue => [issue.message, issue.generalSection]), [
    ['Choose a future start time.', 1], ['Capacity is required.', 2],
    ['Difficulty is required.', 3], ['Select the template again.', 4],
  ]);
});

test('malformed or unrelated backend details are not exposed as readiness issues', () => {
  assert.equal(parseHuntNotReady({ error: 'database_secret', issues: [] }), null);
  assert.deepEqual(parseHuntNotReady({ error: 'hunt_not_ready', issues: [
    { section: 'general', field: 'unknownInternalField', message: 'secret' },
    { section: 'unsafe', field: 'name', message: 'unsafe' },
  ] }), []);
});
