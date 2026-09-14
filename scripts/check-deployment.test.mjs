import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkDeployment, origin } from './check-deployment.mjs';

const web = 'https://web.example';
const api = 'https://api.example';
function response(url, options) {
  assert.ok(['GET', 'OPTIONS'].includes(options.method));
  assert.equal(options.redirect, 'manual');
  assert.equal(options.body, undefined);
  assert.equal(options.headers.Authorization, undefined);
  const headers = { 'Access-Control-Allow-Origin': web, 'Content-Type': 'application/json' };
  if (url === web) return new Response('<div id="root"></div>', { headers: { 'Content-Type': 'text/html' } });
  if (options.method === 'OPTIONS') return new Response(null, { status: 204, headers: {
    ...headers, 'Access-Control-Allow-Methods': 'GET, POST', 'Access-Control-Allow-Headers': 'Content-Type',
  } });
  const body = url.endsWith('/health') ? { status: 'ok', service: 'tedixhunt-api' }
    : url.endsWith('/docs.json') ? { openapi: '3.0.3', paths: { '/api/auth/me': {} } }
    : { error: 'unauthorized' };
  return Response.json(body, { status: url.endsWith('/me') ? 401 : 200, headers });
}

test('valid public contracts pass using only GET and OPTIONS', async () => {
  const results = await checkDeployment(web, api, response);
  assert.equal(results.length, 5);
  assert.ok(results.every(r => r.ok));
});

test('HTML fallback or proxy errors cannot pass API checks', async () => {
  for (const status of [200, 503]) {
    const results = await checkDeployment(web, api, (url, options) => url.includes('/api/')
      ? new Response('<html>unavailable</html>', { status, headers: { 'Content-Type': 'text/html', 'Access-Control-Allow-Origin': web } })
      : response(url, options));
    assert.ok(results.slice(1).every(r => !r.ok));
  }
});

test('missing or wrong CORS origin fails despite valid JSON', async () => {
  const results = await checkDeployment(web, api, (url, options) => {
    const res = response(url, options);
    res.headers.set('Access-Control-Allow-Origin', '*');
    return res;
  });
  assert.ok(results.slice(1).every(r => !r.ok));
});

test('preflight must permit both POST and content-type', async () => {
  for (const header of ['Access-Control-Allow-Methods', 'Access-Control-Allow-Headers']) {
    const results = await checkDeployment(web, api, (url, options) => {
      const res = response(url, options);
      res.headers.delete(header);
      return res;
    });
    assert.equal(results.at(-1).ok, false);
  }
});

test('redirects, network failures and malformed JSON fail without leaking details', async () => {
  for (const request of [
    () => new Response(null, { status: 302, headers: { Location: '/login' } }),
    () => { throw new Error('sensitive detail'); },
    () => new Response('{', { headers: { 'Content-Type': 'application/json' } }),
  ]) {
    const results = await checkDeployment(web, api, request);
    assert.ok(results.every(r => !r.ok));
    assert.ok(!JSON.stringify(results).includes('sensitive detail'));
  }
});

test('reject credentials and non-origin URLs before making requests', async () => {
  for (const value of ['https://user:secret@api.example', 'https://api.example/path', 'https://api.example?key=secret', 'file:///tmp/test']) {
    assert.throws(() => origin(value));
    await assert.rejects(checkDeployment(web, value, () => assert.fail('must not request')));
  }
});
