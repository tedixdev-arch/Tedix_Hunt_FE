import { RouterProvider, createHashRouter } from 'react-router-dom';
import { TemplateOneExperience } from '../pages/template-one/TemplateOneExperience';
import { CreatorIntro } from '../pages/CreatorIntro';
import { LandingPage } from '../pages/LandingPage';

export function RootNavigator() {

  const router = createHashRouter([
    {
      path: '/',
      element: <LandingPage />,
    },
    {
      path: '/play/template-1',
      element: <TemplateOneExperience />,
    },
    {
      path: '/create',
      element: <CreatorIntro />,
    },
  ]);

  return <RouterProvider router={router} />;
}