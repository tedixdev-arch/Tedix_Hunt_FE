import { ApiError } from '../../services/api/client.ts'
import type { HuntLifecycleAction, HuntStatus } from '../../services/api/hunts.ts'

/** Live-control actions the Monitor offers for each persisted Hunt status. */
export type MonitorControls = { primary: Extract<HuntLifecycleAction, 'start' | 'pause' | 'resume'> | null; canEnd: boolean }

export function monitorControls(status: HuntStatus): MonitorControls {
  switch (status) {
    case 'published': return { primary: 'start', canEnd: false }
    case 'active': return { primary: 'pause', canEnd: true }
    case 'paused': return { primary: 'resume', canEnd: true }
    default: return { primary: null, canEnd: false }
  }
}

export const primaryActionLabels: Record<'start' | 'pause' | 'resume', string> = {
  start: 'Start Hunt',
  pause: 'Pause Hunt',
  resume: 'Resume Hunt',
}

export function lifecycleErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 409 || error.status === 422) return 'This Hunt changed state on the server. The latest status is shown — please try again if still needed.'
    if (error.status === 401 || error.status === 403) return 'You no longer have permission to control this Hunt.'
    if (error.status === 404) return 'This Hunt could not be found.'
  }
  return 'We couldn’t update the Hunt. Please check your connection and try again.'
}
