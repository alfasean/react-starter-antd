/**
 * The single place `import.meta.env` is read.
 *
 * Every other module imports the parsed `env` object, so a missing or
 * malformed variable fails loudly at startup rather than as `undefined`
 * halfway through a request.
 */

export type AppEnv = {
  /** Base URL for the application API. Empty string when running on mocks. */
  apiUrl: string;
  /** Shown in the browser title and the layout header. */
  appName: string;
  /** True when the app should run entirely on the in-memory data provider. */
  useMock: boolean;
};

/** Values are optional: an undeclared variable arrives as `undefined`, not `''`. */
type RawEnv = {
  VITE_API_MOCK?: string;
  VITE_APP_NAME?: string;
  VITE_APP_API_URL?: string;
};

export function parseEnv(raw: RawEnv): AppEnv {
  const useMock = raw.VITE_API_MOCK === 'true';
  const apiUrl = (raw.VITE_APP_API_URL ?? '').trim();

  if (!useMock && !apiUrl) {
    throw new Error(
      'VITE_APP_API_URL is required when VITE_API_MOCK is not "true". ' +
        'Set it in .env.development, or set VITE_API_MOCK=true to run on mock data.',
    );
  }

  return {
    apiUrl,
    appName: (raw.VITE_APP_NAME ?? '').trim() || 'React Starter',
    useMock,
  };
}

export const env: AppEnv = parseEnv(import.meta.env);
