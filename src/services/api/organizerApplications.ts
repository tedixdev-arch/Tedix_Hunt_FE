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

export interface OrganizerApplication extends OrganizerApplicationInput {
  id: string;
  status: 'pending';
  createdAt: string;
}

export class OrganizerApplicationsApi {
  private readonly client: ApiClient;

  constructor(client: ApiClient = apiClient) {
    this.client = client;
  }

  create(input: OrganizerApplicationInput): Promise<OrganizerApplication> {
    return this.client.post<OrganizerApplication>('/api/organizer-applications', input, { authenticated: false });
  }
}

export const organizerApplicationsApi = new OrganizerApplicationsApi();
