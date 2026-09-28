import { ApiError, apiClient, type ApiClient } from './client.ts';
import { sessionStore, type SessionStore } from './session.ts';

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
    this.session.saveSession(response.tokens);
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
    this.session.saveSession({ accessToken: response.tokens.accessToken });
    return response;
  }

  async refresh(): Promise<RefreshResponse> {
    const refreshToken = this.session.getRefreshToken();
    if (!refreshToken) throw new ApiError('No refresh session is available.', 401, 'unauthorized');
    try {
      const response = await this.client.post<RefreshResponse>('/api/auth/refresh', { refreshToken }, {
        authenticated: false, retryOnUnauthorized: false,
      });
      this.session.saveSession({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken ?? refreshToken,
      });
      return response;
    } catch (error) {
      this.session.clearSession();
      throw error;
    }
  }

  async logout(): Promise<void> {
    const refreshToken = this.session.getRefreshToken();
    if (!refreshToken) {
      this.session.clearSession();
      return;
    }
    try {
      await this.client.post<void>('/api/auth/logout', { refreshToken }, {
        retryOnUnauthorized: false,
      });
    } finally {
      this.session.clearSession();
    }
  }

  me(): Promise<PublicUser> {
    return this.client.get<PublicUser>('/api/auth/me');
  }

  async bootstrapSession(): Promise<PublicUser | null> {
    if (!this.session.getAccessToken()) return null;
    try {
      return await this.me();
    } catch {
      this.session.clearSession();
      return null;
    }
  }
}

export const authApi = new AuthApi();
