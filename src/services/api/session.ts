export interface SessionTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface SessionStore {
  getAccessToken(): string | null;
  getRefreshToken(): string | null;
  saveSession(tokens: SessionTokens): void;
  clearSession(): void;
  /** Shared backing storage in this realm. Custom stores use replaceSession/clearSession for mutations. */
  coordinationKey?: object;
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
  readonly coordinationKey: object;

  constructor(storage: Storage | null = browserStorage()) {
    this.storage = storage;
    this.coordinationKey = storage ?? this;
  }

  private read(): SessionTokens | null {
    try {
      const value = this.storage?.getItem(SESSION_KEY) ?? null;
      const state = sessionState(this);
      if (state.storedValue !== undefined && state.storedValue !== value) state.identity = {};
      state.storedValue = value;
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
    const value = JSON.stringify(tokens);
    this.storage?.setItem(SESSION_KEY, value);
    sessionState(this).storedValue = this.storage ? value : null;
    sessionState(this).identity = {};
  }

  clearSession(): void {
    this.storage?.removeItem(SESSION_KEY);
    sessionState(this).storedValue = null;
    sessionState(this).identity = {};
  }
}

export interface SessionSnapshot {
  identity: object;
  accessToken: string | null;
  refreshToken: string | null;
}

interface SessionState {
  identity: object;
  storedValue?: string | null;
  flight?: { snapshot: SessionSnapshot; promise: Promise<Required<SessionTokens>> };
}

const states = new WeakMap<object, SessionState>();

export function sessionState(store: SessionStore): SessionState {
  const key = store.coordinationKey ?? store;
  let state = states.get(key);
  if (!state) {
    state = { identity: {} };
    states.set(key, state);
  }
  return state;
}

export function sessionSnapshot(store: SessionStore): SessionSnapshot {
  const accessToken = store.getAccessToken();
  const refreshToken = store.getRefreshToken();
  return { identity: sessionState(store).identity, accessToken, refreshToken };
}

export function sameSession(store: SessionStore, snapshot: SessionSnapshot): boolean {
  store.getAccessToken(); // Observe external storage replacement before checking identity.
  return sessionState(store).identity === snapshot.identity;
}

export function sameCredentials(store: SessionStore, snapshot: SessionSnapshot): boolean {
  return sameSession(store, snapshot)
    && store.getAccessToken() === snapshot.accessToken
    && store.getRefreshToken() === snapshot.refreshToken;
}

/** Replacement and logout invalidate pending work even for identical credentials. */
export function replaceSession(store: SessionStore, tokens: SessionTokens): void {
  store.saveSession(tokens);
  sessionState(store).identity = {};
}

export function clearSession(store: SessionStore): void {
  store.clearSession();
  sessionState(store).identity = {};
}

/** Only a successful rotation preserves the logical login identity. */
export function rotateSession(store: SessionStore, tokens: SessionTokens): void {
  const identity = sessionState(store).identity;
  store.saveSession(tokens);
  sessionState(store).identity = identity;
}

export const sessionStore = new LocalSessionStore();
