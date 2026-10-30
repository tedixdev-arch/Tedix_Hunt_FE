import { apiClient, type ApiClient } from './client.ts'
import type { LocalityProposal } from './localityProposals.ts'
export class AdminLocalityProposalsApi {
  private readonly client: ApiClient
  constructor(client: ApiClient = apiClient) { this.client = client }
  async list(): Promise<LocalityProposal[]> {
    const response = await this.client.get<{ proposals: LocalityProposal[] }>('/api/admin/locality-proposals')
    if (!Array.isArray(response?.proposals)) throw new Error('Invalid locality proposal response.')
    return response.proposals
  }
  decide(id: string, decision: 'approved' | 'rejected', reason: string): Promise<LocalityProposal> {
    return this.client.post(`/api/admin/locality-proposals/${encodeURIComponent(id)}/decision`, { decision, reason })
  }
}
export const adminLocalityProposalsApi = new AdminLocalityProposalsApi()
