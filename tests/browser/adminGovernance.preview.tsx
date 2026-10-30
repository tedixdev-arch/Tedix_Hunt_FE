import { createRoot } from 'react-dom/client'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '../../src/app/providers/AuthProvider'
import { authApi, organizerApplicationsApi, creatorApplicationsApi } from '../../src/services/api'
import { adminTemplateReviewsApi, type AdminTemplateReview } from '../../src/services/api/adminTemplateReviews'
import { adminLocalityProposalsApi } from '../../src/services/api/adminLocalityProposals'
import { geographyApi } from '../../src/services/api/geography'
import { ApiError } from '../../src/services/api/client'
import type { LocalityProposal } from '../../src/services/api/localityProposals'
import { AdminTemplateReviewsPage, AdminTemplateReviewDetailPage } from '../../src/pages/AdminTemplateReviews'
import '../../src/index.css'
import '../../src/shared/theme/theme.css'
import '../../src/shared/theme/global.css'
// Deterministic FE fixtures only. No live account, registry or Template mutation.
const params = new URLSearchParams(location.search)
authApi.bootstrapSession = async () => ({ id: 'admin', roles: ['admin', 'creator'], role: 'admin', name: 'Independent Admin', email: 'admin@example.test', isGuest: false, tedixUserId: null, createdAt: '2026-10-30' })
organizerApplicationsApi.list = async () => []; creatorApplicationsApi.list = async () => []
const scope = window as typeof window & { fixtureCalls: any[] }; scope.fixtureCalls = []
const place = { id: '11111111-1111-4111-8111-111111111111', countryCode: 'RO', countryDisplayName: 'Romania', name: 'Saved locality', administrativeContext: 'Northern county', latitude: 46, longitude: 23, active: true }
const record = (category?: 'universal' | 'local'): AdminTemplateReview => ({ key: category ?? 'legacy', category, version: 3, status: 'submitted', origin: 'creator', creator: { id: params.has('self') ? 'admin' : 'creator', name: 'Ada Creator', email: 'ada@example.test' }, ...(category === 'local' ? { localityId: place.id, localitySnapshot: place, currentLocality: { ...place, name: 'Corrected locality label' }, localApprovedVersion: 2, localApproval: { version: 2, authority: 'approved', independentEvidence: true, localityBound: true }, localSuspension: null } : {}), content: { key: category ?? 'legacy', version: 3, displayName: `${category ?? 'Legacy'} exact submitted story`, theme: 'City', mission: 'Independent saved story', configuration: { normalCheckpointCount: 1, checkpointPositions: [{ checkpointNumber: 1, name: 'Museum', latitude: 46, longitude: 23, radiusMeters: 30 }], finishPoint: { name: 'Finish', latitude: 46.1, longitude: 23.1, radiusMeters: 20 } }, scoring: { points: 100 }, checkpoints: [{ checkpoint: 1, role: 'normal', answer: 'Exact submitted answer' }, { role: 'terminal' }] } })
let candidate = 3, stale = params.has('stale'), suspended = false
adminTemplateReviewsApi.list = async () => [record('universal'), record('local'), record()]
adminTemplateReviewsApi.get = async key => ({ ...record(key === 'universal' ? 'universal' : key === 'local' ? 'local' : undefined), version: candidate })
adminTemplateReviewsApi.approve = async (key, version) => { scope.fixtureCalls.push({ method: 'approve', key, version }); if (stale) { stale = false; candidate = 5; throw new ApiError('template_not_reviewable', 409, 'conflict') } return { ...record(key === 'local' ? 'local' : 'universal'), version: version ?? 3, status: 'approved' } }
adminTemplateReviewsApi.requestChanges = async (key, version) => { scope.fixtureCalls.push({ method: 'changes', key, version }); return { ...record('universal'), version: version ?? 3, status: 'changes_requested' } }
adminTemplateReviewsApi.approved = async () => ({ ...record('local'), version: 2, candidateVersion: 7, candidateStatus: 'draft', submittedVersion: null, status: 'draft', localSuspension: suspended ? { version: 2, reason: 'Unsafe access', byUserId: 'admin', at: '2026-10-30T12:00:00Z' } : null })
adminTemplateReviewsApi.suspend = async (key, version, reason) => { scope.fixtureCalls.push({ method: 'suspend', key, version, reason }); suspended = true; return { key, localApprovedVersion: 2, localSuspension: { version, reason, byUserId: 'admin', at: '2026-10-30T12:00:00Z' } } }
let pending = true
const proposal: LocalityProposal = { id: 'proposal', countryCode: 'RO', name: 'Independent proposed town', administrativeContext: 'Northern county', latitude: 46, longitude: 23, explanation: 'A documented missing locality from an independent source.', evidenceReference: 'Independent gazetteer volume 2, page 30', creatorUserId: params.has('self') ? 'admin' : 'creator', status: 'pending', reviewerUserId: null, decisionReason: null, createdAt: '2026-10-30', decidedAt: null, localityId: null }
adminLocalityProposalsApi.list = async () => pending ? [proposal] : []
adminLocalityProposalsApi.decide = async (id, decision, reason) => { scope.fixtureCalls.push({ method: 'proposal', id, decision, reason }); if (params.has('duplicate')) throw new ApiError('locality_duplicate_conflict', 409, 'conflict'); pending = false; return { ...proposal, status: decision, reviewerUserId: 'admin', decisionReason: reason, decidedAt: '2026-10-30', localityId: decision === 'approved' ? place.id : null } }
geographyApi.search = async () => ({ localities: [place], providerStatus: 'not_requested' })
const entry = params.get('entry') ?? '/admin/templates'
createRoot(document.getElementById('root')!).render(<AuthProvider><MemoryRouter initialEntries={[entry]}><Routes><Route path="/admin/templates" element={<AdminTemplateReviewsPage />} /><Route path="/admin/reviews/:key" element={<AdminTemplateReviewDetailPage />} /></Routes></MemoryRouter></AuthProvider>)
