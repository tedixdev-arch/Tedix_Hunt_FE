// Pure validation: no imports with service, database or browser side effects.
export function configuration(env) {
  const requireValue = name => {
    if (!env[name]?.trim()) throw new Error(`Missing ${name}; authenticated integration requires an authorized disposable setup.`);
    return env[name];
  };
  if (env.CUX_DISPOSABLE_ENVIRONMENT !== 'authorized-disposable') {
    throw new Error('Set CUX_DISPOSABLE_ENVIRONMENT=authorized-disposable only for an explicitly authorized disposable database.');
  }
  const database = requireValue('CUX_TEST_DATABASE');
  if (!/^cux05b_[a-f0-9]{32}$/.test(database)) throw new Error('CUX_TEST_DATABASE must be cux05b_ followed by a fresh UUID without hyphens.');
  if (env.CUX_DROP_DATABASE !== database) throw new Error('CUX_DROP_DATABASE must explicitly name CUX_TEST_DATABASE; this entire owned database is removed after the run.');
  let url;
  try { url = new URL(requireValue('CUX_DATABASE_URL')); } catch { throw new Error('CUX_DATABASE_URL must be a valid disposable PostgreSQL URL.'); }
  // Local-only is deliberate: URL labels and operator flags alone do not establish isolation.
  if (!['postgres:', 'postgresql:'].includes(url.protocol) || url.hostname !== '127.0.0.1'
    || url.pathname !== `/${database}` || url.search || url.hash || !url.username) {
    throw new Error('CUX_DATABASE_URL must address the exact CUX_TEST_DATABASE on 127.0.0.1, without query options. Remote/shared targets are forbidden.');
  }
  const creator = { email: requireValue('CUX_CREATOR_EMAIL'), password: requireValue('CUX_CREATOR_PASSWORD') };
  const admin = { email: requireValue('CUX_ADMIN_EMAIL'), password: requireValue('CUX_ADMIN_PASSWORD') };
  if (creator.email.trim().toLowerCase() === admin.email.trim().toLowerCase()) throw new Error('Creator and Admin must be separate identities.');
  const localityId = requireValue('CUX_LOCALITY_ID');
  if (!/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(localityId)) throw new Error('CUX_LOCALITY_ID must identify an existing registered locality.');
  return { database, databaseUrl: url.href, creator, admin, localityId, backend: requireValue('CUX_BE_DIRECTORY') };
}

export async function verifyOwnership(pool, config) {
  const { rows: [row] } = await pool.query(`SELECT current_database() AS name,
    shobj_description(oid, 'pg_database') AS marker, pg_get_userbyid(datdba)=current_user AS owned
    FROM pg_database WHERE datname=current_database()`);
  if (row?.name !== config.database || row.marker !== `cux05b-owned:${config.database}` || row.owned !== true) {
    throw new Error('Disposable database ownership marker is absent or mismatched; refusing execution and cleanup.');
  }
}
