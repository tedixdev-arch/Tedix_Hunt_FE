import assert from 'node:assert/strict';
import { randomBytes, randomUUID } from 'node:crypto';
import { createRequire } from 'node:module';
import { fork } from 'node:child_process';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { access, mkdir, writeFile } from 'node:fs/promises';
import { configuration } from './config.mjs';
import { preflight, snapshot, dropOwnedDatabase } from './persistence.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
let phase = 'configuration', armed = false, browser, vite, child, db, lock, Pool, config;
const evidence = { run: `cux05b-${randomUUID()}`, workflow: 'BLOCKED', cleanup: 'not armed', steps: [] };
async function rpc(page, operation, ...args) {
  const result = await page.evaluate(async ({ operation, args }) => window.cux(operation, args), { operation, args });
  assert.equal(result.ok, true, `Adapter operation failed (${operation}, HTTP ${result.status ?? 'unavailable'}).`);
  return result.value;
}
async function step(name, action) {
  phase = name;
  const result = await action(); evidence.steps.push(name); return result;
}
try {
  config = configuration(process.env); // Must run before importing any service dependencies.
  config.backend = path.resolve(config.backend);
  phase = 'dependencies';
  await access(path.join(config.backend, 'dist/app.js'));
  const require = createRequire(path.join(config.backend, 'package.json'));
  ({ Pool } = require('pg'));
  const { chromium } = await import('playwright');
  assert.equal(createRequire(import.meta.url)('playwright/package.json').version, '1.56.1');
  await access(chromium.executablePath());
  const { createServer } = await import('vite');
  db = new Pool({ connectionString: config.databaseUrl, connectionTimeoutMillis: 5000 });
  const [creatorId, adminId] = await step('database isolation and identities', () => preflight(db, config));
  // Concurrent runs fail before arming cleanup. Lock remains held until this pool closes.
  lock = await db.connect();
  const locked = (await lock.query('SELECT pg_try_advisory_lock(190720205) AS locked')).rows[0].locked;
  if (!locked) { lock.release(); lock = undefined; throw new Error('Database already in use.'); }
  armed = true;
  evidence.workflow = 'FAILED';
  phase = 'backend startup';
  child = fork(fileURLToPath(new URL('./backend.mjs', import.meta.url)), [config.backend], {
    cwd: config.backend, stdio: ['ignore', 'ignore', 'ignore', 'ipc'],
    env: { PATH: process.env.PATH, NODE_ENV: 'production', DATABASE_URL: config.databaseUrl,
      CUX_TEST_DATABASE: config.database, JWT_SECRET: randomBytes(32).toString('hex'),
      ...Object.fromEntries(Object.entries(process.env).filter(([name]) => name.startsWith('AUTH_ABUSE_') || name === 'AUTH_TRUSTED_PROXIES')) },
  });
  const ready = await Promise.race([
    once(child, 'message').then(([message]) => message),
    once(child, 'exit').then(() => { throw new Error('Backend exited.'); }),
    new Promise((_, reject) => { const timer = setTimeout(() => reject(new Error('Backend timeout.')), 15000); timer.unref(); }),
  ]);
  assert.ok(Number.isInteger(ready.port) && ready.port > 0 && !ready.failed);
  phase = 'frontend startup';
  // Ignore repository .env and inherited VITE_API_BASE_URL, including the development target.
  vite = await createServer({ root, configFile: false, envFile: false, envPrefix: 'CUX_HARNESS_PUBLIC_', logLevel: 'silent',
    define: { 'import.meta.env.VITE_API_BASE_URL': JSON.stringify(''), 'import.meta.env.CUX_INTEGRATION_HARNESS': JSON.stringify('enabled') },
    server: { host: '127.0.0.1', port: 0, proxy: { '/api': { target: `http://127.0.0.1:${ready.port}` } } },
  });
  await vite.listen();
  const url = `http://127.0.0.1:${vite.httpServer.address().port}/tests/integration/browser.html`;
  browser = await chromium.launch({ headless: true });
  const creatorContext = await browser.newContext({ serviceWorkers: 'block' });
  const adminContext = await browser.newContext({ serviceWorkers: 'block' });
  const creator = await creatorContext.newPage(), admin = await adminContext.newPage();
  await Promise.all([creator.goto(url), admin.goto(url)]);
  await Promise.all([creator.waitForFunction(() => typeof window.cux === 'function'), admin.waitForFunction(() => typeof window.cux === 'function')]);
  await step('real separate Creator and Admin login', async () => {
    const a = await rpc(creator, 'loginCreator', config.creator), b = await rpc(admin, 'loginAdmin', config.admin);
    assert.equal(a.id, creatorId); assert.equal(b.id, adminId); assert.notEqual(a.id, b.id);
    assert.ok(a.roles.includes('creator')); assert.ok(b.roles.includes('admin'));
  });
  const universalKey = `${evidence.run}-universal`, localKey = `${evidence.run}-local`;
  const universal = await step('create and save exact Universal version', async () => {
    const initial = await rpc(creator, 'create', universalKey);
    return rpc(creator, 'save', universalKey, { ...initial.content, version: initial.version + 1, displayName: universalKey });
  });
  const beforeUniversal = await snapshot(db, universalKey);
  evidence.universal = { key: universalKey, version: universal.version };
  await step('submit Universal and independently approve exact version', async () => {
    const submitted = await rpc(creator, 'submit', universalKey, universal.version);
    assert.equal(submitted.version, universal.version); assert.equal(submitted.status, 'submitted');
    assert.equal((await rpc(creator, 'get', universalKey)).submittedVersion, universal.version);
    const inspected = await rpc(admin, 'review', universalKey);
    assert.equal(inspected.version, universal.version); assert.deepEqual(inspected.content, universal.content);
    await rpc(admin, 'approve', universalKey, inspected.version);
    const persisted = await snapshot(db, universalKey);
    assert.equal(persisted.published_version, universal.version);
    assert.deepEqual(persisted.versions, beforeUniversal.versions);
    assert.equal(persisted.reviews.length, 1);
    assert.equal(persisted.reviews[0].reviewer_user_id, adminId);
    assert.equal(persisted.reviews[0].version, universal.version);
    assert.equal(persisted.reviews[0].decision, 'approved');
  });
  await step('select approved Universal and copy pinned version', async () => {
    const published = await rpc(creator, 'library', universalKey);
    assert.equal(published.publishedReference.version, universal.version);
    assert.deepEqual(published.content, universal.content);
    await rpc(creator, 'copy', universalKey, localKey, published.publishedReference);
    const copied = await snapshot(db, localKey);
    assert.equal(copied.source_template_id, published.publishedReference.templateId);
    assert.equal(copied.source_version, universal.version);
  });
  const local = await step('select locality and save checkpoints, FinishPoint, Personal and Team Challenges', async () => {
    const locality = await rpc(creator, 'locality', config.localityId); assert.equal(locality.active, true);
    const copied = await rpc(creator, 'get', localKey);
    const content = await rpc(creator, 'localContent', localKey, copied.version + 1, locality.latitude, locality.longitude);
    const saved = await rpc(creator, 'save', localKey, content, locality.id);
    assert.equal(saved.localityId, locality.id); assert.equal(saved.localitySnapshot.id, locality.id);
    assert.equal(saved.content.checkpoints[0].customExercises.personal.type, 'single-choice');
    assert.equal(saved.content.checkpoints[1].role, 'terminal');
    assert.equal(saved.content.checkpoints[1].customExercises.team.type, 'shared-final-key');
    return saved;
  });
  const beforeLocal = await snapshot(db, localKey);
  evidence.local = { key: localKey, version: local.version, pinnedUniversalVersion: universal.version };
  assert.deepEqual(beforeLocal.versions.at(-1).content, local.content);
  await step('reload and reopen saved Local', async () => {
    await creator.reload(); await creator.waitForFunction(() => typeof window.cux === 'function');
    const reopened = await rpc(creator, 'get', localKey);
    assert.equal(reopened.key, local.key); assert.equal(reopened.version, local.version);
    assert.deepEqual(reopened.content, local.content);
    assert.equal(reopened.localityId, local.localityId); assert.deepEqual(reopened.localitySnapshot, local.localitySnapshot);
  });
  await step('submit and independently approve exact Local version', async () => {
    const submitted = await rpc(creator, 'submit', localKey, local.version);
    assert.equal(submitted.version, local.version); assert.equal(submitted.status, 'submitted');
    assert.equal((await rpc(creator, 'get', localKey)).submittedVersion, local.version);
    const inspected = await rpc(admin, 'review', localKey);
    assert.equal(inspected.version, local.version); assert.deepEqual(inspected.content, local.content);
    await rpc(admin, 'approve', localKey, inspected.version);
    const retained = await rpc(admin, 'approved', localKey);
    assert.equal(retained.version, local.version); assert.deepEqual(retained.content, local.content);
    assert.deepEqual(retained.localitySnapshot, local.localitySnapshot);
  });
  await step('verify persisted immutable versions and independent approval evidence', async () => {
    const approved = await snapshot(db, localKey);
    assert.deepEqual(approved.versions, beforeLocal.versions);
    assert.equal(approved.local_approved_version, local.version);
    assert.equal(approved.reviews.length, 1);
    assert.equal(approved.reviews[0].version, local.version);
    assert.equal(approved.reviews[0].reviewer_user_id, adminId);
    assert.equal(approved.reviews[0].decision, 'approved');
    // Append a candidate revision; retained content/version must remain exactly the approved artifact.
    const next = await rpc(creator, 'save', localKey, { ...local.content, version: local.version + 1, displayName: `${localKey} revision` }, config.localityId);
    assert.equal(next.version, local.version + 1);
    const revised = await snapshot(db, localKey);
    assert.deepEqual(revised.versions.slice(0, -1), approved.versions);
    assert.deepEqual(revised.reviews, approved.reviews);
    const retained = await rpc(admin, 'approved', localKey);
    assert.equal(retained.version, local.version); assert.deepEqual(retained.content, local.content);
    assert.deepEqual((await snapshot(db, universalKey)).versions, beforeUniversal.versions);
  });
  await step('revoke both browser sessions', () => Promise.all([rpc(creator, 'logout'), rpc(admin, 'logout')]));
  evidence.workflow = 'VERIFIED';
} catch (error) {
  evidence.failurePhase = phase;
  process.exitCode = 1;
  // Errors may embed values supplied to browser/SQL. Report only the bounded phase.
  console.error(`Creator integration stopped during ${phase}. See docs/qa/CUX-05B-1-Integration-Harness.md for prerequisites. No fallback services are used.`);
  if (phase === 'configuration') console.error(error.message); // Pure validator emits names/instructions only.
} finally {
  await browser?.close().catch(() => {});
  await vite?.close().catch(() => {});
  if (child && child.exitCode === null && child.signalCode === null) {
    try {
      const exited = once(child, 'exit');
      if (child.connected) child.send('stop', () => {});
      const timer = setTimeout(() => child.kill('SIGKILL'), 5000); timer.unref();
      await exited;
      clearTimeout(timer);
    } catch { child.kill('SIGKILL'); }
  }
  // Release all checked-out clients, including the advisory-lock client, before DROP.
  lock?.release(true);
  await db?.end().catch(() => {});
  if (armed) {
    try { await dropOwnedDatabase(Pool, config); evidence.cleanup = 'VERIFIED: owned database removed'; }
    catch { evidence.cleanup = 'BLOCKED: owned database retained; operator cleanup required'; process.exitCode = 1; }
  }
  await mkdir(path.join(root, 'work/creator-integration'), { recursive: true });
  await writeFile(path.join(root, 'work/creator-integration', `${evidence.run}.json`), JSON.stringify(evidence, null, 2) + '\n');
  console.log(`Creator integration: ${evidence.workflow}; cleanup: ${evidence.cleanup}.`);
}
