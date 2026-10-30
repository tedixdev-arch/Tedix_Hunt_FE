import { createRoot } from 'react-dom/client'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { CreatorTemplateEditorPage, CreatorStudioPage } from '../../src/pages/CreatorStudio'
import { AuthProvider } from '../../src/app/providers/AuthProvider'
import { authApi } from '../../src/services/api'
import { creatorTemplatesApi, type CreatorTemplate } from '../../src/services/api/creatorTemplates'
import { geographyApi } from '../../src/services/api/geography'
import { localityProposalsApi, type LocalityProposal } from '../../src/services/api/localityProposals'
import '../../src/index.css'
import '../../src/shared/theme/theme.css'
import '../../src/shared/theme/global.css'
// FE-only deterministic backend projections, never real accounts, review or live mutations.
authApi.bootstrapSession = async () => null
const params = new URLSearchParams(location.search)
const category = params.get('type') === 'universal' ? 'universal' : 'local'
const status = (params.get('status') ?? 'draft') as CreatorTemplate['status']
const incomplete = params.has('incomplete')
const place = { id: '11111111-1111-4111-8111-111111111111', countryCode: 'RO', countryDisplayName: 'Romania', name: 'Independent town', administrativeContext: 'Northern county', latitude: 46, longitude: 23, active: true }
let record: CreatorTemplate = { key: 'owned-completion', version: 3, category, status,
  ...(category === 'universal' ? { publishedVersion: 2 } : { localityId: incomplete ? null : place.id, localitySnapshot: incomplete ? null : place, localApprovedVersion: 2, localApproval: { version: 2, authority: 'approved', independentEvidence: true, localityBound: true }, localSuspension: params.has('suspended') ? { at: '2026-10-30T10:00:00Z', byUserId: 'independent-admin', reason: 'Access temporarily closed', version: 2 } : null }),
  content: { key: 'owned-completion', version: 3, displayName: 'Creator completion story', theme: 'City', mission: { name: 'Independent story' }, configuration: { normalCheckpointCount: 1, checkpointPositions: incomplete ? [] : [{ checkpointNumber: 1, name: 'Museum', latitude: 46, longitude: 23, radiusMeters: 15 }], ...(!incomplete ? { finishPoint: { name: 'Finish', latitude: 46.1, longitude: 23.1, radiusMeters: 15 } } : {}) }, scoring: { model: 'platform' }, checkpoints: [{ checkpoint: 1, role: 'normal' }, { role: 'terminal' }] } }
let proposals: LocalityProposal[] = []
const scope = window as typeof window & { fixtureCalls: any[]; fixtureRecord: () => CreatorTemplate; approveProposal: () => void }
scope.fixtureCalls = []; scope.fixtureRecord = () => structuredClone(record)
scope.approveProposal = () => { proposals = proposals.map(item => ({ ...item, status: 'approved', localityId: place.id, reviewerUserId: 'independent-admin', decisionReason: 'Confirmed against the independent gazetteer.', decidedAt: '2026-10-30T10:30:00Z' })) }
creatorTemplatesApi.list = async () => [structuredClone(record)]
creatorTemplatesApi.get = async () => structuredClone(record)
creatorTemplatesApi.createVersion = async (key, content, localityId) => { scope.fixtureCalls.push({ method: 'version', key, content, localityId }); record = { ...record, version: content.version, content, status: 'draft', submittedVersion: null, ...(localityId !== undefined ? { localityId, localitySnapshot: localityId ? place : null } : {}) }; return structuredClone(record) }
creatorTemplatesApi.submit = async (key, version) => { scope.fixtureCalls.push({ method: 'submit', key, version }); record = { ...record, status: 'submitted', submittedVersion: version }; return structuredClone(record) }
geographyApi.countries = async () => ({ countries: [{ code: 'RO', displayName: 'Romania' }] })
geographyApi.search = async () => ({ localities: [], providerStatus: 'not_requested' })
geographyApi.get = async id => { scope.fixtureCalls.push({ method: 'registry', id }); return { ...place } }
localityProposalsApi.mine = async () => ({ proposals: structuredClone(proposals) })
localityProposalsApi.submit = async input => { const proposal: LocalityProposal = { ...input, id: 'proposal', creatorUserId: 'creator', status: 'pending', reviewerUserId: null, decisionReason: null, createdAt: '2026-10-30T10:00:00Z', decidedAt: null, localityId: null }; proposals = [proposal]; scope.fixtureCalls.push({ method: 'proposal', input }); return structuredClone(proposal) }
createRoot(document.getElementById('root')!).render(<MemoryRouter initialEntries={[params.has('list') ? '/creator' : '/create?template=owned-completion']}><AuthProvider><Routes><Route path="/creator" element={<CreatorStudioPage />} /><Route path="/create" element={<CreatorTemplateEditorPage />} /></Routes></AuthProvider></MemoryRouter>)
