import type { AccessControlProvider } from '@refinedev/core';

/* -------------------------------------------------------------------------
 * DEVELOPMENT STUB — ALLOWS EVERYTHING.
 *
 * The shape is real: every route is already wrapped in <CanAccessRoute> and
 * every button honours `options.buttons`, so switching to real permissions is
 * a change to the body of `can` and nothing else.
 * ------------------------------------------------------------------------- */

export const allowAllAccessControlProvider: AccessControlProvider = {
  can: async ({ resource, action, params }) => {
    void resource;
    void action;
    void params;

    return { can: true };
  },

  options: {
    buttons: {
      enableAccessControl: true,
      // Show a disabled button rather than hiding it, so the UI stays stable
      // regardless of who is looking at it.
      hideIfUnauthorized: false,
    },
  },
};

/* -------------------------------------------------------------------------
 * Reference implementation, for when a permissions API exists.
 *
 * export const apiAccessControlProvider = (
 *   httpClient: AxiosInstance,
 *   user?: AppUser,
 * ): AccessControlProvider => ({
 *   can: async ({ resource, action }) => {
 *     try {
 *       const { data } = await httpClient.get<{ isAllowed: boolean }>(
 *         'permissions/check',
 *         { params: { resource, action, subject: user?.id } },
 *       );
 *       return { can: data.isAllowed };
 *     } catch (error) {
 *       if (isAxiosError(error)) {
 *         if (error.response?.status === 401) return { can: false, reason: 'Unauthorized' };
 *         if (error.response?.status === 403) return { can: false, reason: 'Forbidden' };
 *       }
 *       return { can: false, reason: 'Permission check failed' };
 *     }
 *   },
 *   options: { buttons: { enableAccessControl: true, hideIfUnauthorized: false } },
 * });
 * ------------------------------------------------------------------------- */
