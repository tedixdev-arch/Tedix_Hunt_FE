// Require an ISO calendar date and explicit timezone rather than browser-local parsing.
export function formatStarterDate(value?: string | null): string {
  if (typeof value !== 'string') return '-'
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2}))?$/.exec(value)
  if (!match) return '-'
  const calendar = new Date(`${match[1]}-${match[2]}-${match[3]}T00:00:00Z`)
  if (Number.isNaN(calendar.getTime()) || calendar.toISOString().slice(0, 10) !== value.slice(0, 10)) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${String(date.getUTCDate()).padStart(2, '0')} ${months[date.getUTCMonth()]} ${String(date.getUTCFullYear()).padStart(4, '0')}`
}
