import { ApiError, apiClient, type ApiClient } from './client.ts';
import { beginAuthentication, clearSession, commitAuthentication, sameSession, sessionSnapshot, sessionState, sessionStore, type SessionStore } from './session.ts';

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

  private async authenticate<T extends AuthResponse | GuestAuthResponse = AuthResponse>(path: string, input: unknown, accessOnly = false): Promise<T> {
    const attempt = beginAuthentication(this.session);
    const response = await this.client.post<T>(path, input, { authenticated: false });
    const tokens = accessOnly ? { accessToken: response.tokens.accessToken } : response.tokens;
    if (!commitAuthentication(this.session, attempt, tokens)) {
      // A superseded login may still have issued a server credential. Discard it locally
      // and revoke it best effort, without authenticating as the replacement account.
      if ('refreshToken' in response.tokens) {
        void this.client.post('/api/auth/logout', { refreshToken: response.tokens.refreshToken }, {
          authenticated: false, retryOnUnauthorized: false,
        }).catch(() => undefined);
      }
      throw new ApiError('The session has changed. Please try again.', 401, 'unauthorized');
    }
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

  async changePassword(input: ChangePasswordInput): Promise<ChangePasswordResponse> {
    const origin = sessionSnapshot(this.session);
    const authentication = sessionState(this.session).authentication;
    const response = await this.client.post<ChangePasswordResponse>('/api/auth/change-password', input);
    if (!sameSession(this.session, origin) || sessionState(this.session).authentication !== authentication) {
      throw new ApiError('The session has changed. Please try again.', 401, 'unauthorized');
    }
    return response;
  }

  registerParticipant(input: RegisterInput): Promise<AuthResponse> {
    return this.authenticate('/api/auth/participant/register', input);
  }

  loginParticipant(input: LoginInput): Promise<AuthResponse> {
    return this.authenticate('/api/auth/participant/login', input);
  }

  async createGuestSession(input: GuestSessionInput = {}): Promise<GuestAuthResponse> {
    // Guest creation participates in the same intent order as login/register/activation.
    // Its backend response remains access-only and non-refreshable.
    return this.authenticate<GuestAuthResponse>('/api/auth/guest', input, true);
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
