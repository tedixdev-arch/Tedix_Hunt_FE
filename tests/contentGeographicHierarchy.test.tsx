import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { expect, test, vi } from 'vitest'
import { ContentGeography } from '../src/features/creator/content/ContentGeography'
import { libraryEditor, libraryGeographyMatches, libraryPayload } from '../src/features/creator/content/libraryAdapter'
import { geographyApi, type GeographicCity } from '../src/services/api/geography'
import type { LibraryContent, LibraryGeography } from '../src/services/api/creatorContent'
import { authorPrototype, toPersistence } from '../src/features/creator/exercises/persistenceAdapter'
import { prototypes } from '../src/features/creator/exercises/catalog'
const city: GeographicCity = { geographicId: '683506', countryCode: 'RO', countryDisplayName: 'Romania', name: 'Cluj-Napoca', admin1Code: '13', regionDisplayName: 'Cluj', regionStatus: 'resolved', administrativeContext: 'Cluj', latitude: 46, longitude: 23, localityId: null, registeredActive: false, registrationState: 'unregistered', nextAction: '' }
const scope = { country: 'RO', region: '', city: city.geographicId }
const cases: [string, LibraryGeography, boolean][] = [
 ['Universal', { scope: 'universal' }, true],
 ['Romania', { scope: 'country', countryCode: 'RO' }, true],
 ['Cluj region', { scope: 'region', countryCode: 'RO', admin1Code: '13' }, true],
 ['another Romanian region', { scope: 'region', countryCode: 'RO', admin1Code: '10' }, false],
 ['exact city', { scope: 'city', countryCode: 'RO', geographicId: '683506' }, true],
 ['another city', { scope: 'city', countryCode: 'RO', geographicId: '685948' }, false],
 ['another country', { scope: 'country', countryCode: 'FR' }, false],
]
for (const [name, geography, eligible] of cases) test(`Cluj-Napoca: ${name} eligibility`, () => expect(libraryGeographyMatches(geography, scope, city)).toBe(eligible))
for (const hierarchy of [null, { ...city, geographicId: '685948' }, { ...city, countryCode: 'FR' }, { ...city, regionStatus: 'missing_label' as const }, { ...city, admin1Code: '' }]) test(`unresolved/mismatched hierarchy excludes both regions: ${JSON.stringify(hierarchy)}`, () => {
 for (const admin1Code of ['13','10']) expect(libraryGeographyMatches({ scope: 'region', countryCode: 'RO', admin1Code }, { ...scope, region: admin1Code }, hierarchy)).toBe(false)
 expect(libraryGeographyMatches({scope:'universal'},scope,hierarchy)).toBe(true)
 expect(libraryGeographyMatches({scope:'country',countryCode:'RO'},scope,hierarchy)).toBe(true)
})
test('resolved city hierarchy overrides a stale region selection', () => {
 expect(libraryGeographyMatches({scope:'region',countryCode:'RO',admin1Code:'10'},{...scope,region:'10'},city)).toBe(false)
 expect(libraryGeographyMatches({scope:'region',countryCode:'RO',admin1Code:'13'},{...scope,region:'10'},city)).toBe(true)
})
const saved: LibraryContent = { contentId:'content',revisionId:'revision',ownerId:'owner',version:1,status:'draft',createdAt:'2026-01-01',updatedAt:'2026-01-01',category:'Mathematics',curriculum:{subject:'math',grade:'7'},geography:{scope:'city',countryCode:'RO',geographicId:'683506'},exercise:toPersistence(authorPrototype(prototypes[0])) }
for (const failure of [false,true]) test(`restored city resolves separately from saved classifications; catalog failure=${failure}`, async () => {
 vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT',true)
 vi.spyOn(geographyApi,'countries').mockResolvedValue({countries:[{code:'RO',displayName:'Romania'}]})
 vi.spyOn(geographyApi,'regions').mockResolvedValue({regions:[{countryCode:'RO',admin1Code:'13',displayName:'Cluj'}],regionLabel:'Region',metadataStatus:'ready',nextAfter:null})
 let complete!: (city: GeographicCity)=>void, reject!: (error: Error)=>void
 const lookup=vi.spyOn(geographyApi,'city').mockImplementation(()=>new Promise((resolve,fail)=>{complete=resolve;reject=fail}))
 const editor=libraryEditor(saved), before=structuredClone(editor), onChange=vi.fn(), resolved=vi.fn()
 const host=document.createElement('div');document.body.append(host);const root=createRoot(host)
 try {
  await act(async()=>root.render(<ContentGeography value={editor.metadata.scope} onChange={onChange} onCityResolved={resolved}/>))
  expect(editor.metadata.scope.region).toBe('');expect(lookup).toHaveBeenCalledWith('683506');expect(resolved).toHaveBeenLastCalledWith(null)
  expect(libraryGeographyMatches({scope:'region',countryCode:'RO',admin1Code:'10'},editor.metadata.scope,resolved.mock.calls.at(-1)?.[0])).toBe(false)
  await act(async()=>{if(failure)reject(new Error('offline'));else complete(city)})
  const hierarchy=resolved.mock.calls.at(-1)?.[0]
  expect(libraryGeographyMatches({scope:'region',countryCode:'RO',admin1Code:'13'},editor.metadata.scope,hierarchy)).toBe(!failure)
  expect(libraryGeographyMatches({scope:'region',countryCode:'RO',admin1Code:'10'},editor.metadata.scope,hierarchy)).toBe(false)
  expect(onChange).not.toHaveBeenCalled();expect(editor).toEqual(before)
  expect(libraryPayload(editor.draft,editor.metadata)).toEqual({exercise:saved.exercise,category:saved.category,curriculum:saved.curriculum,geography:saved.geography})
  if(failure)expect(host.textContent).toContain('saved location is retained')
 }finally{act(()=>root.unmount());host.remove();vi.restoreAllMocks();vi.unstubAllGlobals()}
})
