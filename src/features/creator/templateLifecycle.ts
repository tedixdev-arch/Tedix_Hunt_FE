import type { CreatorTemplate } from '../../services/api/creatorTemplates.ts'

export function canReviseTemplate(template: CreatorTemplate): boolean {
  if (!template.category || !['approved', 'changes_requested'].includes(template.status)) return false
  if (template.category === 'local' && template.status === 'approved') {
    return !!template.localApproval?.independentEvidence && ['approved', 'historical'].includes(template.localApproval.authority)
  }
  return true
}

/** Private owner projection only. A preflight is advisory; backend locks remain authoritative. */
export function sameTemplateState(current: CreatorTemplate, saved: CreatorTemplate): boolean {
  return ['key', 'version', 'status', 'category', 'submittedVersion', 'publishedVersion', 'localApprovedVersion', 'localApproval', 'localSuspension', 'localityId', 'localitySnapshot', 'content'].every(field =>
    JSON.stringify(current[field as keyof CreatorTemplate]) === JSON.stringify(saved[field as keyof CreatorTemplate]))
}
