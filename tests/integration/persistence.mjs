import assert from 'node:assert/strict';
import { verifyOwnership } from './config.mjs';

export async function preflight(pool, config) {
  await verifyOwnership(pool, config);
  const { rows: users } = await pool.query(`SELECT u.id, lower(btrim(u.email)) AS email, u.is_guest, u.account_status,
    u.password_hash IS NOT NULL AS password, array_agg(r.role) AS roles
    FROM users u LEFT JOIN user_roles r ON r.user_id=u.id GROUP BY u.id`);
  assert.equal(users.length, 2, 'Database must contain only the two supplied disposable identities.');
  const identities = [config.creator, config.admin].map((input, index) => {
    const user = users.find(u => u.email === input.email.trim().toLowerCase());
    assert.ok(user && !user.is_guest && user.account_status === 'active' && user.password
      && user.roles.includes(index ? 'admin' : 'creator'), 'Missing active disposable role/password fixture.');
    return user.id;
  });
  assert.notEqual(...identities);
  assert.equal((await pool.query("SELECT count(*)::int AS count FROM hunt_templates WHERE origin='creator'")).rows[0].count, 0,
    'Require a fresh database without pre-existing Creator Templates.');
  assert.equal((await pool.query('SELECT (SELECT count(*) FROM hunts) + (SELECT count(*) FROM organizations) AS count')).rows[0].count, '0',
    'Require a fresh database without existing Hunts or organizations.');
  return identities;
}

export async function snapshot(pool, key) {
  const { rows } = await pool.query(`SELECT t.id, t.key, t.created_by_user_id, t.source_template_id, t.source_version,
    t.published_version, t.local_approved_version,
    (SELECT jsonb_agg(to_jsonb(v) ORDER BY v.version) FROM hunt_template_versions v WHERE v.template_id=t.id) AS versions,
    (SELECT jsonb_agg(to_jsonb(r) ORDER BY r.version) FROM hunt_template_reviews r WHERE r.template_id=t.id) AS reviews
    FROM hunt_templates t WHERE t.key=$1`, [key]);
  assert.equal(rows.length, 1);
  return rows[0];
}

export async function dropOwnedDatabase(Pool, config) {
  // No FORCE, session termination, schema reset or fallback URL. Recheck identity before DROP.
  const url = new URL(config.databaseUrl);
  if (!/^cux05b_[a-f0-9]{32}$/.test(config.database) || url.hostname !== '127.0.0.1'
    || !['postgres:', 'postgresql:'].includes(url.protocol) || url.pathname !== `/${config.database}` || url.search || url.hash) {
    throw new Error('Cleanup target rejected.');
  }
  url.pathname = '/postgres';
  const maintenance = new Pool({ connectionString: url.href, connectionTimeoutMillis: 5000 });
  try {
    const { rows: [row] } = await maintenance.query(`SELECT shobj_description(oid, 'pg_database') AS marker,
      pg_get_userbyid(datdba)=current_user AS owned FROM pg_database WHERE datname=$1`, [config.database]);
    if (row?.marker !== `cux05b-owned:${config.database}` || row.owned !== true) throw new Error('Cleanup ownership mismatch.');
    // Name was strictly validated before any I/O and is quoted independently here.
    if (!/^cux05b_[a-f0-9]{32}$/.test(config.database)) throw new Error('Cleanup name rejected.');
    await maintenance.query(`DROP DATABASE "${config.database}"`);
    assert.equal((await maintenance.query('SELECT 1 FROM pg_database WHERE datname=$1', [config.database])).rows.length, 0);
  } finally { await maintenance.end(); }
}
