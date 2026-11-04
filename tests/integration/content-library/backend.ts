import { readFile, readdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { randomUUID, randomBytes } from 'node:crypto'
process.env.JWT_SECRET = randomBytes(48).toString('hex')
const backend = resolve(process.env.C2B_BACKEND || 'work/backend')
const adminUrl = new URL(process.env.TEST_DATABASE_URL || 'postgres://postgres:c2b-disposable@127.0.0.1:55432/postgres')
if (!['localhost', '127.0.0.1', '[::1]'].includes(adminUrl.hostname)) throw new Error('Use a disposable local PostgreSQL instance.')
const moduleAt = (path: string) => import(pathToFileURL(resolve(backend, path)).href)
const { Pool } = await moduleAt('node_modules/pg/lib/index.js').then(m => m.default ?? m)
const admin = new Pool({ connectionString: adminUrl.toString() })
const database = `c2b_fe_${randomUUID().replaceAll('-', '')}`
await admin.query(`CREATE DATABASE "${database}"`)
const url = new URL(adminUrl); url.pathname = `/${database}`
process.env.DATABASE_URL = url.toString()
process.env.NODE_ENV = 'test'
const { pool } = await moduleAt('src/lib/postgres.ts')
const { runMigrations } = await moduleAt('src/db/migrate.ts')
const db = await pool.connect()
await db.query(await readFile(resolve(backend, 'src/db/pre_migration_baseline.sql'),'utf8'))
const migrations = []
for (const name of (await readdir(resolve(backend, 'src/db/migrations'))).filter(n => /^\d{3}_.*\.ts$/.test(n)).sort()) migrations.push((await moduleAt(`src/db/migrations/${name}`)).default)
await runMigrations(db, migrations)
const ids=[]
for (const n of ['owner','other']) {
 const id=(await db.query("INSERT INTO users(email,role) VALUES ($1,'participant') RETURNING id",[`${n}@c2b.invalid`])).rows[0].id
 await db.query("INSERT INTO user_roles(user_id,role) VALUES ($1,'creator')",[id]); ids.push(id)
}
const country='RO'
await db.query("INSERT INTO countries(code,display_name) VALUES ('RO','Romania') ON CONFLICT DO NOTHING")
const importId=(await db.query("INSERT INTO geographic_imports(source,dataset,sha256,attribution) VALUES ('geonames','test',repeat('a',64),'GeoNames (CC BY 4.0)') RETURNING id")).rows[0].id
await db.query("INSERT INTO geographic_regions(country_code,admin1_code,display_name,import_id) VALUES ($1,'13','Cluj',$2)",[country,importId])
await db.query("INSERT INTO geographic_cities(geoname_id,country_code,name,administrative_context,admin1_code,admin2_code,latitude,longitude,population,source_modified,import_id) VALUES (683506,$1,'Cluj-Napoca','Cluj','13','',46,23,1,'2026-01-01',$2)",[country,importId])
await db.query("INSERT INTO geographic_city_names(geoname_id,country_code,normalized_name) VALUES (683506,'RO','cluj-napoca')")
await db.query("INSERT INTO geographic_regions(country_code,admin1_code,display_name,import_id) VALUES ('RO','23','Iași',$1)",[importId])
await db.query("INSERT INTO geographic_cities(geoname_id,country_code,name,administrative_context,admin1_code,admin2_code,latitude,longitude,population,source_modified,import_id) VALUES (675810,'RO','Iași','Iași','23','',47,27,1,'2026-01-01',$1)",[importId])
await db.query("INSERT INTO geographic_city_names(geoname_id,country_code,normalized_name) VALUES (675810,'RO','iasi')")
await db.query('UPDATE geographic_imports SET completed_at=now(),row_count=1')
db.release()
const { signJwt }=await moduleAt('src/lib/jwt.ts')
await writeFile(process.env.C2B_ACTORS || 'work/actors.json',JSON.stringify(ids.map(id=>({id,token:signJwt({sub:id,type:'access'})}))))
const { createApp }=await moduleAt('src/app.ts')
const app = createApp()
const server = app.listen(3002,'127.0.0.1',()=>console.log('Disposable C2b backend ready on 3002'))
const cleanup = () => server.close(async () => { app.locals.stopAbuseProtection?.(); await pool.end(); await admin.query(`DROP DATABASE "${database}"`); await admin.end(); process.exit(0) })
process.once('SIGTERM', cleanup); process.once('SIGINT', cleanup)
