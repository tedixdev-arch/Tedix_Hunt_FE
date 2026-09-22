import { createHashRouter, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../app/providers/AuthProvider'
import { TemplateOneExperience } from '../pages/template-one/TemplateOneExperience'
import { CreatorStudioPage, CreatorTemplateEditorPage } from '../pages/CreatorStudio'
import { HomePage } from '../pages/HomePage'
import { DiscoveryIntroPage, PassportPreviewPage } from '../pages/DiscoveryFlow'
import { CompetitionMiniHunt } from '../pages/CompetitionMiniHunt'
import { JoinHuntPage } from '../pages/ParticipantJoinFlow'
import { PublicHuntAccessPage } from '../pages/PublicHuntAccessPage'
import { ParticipantReadinessPage } from '../pages/ParticipantReadinessPage'
import { IndependentOrganizerPage, OrganizerHuntsPage, OrganizerSignInPage, RegisteredOrganizerSignInPage } from '../pages/OrganizerFlow'
import { RegisteredOrganizerApplicationPage } from '../pages/RegisteredOrganizerApplicationPage'
import { CustomRequestPage, OrganizerSetupChoicePage } from '../pages/OrganizerSetupFlow'
import { CustomHuntEditorPage } from '../pages/CustomHuntEditor'
import { OrganizerMonitorPage } from '../pages/OrganizerMonitor'
import { AdminDashboardPage, AdminRewardInventoryPage, AdminSectionPage, AdminTemplateReviewPage } from '../pages/AdminConsole'
import { AdminAccountSecurityPage } from '../pages/AdminAccountSecurity'
import { AdminUsersPage } from '../pages/AdminUsers'
import { AdminActivationPage } from '../pages/AdminActivation'
import { ProfessionalSignInPage } from '../pages/ProfessionalAccess'
import type { ReactNode } from 'react'
import { canAccessAdmin, canAccessCreator, canAccessOrganizer, canAccessParticipant } from '../features/auth/access'

function RequireAuthFlow({ children, entry, canAccess }: { children: ReactNode; entry: string; canAccess: typeof canAccessCreator }) {
  const { user, isBootstrapping } = useAuth()
  if (isBootstrapping) return <main className="grid min-h-dvh place-items-center bg-slate-950 text-white">Loading…</main>
  return canAccess(user) ? children : <Navigate replace to={entry} />
}

function CreatorEntry() {
  const { user, isBootstrapping } = useAuth()
  if (isBootstrapping) return <main className="grid min-h-dvh place-items-center bg-slate-950 text-white">Loading…</main>
  return canAccessCreator(user) ? <Navigate replace to="/creator" /> : <ProfessionalSignInPage type="creator" />
}

function AdminEntry() {
  const { user, isBootstrapping } = useAuth()
  if (isBootstrapping) return <main className="grid min-h-dvh place-items-center bg-slate-950 text-white">Loading…</main>
  return canAccessAdmin(user) ? <Navigate replace to="/admin" /> : <ProfessionalSignInPage type="admin" />
}

function RequireAdmin({ children }: { children: ReactNode }) {
  const { user, isBootstrapping } = useAuth()
  const location = useLocation()
  if (isBootstrapping) return <main className="grid min-h-dvh place-items-center bg-slate-950 text-white">Loading…</main>
  if (!user) return <Navigate replace state={{ from: location.pathname }} to="/admin/sign-in" />
  if (!canAccessAdmin(user)) return <main className="grid min-h-dvh place-items-center bg-slate-100 px-5 text-center text-slate-950"><div><h1 className="text-2xl font-black">Admin access required</h1><p className="mt-3 text-slate-600" role="alert">This account does not have Admin access.</p></div></main>
  return children
}

function RequireOrganizer({ children, allowIndependent = false }: { children: ReactNode; allowIndependent?: boolean }) {
  const { user, isBootstrapping } = useAuth()
  const location = useLocation()
  if (allowIndependent && new URLSearchParams(location.search).get('mode') === 'independent') return children
  if (isBootstrapping) return <main className="grid min-h-dvh place-items-center bg-slate-950 text-white">Loading…</main>
  if (!user) return <Navigate replace state={{ from: location.pathname }} to="/organizer/registered" />
  if (!canAccessOrganizer(user)) return <main className="grid min-h-dvh place-items-center bg-slate-100 px-5 text-center text-slate-950"><div><h1 className="text-2xl font-black">Organizer access required</h1><p className="mt-3 text-slate-600" role="alert">This account does not have Organizer access.</p></div></main>
  return children
}

export const router = createHashRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/discover',
    element: <DiscoveryIntroPage />,
  },
  {
    path: '/discover/mini-hunt',
    element: <CompetitionMiniHunt />,
  },
  {
    path: '/discover/passport',
    element: <PassportPreviewPage />,
  },
  {
    path: '/join',
    element: <JoinHuntPage />,
  },
  {
    path: '/join/:code',
    element: <PublicHuntAccessPage />,
  },
  {
    path: '/hunt/signal-cluj',
    element: <Navigate replace to="/join" />,
  },
  {
    path: '/participant/sign-in',
    element: <Navigate replace to="/join" />,
  },
  {
    path: '/participant/setup',
    element: <RequireAuthFlow canAccess={canAccessParticipant} entry="/join"><ParticipantReadinessPage /></RequireAuthFlow>,
  },
  {
    path: '/play/template-1',
    element: <TemplateOneExperience />,
  },
  {
    path: '/organizer/sign-in',
    element: <OrganizerSignInPage />,
  },
  {
    path: '/organizer/registered',
    element: <RegisteredOrganizerSignInPage />,
  },
  {
    path: '/organizer/apply',
    element: <RegisteredOrganizerApplicationPage />,
  },
  {
    path: '/organizer/independent',
    element: <IndependentOrganizerPage />,
  },
  {
    path: '/organizer',
    element: <RequireOrganizer><OrganizerHuntsPage /></RequireOrganizer>,
  },
  {
    path: '/organizer/hunts/new',
    element: <RequireOrganizer allowIndependent><OrganizerSetupChoicePage /></RequireOrganizer>,
  },
  {
    path: '/organizer/hunts/new/setup',
    element: <RequireOrganizer allowIndependent><CustomHuntEditorPage /></RequireOrganizer>,
  },
  {
    path: '/organizer/hunts/:huntId/setup',
    element: <RequireOrganizer><CustomHuntEditorPage /></RequireOrganizer>,
  },
  {
    path: '/organizer/hunts/new/quick',
    element: <Navigate replace to="/organizer/hunts/new/setup" />,
  },
  {
    path: '/organizer/hunts/new/guided',
    element: <Navigate replace to="/organizer/hunts/new/setup" />,
  },
  {
    path: '/organizer/hunts/new/custom-request',
    element: <CustomRequestPage />,
  },
  {
    path: '/organizer/hunts/:huntId',
    element: <RequireOrganizer><OrganizerMonitorPage /></RequireOrganizer>,
  },
  {
    path: '/creator/sign-in',
    element: <CreatorEntry />,
  },
  {
    path: '/creator',
    element: <RequireAuthFlow canAccess={canAccessCreator} entry="/creator/sign-in"><CreatorStudioPage /></RequireAuthFlow>,
  },
  {
    path: '/create',
    element: <RequireAuthFlow canAccess={canAccessCreator} entry="/creator/sign-in"><CreatorTemplateEditorPage /></RequireAuthFlow>,
  },
  {
    path: '/admin/sign-in',
    element: <AdminEntry />,
  },
  {
    path: '/admin/activate',
    element: <AdminActivationPage />,
  },
  {
    path: '/admin/verify',
    element: <Navigate replace to="/admin/sign-in" />,
  },
  {
    path: '/admin',
    element: <RequireAdmin><AdminDashboardPage /></RequireAdmin>,
  },
  {
    path: '/admin/reviews/template-1',
    element: <RequireAdmin><AdminTemplateReviewPage /></RequireAdmin>,
  },
  {
    path: '/admin/account',
    element: <RequireAdmin><AdminAccountSecurityPage /></RequireAdmin>,
  },
  {
    path: '/admin/templates',
    element: <RequireAdmin><AdminSectionPage section="templates" /></RequireAdmin>,
  },
  {
    path: '/admin/hunts',
    element: <RequireAdmin><AdminSectionPage section="hunts" /></RequireAdmin>,
  },
  {
    path: '/admin/rewards',
    element: <RequireAdmin><AdminRewardInventoryPage /></RequireAdmin>,
  },
  {
    path: '/admin/alerts',
    element: <RequireAdmin><AdminSectionPage section="alerts" /></RequireAdmin>,
  },
  {
    path: '/admin/users',
    element: <RequireAdmin><AdminUsersPage /></RequireAdmin>,
  },
  {
    path: '/admin/settings',
    element: <RequireAdmin><AdminSectionPage section="settings" /></RequireAdmin>,
  },
  {
    path: '/admin/audit',
    element: <RequireAdmin><AdminSectionPage section="audit" /></RequireAdmin>,
  },
])
