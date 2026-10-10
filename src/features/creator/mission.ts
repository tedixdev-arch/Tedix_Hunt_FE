/** Preserve the backend mission object; legacy text is readable until it is saved as a name. */
export type TemplateMission = Record<string, unknown> | string

export function missionStoryFields(mission: TemplateMission): Array<[string, string]> {
  if (typeof mission === 'string') return [['name', mission]]
  if (!mission || typeof mission !== 'object' || Array.isArray(mission)) return []
  return Object.entries(mission).filter((entry): entry is [string, string] => typeof entry[1] === 'string')
}

export function editMissionStory(mission: TemplateMission, field: string, text: string): Record<string, unknown> {
  return { ...(typeof mission === 'string' ? { name: mission } : mission), [field]: text }
}

export function serializeMission(mission: TemplateMission): Record<string, unknown> {
  return typeof mission === 'string' ? { name: mission } : mission
}
