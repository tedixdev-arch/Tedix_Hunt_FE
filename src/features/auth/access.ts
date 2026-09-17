import type { GlobalRole, PublicUser } from '../../services/api/auth.ts'

export function hasRole(user: PublicUser | null, role: GlobalRole) {
  return Array.isArray(user?.roles) && user.roles.includes(role)
}

export function hasAnyRole(user: PublicUser | null, roles: GlobalRole[]) {
  return roles.some((role) => hasRole(user, role))
}

export function canAccessCreator(user: PublicUser | null) {
  return hasRole(user, 'creator')
}

export function canAccessParticipant(user: PublicUser | null) {
  return user !== null && (hasRole(user, 'participant') || user.isGuest)
}
