import { ApiError, apiClient, type ApiClient } from './client.ts';
import { sessionStore, type SessionStore, type SessionTokens } from './session.ts';

export interface PublicUser {
  id: string;
  email?: string;
  displayName?: string;
  accountType?: 'creator' | 'participant' | 'guest';
}

export interface AuthTokens extends SessionTokens {}

export interface AuthResponse extends AuthTokens {
  user: PublicUser;
}

export interface ApiErrorResponse {
  message?: string;
  detail?: string;
  errors?: Record<string, string[]>;
}

export interface RegisterInput {
  email: string;
  password: string;
  displayName: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface GuestSessionInput {
  displayName?: string;
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
    this.session.saveSession({ accessToken: response.accessToken, refreshToken: response.refreshToken });
    return response;
  }

  registerCreator(input: RegisterInput): Promise<AuthResponse> {
    return this.authenticate('/api/auth/creator/register', input);
  }

  loginCreator(input: LoginInput): Promise<AuthResponse> {
    return this.authenticate('/api/auth/creator/login', input);
  }

  registerParticipant(input: RegisterInput): Promise<AuthResponse> {
    return this.authenticate('/api/auth/participant/register', input);
  }

  loginParticipant(input: LoginInput): Promise<AuthResponse> {
    return this.authenticate('/api/auth/participant/login', input);
  }

  async createGuestSession(input: GuestSessionInput = {}): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/api/auth/guest', input, { authenticated: false });
    // Guests are intentionally non-refreshable.
    this.session.saveSession({ accessToken: response.accessToken });
    return response;
  }

  async refresh(): Promise<AuthResponse> {
    const refreshToken = this.session.getRefreshToken();
    if (!refreshToken) throw new ApiError('No refresh session is available.', 401, 'unauthorized');
    try {
      const response = await this.client.post<AuthResponse>('/api/auth/refresh', { refreshToken }, {
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
    try {
      await this.client.post<void>('/api/auth/logout', refreshToken ? { refreshToken } : {}, {
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
