import type { CreatorTemplate, CreatorTemplateStatus } from '../../src/services/api/creatorTemplates'

// Shapes from BE HuntTemplate.listCreatorOwnedWithLatestVersion/mapLocalApproval (C2/C6b-5).
// C5 published_version is deliberately absent from the owner contract.
export function projection(category?: CreatorTemplate['category'], status: CreatorTemplateStatus = 'draft', version = 2): CreatorTemplate {
  return {
    key: `${category ?? 'legacy'}-${status}`, category, status, version, submittedVersion: status === 'draft' ? null : version,
    content: { key: 'fixture', version, displayName: `Signal Cluj ${category ?? 'legacy'}`, theme: 'City', mission: 'Story', configuration: {}, scoring: {}, checkpoints: [] },
    ...(category === 'local' ? {
      localApprovedVersion: 1,
      localApproval: { version: 1, authority: 'approved' as const, independentEvidence: true, localityBound: true },
      localSuspension: null,
    } : {}),
  }
}
