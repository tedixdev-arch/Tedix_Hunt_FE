import React from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { CreatorTemplateEditorPage } from '../../src/pages/CreatorStudio'
import { AuthProvider } from '../../src/app/providers/AuthProvider'
import { creatorTemplatesApi, type CreatorTemplate } from '../../src/services/api/creatorTemplates'
import { signalOverloadRouteProposal } from '../fixtures/signalOverloadRouteProposal'
import '../../src/index.css'
import '../../src/shared/theme/theme.css'
import '../../src/shared/theme/global.css'
let record: CreatorTemplate = { key: 'local-preview', version: 1, status: 'draft', content: {
  key: 'local-preview', version: 1, displayName: 'Signal Overload - Cluj Napoca', theme: 'Smart Theme (Signal)',
  mission: { name: 'Restore', signal: 'SIGNAL', briefing: 'Local interface preview', finishLocation: 'Finish' },
  configuration: { normalCheckpointCount: 6, checkpointPositions: [] }, scoring: { startingScore: 500 },
  checkpoints: [...Array.from({ length: 6 }, (_, index) => ({ checkpoint: index + 1, role: 'normal', kind: 'square', navigationMode: 'none' })), { role: 'terminal', kind: 'radial', navigationMode: 'none' }],
  routeResearch: { proposal: signalOverloadRouteProposal },
} }
creatorTemplatesApi.get = async () => structuredClone(record)
creatorTemplatesApi.createVersion = async (_, content) => { record = { ...record, version: content.version, content }; return structuredClone(record) }
createRoot(document.getElementById('root')!).render(<MemoryRouter initialEntries={['/create?template=local-preview']}><AuthProvider><CreatorTemplateEditorPage /></AuthProvider></MemoryRouter>)
