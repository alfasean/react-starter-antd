import { describe, expect, it } from 'vitest';
import { parseEnv } from './env';

describe('parseEnv', () => {
  it('treats VITE_API_MOCK="true" as mock mode', () => {
    const result = parseEnv({ VITE_API_MOCK: 'true', VITE_APP_NAME: 'X', VITE_APP_API_URL: '' });
    expect(result.useMock).toBe(true);
  });

  it('requires an api url when not in mock mode', () => {
    expect(() =>
      parseEnv({ VITE_API_MOCK: 'false', VITE_APP_NAME: 'X', VITE_APP_API_URL: '' }),
    ).toThrow(/VITE_APP_API_URL/);
  });

  it('falls back to a default app name', () => {
    const result = parseEnv({ VITE_API_MOCK: 'true', VITE_APP_NAME: '', VITE_APP_API_URL: '' });
    expect(result.appName).toBe('React Starter');
  });

  it('trims the api url', () => {
    const result = parseEnv({
      VITE_API_MOCK: 'false',
      VITE_APP_NAME: 'X',
      VITE_APP_API_URL: '  https://api.test/v1  ',
    });
    expect(result.apiUrl).toBe('https://api.test/v1');
  });
});
