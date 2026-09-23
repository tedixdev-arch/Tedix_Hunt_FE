import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'

const readProjectFile = (path: string) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('the application loads Sora with the supported UI weights', async () => {
  const html = await readProjectFile('index.html')

  assert.match(html, /family=Sora:wght@400;500;600;700;800&amp;display=swap/)
})

test('global and Tailwind sans typography use Sora first', async () => {
  const [globalCss, legacyGlobalCss, tailwindConfig] = await Promise.all([
    readProjectFile('src/index.css'),
    readProjectFile('src/shared/theme/global.css'),
    readProjectFile('tailwind.config.js'),
  ])

  assert.match(globalCss, /font-family:\s*"Sora", system-ui, -apple-system, "Segoe UI", sans-serif/)
  assert.match(legacyGlobalCss, /font-family:\s*\n\s*'Sora',\s*\n\s*system-ui,/)
  assert.match(tailwindConfig, /sans:\s*\['Sora', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'\]/)
})

test('typography avoids unsupported Sora weights and system-only primary stacks', async () => {
  const [globalCss, legacyGlobalCss] = await Promise.all([
    readProjectFile('src/index.css'),
    readProjectFile('src/shared/theme/global.css'),
  ])

  assert.doesNotMatch(`${globalCss}\n${legacyGlobalCss}`, /font-weight:\s*(?:650|750|850|900|950)\b/)
  assert.doesNotMatch(`${globalCss}\n${legacyGlobalCss}`, /font-family:\s*(?:system-ui|-apple-system)/)
})
