# React Starter — Design

Date: 2026-09-07
Status: Approved

## Purpose

A reusable starter for new internal front-end projects, derived from the
`dealWEB` codebase. It keeps what works there (Refine + Ant Design, the
custom data provider contract, the shared layout and table kit) and fixes
what does not scale (one domain's code scattered across four top-level
folders, a single global `interfaces/index.ts`, two test runners, no
enforced module boundaries).

Success criteria:

1. `pnpm install && pnpm dev` produces a running, browsable app with no
   backend and no auth configuration.
2. A developer adds a new CRUD screen by copying one folder and editing it.
3. `pnpm verify` (types, lint, format, tests) passes on a fresh clone.
4. An LLM agent given the repo writes code that matches house style without
   further prompting.

## Stack

Versions are chosen for mutual compatibility, not for being newest.

| Package | Version | Note |
| --- | --- | --- |
| react / react-dom | 19.2 | |
| vite | 7.3 | Vite 8 needs `@vitejs/plugin-react` 6 (rolldown); too fresh for a starter |
| @vitejs/plugin-react | 5.2 | |
| @refinedev/core | 5.x | |
| @refinedev/antd | 6.x | **peers `antd ^5.23`, not antd 6** |
| @refinedev/react-router | 2.x | **peers `react-router ^7`, not 8** |
| react-router | 7.18 | |
| antd | 5.29 | pinned by the `@refinedev/antd` peer above |
| @ant-design/icons | 5.6 | matches the version `@refinedev/antd` depends on |
| lucide-react | latest | sider / resource icons, as in dealWEB |
| @tanstack/react-query | 5.x | required by Refine 5 |
| jotai | 2.x | client-only state |
| axios, dayjs | latest | |
| typescript | 5.9 | |
| vitest + @testing-library/react + jsdom | 4.x / 16.x | Jest is dropped |
| eslint 9 (flat) + typescript-eslint 8 + prettier | latest | |

Package manager: pnpm.

Deliberately excluded: real authentication, PWA/service worker,
exceljs / jspdf / html2canvas reporting, Refine devtools, MSW.

## Architecture

### Layers and dependency direction

```
app/  --->  features/*  --->  shared/  --->  (nothing)
              +---> features/other  (root index.ts only)
```

- `app/` is a composition root. Provider wiring, the router, and the Refine
  resource tree. No business logic, no feature-specific components.
- `features/<domain>/` owns everything for one domain: api, components,
  hooks, pages, types, routes. It exposes a single public `index.ts`.
- `shared/` is domain-free and reusable: layout, ui kit, table helpers,
  formatters, http clients, config, shared types.
- `providers/` holds the Refine data / auth / access-control providers.

Rules, enforced by `eslint-plugin-import`'s `no-restricted-paths`:

- `shared/` must not import from `features/` or `app/`.
- `features/a` must not import `features/b/<internals>` — only
  `features/b` (its root `index.ts`).
- Nothing outside `app/` may import `app/`.

A violation fails lint, and therefore CI. This is the property dealWEB's
layout cannot express.

### Directory layout

```
react-starter/
  .claude/
    settings.json
    rules/
    skills/add-feature/
  docs/
  public/
  src/
    app/
      providers.tsx        # QueryClient, Refine, antd ConfigProvider, auth
      router.tsx           # collects feature routes, public/protected split
      resources.ts         # Refine resource tree (drives the sider)
      app.tsx
    features/
      vendor/
        api/               # endpoints + typed request functions
        components/        # vendor-table, vendor-form, toolbar
        hooks/             # use-vendor-form, use-vendor-table
        pages/             # list.tsx create.tsx edit.tsx
        routes.tsx
        types.ts
        index.ts           # the only public entrypoint
    shared/
      components/          # layout, error, table, ui
      config/              # antd theme, env, query client, axios clients
      hooks/               # use-responsive-table, use-styles
      lib/                 # formatters, filter mapping, notifications
      types/
    providers/
      data/                # api data provider + mock data provider
      auth/                # dev auth provider (stub)
      access-control/      # allow-all stub, real shape
    test/                  # setup, render helpers, factories
    main.tsx
  AGENTS.md
  CLAUDE.md                # @AGENTS.md
  .env.example / .env.development
  eslint.config.js, vite.config.ts, tsconfig*.json
```

Path aliases: `@/*` maps to `src/*`. The single `@interfaces` alias from
dealWEB is dropped; types live with the feature that owns them.

## Data layer

The API data provider ports dealWEB's contract: `page` / `size` /
`filters` / `orderBy` query parameters, built by `generateFilter`,
`generateSort`, and `mapOperator`, with the `q` filter lifted into a
`search` parameter. Unlike dealWEB's version it is unit-tested.

A second, in-memory `mockDataProvider` (~100 lines, no dependency) is
selected when `VITE_API_MOCK=true`, which is the default in
`.env.development`. It supports pagination, sorting, filtering, and the
full CRUD surface against seeded arrays, so the app runs with no backend.
Setting `VITE_API_MOCK=false` and `VITE_APP_API_URL` switches to the real
provider with no code change.

## Auth and access control

Authentication is deliberately stubbed; the seam around it is real.

- `providers/auth/dev-auth-provider.ts` implements Refine's `AuthProvider`,
  always authenticated, returning a fixed fake identity.
- The `<Authenticated>` gate, the protected/public route split, the token
  storage key, and the axios `Authorization` request interceptor all exist
  and behave correctly.
- `providers/access-control/` implements `AccessControlProvider` with the
  real `{ resource, action }` shape and an allow-all body. Every route is
  already wrapped in `<CanAccessRoute>`.

Replacing the stub with MSAL or the in-house identity provider means
editing one file plus env vars. `docs/AUTH.md` records exactly what to
change.

## Shared kit

Carried over from dealWEB, trimmed of business specifics:
`ContentLayout` (header / sider / title), error boundary and error pages,
table toolbar, filter-dropdown search (text and select), pagination total,
full-screen loading, list skeletons, the Refine `List` / `Create` / `Edit`
wrappers, `useResponsiveTable`, formatters, and the antd theme config.

## Demo resource

`features/vendor/` is a complete worked example: a list with server-side
pagination, sorting, per-column filters and global search; create and edit
forms; a typed api module; feature-local hooks; routes; and tests.
`docs/DEMO.md` names the three edits that remove it.

## Quality gates

`pnpm verify` runs, in order: `tsc --noEmit`, `eslint .`,
`prettier --check .`, `vitest run`.

TypeScript is strict, plus `noUncheckedIndexedAccess`, `noUnusedLocals`,
`noUnusedParameters`. Tests use Vitest with Testing Library and jsdom; Jest
is not present. A lint-staged pre-commit hook is included but not installed
by default.

## Agent guidance

`AGENTS.md` at the repo root is the single source of truth for coding
conventions; `CLAUDE.md` contains only `@AGENTS.md` so Claude Code loads the
same file rather than a second copy that drifts.

`AGENTS.md` covers, briefly, with the detail delegated to `.claude/rules/`:

- **architecture-boundaries** — the layer diagram, the import rules, and
  what belongs in `app/` vs `features/` vs `shared/`.
- **components-and-logic** — components render; state, effects, and data
  access live in hooks. A `.tsx` component contains no data fetching, no
  `useEffect` orchestration, and no business rules; those move to a
  `use-*` hook in the feature's `hooks/`. Presentational components take
  props and return markup.
- **data-fetching** — all HTTP goes through `features/*/api/` or a Refine
  hook; never `axios` inside a component.
- **state-management** — server state belongs to Refine / TanStack Query;
  client-only state belongs to Jotai; server state is never mirrored into
  an atom.
- **forms** — Refine `useForm` with antd, validation colocated with the
  feature.
- **typescript** — no `any`, no non-null `!` assertions, types colocated in
  the feature's `types.ts`, no global type dumping ground.
- **naming** — kebab-case filenames, PascalCase components, `use-` prefixed
  hooks, one public `index.ts` per feature.
- **testing** — test observable behavior through Testing Library queries,
  not implementation details.

`.claude/settings.json` allowlists `pnpm lint`, `pnpm test`, `pnpm tsc`, and
`pnpm verify` so agents can self-check without permission prompts.

`.claude/skills/add-feature/` is a skill that scaffolds a new feature module
in the conventional shape, so "add a feature" produces correct structure
without re-reading every rule file.

## Documentation

- `README.md` — quickstart, scripts, environment variables.
- `docs/ARCHITECTURE.md` — layers, boundaries, and the reasoning.
- `docs/ADDING_A_FEATURE.md` — step-by-step recipe from the vendor example.
- `docs/AUTH.md` — how to replace the auth stub.
- `docs/DEMO.md` — how to delete the demo resource.
