// Child process: inherit only explicitly selected runtime settings, never load .env.
import { pathToFileURL } from 'node:url';
import path from 'node:path';

let server, app, pool;
try {
  const directory = process.argv[2];
  ({ pool } = await import(pathToFileURL(path.join(directory, 'dist/lib/postgres.js')).href));
  const { rows: [row] } = await pool.query('SELECT current_database() AS name');
  if (row.name !== process.env.CUX_TEST_DATABASE) throw new Error('binding');
  const { createApp } = await import(pathToFileURL(path.join(directory, 'dist/app.js')).href);
  app = createApp(); // Same middleware, authorization and product routes as server.ts.
  server = app.listen(0, '127.0.0.1', () => process.send({ port: server.address().port }));
  process.on('message', async message => {
    if (message !== 'stop') return;
    await new Promise(resolve => server.close(resolve));
    app.locals.stopAbuseProtection();
    await pool.end();
    process.exit(0);
  });
  process.on('disconnect', () => process.exit(1));
} catch {
  // Child stdout/stderr are disabled too: no SQL diagnostics or connection strings.
  process.send?.({ failed: true });
  await pool?.end().catch(() => {});
  process.exit(1);
}
