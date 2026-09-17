import type { PublicUser } from '../../services/api/auth.ts'

export function canAccessCreator(user: PublicUser | null) {
  return user?.role === 'creator'
}

export function canAccessParticipant(user: PublicUser | null) {
  return user !== null && (user.role === 'participant' || user.isGuest)
}
