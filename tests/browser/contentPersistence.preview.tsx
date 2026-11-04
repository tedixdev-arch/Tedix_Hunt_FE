import { createRoot } from 'react-dom/client'
import { createMemoryRouter, RouterProvider, Link } from 'react-router-dom'
import { ContentStudio } from '../../src/features/creator/content/ContentStudio'
import '../../src/index.css'
import '../../src/shared/theme/theme.css'
import '../../src/shared/theme/global.css'
const router = createMemoryRouter([{ path: '/', element: <main className="mx-auto max-w-7xl p-4"><Link to="/away">Leave Content</Link><ContentStudio active /></main> }, { path: '/away', element: <p>Left Content</p> }])
createRoot(document.getElementById('root')!).render(<RouterProvider router={router} />)
