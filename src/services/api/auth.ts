import { apiClient, type ApiClient } from './client.ts';
import { clearSession, replaceSession, sameSession, sessionSnapshot, sessionStore, type SessionStore } from './session.ts';

export type GlobalRole = 'participant' | 'organizer' | 'creator' | 'admin';

export interface PublicUser {
  id: string;
  email: string | null;
  name: string;
  /** `roles` is authoritative for capabilities; `role` is transitional compatibility/display data. */
  roles: GlobalRole[];
  role: string;
  isGuest: boolean;
  tedixUserId: string | null;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: PublicUser;
  tokens: AuthTokens;
}

export interface GuestAuthResponse {
  user: PublicUser;
  tokens: Pick<AuthTokens, 'accessToken'>;
}

export type RefreshResponse = AuthTokens;

export interface ApiErrorResponse {
  message?: string;
  detail?: string;
  errors?: Record<string, string[]>;
}

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface ActivateAdminInput {
  token: string;
  password: string;
}

export type ActivateProfessionalInput = ActivateAdminInput;

export interface ChangePasswordResponse {
  message: string;
}

export interface GuestSessionInput {
  name?: string;
}

export class AuthApi {
  private readonly client: ApiClient;
  private readonly session: SessionStore;

  constructor(
    client: ApiClient = apiClient,
    session: SessionStore = sessionStore,
  ) {
    this.client = client;
    this.session = session;
  }

  private async authenticate(path: string, input: unknown): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>(path, input, { authenticated: false });
    replaceSession(this.session, response.tokens);
    return response;
  }

  registerCreator(input: RegisterInput): Promise<AuthResponse> {
    return this.authenticate('/api/auth/creator/register', input);
  }

  loginCreator(input: LoginInput): Promise<AuthResponse> {
    return this.authenticate('/api/auth/creator/login', input);
  }

  loginOrganizer(input: LoginInput): Promise<AuthResponse> {
    return this.authenticate('/api/auth/organizer/login', input);
  }

  loginAdmin(input: LoginInput): Promise<AuthResponse> {
    return this.authenticate('/api/auth/admin/login', input);
  }

  activateAdmin(input: ActivateAdminInput): Promise<AuthResponse> {
    return this.authenticate('/api/auth/admin/activate', input);
  }

  activateDirectOrganizer(input: ActivateProfessionalInput): Promise<AuthResponse> {
    return this.authenticate('/api/auth/organizer/activate-direct', input);
  }

  activateCreator(input: ActivateProfessionalInput): Promise<AuthResponse> {
    return this.authenticate('/api/auth/creator/activate', input);
  }

  changePassword(input: ChangePasswordInput): Promise<ChangePasswordResponse> {
    return this.client.post<ChangePasswordResponse>('/api/auth/change-password', input);
  }

  registerParticipant(input: RegisterInput): Promise<AuthResponse> {
    return this.authenticate('/api/auth/participant/register', input);
  }

  loginParticipant(input: LoginInput): Promise<AuthResponse> {
    return this.authenticate('/api/auth/participant/login', input);
  }

  async createGuestSession(input: GuestSessionInput = {}): Promise<GuestAuthResponse> {
    const response = await this.client.post<GuestAuthResponse>('/api/auth/guest', input, { authenticated: false });
    // Guests are intentionally non-refreshable.
    replaceSession(this.session, { accessToken: response.tokens.accessToken });
    return response;
  }

  async refresh(): Promise<RefreshResponse> {
    return this.client.refreshSession();
  }

  async logout(): Promise<void> {
    const refreshToken = this.session.getRefreshToken();
    // Invalidate immediately, before any pending refresh or logout response settles.
    clearSession(this.session);
    if (!refreshToken) return;
    await this.client.post<void>('/api/auth/logout', { refreshToken }, {
      authenticated: false, retryOnUnauthorized: false,
    });
  }

  me(): Promise<PublicUser> {
    return this.client.get<PublicUser>('/api/auth/me');
  }

  async bootstrapSession(): Promise<PublicUser | null> {
    if (!this.session.getAccessToken()) return null;
    const snapshot = sessionSnapshot(this.session);
    try {
      const user = await this.me();
      return sameSession(this.session, snapshot) ? user : null;
    } catch {
      // ApiClient owns expiry; a network error or obsolete bootstrap cannot clear a newer login.
      return null;
    }
  }
}

export const authApi = new AuthApi();
