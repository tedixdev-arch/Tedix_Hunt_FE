import { apiClient, type ApiClient } from './client.ts';

export type OrganizationType = 'school' | 'ngo' | 'community' | 'other';

export interface OrganizerApplicationInput {
  name: string;
  email: string;
  organizationName: string;
  organizationType: OrganizationType;
  reason: string;
  phone: string | null;
}

export type OrganizerApplicationStatus = 'pending' | 'approved' | 'rejected';

export interface PublicOrganizerApplication extends OrganizerApplicationInput {
  id: string;
  status: 'pending';
  createdAt: string;
}

export interface OrganizerApplication extends OrganizerApplicationInput {
  id: string;
  status: OrganizerApplicationStatus;
  createdAt: string;
  updatedAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
  userId: string | null;
  organizationId: string | null;
  activationExpiresAt: string | null;
  activatedAt: string | null;
}

export interface OrganizerApplicationApproval {
  application: OrganizerApplication;
  activationToken: string;
  activationExpiresAt: string | null;
}

export interface OrganizerApplicationRejection {
  application: OrganizerApplication;
}

/** Signals that the Admin action queue may have changed after a review decision. */
export const organizerApplicationsPendingChangedEvent = 'tedixhunt:organizer-applications-pending-changed';

export function notifyOrganizerApplicationsPendingChanged(): void {
  window.dispatchEvent(new Event(organizerApplicationsPendingChangedEvent));
}

export class OrganizerApplicationsApi {
  private readonly client: ApiClient;

  constructor(client: ApiClient = apiClient) {
    this.client = client;
  }

  create(input: OrganizerApplicationInput): Promise<PublicOrganizerApplication> {
    return this.client.post<PublicOrganizerApplication>('/api/organizer-applications', input, { authenticated: false });
  }

  list(status?: OrganizerApplicationStatus): Promise<OrganizerApplication[]> {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    return this.client.get<OrganizerApplication[]>(`/api/organizer-applications${query}`);
  }

  approve(id: string): Promise<OrganizerApplicationApproval> {
    return this.client.post<OrganizerApplicationApproval>(`/api/organizer-applications/${encodeURIComponent(id)}/approve`);
  }

  reject(id: string): Promise<OrganizerApplicationRejection> {
    return this.client.post<OrganizerApplicationRejection>(`/api/organizer-applications/${encodeURIComponent(id)}/reject`);
  }
}

export const organizerApplicationsApi = new OrganizerApplicationsApi();
