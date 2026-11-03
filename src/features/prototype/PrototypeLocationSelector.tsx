/** TEMPORARY prototype display defaults. Never use these labels as locality authority. */
export const prototypeLocation = { country: 'Romania', countryCode: 'RO', county: 'Cluj', city: 'Cluj-Napoca' } as const

/** No requests, coordinates, UUIDs or persistence side effects. */
export function PrototypeLocationSelector() {
  return <section aria-label="Prototype location" className="mt-4 grid min-w-0 gap-4 sm:grid-cols-3">
    {(['Country', 'County', 'City'] as const).map((label, index) => {
      const value = [prototypeLocation.country, prototypeLocation.county, prototypeLocation.city][index]
      return <label key={label} className="min-w-0 text-sm font-bold">{label}<select aria-label={label} className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3 font-normal" value={value} onChange={() => {}}><option value={value}>{value}</option></select></label>
    })}
  </section>
}
