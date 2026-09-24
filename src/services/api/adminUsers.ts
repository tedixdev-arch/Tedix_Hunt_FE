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
  isBlocked?: boolean
  status?: 'active' | 'blocked'
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

  updateUser(id: string, input: { name: string; email: string }): Promise<ProfessionalUser> {
    return this.client.patch<ProfessionalUser>(`/api/admin/users/${encodeURIComponent(id)}`, input)
  }
  grantRole(id: string, role: ProfessionalRole): Promise<ProfessionalUser> {
    return this.client.post<ProfessionalUser>(`/api/admin/users/${encodeURIComponent(id)}/roles/${role}`)
  }
  removeRole(id: string, role: ProfessionalRole): Promise<ProfessionalUser> {
    return this.client.delete<ProfessionalUser>(`/api/admin/users/${encodeURIComponent(id)}/roles/${role}`)
  }
  blockUser(id: string): Promise<ProfessionalUser> {
    return this.client.post<ProfessionalUser>(`/api/admin/users/${encodeURIComponent(id)}/block`)
  }
  unblockUser(id: string): Promise<ProfessionalUser> {
    return this.client.post<ProfessionalUser>(`/api/admin/users/${encodeURIComponent(id)}/unblock`)
  }
  setPassword(id: string, password: string): Promise<void> {
    return this.client.put(`/api/admin/users/${encodeURIComponent(id)}/password`, { password })
  }
  deleteUser(id: string): Promise<void> {
    return this.client.delete(`/api/admin/users/${encodeURIComponent(id)}`)
  }
}

export const adminUsersApi = new AdminUsersApi()
