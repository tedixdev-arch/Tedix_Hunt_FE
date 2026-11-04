import { ContentPicker } from './ContentPicker'
import { starterContent, type ContentCategory, type ContentRecord } from './catalog'

/** Read-only library; authoring belongs exclusively to Create Content. */
export function ContentLibrary({ items = starterContent, category = 'Personal Challenges' }: { items?: readonly ContentRecord[]; category?: ContentCategory }) {
  return <section aria-label="Content Library" className="mt-6 min-w-0 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
    <h2 className="text-2xl font-bold">Library</h2>
    <ContentPicker key={category} section={category} items={items} libraryView />
  </section>
}
