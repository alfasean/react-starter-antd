/* -------------------------------------------------------------------------
 * DEVELOPMENT STUB — AUTHENTICATES EVERYONE.
 *
 * `check` returns authenticated unconditionally. This exists so the protected
 * route shell, the layout, and access control can all be exercised before an
 * identity provider is wired up.
 *
 * REPLACE THIS FILE BEFORE ANY DEPLOYMENT. See docs/AUTH.md.
 * ------------------------------------------------------------------------- */

import type { AuthProvider } from '@refinedev/core';

import { TOKEN_KEY } from '@/shared/config';
import type { AppUser } from '@/shared/types';

const DEV_USER: AppUser = {
  id: 'dev-user',
  name: 'Dev User',
  email: 'dev@example.com',
  roles: ['admin'],
};

const DEV_TOKEN = 'dev-token';

export const devAuthProvider: AuthProvider = {
  login: async () => {
    localStorage.setItem(TOKEN_KEY, DEV_TOKEN);

    return { success: true, redirectTo: '/' };
  },

  logout: async () => {
    localStorage.removeItem(TOKEN_KEY);

    return { success: true, redirectTo: '/login' };
  },

  // A real implementation validates or refreshes a token here and returns
  // { authenticated: false, redirectTo: '/login' } when that fails.
  check: async () => ({ authenticated: true }),

  getIdentity: async () => DEV_USER,

  getPermissions: async () => DEV_USER.roles,

  onError: async (error) => {
    // A real implementation inspects the status and signs the user out on 401.
    return { error: error as Error };
  },
};
