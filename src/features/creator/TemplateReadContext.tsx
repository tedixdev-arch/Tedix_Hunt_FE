import type { CreatorTemplate } from '../../services/api/creatorTemplates'

const statuses = { draft: 'Draft', submitted: 'Submitted', changes_requested: 'Changes requested', approved: 'Approved' }

/** Only private owner projections are used; latest content is never approval authority. */
export function TemplateReadContext({ template }: { template: CreatorTemplate }) {
  const { category, localApproval: approval, localSuspension: suspension } = template
  return <dl className="mt-2 space-y-1 text-sm text-slate-600">
    <div><dt className="inline font-bold">Type: </dt><dd className="inline">{category === 'universal' ? 'Universal' : category === 'local' ? 'Local' : category === null ? 'Legacy' : 'Unavailable'}</dd></div>
    <div><dt className="inline font-bold">Current candidate: </dt><dd className="inline">{statuses[template.status]} · Version {template.version}</dd></div>
    {template.submittedVersion != null && template.submittedVersion !== template.version && <div><dt className="inline font-bold">Submitted for review: </dt><dd className="inline">Version {template.submittedVersion}</dd></div>}
    {category === 'universal' && <div><dt className="inline font-bold">Publication: </dt><dd className="inline">{template.publishedVersion === undefined ? 'Publication information unavailable.' : template.publishedVersion === null ? 'Not yet published.' : `Published version ${template.publishedVersion}.`}</dd></div>}
    {category === 'local' && <>
      <div><dt className="inline font-bold">Retained Local approval: </dt><dd className="inline">{!approval ? 'Context unavailable.'
        : approval.authority === 'integrity_exception' ? 'Integrity restriction — approval version cannot be resolved.'
        : approval.authority === 'none' ? 'None.'
        : `${approval.authority === 'historical' ? 'Historical authority' : 'Approved'} · ${approval.version == null ? 'Version unavailable' : `Version ${approval.version}`}`}</dd></div>
      {approval && ['approved', 'historical'].includes(approval.authority) && <div><dt className="inline font-bold">Approval context: </dt><dd className="inline">{approval.independentEvidence ? 'Independent review recorded.' : 'Independent review evidence missing.'} {approval.localityBound ? 'Stored locality binding recorded.' : 'Stored locality binding missing.'}</dd></div>}
      <div><dt className="inline font-bold">Local suspension: </dt><dd className="inline">{suspension === undefined ? 'Context unavailable.' : suspension === null ? 'None recorded.' : `Suspended · Version ${suspension.version} — ${suspension.reason}`}</dd></div>
    </>}
  </dl>
}
