# Server database and deployment handoff

The owner intends to connect the prototype to the existing Hetzner PostgreSQL
service when access is available. Access timing is not an instruction to apply
unreviewed changes or overwrite an existing database. This handoff remains pending.

## When access is available

1. Confirm the server, PostgreSQL version, dedicated prototype database, ownership
   and intended environment. Confirm secure network access and migration permissions.
   PostgreSQL 17 is the version currently tested in BE CI.
2. Inspect the existing schema and migration history without changing data. Check
   for name collisions with `users`, `auth_sessions`, `auth_refresh_tokens` and
   `pgmigrations`. Reconcile any existing tables or data with the team first.
3. Obtain and verify a backup/recovery plan for existing data before schema changes.
4. Use the reviewed, merged BE version. Build it and run `npm run db:migrate` with
   DATABASE_URL configured securely on BE. Apply migrations in recorded order:
   7.1 foundation, 7.2 users, 7.3 sessions, plus future reviewed migrations.
   Re-running the migration command must not duplicate schema or data.
5. Configure BE NODE_ENV=production, WEB_ORIGIN, HTTPS/reverse proxy and appropriate
   request limits. Legacy organization code still needs its Mongo/JWT settings until
   migrated. PostgreSQL credentials never go into FE or GitHub source.
6. Point FE VITE_API_BASE_URL at the deployed BE API (prefer `/api`) and rebuild FE.
   No direct browser-to-PostgreSQL connection is used. Verify proxy/PWA exclusions.
7. Verify health/readiness, registration, login, identity restoration, refresh and
   logout. Validate the complete browser flow once step 7.5 is implemented.
8. Record the deployed FE/BE commits, applied migration versions and test results.

## Future plan steps

Every database change is added as a new versioned BE migration, tested against
PostgreSQL and reviewed in a PR. Already-applied migrations are not edited. Apply
future migrations through the same deployment workflow; do not manually reshape
the server database or copy development data automatically. Authentication-table
rollback destroys sessions, and users-table rollback destroys user data; use a
reviewed recovery or forward-correction plan on any populated database.

Separate prototype data and credentials from production. pgAdmin can inspect the
database, but it does not deploy application code or synchronize database schemas.
