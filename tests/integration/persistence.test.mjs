import test from 'node:test';
import assert from 'node:assert/strict';
import { dropOwnedDatabase, preflight } from './persistence.mjs';

const database = `cux05b_${'a'.repeat(32)}`;
const config = { database, databaseUrl: `postgresql://runner@127.0.0.1/${database}`,
  creator: { email: 'creator@example.invalid' }, admin: { email: 'admin@example.invalid' } };
for (const row of [undefined, { owned: true, marker: 'shared' }, { owned: false, marker: `cux05b-owned:${database}` }]) {
  test('cleanup refuses absent marker or foreign ownership without issuing DROP', async () => {
    const queries = [];
    class Pool {
      async query(sql) { queries.push(sql); return { rows: row ? [row] : [] }; }
      async end() {}
    }
    await assert.rejects(dropOwnedDatabase(Pool, config));
    assert.equal(queries.some(q => /DROP/.test(q)), false);
  });
}
test('cleanup validates name independently of marker', async () => {
  const name = 'shared'; const queries = [];
  class Pool {
    async query(sql) { queries.push(sql); return { rows: [{ owned: true, marker: `cux05b-owned:${name}` }] }; }
    async end() {}
  }
  await assert.rejects(dropOwnedDatabase(Pool, { ...config, database: name }));
  assert.equal(queries.some(q => /DROP/.test(q)), false);
});
test('cleanup refuses a remote connection before opening a pool', async () => {
  class Pool { constructor() { assert.fail('No remote pool may be opened.'); } }
  await assert.rejects(dropOwnedDatabase(Pool, { ...config, databaseUrl: `postgresql://runner@shared.example/${database}` }), /Cleanup target rejected/);
});
test('cleanup drops only exact owned database and checks disappearance', async () => {
  const queries = [];
  class Pool {
    constructor(input) { assert.equal(new URL(input.connectionString).pathname, '/postgres'); }
    async query(sql) {
      queries.push(sql);
      return { rows: queries.length === 1 ? [{ owned: true, marker: `cux05b-owned:${database}` }] : [] };
    }
    async end() {}
  }
  await dropOwnedDatabase(Pool, config);
  assert.equal(queries[1], `DROP DATABASE "${database}"`);
  assert.equal(queries.length, 3);
});
test('preflight rejects unexpected accounts before browser startup or mutation', async () => {
  let queries = 0;
  const pool = { query: async () => ({ rows: ++queries === 1
    ? [{ name: database, marker: `cux05b-owned:${database}`, owned: true }]
    : [] }) };
  await assert.rejects(preflight(pool, config));
  assert.equal(queries, 2);
});
