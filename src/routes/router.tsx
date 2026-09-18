import { createHashRouter, Navigate } from 'react-router-dom'
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
import { CustomRequestPage, OrganizerSetupChoicePage } from '../pages/OrganizerSetupFlow'
import { CustomHuntEditorPage } from '../pages/CustomHuntEditor'
import { OrganizerMonitorPage } from '../pages/OrganizerMonitor'
import { AdminDashboardPage, AdminRewardInventoryPage, AdminSectionPage, AdminTemplateReviewPage } from '../pages/AdminConsole'
import { AdminVerificationPage, ProfessionalSignInPage } from '../pages/ProfessionalAccess'
import type { ReactNode } from 'react'
import { canAccessCreator, canAccessParticipant } from '../features/auth/access'

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
    path: '/organizer/independent',
    element: <IndependentOrganizerPage />,
  },
  {
    path: '/organizer',
    element: <OrganizerHuntsPage />,
  },
  {
    path: '/organizer/hunts/new',
    element: <OrganizerSetupChoicePage />,
  },
  {
    path: '/organizer/hunts/new/setup',
    element: <CustomHuntEditorPage />,
  },
  {
    path: '/organizer/hunts/:huntId/setup',
    element: <CustomHuntEditorPage />,
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
    element: <OrganizerMonitorPage />,
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
    element: <ProfessionalSignInPage type="admin" />,
  },
  {
    path: '/admin/verify',
    element: <AdminVerificationPage />,
  },
  {
    path: '/admin',
    element: <AdminDashboardPage />,
  },
  {
    path: '/admin/reviews/template-1',
    element: <AdminTemplateReviewPage />,
  },
  {
    path: '/admin/templates',
    element: <AdminSectionPage section="templates" />,
  },
  {
    path: '/admin/hunts',
    element: <AdminSectionPage section="hunts" />,
  },
  {
    path: '/admin/rewards',
    element: <AdminRewardInventoryPage />,
  },
  {
    path: '/admin/alerts',
    element: <AdminSectionPage section="alerts" />,
  },
  {
    path: '/admin/users',
    element: <AdminSectionPage section="users" />,
  },
  {
    path: '/admin/settings',
    element: <AdminSectionPage section="settings" />,
  },
  {
    path: '/admin/audit',
    element: <AdminSectionPage section="audit" />,
  },
])
