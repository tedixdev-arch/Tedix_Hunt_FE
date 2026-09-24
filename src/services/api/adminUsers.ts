import { apiClient, type ApiClient } from './client.ts'
import type { GlobalRole } from './auth.ts'

export type AdminActivationState = 'not_required' | 'pending' | 'expired'
export type ProfessionalRole = 'admin' | 'organizer' | 'creator'

export interface AdminIdentity {
  id: string
  email: string | null
  name: string | null
  roles: GlobalRole[]
  isGuest: boolean
  createdAt: string
}

export interface AdminUser extends AdminIdentity {
  activationState: AdminActivationState
}

export type ProfessionalUser = AdminUser

export interface ProvisionAdminInput {
  email: string
  name?: string
}

export interface ProvisionAdminResponse {
  user: AdminIdentity
  activationRequired: boolean
  activationToken?: string
  activationExpiresAt?: string
}

interface ProvisionProfessionalBase {
  email: string
  name?: string
}

export type ProvisionProfessionalInput =
  | (ProvisionProfessionalBase & { role: 'organizer'; organizationName: string })
  | (ProvisionProfessionalBase & { role: 'creator' })

export interface ProvisionProfessionalResponse extends ProvisionAdminResponse {
  organization?: { id: string; name: string }
}

export class AdminUsersApi {
  private readonly client: ApiClient

  constructor(client: ApiClient = apiClient) {
    this.client = client
  }

  listAdmins(): Promise<AdminUser[]> {
    return this.listUsers('admin')
  }

  listUsers(role: ProfessionalRole): Promise<ProfessionalUser[]> {
    return this.client.get<ProfessionalUser[]>(`/api/admin/users?role=${encodeURIComponent(role)}`)
  }

  provisionAdmin(input: ProvisionAdminInput): Promise<ProvisionAdminResponse> {
    return this.client.post<ProvisionAdminResponse>('/api/admin/users/admin', input)
  }
  provisionProfessional(input: ProvisionProfessionalInput): Promise<ProvisionProfessionalResponse> {
    return this.client.post<ProvisionProfessionalResponse>('/api/admin/users/professional', input)
  }
}

export const adminUsersApi = new AdminUsersApi()
