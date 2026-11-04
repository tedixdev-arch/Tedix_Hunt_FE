import { createRoot } from 'react-dom/client'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { AuthProvider } from '../../src/app/providers/AuthProvider'
import { authApi, creatorApplicationsApi, organizerApplicationsApi, adminTemplateReviewsApi } from '../../src/services/api'
import { adminContentReviewApi } from '../../src/services/api/adminContentReview'
import { geographyApi } from '../../src/services/api/geography'
import { AdminContentReviewPage } from '../../src/pages/AdminContentReview'
import { libraryPayload } from '../../src/features/creator/content/libraryAdapter'
import { authorPrototype } from '../../src/features/creator/exercises/persistenceAdapter'
import { prototypes } from '../../src/features/creator/exercises/catalog'
import type { LibraryGeography } from '../../src/services/api/creatorContent'
import '../../src/index.css'
import '../../src/shared/theme/theme.css'
import '../../src/shared/theme/global.css'
// Deterministic catalog/API fixtures for visual regression; production uses the real catalog client.
const scope = new URLSearchParams(location.search).get('scope') || 'city'
const geography: LibraryGeography = scope==='universal'?{scope:'universal'}:scope==='country'?{scope:'country',countryCode:'RO'}:scope==='region'?{scope:'region',countryCode:'RO',admin1Code:'13'}:{scope:'city',countryCode:'RO',geographicId:'683506'}
authApi.bootstrapSession=async()=>({id:'admin',roles:['admin'],role:'admin',name:'Review Admin',email:'admin@example.invalid',isGuest:false,tedixUserId:null,createdAt:'2026-01-01'})
creatorApplicationsApi.list=async()=>[];organizerApplicationsApi.list=async()=>[];adminTemplateReviewsApi.list=async()=>[]
geographyApi.countries=async()=>({countries:[{code:'RO',displayName:'Romania'}]})
geographyApi.regions=async()=>({regions:[{countryCode:'RO',admin1Code:'13',displayName:'Cluj'}],regionLabel:'Region',metadataStatus:'ready',nextAfter:null})
geographyApi.city=async()=>{if(scope==='fallback')throw Error('Catalog unavailable');return {geographicId:'683506',countryCode:'RO',countryDisplayName:'Romania',name:'Cluj-Napoca',admin1Code:'13',regionDisplayName:'Cluj',regionStatus:'resolved',administrativeContext:'Cluj',latitude:46,longitude:23,localityId:null,registeredActive:false,registrationState:'unregistered',nextAction:'none'}}
const payload=libraryPayload({source:'custom',custom:authorPrototype(prototypes[0])},{category:'Science',grade:'',scope:{country:'',region:'',city:''}})
adminContentReviewApi.list=async()=>({items:[{contentId:'content',revisionId:'revision',version:1,status:'submitted',title:'Equivalent expressions',classification:'personal',type:'tap-pair',category:'Science',curriculum:{},geographicScope:geography.scope,countryCode:'RO',admin1Code:null,geographicId:null,submittedAt:'2026-11-05'}],nextAfter:null})
adminContentReviewApi.detail=async()=>({...payload,geography,contentId:'content',revisionId:'revision',version:1,ownerId:'creator',status:'submitted',createdAt:'2026-11-05',updatedAt:'2026-11-05'})
adminContentReviewApi.decide=async()=>{throw Error('Visual fixture must not send decisions')}
const router=createMemoryRouter([{path:'/',element:<AuthProvider><AdminContentReviewPage/></AuthProvider>}])
createRoot(document.getElementById('root')!).render(<RouterProvider router={router}/>)
