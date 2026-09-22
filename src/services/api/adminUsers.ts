import { apiClient, type ApiClient } from './client.ts'
import type { GlobalRole } from './auth.ts'

export type AdminActivationState = 'not_required' | 'pending' | 'expired'

export interface AdminUser {
  id: string
  email: string | null
  name: string
  roles: GlobalRole[]
  isGuest: boolean
  createdAt: string
  activationState: AdminActivationState
}

export interface ProvisionAdminInput {
  email: string
  name?: string
}

export interface ProvisionAdminResponse {
  user: AdminUser
  activationRequired: boolean
  activationToken?: string
  activationExpiresAt?: string
}

export class AdminUsersApi {
  private readonly client: ApiClient

  constructor(client: ApiClient = apiClient) {
    this.client = client
  }

  listAdmins(): Promise<AdminUser[]> {
    return this.client.get<AdminUser[]>('/api/admin/users?role=admin')
  }

  provisionAdmin(input: ProvisionAdminInput): Promise<ProvisionAdminResponse> {
    return this.client.post<ProvisionAdminResponse>('/api/admin/users/admin', input)
  }
}

export const adminUsersApi = new AdminUsersApi()
