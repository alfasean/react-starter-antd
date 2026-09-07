/**
 * The vendor feature's only public surface.
 *
 * Anything not exported here is private to the feature — other features must
 * not reach past this file. The lint rule `no-restricted-imports` enforces it.
 */
export { vendorRoutes } from './routes';
export type { Vendor } from './types';
