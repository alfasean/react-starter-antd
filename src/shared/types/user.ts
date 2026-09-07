/**
 * The identity shape the UI consumes.
 *
 * It lives in `shared/` rather than next to the auth provider so that layout
 * components and stores can use it without importing from `providers/`,
 * which the architecture boundaries forbid.
 */
export type AppUser = {
  id: string;
  name: string;
  email: string;
  roles: string[];
};
