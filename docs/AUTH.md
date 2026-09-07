# Authentication

Authentication is **stubbed**. Everything around it is real.

`src/providers/auth/dev-auth-provider.ts` returns `{ authenticated: true }` for
every request, so the protected-route shell, the layout, the identity in the
header, and access control can all be exercised before an identity provider
exists.

**Replace it before any deployment.**

## What is already wired

| Concern                      | Where                                                            | Status   |
| ---------------------------- | ---------------------------------------------------------------- | -------- |
| Route protection             | `src/app/router.tsx` — `<Authenticated>` around the layout route | Real     |
| Redirect to login            | `CatchAllNavigate to="/login"`                                   | Real     |
| Token storage key            | `TOKEN_KEY` in `src/shared/config/constants.ts`                  | Real     |
| `Authorization` header       | request interceptor in `src/shared/config/http.ts`               | Real     |
| Per-route permission gate    | `<CanAccessRoute>` in each feature's `routes.tsx`                | Real     |
| Identity shown in the header | `useGetIdentity<AppUser>()`                                      | Real     |
| **Who the user is**          | `dev-auth-provider.ts`                                           | **Stub** |
| **What they may do**         | `src/providers/access-control/allow-all.ts`                      | **Stub** |

## Replacing the stub

Two files change. Nothing else should need to.

### 1. `src/providers/auth/dev-auth-provider.ts`

Implement Refine's `AuthProvider`:

- `login` — start the sign-in flow. Write the access token to
  `localStorage[TOKEN_KEY]`; the axios interceptor picks it up from there.
- `check` — the gate. Return `{ authenticated: true }` only when a valid,
  unexpired token is held. Return
  `{ authenticated: false, redirectTo: '/login' }` otherwise. Refresh silently
  here if the identity provider supports it.
- `logout` — clear the token and any provider session, then redirect.
- `getIdentity` — return an `AppUser` (`src/shared/types/user.ts`).
- `getPermissions` — return the roles or scopes access control reads.
- `onError` — sign the user out on a 401.

### 2. `src/providers/access-control/allow-all.ts`

Replace the body of `can` with a real check. A reference implementation calling
a `permissions/check` endpoint is in the same file, commented out. Keep
`options.buttons` as it is unless you want unauthorized actions hidden rather
than disabled.

Then point `src/app/providers.tsx` at whatever you named the replacements.

## Azure AD (MSAL)

If the target is Entra ID, add:

```
pnpm add @azure/msal-browser @azure/msal-react
```

Environment variables to add to `.env.example`:

```
VITE_AUTH_AZURE_CLIENT_ID=
VITE_AUTH_AZURE_AUTHORITY=https://login.microsoftonline.com/<tenant-id>
VITE_AUTH_AZURE_REDIRECT_URI=http://localhost:3000
VITE_AUTH_AZURE_POST_LOGOUT_REDIRECT_URI=http://localhost:3000
VITE_AUTH_AZURE_SCOPE=api://<client-id>/token
```

Add each to `ImportMetaEnv` in `src/vite-env.d.ts` and parse them in
`src/shared/config/env.ts`, so a missing value fails at startup rather than at
the first sign-in attempt.

`login` becomes `instance.loginRedirect()`, and `check` becomes
`instance.acquireTokenSilent({ ...tokenRequest, account })`, storing the
returned `accessToken` under `TOKEN_KEY`. Wrap the app in `<MsalProvider>`
inside `src/app/providers.tsx`, outside `<Refine>`.

## In-house identity provider

Same two files. `login` posts credentials and stores the returned token;
`check` validates it (locally by expiry, or against an introspection endpoint)
and refreshes when needed. If the token needs refreshing on 401 responses, add
a response interceptor in `src/shared/config/http.ts` — that is the one place
allowed to know about tokens.
