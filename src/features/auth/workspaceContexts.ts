import type { HuntContext } from '../../services/api/huntContexts.ts'

export interface ContextualWorkspace {
  role: 'Participant' | 'Supervisor'
  context: HuntContext
}

export function contextualWorkspaceChoices(contexts: HuntContext[]): ContextualWorkspace[] {
  return contexts.flatMap(context => [
    ...(context.participant ? [{ role: 'Participant' as const, context }] : []),
    ...(context.supervisor ? [{ role: 'Supervisor' as const, context }] : []),
  ])
}
