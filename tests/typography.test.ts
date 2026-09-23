import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'

const readProjectFile = (path: string) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('the application self-hosts the Sora variable font', async () => {
  const [html, globalCss] = await Promise.all([
    readProjectFile('index.html'),
    readProjectFile('src/index.css'),
  ])

  assert.doesNotMatch(html, /fonts\.(?:googleapis|gstatic)\.com/)
  assert.match(globalCss, /src:\s*url\(['"]\/fonts\/sora\/Sora-Variable\.woff2['"]\)\s*format\(['"]woff2['"]\)/)
  assert.match(globalCss, /font-weight:\s*400 800/)
  assert.match(globalCss, /font-display:\s*swap/)
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
