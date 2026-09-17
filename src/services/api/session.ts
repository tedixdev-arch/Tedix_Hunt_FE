export interface SessionTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface SessionStore {
  getAccessToken(): string | null;
  getRefreshToken(): string | null;
  saveSession(tokens: SessionTokens): void;
  clearSession(): void;
}

const SESSION_KEY = 'tedix-hunt.session';

function browserStorage(): Storage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

export class LocalSessionStore implements SessionStore {
  private readonly storage: Storage | null;

  constructor(storage: Storage | null = browserStorage()) {
    this.storage = storage;
  }

  private read(): SessionTokens | null {
    try {
      const value = this.storage?.getItem(SESSION_KEY);
      if (!value) return null;
      const session = JSON.parse(value) as Partial<SessionTokens>;
      return typeof session.accessToken === 'string'
        ? { accessToken: session.accessToken, ...(typeof session.refreshToken === 'string' && { refreshToken: session.refreshToken }) }
        : null;
    } catch {
      this.clearSession();
      return null;
    }
  }

  getAccessToken(): string | null {
    return this.read()?.accessToken ?? null;
  }

  getRefreshToken(): string | null {
    return this.read()?.refreshToken ?? null;
  }

  saveSession(tokens: SessionTokens): void {
    this.storage?.setItem(SESSION_KEY, JSON.stringify(tokens));
  }

  clearSession(): void {
    this.storage?.removeItem(SESSION_KEY);
  }
}

export const sessionStore = new LocalSessionStore();
