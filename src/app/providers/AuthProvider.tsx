import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react'
import { authApi, type GuestSessionInput, type LoginInput, type PublicUser, type RegisterInput } from '../../services/api'

type AuthContextValue = {
  user: PublicUser | null
  isAuthenticated: boolean
  isBootstrapping: boolean
  loginParticipant: (input: LoginInput) => Promise<PublicUser>
  registerParticipant: (input: RegisterInput) => Promise<PublicUser>
  createGuestSession: (input?: GuestSessionInput) => Promise<PublicUser>
  loginCreator: (input: LoginInput) => Promise<PublicUser>
  registerCreator: (input: RegisterInput) => Promise<PublicUser>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<PublicUser | null>(null)
  const [isBootstrapping, setIsBootstrapping] = useState(true)

  useEffect(() => {
    let active = true
    authApi.bootstrapSession().then(current => { if (active) setUser(current) }).finally(() => { if (active) setIsBootstrapping(false) })
    return () => { active = false }
  }, [])

  const authenticate = useCallback(async (request: Promise<{ user: PublicUser }>) => {
    const response = await request
    setUser(response.user)
    return response.user
  }, [])
  const loginParticipant = useCallback((input: LoginInput) => authenticate(authApi.loginParticipant(input)), [authenticate])
  const registerParticipant = useCallback((input: RegisterInput) => authenticate(authApi.registerParticipant(input)), [authenticate])
  const createGuestSession = useCallback((input: GuestSessionInput = {}) => authenticate(authApi.createGuestSession(input)), [authenticate])
  const loginCreator = useCallback((input: LoginInput) => authenticate(authApi.loginCreator(input)), [authenticate])
  const registerCreator = useCallback((input: RegisterInput) => authenticate(authApi.registerCreator(input)), [authenticate])
  const logout = useCallback(async () => { try { await authApi.logout() } finally { setUser(null) } }, [])

  const value = useMemo(() => ({ user, isAuthenticated: user !== null, isBootstrapping, loginParticipant, registerParticipant, createGuestSession, loginCreator, registerCreator, logout }), [user, isBootstrapping, loginParticipant, registerParticipant, createGuestSession, loginCreator, registerCreator, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
