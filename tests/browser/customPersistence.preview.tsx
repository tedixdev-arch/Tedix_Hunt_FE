import React from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { CreatorTemplateEditorPage } from '../../src/pages/CreatorStudio'
import { AuthProvider } from '../../src/app/providers/AuthProvider'
import { creatorTemplatesApi, type CreatorTemplate } from '../../src/services/api/creatorTemplates'
import { checkpointExercises } from '../../src/data/templateOne'
import { exerciseFixtures } from '../fixtures/customExercises'
import '../../src/index.css'
import '../../src/shared/theme/theme.css'
import '../../src/shared/theme/global.css'
let record: CreatorTemplate
const scope = window as any
scope.fixtureCalls = []; scope.fixtureRecord = () => structuredClone(record); scope.exercises = exerciseFixtures
creatorTemplatesApi.get = async () => structuredClone(record)
creatorTemplatesApi.createVersion = async (_, content) => {
  scope.fixtureCalls.push({ method: 'version', content: structuredClone(content) })
  const saved = structuredClone(content)
  for (const cp of saved.checkpoints as any[]) for (const e of Object.values(cp.customExercises ?? {}) as any[]) { e.id = crypto.randomUUID(); e.owner = { templateKey: saved.key, version: saved.version } }
  record = { ...record, status: 'draft', version: saved.version, content: saved }
  return structuredClone(record)
}
creatorTemplatesApi.submit = async (key, version) => { scope.fixtureCalls.push({ method: 'submit', key, version }); record = { ...record, status: 'submitted' }; return structuredClone(record) }
let root = createRoot(document.getElementById('root')!)
const mountEditor = () => root.render(<MemoryRouter initialEntries={['/create?template=custom-fixture']}><AuthProvider><CreatorTemplateEditorPage /></AuthProvider></MemoryRouter>)
scope.fixtureReopen = () => { root.unmount(); root = createRoot(document.getElementById('root')!); mountEditor() }
scope.fixtureLoad = (type: string) => {
  const exercise: any = structuredClone(exerciseFixtures.find(e => e.type === type)!)
  exercise.id = crypto.randomUUID(); exercise.owner = { templateKey: 'custom-fixture', version: 3 }
  const checkpoints: any[] = checkpointExercises.map((row, i) => { const cp: any = { ...structuredClone(row), role: i === 6 ? 'terminal' : 'normal' }; if (i === 6) delete cp.checkpoint; return cp })
  checkpoints[0].customExercises = { [exercise.classification]: exercise }
  record = { key: 'custom-fixture', version: 3, status: 'draft', category: 'universal', content: {
    key: 'custom-fixture', version: 3, displayName: 'Custom exercise browser fixture', theme: 'City', mission: { name: 'Verify exercises' }, configuration: { normalCheckpointCount: 6 }, scoring: { startingScore: 500 }, checkpoints,
  } }
  scope.fixtureCalls = []; scope.fixtureReopen()
}
scope.fixtureLoad('single-choice')
