import { createBrowserRouter, Outlet, RouterProvider } from 'react-router';
import { DocumentTitleHandler, UnsavedChangesNotifier } from '@refinedev/react-router';

import { AppProviders } from './providers';
import { router } from './router';

/**
 * The providers live in a root route element rather than around
 * `<RouterProvider>`, because Refine's router bindings read react-router's
 * context and must therefore render inside it.
 */
const rootRouter = createBrowserRouter([
  {
    element: (
      <AppProviders>
        <Outlet />
        <UnsavedChangesNotifier />
        <DocumentTitleHandler />
      </AppProviders>
    ),
    children: router,
  },
]);

export function App() {
  return <RouterProvider router={rootRouter} />;
}
