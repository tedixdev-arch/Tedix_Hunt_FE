import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type PropsWithChildren } from 'react'
import { ApiError, authApi, sessionStore, type ActivateAdminInput, type ChangePasswordInput, type GuestSessionInput, type LoginInput, type PublicUser, type RegisterInput } from '../../services/api'

import { currentAuthentication, sameSession, sessionSnapshot, sessionState } from '../../services/api/session'

type AuthContextValue = {
  user: PublicUser | null
  isAuthenticated: boolean
  isBootstrapping: boolean
  loginParticipant: (input: LoginInput) => Promise<PublicUser>
  registerParticipant: (input: RegisterInput) => Promise<PublicUser>
  createGuestSession: (input?: GuestSessionInput) => Promise<PublicUser>
  loginCreator: (input: LoginInput) => Promise<PublicUser>
  loginOrganizer: (input: LoginInput) => Promise<PublicUser>
  loginAdmin: (input: LoginInput) => Promise<PublicUser>
  activateAdmin: (input: ActivateAdminInput) => Promise<PublicUser>
  activateDirectOrganizer: (input: ActivateAdminInput) => Promise<PublicUser>
  activateCreator: (input: ActivateAdminInput) => Promise<PublicUser>
  changePassword: (input: ChangePasswordInput) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: PropsWithChildren) {
  const operation = useRef(0)
  const [user, setUser] = useState<PublicUser | null>(null)
  const [isBootstrapping, setIsBootstrapping] = useState(true)

  useEffect(() => {
    let active = true
    const version = operation.current
    const origin = sessionSnapshot(sessionStore)
    authApi.bootstrapSession().then(current => { if (active && operation.current === version && sameSession(sessionStore, origin)) setUser(current) }).finally(() => { if (active) setIsBootstrapping(false) })
    return () => { active = false }
  }, [])

  const authenticate = useCallback(async (start: () => Promise<{ user: PublicUser }>) => {
    const version = ++operation.current
    const request = start()
    const attempt = sessionState(sessionStore).authentication
    const response = await request
    if (operation.current !== version || !attempt || !currentAuthentication(sessionStore, attempt)) {
      throw new ApiError('The session has changed. Please try again.', 401, 'unauthorized')
    }
    setUser(response.user)
    return response.user
  }, [])
  const loginParticipant = useCallback((input: LoginInput) => authenticate(() => authApi.loginParticipant(input)), [authenticate])
  const registerParticipant = useCallback((input: RegisterInput) => authenticate(() => authApi.registerParticipant(input)), [authenticate])
  const createGuestSession = useCallback((input: GuestSessionInput = {}) => authenticate(() => authApi.createGuestSession(input)), [authenticate])
  const loginCreator = useCallback((input: LoginInput) => authenticate(() => authApi.loginCreator(input)), [authenticate])
  const loginOrganizer = useCallback((input: LoginInput) => authenticate(() => authApi.loginOrganizer(input)), [authenticate])
  const loginAdmin = useCallback((input: LoginInput) => authenticate(() => authApi.loginAdmin(input)), [authenticate])
  const activateAdmin = useCallback((input: ActivateAdminInput) => authenticate(() => authApi.activateAdmin(input)), [authenticate])
  const activateDirectOrganizer = useCallback((input: ActivateAdminInput) => authenticate(() => authApi.activateDirectOrganizer(input)), [authenticate])
  const activateCreator = useCallback((input: ActivateAdminInput) => authenticate(() => authApi.activateCreator(input)), [authenticate])
  const changePassword = useCallback(async (input: ChangePasswordInput) => {
    const version = operation.current
    const origin = sessionSnapshot(sessionStore)
    const authentication = sessionState(sessionStore).authentication
    await authApi.changePassword(input)
    if (operation.current !== version || !sameSession(sessionStore, origin)
      || sessionState(sessionStore).authentication !== authentication) {
      throw new ApiError('The session has changed. Please try again.', 401, 'unauthorized')
    }
    operation.current += 1
    sessionStore.clearSession()
    setUser(null)
  }, [])
  const logout = useCallback(async () => {
    operation.current += 1
    setUser(null)
    await authApi.logout()
  }, [])

  const value = useMemo(() => ({ user, isAuthenticated: user !== null, isBootstrapping, loginParticipant, registerParticipant, createGuestSession, loginCreator, loginOrganizer, activateAdmin, activateDirectOrganizer, activateCreator, loginAdmin, changePassword, logout }), [user, isBootstrapping, loginParticipant, registerParticipant, createGuestSession, loginCreator, loginOrganizer, activateAdmin, activateDirectOrganizer, activateCreator, loginAdmin, changePassword, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
