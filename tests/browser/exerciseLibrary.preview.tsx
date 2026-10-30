import React from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { CreatorTemplateEditorPage } from '../../src/pages/CreatorStudio'
import { AuthProvider } from '../../src/app/providers/AuthProvider'
import { creatorTemplatesApi, type CreatorTemplate } from '../../src/services/api/creatorTemplates'
import { checkpointExercises } from '../../src/data/templateOne'
import { prototypes } from '../../src/features/creator/exercises/catalog'
import '../../src/index.css'
import '../../src/shared/theme/theme.css'
import '../../src/shared/theme/global.css'
const checkpoints = checkpointExercises.map((row, i) => {
  const copy = { ...structuredClone(row), role: i === 6 ? 'terminal' : 'normal' }
  if (i === 6) delete (copy as any).checkpoint
  return copy
})
let record: CreatorTemplate = { key: 'exercise-fixture', version: 3, status: 'draft', category: 'universal', content: {
  key: 'exercise-fixture', version: 3, displayName: 'Independent exercise browser fixture', theme: 'City', mission: 'Exercise authoring fixture',
  configuration: { normalCheckpointCount: 6 }, scoring: { startingScore: 500 }, checkpoints,
} }
const scope = window as any
scope.fixtureCalls = []; scope.fixtureRecord = () => structuredClone(record); scope.prototypes = prototypes
creatorTemplatesApi.get = async () => structuredClone(record)
creatorTemplatesApi.createVersion = async (_, content) => { scope.fixtureCalls.push({ method: 'version', content }); record = { ...record, version: content.version, content }; return structuredClone(record) }
creatorTemplatesApi.submit = async () => { throw new Error('Browser fixture must not submit') }
let root = createRoot(document.getElementById('root')!)
const mountEditor = () => root.render(<MemoryRouter initialEntries={['/create?template=exercise-fixture']}><AuthProvider><CreatorTemplateEditorPage /></AuthProvider></MemoryRouter>)
scope.fixtureReopen = () => { root.unmount(); root = createRoot(document.getElementById('root')!); mountEditor() }
mountEditor()
