import { lazy, Suspense } from 'react';
import type { RouteObject } from 'react-router';

import { CanAccessRoute, ListSkeleton } from '@/shared/components';

const DashboardPage = lazy(() => import('./pages/dashboard-page'));

export const dashboardRoutes: RouteObject[] = [
  {
    path: '/',
    index: true,
    element: (
      <CanAccessRoute resource="dashboard" action="list">
        <Suspense fallback={<ListSkeleton rows={3} />}>
          <DashboardPage />
        </Suspense>
      </CanAccessRoute>
    ),
  },
];
