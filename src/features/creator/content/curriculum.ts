import type { ContentFilters, ContentRecord } from './catalog'
export const mathematicsLevels = [
  { key: 'grade', label: 'Grade', all: 'Mix' },
  { key: 'main', label: 'Main', all: 'Mix' },
  { key: 'unit', label: 'Unit', all: '' },
  { key: 'lesson', label: 'Lesson', all: '' },
] as const
export type CurriculumLevel = typeof mathematicsLevels[number]['key']
/** Association values are source data, never generated curriculum identifiers. */
export function curriculumOptions(items: readonly ContentRecord[], filters: ContentFilters, level: CurriculumLevel): string[] {
  const index = mathematicsLevels.findIndex(l => l.key === level)
  if (mathematicsLevels.slice(0, index).some(parent => filters[parent.key] === parent.all)) return []
  const rows = items.flatMap(item => item.curriculum).filter(row => row.category === 'Mathematics' && mathematicsLevels.slice(0, index).every(parent => {
    const selected = filters[parent.key]
    const value = parent.key === 'unit' ? row.unitId : parent.key === 'lesson' ? row.lessonId : row[parent.key]
    return selected === parent.all || String(value) === selected
  }))
  return [...new Set(rows.map(row => level === 'unit' ? row.unitId : level === 'lesson' ? row.lessonId : String(row[level])).filter((value): value is string => !!value))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
}
export function changeCurriculum(filters: ContentFilters, level: CurriculumLevel, value: string): ContentFilters {
  const next = { ...filters, [level]: value }
  const index = mathematicsLevels.findIndex(l => l.key === level)
  for (const child of mathematicsLevels.slice(index + 1)) next[child.key] = child.all
  return next
}
