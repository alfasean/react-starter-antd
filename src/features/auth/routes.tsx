import { lazy, Suspense } from 'react';
import type { RouteObject } from 'react-router';
import { Outlet } from 'react-router';
import { Authenticated } from '@refinedev/core';
import { NavigateToResource } from '@refinedev/react-router';

import { FullScreenLoading } from '@/shared/components';

const LoginPage = lazy(() => import('./pages/login-page'));

/**
 * Public routes. An already-authenticated visitor is bounced to the first
 * resource rather than being shown the login form again.
 */
export const authRoutes: RouteObject[] = [
  {
    element: (
      <Authenticated key="public" fallback={<Outlet />}>
        <NavigateToResource />
      </Authenticated>
    ),
    children: [
      {
        path: '/login',
        element: (
          <Suspense fallback={<FullScreenLoading />}>
            <LoginPage />
          </Suspense>
        ),
      },
    ],
  },
];
