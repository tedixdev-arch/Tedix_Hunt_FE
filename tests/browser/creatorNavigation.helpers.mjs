// Use the public navigation instead of interacting with retained, hidden panels.
export const section = (page, name) => page.getByRole('navigation', { name: 'Creator sections', exact: true }).getByRole('button', { name, exact: true }).click()
export async function feature(page, name) {
  await section(page, 'Checkpoints & Challenges')
  await page.getByRole('navigation', { name: 'Hunt Features', exact: true }).getByRole('button', { name }).click()
}
export async function saveChallengeDraft(page) {
  await section(page, 'Review & Submit')
  await page.getByRole('button', { name: 'Save draft', exact: true }).click()
  await page.getByRole('status').filter({ hasText: 'Template version saved by the backend' }).waitFor()
  await section(page, 'Checkpoints & Challenges')
}
