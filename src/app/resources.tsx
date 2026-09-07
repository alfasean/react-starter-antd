import type { IResourceItem } from '@refinedev/core';
import { LayoutDashboard, Store } from 'lucide-react';

const ICON_SIZE = 18;

/**
 * The Refine resource tree. It drives the sider menu, breadcrumbs, document
 * titles, and the `resource`/`action` pairs access control checks.
 *
 * Registering a resource here does NOT create routes — add those to the
 * feature's own `routes.tsx` and spread them in `src/app/router.tsx`.
 */
export const resources: IResourceItem[] = [
  {
    name: 'dashboard',
    list: '/',
    meta: {
      label: 'Dashboard',
      icon: <LayoutDashboard size={ICON_SIZE} />,
    },
  },
  {
    name: 'vendor',
    list: '/vendor',
    create: '/vendor/create',
    edit: '/vendor/:id',
    meta: {
      label: 'Vendor',
      icon: <Store size={ICON_SIZE} />,
      canDelete: true,
    },
  },

  /* ---------------------------------------------------------------------
   * To group resources under a collapsible heading, add a parent entry with
   * no routes and point children at it via `meta.parent`:
   *
   * { name: 'master-data', meta: { label: 'Master Data', icon: <Database /> } },
   * { name: 'product', list: '/product', meta: { parent: 'master-data' } },
   * --------------------------------------------------------------------- */
];
