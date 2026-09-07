import { lazy, Suspense } from 'react';
import type { RouteObject } from 'react-router';

import { CanAccessRoute, ListSkeleton } from '@/shared/components';

const VendorListPage = lazy(() => import('./pages/vendor-list-page'));
const VendorCreatePage = lazy(() => import('./pages/vendor-create-page'));
const VendorEditPage = lazy(() => import('./pages/vendor-edit-page'));

export const vendorRoutes: RouteObject[] = [
  {
    path: '/vendor',
    element: (
      <CanAccessRoute resource="vendor" action="list">
        <Suspense fallback={<ListSkeleton rows={8} />}>
          <VendorListPage />
        </Suspense>
      </CanAccessRoute>
    ),
  },
  {
    path: '/vendor/create',
    element: (
      <CanAccessRoute resource="vendor" action="create">
        <Suspense fallback={<ListSkeleton rows={4} />}>
          <VendorCreatePage />
        </Suspense>
      </CanAccessRoute>
    ),
  },
  {
    path: '/vendor/:id',
    element: (
      <CanAccessRoute resource="vendor" action="edit">
        <Suspense fallback={<ListSkeleton rows={4} />}>
          <VendorEditPage />
        </Suspense>
      </CanAccessRoute>
    ),
  },
];
