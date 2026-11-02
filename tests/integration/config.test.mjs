import test from 'node:test';
import assert from 'node:assert/strict';
import { configuration, verifyOwnership } from './config.mjs';

const database = `cux05b_${'a'.repeat(32)}`;
const valid = { CUX_DISPOSABLE_ENVIRONMENT: 'authorized-disposable', CUX_TEST_DATABASE: database,
  CUX_DROP_DATABASE: database,
  CUX_DATABASE_URL: `postgresql://runner:private@127.0.0.1/${database}`, CUX_BE_DIRECTORY: '/isolated/be',
  CUX_CREATOR_EMAIL: 'creator@example.invalid', CUX_CREATOR_PASSWORD: 'private',
  CUX_ADMIN_EMAIL: 'admin@example.invalid', CUX_ADMIN_PASSWORD: 'private', CUX_LOCALITY_ID: '11111111-1111-4111-8111-111111111111' };
test('accepts only complete explicit local configuration', () => assert.equal(configuration(valid).database, database));
for (const name of Object.keys(valid)) test(`rejects missing ${name}`, () => {
  const env = { ...valid }; delete env[name]; assert.throws(() => configuration(env));
});
for (const target of ['https://tedixhunt-be-dev.anainfo.ai', `postgresql://runner@tedixhunt-be-dev.anainfo.ai/${database}`,
  `postgresql://runner@77.42.79.192/${database}`, `postgresql://runner@staging.example/${database}`,
  'postgresql://runner@127.0.0.1/tedix_test', `postgresql://runner@127.0.0.1/${database}?host=production`,
  `postgresql://runner@localhost/${database}`, `postgresql://runner@127.0.0.1/${database}#ignored`]) {
  test('rejects unsafe or ambiguous target without echoing connection string', () => {
    assert.throws(() => configuration({ ...valid, CUX_DATABASE_URL: target }), error => !error.message.includes(target));
  });
}
test('rejects same identity regardless of case/whitespace', () => assert.throws(() => configuration({ ...valid, CUX_ADMIN_EMAIL: ' CREATOR@example.invalid ' })));
test('does not inherit VITE or DATABASE_URL defaults', () => assert.throws(() => configuration({ VITE_API_BASE_URL: 'https://tedixhunt-be-dev.anainfo.ai', DATABASE_URL: valid.CUX_DATABASE_URL })));
for (const row of [undefined, { name: database }, { name: 'shared', marker: `cux05b-owned:${database}` }, { name: database, marker: 'test' }]) {
  test('fails closed on missing/mismatched observed ownership', async () => {
    await assert.rejects(verifyOwnership({ query: async () => ({ rows: row ? [row] : [] }) }, { database }));
  });
}
test('accepts observed exact name and ownership marker', async () => {
  await verifyOwnership({ query: async () => ({ rows: [{ name: database, marker: `cux05b-owned:${database}`, owned: true }] }) }, { database });
});
