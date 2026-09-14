import { pathToFileURL } from 'node:url';

export function origin(value) {
  const url = new URL(value);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password ||
      url.pathname !== '/' || url.search || url.hash) {
    throw new Error('Use a website origin only, without credentials, paths or query parameters.');
  }
  return url.origin;
}

// Check public responses only: never send passwords, tokens or a login POST.
export async function checkDeployment(web, api, request = fetch) {
  web = origin(web);
  api = origin(api);
  const includes = (value, item) => (value ?? '').toLowerCase().split(',').map(s => s.trim()).includes(item);
  const checks = [
    { name: 'Frontend HTML', url: web, html: true },
    { name: 'API health', url: `${api}/api/health`,
      valid: body => body.status === 'ok' && body.service === 'tedixhunt-api' },
    { name: 'API documentation', url: `${api}/api/docs.json`,
      valid: body => typeof body.openapi === 'string' && !!body.paths?.['/api/auth/me'] },
    { name: 'Protected route rejects anonymous access', url: `${api}/api/auth/me`, status: 401,
      valid: body => body.error === 'unauthorized' },
    { name: 'Login CORS preflight', url: `${api}/api/auth/creator/login`, method: 'OPTIONS' },
  ];
  return Promise.all(checks.map(async check => {
    try {
      const headers = check.html ? {} : { Origin: web };
      if (check.method) Object.assign(headers, {
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'content-type',
      });
      const response = await request(check.url, {
        method: check.method ?? 'GET', headers, redirect: 'manual', signal: AbortSignal.timeout(10000),
      });
      const type = response.headers.get('content-type') ?? '';
      let ok = check.method ? [200, 204].includes(response.status) : response.status === (check.status ?? 200);
      // An HTML proxy/error page must never count as a healthy JSON API.
      if (check.html) {
        ok = ok && type.includes('text/html') && /id=["']root["']/.test(await response.text());
      } else {
        ok = ok && response.headers.get('access-control-allow-origin') === web;
        if (check.method) {
          ok = ok && includes(response.headers.get('access-control-allow-methods'), 'post') &&
            includes(response.headers.get('access-control-allow-headers'), 'content-type');
        } else {
          const body = type.includes('application/json') ? await response.json() : null;
          ok = ok && body !== null && check.valid(body);
        }
      }
      return { check: check.name, ok, detail: `HTTP ${response.status}; ${type || 'no content type'}` };
    } catch {
      // Avoid logging response bodies or request internals that could contain secrets.
      return { check: check.name, ok: false, detail: 'Request failed, timed out or returned invalid JSON.' };
    }
  }));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const results = await checkDeployment(
      process.argv[2] ?? 'https://tedixhunt.anainfo.ai',
      process.argv[3] ?? 'https://tedixhuntbe.anainfo.ai',
    );
    for (const result of results) console.log(`${result.ok ? 'PASS' : 'FAIL'} ${result.check}: ${result.detail}`);
    console.log('These checks do not prove the deployed commits, database target or browser login flow.');
    process.exitCode = results.every(result => result.ok) ? 0 : 1;
  } catch (error) {
    console.error(error instanceof TypeError ? 'Invalid website origin.' : error.message);
    process.exitCode = 1;
  }
}
