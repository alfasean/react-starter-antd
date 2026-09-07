import type { RouteObject } from 'react-router';
import { Outlet } from 'react-router';
import { Authenticated } from '@refinedev/core';
import { CatchAllNavigate } from '@refinedev/react-router';

import { ContentLayout, ErrorBoundary, ErrorPage } from '@/shared/components';
import { authRoutes } from '@/features/auth';
import { dashboardRoutes } from '@/features/dashboard';

/**
 * Routes behind the authentication gate, rendered inside the app shell.
 *
 * Each feature owns its own route list and exports it from the feature root.
 * Import them from `@/features/<name>` only — never a deep path.
 */
const protectedRoutes: RouteObject[] = [
  {
    element: (
      <Authenticated key="protected" fallback={<CatchAllNavigate to="/login" />}>
        <ContentLayout>
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </ContentLayout>
      </Authenticated>
    ),
    children: [...dashboardRoutes],
  },
];

export const router: RouteObject[] = [
  ...protectedRoutes,
  ...authRoutes,
  { path: '*', element: <ErrorPage status="404" /> },
];
