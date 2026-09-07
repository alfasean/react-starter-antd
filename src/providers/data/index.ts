import type { DataProvider } from '@refinedev/core';

import { env, httpClient } from '@/shared/config';
import { createApiDataProvider } from './api-data-provider';
import { createMockDataProvider } from './mock-data-provider';
import { mockSeed } from './mock-db';

/**
 * The provider the app runs on, chosen once at startup.
 *
 * `VITE_API_MOCK=true`  -> in-memory data, no backend needed
 * `VITE_API_MOCK=false` -> the real API at VITE_APP_API_URL
 */
export const dataProvider: DataProvider = env.useMock
  ? createMockDataProvider(mockSeed)
  : createApiDataProvider(httpClient);

export { createApiDataProvider } from './api-data-provider';
export { createMockDataProvider } from './mock-data-provider';
export type { MockRecord, MockSeed } from './mock-data-provider';
export { mockSeed } from './mock-db';
export * from './generate-filter';
export * from './generate-sort';
export * from './map-operator';
