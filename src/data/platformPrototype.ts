export type UserRole = 'participant' | 'organizer' | 'creator' | 'admin'

export type HuntStatus =
  | 'ready'
  | 'countdown'
  | 'in-progress'
  | 'delayed'
  | 'paused'
  | 'cancelled'
  | 'completed'

export type PrototypeHunt = {
  id: string
  name: string
  status: HuntStatus
  primaryAction: string
}

export const roleEntries = [
  { role: 'participant' as const, label: 'Join a hunt', path: '/join' },
  { role: 'organizer' as const, label: 'Organize a hunt', path: '/organizer/sign-in' },
  { role: 'creator' as const, label: 'Creator Studio', path: '/creator/sign-in' },
  { role: 'admin' as const, label: 'Admin sign in', path: '/admin/sign-in' },
] as const

export const joinMethods = [
  { id: 'code', label: 'Enter a hunt code' },
  { id: 'link', label: 'Open an Organizer invitation link' },
  { id: 'email', label: 'Open an email invitation' },
] as const

export const featuredHunt = {
  id: 'signal-cluj',
  name: 'SIGNAL: CLUJ NAPOCA',
  mission: 'Restore the Signal',
  location: 'Cluj Napoca',
  previewPath: '/hunt/signal-cluj',
  playPath: '/play/template-1',
} as const

export const organizerHunts: readonly PrototypeHunt[] = [
  { id: 'hunt-1', name: 'Hunt 1', status: 'ready', primaryAction: 'Start hunt' },
  { id: 'signal-cluj', name: 'Signal: Cluj Napoca', status: 'in-progress', primaryAction: 'Monitor hunt' },
  { id: 'hunt-3', name: 'Hunt 3', status: 'countdown', primaryAction: 'View countdown' },
  { id: 'hunt-4', name: 'Hunt 4', status: 'delayed', primaryAction: 'Set new time' },
  { id: 'hunt-5', name: 'Hunt 5', status: 'cancelled', primaryAction: 'View details' },
  { id: 'hunt-6', name: 'Hunt 6', status: 'paused', primaryAction: 'Resume hunt' },
] as const

export const organizerSetupOptions = [
  {
    id: 'quick',
    name: 'Quick Setup',
    recommended: true,
    path: '/organizer/hunts/new/quick',
    description: 'Choose a complete template and enter only the essential local details.',
  },
  {
    id: 'guided',
    name: 'Guided Customization',
    recommended: false,
    path: '/organizer/hunts/new/guided',
    description: 'Customize approved story, challenge, scoring, hint, and award options.',
  },
  {
    id: 'custom-request',
    name: 'Custom Request',
    recommended: false,
    path: '/organizer/hunts/new/custom-request',
    description: 'Request a hunt that cannot be created from the approved options.',
  },
] as const

export const customRequestStatuses = [
  'Received',
  'Under review',
  'Creator assigned',
  'Draft ready',
  'Changes requested',
  'Approved',
] as const

export const creatorQueues = [
  'Assigned Custom Hunt requests',
  'Draft templates',
  'Templates requiring changes',
  'Submitted templates',
  'Approved templates',
] as const

export const adminSections = [
  'Users and roles',
  'Creator approvals',
  'Custom Hunt requests',
  'Platform components',
  'Safety and PANIC alerts',
  'Audit records',
] as const

export const samplePassportAchievement = {
  id: 'mini-signal-restorer',
  name: 'Signal Restorer',
  label: 'Sample achievement',
  passportName: 'My Hunts Passport',
  permanent: false,
} as const
