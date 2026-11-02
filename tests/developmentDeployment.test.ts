import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { build } from 'vite'

const workflow = await readFile(new URL('../.github/workflows/frontend.yml', import.meta.url), 'utf8')
const devJob = workflow.split('  deploy-dev:')[1].split('  deploy-production:')[0]
const productionJob = workflow.split('  deploy-production:')[1]
const keys = ['VITE_DEPLOYMENT_ENVIRONMENT', 'VITE_DEVELOPMENT_LOCATION_PRESET', 'VITE_API_BASE_URL']
function environment(job: string) {
  return Object.fromEntries(keys.map(key => {
    const value = job.match(new RegExp(`^          ${key}: (.*)$`, 'm'))?.[1]
    assert.notEqual(value, undefined, `missing explicit ${key}`)
    return [key, value === '""' ? '' : value]
  }))
}
async function compiledPresetEnabled(env: Record<string, string | undefined>) {
  const result = await build({
    configFile: false, mode: 'production', logLevel: 'silent',
    define: Object.fromEntries(keys.map(key => [`import.meta.env.${key}`, JSON.stringify(env[key] ?? '')])),
    build: { write: false, lib: { entry: new URL('../src/features/creator/developmentLocation.ts', import.meta.url).pathname, formats: ['es'] } },
  })
  const output = Array.isArray(result) ? result[0] : result
  assert.ok('output' in output)
  const chunk = output.output.find(item => item.type === 'chunk')!
  assert.equal(chunk.type, 'chunk')
  const module = await import(`data:text/javascript;base64,${Buffer.from(chunk.code).toString('base64')}`)
  return module.developmentLocationEnabled()
}
test('actual normal dev deployment enables compiled preset under Vite production mode; production stays off', async () => {
  assert.match(devJob, /npm run build\n/)
  assert.doesNotMatch(devJob, /--mode development/)
  const dev = environment(devJob), production = environment(productionJob)
  assert.equal(await compiledPresetEnabled(dev), true)
  assert.equal(await compiledPresetEnabled(production), false)
  assert.equal(await compiledPresetEnabled({ ...dev, VITE_API_BASE_URL: production.VITE_API_BASE_URL }), false)
  assert.equal(await compiledPresetEnabled({ ...dev, VITE_DEPLOYMENT_ENVIRONMENT: 'production' }), false)
  assert.equal(await compiledPresetEnabled({ ...dev, VITE_DEVELOPMENT_LOCATION_PRESET: '' }), false)
})
