import { httpClient } from '@/shared/config';
import type { Vendor } from '../types';

/**
 * Endpoints for this feature.
 *
 * Ordinary CRUD goes through Refine's hooks and the data provider — you do not
 * need anything here for that. This module is for calls Refine does not model:
 * exports, reports, bulk actions, custom endpoints.
 *
 * Components never call axios directly; they call functions from here, wrapped
 * in a hook. See .claude/rules/data-fetching.md.
 */
export const VENDOR_ENDPOINTS = {
  base: 'vendor',
  export: 'vendor/export',
} as const;

/** Example of a non-CRUD call. Unused by the demo screens; delete with them. */
export async function fetchActiveVendors(): Promise<Vendor[]> {
  const { data } = await httpClient.get<{ data: Vendor[] }>(VENDOR_ENDPOINTS.base, {
    params: { filters: 'active=true', size: 1000 },
  });

  return data.data;
}
