import { AdminShell } from './AdminConsole.tsx'
import { LocalityProposalReview } from '../features/admin/LocalityProposalReview'

/**
 * Admin location work: review Creator proposals for places missing from the GeoNames city list.
 * Listed cities need no Admin step; Creators and Organizers choose them directly.
 */
export function AdminLocationsPage() {
  return <AdminShell active="locations">
    <h2 className="mt-6 text-2xl font-bold">Locality proposals</h2>
    <p className="mt-2 text-slate-600">Places missing from the city list, proposed by Creators. Every listed city can already be used without an Admin step.</p>
    <div className="mt-5"><LocalityProposalReview /></div>
  </AdminShell>
}
