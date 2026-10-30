import { apiClient, type ApiClient } from './client.ts'

export interface LocalityProposalInput {
  countryCode: string
  name: string
  administrativeContext: string
  latitude: number
  longitude: number
  explanation: string
  evidenceReference: string
}
export interface LocalityProposal extends LocalityProposalInput {
  id: string
  creatorUserId: string
  status: 'pending' | 'approved' | 'rejected'
  reviewerUserId: string | null
  decisionReason: string | null
  createdAt: string
  decidedAt: string | null
  localityId: string | null
}
export class LocalityProposalsApi {
  private readonly client: ApiClient
  constructor(client: ApiClient = apiClient) { this.client = client }
  mine(): Promise<{ proposals: LocalityProposal[] }> { return this.client.get('/api/geography/locality-proposals/mine') }
  submit(input: LocalityProposalInput): Promise<LocalityProposal> {
    // Ownership, status and registry identity are always server-owned.
    const { countryCode, name, administrativeContext, latitude, longitude, explanation, evidenceReference } = input
    return this.client.post('/api/geography/locality-proposals', { countryCode, name, administrativeContext, latitude, longitude, explanation, evidenceReference })
  }
}
export const localityProposalsApi = new LocalityProposalsApi()
