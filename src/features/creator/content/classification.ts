/** Existing Template Setup values. All is a filter operation, never persisted. */
export const templateCategories = ['Mathematics', 'History', 'Science', 'Mixed'] as const
export type ActivityCategory = typeof templateCategories[number]
/** Ordered extension points; no selectable curriculum records are available in C1. */
export const categoryFilters: Record<string, readonly string[]> = {
  Mathematics: ['grade', 'main', 'unit', 'lesson'], Language: [], Tourism: [],
  History: [], Science: [], Mixed: [],
}
