# React Starter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a reusable Refine + Ant Design starter with self-contained feature modules, lint-enforced module boundaries, a zero-backend mock data provider, a stubbed auth seam, and agent guidance files.

**Architecture:** Three layers with a one-way dependency rule — `app/` (composition root) → `features/*` (self-contained domains) → `shared/` (domain-free kit). `providers/` supplies Refine's data/auth/access-control providers. Boundaries are enforced by ESLint so violations fail CI.

**Tech Stack:** React 19.2, Vite 7.3, TypeScript 5.9, Refine 5 (`@refinedev/core` 5 / `@refinedev/antd` 6 / `@refinedev/react-router` 2), react-router 7.18, Ant Design 5.29, TanStack Query 5, Jotai 2, Axios, Vitest 4 + Testing Library, ESLint 9 flat + Prettier, pnpm.

**Spec:** `docs/superpowers/specs/2026-09-07-react-starter-design.md`

## Global Constraints

- Package manager is **pnpm**. Never generate `package-lock.json` or `yarn.lock`.
- **`@refinedev/antd` 6 peers `antd ^5.23` — antd 6 is NOT compatible.** Pin `antd@^5.29.3`.
- **`@refinedev/react-router` 2 peers `react-router ^7` — react-router 8 is NOT compatible.** Pin `react-router@^7.18.3`.
- `@ant-design/icons` pinned to `^5.6.1` to match what `@refinedev/antd` depends on; a v6 top-level install creates duplicate icon contexts.
- Vite stays on **7.x**. Vite 8 requires `@vitejs/plugin-react` 6 (rolldown-based) — out of scope.
- TypeScript `strict: true` plus `noUncheckedIndexedAccess`, `noUnusedLocals`, `noUnusedParameters`.
- No `any`. No non-null assertions (`!`). Both are lint errors.
- Filenames are kebab-case. Components are PascalCase. Hooks are `use-*.ts(x)` exporting `useThing`.
- Inside a feature, import siblings with **relative** paths. Across features, import **only** `@/features/<name>` (the root `index.ts`).
- Jest must not appear anywhere. Vitest is the only test runner.
- Every task ends with a commit. Commit messages use Conventional Commits.
- The API response envelope for lists is `{ data: T[], totalData: number }`. Single-record endpoints return the record directly.

---

## File Structure

| Path | Responsibility |
| --- | --- |
| `package.json`, `tsconfig*.json`, `vite.config.ts`, `eslint.config.js`, `.prettierrc` | Toolchain and quality gates |
| `.env.example`, `.env.development` | Environment contract |
| `src/shared/config/env.ts` | Parse + validate `import.meta.env` once, export typed object |
| `src/shared/config/http.ts` | Axios instances + auth interceptor |
| `src/shared/config/query-client.ts` | TanStack QueryClient defaults |
| `src/shared/config/theme.ts` | antd `ThemeConfig` + global styles |
| `src/shared/lib/*` | Pure helpers: formatters, antd↔Refine filter mapping, notifications |
| `src/shared/components/layout/*` | `ContentLayout`, header, sider, title |
| `src/shared/components/error/*` | `ErrorBoundary`, `ErrorPage` |
| `src/shared/components/ui/*` | Loading, skeletons, logo, `CanAccessRoute`, Refine `List`/`Create`/`Edit` wrappers |
| `src/shared/components/table/*` | Toolbar, filter dropdowns, pagination total |
| `src/shared/hooks/*` | `useResponsiveTable` |
| `src/providers/data/*` | `mapOperator`, `generateFilter`, `generateSort`, `createApiDataProvider`, `createMockDataProvider`, `index.ts` selector |
| `src/providers/auth/*` | `devAuthProvider` |
| `src/providers/access-control/*` | `allowAllAccessControlProvider` |
| `src/features/vendor/*` | The worked example domain |
| `src/app/*` | `providers.tsx`, `router.tsx`, `resources.tsx`, `app.tsx` |
| `src/test/*` | Vitest setup, `renderWithProviders` |
| `AGENTS.md`, `CLAUDE.md`, `.claude/**` | Agent guidance |
| `README.md`, `docs/*.md` | Human docs |

---

### Task 1: Toolchain and quality gates

Establishes the repo so `pnpm verify` runs green on a trivial test. Everything later depends on this.

**Files:**
- Create: `package.json`, `pnpm-workspace.yaml`, `.gitignore`, `.npmrc`
- Create: `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`
- Create: `vite.config.ts`, `index.html`, `.prettierrc`, `.prettierignore`
- Create: `eslint.config.js`
- Create: `.env.example`, `.env.development`
- Create: `src/test/setup.ts`, `src/test/smoke.test.ts`
- Create: `src/vite-env.d.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: the `@/*` → `src/*` alias; scripts `dev`, `build`, `typecheck`, `lint`, `format:check`, `test:run`, `verify`; the `ImportMetaEnv` type used by Task 2.

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "react-starter",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "packageManager": "pnpm@10.0.0",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b --noEmit && vite build",
    "preview": "vite preview",
    "typecheck": "tsc -b --noEmit",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "test": "vitest",
    "test:run": "vitest run",
    "verify": "pnpm typecheck && pnpm lint && pnpm format:check && pnpm test:run"
  }
}
```

- [ ] **Step 2: Install dependencies**

```bash
pnpm add react@^19.2.0 react-dom@^19.2.0 react-router@^7.18.3 \
  @refinedev/core@^5.0.12 @refinedev/antd@^6.0.3 @refinedev/react-router@^2.0.4 \
  antd@^5.29.3 @ant-design/icons@^5.6.1 lucide-react@latest \
  @tanstack/react-query@^5.102.8 jotai@^2.20.3 axios@latest dayjs@^1.11.13 \
  query-string@^9.1.1
pnpm add -D typescript@~5.9.0 vite@^7.3.6 @vitejs/plugin-react@^5.2.0 \
  @types/react@^19 @types/react-dom@^19 @types/node@^22 \
  vitest@^4.1.11 jsdom@latest @vitest/ui@^4.1.11 \
  @testing-library/react@^16.3.0 @testing-library/jest-dom@^6.8.0 @testing-library/user-event@^14.6.1 \
  eslint@^9 @eslint/js@^9 typescript-eslint@^8 globals@latest \
  eslint-plugin-react-hooks@latest eslint-plugin-react-refresh@latest \
  eslint-plugin-import@latest eslint-import-resolver-typescript@latest \
  prettier@latest eslint-config-prettier@latest
```

Verify the resolved tree has no peer warnings for antd or react-router:

```bash
pnpm why antd && pnpm why react-router
```

Expected: `antd 5.29.x` only, `react-router 7.18.x` only. If a v6 antd or v8 react-router appears, the pins in Global Constraints were violated — fix before continuing.

- [ ] **Step 3: Create the TypeScript configs**

`tsconfig.json`:

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

`tsconfig.app.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "useDefineForClassFields": true,
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "skipLibCheck": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noUncheckedIndexedAccess": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] },
    "types": ["vite/client", "vitest/globals", "@testing-library/jest-dom"]
  },
  "include": ["src"]
}
```

`tsconfig.node.json`:

```json
{
  "compilerOptions": {
    "target": "ES2023",
    "lib": ["ES2023"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "skipLibCheck": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "types": ["node"]
  },
  "include": ["vite.config.ts", "eslint.config.js"]
}
```

- [ ] **Step 4: Create `vite.config.ts`**

```ts
/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: { port: 3000 },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    restoreMocks: true,
  },
});
```

- [ ] **Step 5: Create `eslint.config.js` with the boundary rules**

This is the file that makes the architecture enforceable rather than aspirational.

```js
import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import importPlugin from 'eslint-plugin-import';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  { ignores: ['dist', 'coverage', 'node_modules'] },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        project: ['./tsconfig.app.json', './tsconfig.node.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      import: importPlugin,
    },
    settings: {
      'import/resolver': { typescript: { project: './tsconfig.app.json' } },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],

      // --- Architecture boundaries ---
      'import/no-restricted-paths': [
        'error',
        {
          zones: [
            {
              target: './src/shared',
              from: ['./src/features', './src/app', './src/providers'],
              message: 'shared/ is domain-free: it must not import features, app, or providers.',
            },
            {
              target: './src/providers',
              from: ['./src/features', './src/app'],
              message: 'providers/ must not depend on features or app.',
            },
            {
              target: ['./src/features', './src/shared', './src/providers'],
              from: './src/app',
              message: 'app/ is the composition root; nothing may import it.',
            },
          ],
        },
      ],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/features/*/*'],
              message:
                'Import a feature through its public root only: @/features/<name>. Inside a feature, use relative paths.',
            },
            {
              group: ['../../features/*', '../../../features/*'],
              message: 'Use the @/features/<name> alias for cross-feature imports.',
            },
          ],
        },
      ],
      'import/no-cycle': ['error', { maxDepth: 4 }],
    },
  },
  {
    files: ['**/*.test.{ts,tsx}', 'src/test/**'],
    rules: { '@typescript-eslint/no-unsafe-assignment': 'off' },
  },
  prettier,
);
```

- [ ] **Step 6: Create `.prettierrc`, `.prettierignore`, `.gitignore`, `.npmrc`**

`.prettierrc`:

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "endOfLine": "lf"
}
```

`.prettierignore`: `dist`, `coverage`, `pnpm-lock.yaml`, `node_modules`
`.gitignore`: `node_modules`, `dist`, `coverage`, `.env.local`, `.env.*.local`, `*.local`, `.DS_Store`, `.refine`
`.npmrc`: `auto-install-peers=true` and `strict-peer-dependencies=false`

- [ ] **Step 7: Create the env files and `src/vite-env.d.ts`**

`.env.example`:

```
# true = run entirely on the in-memory mock provider, no backend required
VITE_API_MOCK=true

VITE_APP_NAME=React Starter
VITE_APP_API_URL=https://api.example.com/v1
```

`.env.development` is the same file with `VITE_API_MOCK=true` and the app URL left as the example value.

`src/vite-env.d.ts`:

```ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_MOCK: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

- [ ] **Step 8: Create `src/test/setup.ts` and a smoke test**

`src/test/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';
```

`src/test/smoke.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

describe('toolchain', () => {
  it('runs vitest', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 9: Create a minimal `index.html` and `src/main.tsx` placeholder**

`index.html` loads `/src/main.tsx` and mounts `#root`. `src/main.tsx` renders `<div>booting</div>` for now; Task 8 replaces it.

- [ ] **Step 10: Run the full gate**

Run: `pnpm verify`
Expected: typecheck clean, lint clean, prettier clean, 1 test passing.
If prettier fails, run `pnpm format` and re-run.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "chore: scaffold toolchain, boundary lint rules, and test setup"
```

---

### Task 2: Shared config layer

**Files:**
- Create: `src/shared/config/env.ts`, `src/shared/config/env.test.ts`
- Create: `src/shared/config/query-client.ts`
- Create: `src/shared/config/http.ts`
- Create: `src/shared/config/theme.ts`
- Create: `src/shared/config/constants.ts`
- Create: `src/shared/config/index.ts`

**Interfaces:**
- Consumes: `ImportMetaEnv` from Task 1.
- Produces:
  - `env: { apiUrl: string; appName: string; useMock: boolean }`
  - `TOKEN_KEY: 'react-starter.token'`
  - `queryClient: QueryClient`
  - `httpClient: AxiosInstance` (baseURL `env.apiUrl`, `Authorization: Bearer <token>` request interceptor reading `TOKEN_KEY` from `localStorage`)
  - `themeConfig: ThemeConfig`

- [ ] **Step 1: Write the failing test for env parsing**

`src/shared/config/env.test.ts`:

```ts
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
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `pnpm vitest run src/shared/config/env.test.ts`
Expected: FAIL — `parseEnv` is not exported.

- [ ] **Step 3: Implement `env.ts`**

```ts
export type AppEnv = {
  apiUrl: string;
  appName: string;
  useMock: boolean;
};

type RawEnv = {
  VITE_API_MOCK: string;
  VITE_APP_NAME: string;
  VITE_APP_API_URL: string;
};

export function parseEnv(raw: RawEnv): AppEnv {
  const useMock = raw.VITE_API_MOCK === 'true';
  const apiUrl = raw.VITE_APP_API_URL.trim();

  if (!useMock && !apiUrl) {
    throw new Error('VITE_APP_API_URL is required when VITE_API_MOCK is not "true".');
  }

  return {
    apiUrl,
    appName: raw.VITE_APP_NAME.trim() || 'React Starter',
    useMock,
  };
}

export const env: AppEnv = parseEnv(import.meta.env);
```

- [ ] **Step 4: Run the test again**

Run: `pnpm vitest run src/shared/config/env.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Implement the remaining config modules**

`constants.ts`: `export const TOKEN_KEY = 'react-starter.token';`

`query-client.ts`: a `QueryClient` with `defaultOptions.queries = { refetchOnWindowFocus: false, refetchOnReconnect: false, retry: 1, staleTime: 30_000 }`.

`http.ts`: `axios.create({ baseURL: env.apiUrl })` plus a request interceptor that reads `TOKEN_KEY` from `localStorage` and, when present, sets `config.headers.Authorization = \`Bearer ${token}\``. Export as `httpClient`. Do **not** put MSAL logic here — Task 5 owns the auth seam.

`theme.ts`: an antd `ThemeConfig` with `token.colorPrimary`, `token.borderRadius`, `token.fontFamily`, and `components.Layout` overrides. Keep it small and commented as the place to apply brand colors.

`index.ts` re-exports all of the above.

- [ ] **Step 6: Verify and commit**

```bash
pnpm verify
git add -A && git commit -m "feat(shared): add typed env, http client, query client, and theme config"
```

---

### Task 3: API data provider

Ports the dealWEB request contract, with the unit tests it never had.

**Files:**
- Create: `src/providers/data/map-operator.ts`
- Create: `src/providers/data/generate-filter.ts`, `src/providers/data/generate-filter.test.ts`
- Create: `src/providers/data/generate-sort.ts`, `src/providers/data/generate-sort.test.ts`
- Create: `src/providers/data/api-data-provider.ts`

**Interfaces:**
- Consumes: `httpClient` from Task 2.
- Produces:
  - `mapOperator(operator: CrudOperators): string`
  - `generateFilter(filters?: CrudFilters): string`
  - `generateSort(sorters?: CrudSorting): { _sort: string[]; _order: string[] } | undefined`
  - `createApiDataProvider(client: AxiosInstance): DataProvider`

- [ ] **Step 1: Write the failing tests for filter and sort generation**

`src/providers/data/generate-filter.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { generateFilter } from './generate-filter';

describe('generateFilter', () => {
  it('returns an empty string for no filters', () => {
    expect(generateFilter()).toBe('');
    expect(generateFilter([])).toBe('');
  });

  it('maps eq on a string field', () => {
    expect(generateFilter([{ field: 'name', operator: 'eq', value: 'Acme' }])).toBe('name=Acme');
  });

  it('maps contains to the -=- operator', () => {
    expect(generateFilter([{ field: 'name', operator: 'contains', value: 'Ac' }])).toBe('name-=-Ac');
  });

  it('joins array values with a semicolon', () => {
    expect(generateFilter([{ field: 'id', operator: 'in', value: [1, 2, 3] }])).toBe('id#In1;2;3');
  });

  it('renders the global search field as q==*value', () => {
    expect(generateFilter([{ field: 'q', operator: 'contains', value: 'abc' }])).toBe('q==*abc');
  });

  it('wraps an or group in parentheses joined by |', () => {
    const result = generateFilter([
      {
        operator: 'or',
        value: [
          { field: 'name', operator: 'eq', value: 'A' },
          { field: 'name', operator: 'eq', value: 'B' },
        ],
      },
    ]);
    expect(result).toBe('(name=A|name=B)');
  });

  it('joins multiple top-level filters with ", "', () => {
    const result = generateFilter([
      { field: 'name', operator: 'eq', value: 'A' },
      { field: 'active', operator: 'eq', value: true },
    ]);
    expect(result).toBe('name=A, active=true');
  });
});
```

`src/providers/data/generate-sort.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { generateSort } from './generate-sort';

describe('generateSort', () => {
  it('returns undefined when there are no sorters', () => {
    expect(generateSort()).toBeUndefined();
    expect(generateSort([])).toBeUndefined();
  });

  it('splits fields and orders into parallel arrays', () => {
    expect(
      generateSort([
        { field: 'name', order: 'asc' },
        { field: 'createdAt', order: 'desc' },
      ]),
    ).toEqual({ _sort: ['name', 'createdAt'], _order: ['asc', 'desc'] });
  });
});
```

- [ ] **Step 2: Run them and confirm they fail**

Run: `pnpm vitest run src/providers/data`
Expected: FAIL — modules not found.

- [ ] **Step 3: Implement `map-operator.ts`**

Port dealWEB's mapping verbatim — the backend depends on these exact tokens:

| operator | token | operator | token |
| --- | --- | --- | --- |
| `or` | `\|` | `in` | `#In` |
| `eq` | `=` | `nin` | `#NotIn` |
| `ne` | `!=` | `contains` / `ncontains` | `-=-` |
| `lt` | `<` | `containss` / `ncontainss` | `-=-*` |
| `gt` | `>` | `null` | `==` |
| `lte` | `<=` | `startswith` | `^` |
| `gte` | `>=` | `nstartswith` | `!^` |
| `startswiths` / `nstartswiths` | `=-*` | `endswith` | `$` |
| `nendswith` | `!$` | `endswiths` / `nendswiths` | `-=*` |

Anything else returns `''`. Implement as a `switch` over `CrudOperators` returning `string`.

- [ ] **Step 4: Implement `generate-sort.ts`**

```ts
import type { CrudSorting } from '@refinedev/core';

export type GeneratedSort = { _sort: string[]; _order: string[] };

export function generateSort(sorters?: CrudSorting): GeneratedSort | undefined {
  if (!sorters || sorters.length === 0) return undefined;

  return sorters.reduce<GeneratedSort>(
    (acc, item) => {
      acc._sort.push(item.field);
      acc._order.push(item.order);
      return acc;
    },
    { _sort: [], _order: [] },
  );
}
```

- [ ] **Step 5: Implement `generate-filter.ts`**

Recursive, typed — no `any` (dealWEB's version used `any` throughout; that is not acceptable here).

```ts
import type { CrudFilter, CrudFilters, LogicalFilter } from '@refinedev/core';
import { mapOperator } from './map-operator';

const isLogical = (filter: CrudFilter): filter is LogicalFilter => 'field' in filter;

function renderValue(field: string, mapped: string, value: unknown): string {
  if (Array.isArray(value)) {
    const allBooleanStrings = value.every((v) => v === 'true' || v === 'false');
    const operator = allBooleanStrings ? mapped.replace('*', '') : mapped;
    const separator = allBooleanStrings ? ' ' : '';
    const joined = value.map((v) => String(v)).join(';');
    return `${field}${separator}${operator}${separator}${joined}`;
  }

  if (typeof value === 'boolean') {
    return `${field}${mapped.replace('*', '')}${String(value)}`;
  }

  return `${field}${mapped}${String(value)}`;
}

function processFilter(filter: CrudFilter): string {
  if (!isLogical(filter)) {
    const joiner = filter.operator === 'or' ? '|' : ',';
    if (!Array.isArray(filter.value)) return '';

    const nested = (filter.value as CrudFilter[]).map(processFilter).filter(Boolean);
    return nested.length === 0 ? '' : `(${nested.join(joiner)})`;
  }

  const { field, operator, value } = filter;
  if (field === 'q') return `${field}==*${String(value)}`;

  return renderValue(field, mapOperator(operator), value);
}

export function generateFilter(filters?: CrudFilters): string {
  if (!filters || filters.length === 0) return '';
  return filters.map(processFilter).filter(Boolean).join(', ');
}
```

- [ ] **Step 6: Run the tests**

Run: `pnpm vitest run src/providers/data`
Expected: PASS (9 tests). If the boolean-array case fails, adjust `renderValue`'s separator handling until the `name=A, active=true` and `id#In1;2;3` cases both pass.

- [ ] **Step 7: Implement `api-data-provider.ts`**

`createApiDataProvider(client)` returns a Refine `DataProvider` implementing `getList`, `getOne`, `getMany`, `create`, `update`, `deleteOne`, `custom`, `getApiUrl`. Behaviour, ported from dealWEB:

- `getList`: pulls the `q` filter out of `filters` and sends it as a separate `search` query parameter; sends `page` (from `pagination.current`) and `size` (from `pagination.pageSize`) only when `pagination.mode === 'server'`; sends `filters` as the `generateFilter` string; sends `orderBy` as a comma-joined list where descending fields get a ` desc` suffix. Merges `meta.queries`. Serialises with `query-string`. Reads `data.data` and `data.totalData` from the envelope, falling back to the raw array and its length.
- `create` defaults to `POST`, `update` to `PATCH`, `deleteOne` to `DELETE` with `variables` in the request body; each honours `meta.method` and `meta.headers`.
- Do **not** re-attach the `Authorization` header here; the `httpClient` interceptor from Task 2 already does it. (dealWEB duplicated this.)

- [ ] **Step 8: Verify and commit**

```bash
pnpm verify
git add -A && git commit -m "feat(providers): add tested api data provider with filter and sort generation"
```

---

### Task 4: Mock data provider

Makes `pnpm dev` work with no backend.

**Files:**
- Create: `src/providers/data/mock-db.ts`
- Create: `src/providers/data/mock-data-provider.ts`, `src/providers/data/mock-data-provider.test.ts`
- Create: `src/providers/data/index.ts`

**Interfaces:**
- Consumes: nothing from earlier tasks except types.
- Produces:
  - `createMockDataProvider(seed: Record<string, MockRecord[]>): DataProvider`
  - `type MockRecord = { id: string | number } & Record<string, unknown>`
  - `dataProvider: DataProvider` — the default export selected by `env.useMock`, consumed by Task 8.

- [ ] **Step 1: Write the failing test**

`src/providers/data/mock-data-provider.test.ts`:

```ts
import { beforeEach, describe, expect, it } from 'vitest';
import type { DataProvider } from '@refinedev/core';
import { createMockDataProvider } from './mock-data-provider';

const seed = () => ({
  vendor: [
    { id: 1, name: 'Charlie', active: true },
    { id: 2, name: 'Alpha', active: false },
    { id: 3, name: 'Bravo', active: true },
  ],
});

describe('createMockDataProvider', () => {
  let provider: DataProvider;

  beforeEach(() => {
    provider = createMockDataProvider(seed());
  });

  it('paginates', async () => {
    const result = await provider.getList({
      resource: 'vendor',
      pagination: { current: 1, pageSize: 2, mode: 'server' },
    });
    expect(result.data).toHaveLength(2);
    expect(result.total).toBe(3);
  });

  it('sorts ascending by field', async () => {
    const result = await provider.getList({
      resource: 'vendor',
      sorters: [{ field: 'name', order: 'asc' }],
    });
    expect(result.data.map((r) => r.name)).toEqual(['Alpha', 'Bravo', 'Charlie']);
  });

  it('filters with contains', async () => {
    const result = await provider.getList({
      resource: 'vendor',
      filters: [{ field: 'name', operator: 'contains', value: 'ra' }],
    });
    expect(result.data.map((r) => r.name)).toEqual(['Charlie', 'Bravo']);
  });

  it('creates, reads, updates and deletes', async () => {
    const created = await provider.create({ resource: 'vendor', variables: { name: 'Delta' } });
    expect(created.data.id).toBeDefined();

    const read = await provider.getOne({ resource: 'vendor', id: created.data.id });
    expect(read.data.name).toBe('Delta');

    await provider.update({
      resource: 'vendor',
      id: created.data.id,
      variables: { name: 'Echo' },
    });
    const updated = await provider.getOne({ resource: 'vendor', id: created.data.id });
    expect(updated.data.name).toBe('Echo');

    await provider.deleteOne({ resource: 'vendor', id: created.data.id, variables: {} });
    const after = await provider.getList({ resource: 'vendor' });
    expect(after.total).toBe(3);
  });

  it('rejects an unknown id', async () => {
    await expect(provider.getOne({ resource: 'vendor', id: 999 })).rejects.toThrow(/not found/i);
  });
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `pnpm vitest run src/providers/data/mock-data-provider.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `mock-data-provider.ts`**

Implementation notes, so the tests above pass exactly:

- Keep state in a `Map<string, MockRecord[]>` built from the seed; clone the seed on construction so tests are independent.
- `getList` applies, in order: filtering → sorting → pagination. Compute `total` from the filtered length, before pagination.
- Filtering supports `eq`, `ne`, `contains` (case-insensitive `String.includes`), `in`, `gt`, `gte`, `lt`, `lte`, and the `q` field (case-insensitive substring across every string-valued property). Unknown operators are ignored rather than throwing.
- Sorting compares with `localeCompare` for strings and subtraction for numbers, reversed for `desc`.
- Pagination applies only when `pagination.mode !== 'off'`; default `current` 1, `pageSize` 10.
- `create` assigns `id = max(existing numeric ids) + 1`.
- `getOne` / `update` / `deleteOne` throw `new Error(\`Record ${id} not found in ${resource}\`)` when missing.
- Add a small artificial delay (`await new Promise((r) => setTimeout(r, 150))`) in `getList` only, so loading states are visible during development. Skip the delay when `import.meta.env.MODE === 'test'` so the suite stays fast.

- [ ] **Step 4: Implement `mock-db.ts`**

Export `mockSeed` containing 25 vendor records with fields matching Task 6's `Vendor` type: `id`, `code`, `name`, `email`, `phone`, `city`, `active`, `createdAt`. Generate them deterministically from a literal array of names — no faker dependency.

- [ ] **Step 5: Implement `index.ts` (the selector)**

```ts
import { env, httpClient } from '@/shared/config';
import { createApiDataProvider } from './api-data-provider';
import { createMockDataProvider } from './mock-data-provider';
import { mockSeed } from './mock-db';

export const dataProvider = env.useMock
  ? createMockDataProvider(mockSeed)
  : createApiDataProvider(httpClient);

export * from './generate-filter';
export * from './generate-sort';
export * from './map-operator';
```

- [ ] **Step 6: Run the tests**

Run: `pnpm vitest run src/providers/data`
Expected: PASS (14 tests total across the data folder).

- [ ] **Step 7: Verify and commit**

```bash
pnpm verify
git add -A && git commit -m "feat(providers): add in-memory mock data provider for zero-backend development"
```

---

### Task 5: Auth and access-control seams

**Files:**
- Create: `src/providers/auth/dev-auth-provider.ts`, `src/providers/auth/index.ts`
- Create: `src/providers/auth/types.ts`
- Create: `src/providers/access-control/allow-all.ts`, `src/providers/access-control/index.ts`
- Create: `src/shared/stores/user.ts`
- Create: `docs/AUTH.md`

**Interfaces:**
- Consumes: `TOKEN_KEY` from Task 2.
- Produces:
  - `type AppUser = { id: string; name: string; email: string; roles: string[] }`
  - `devAuthProvider: AuthProvider`
  - `allowAllAccessControlProvider: AccessControlProvider`
  - `userAtom: PrimitiveAtom<AppUser | undefined>`

- [ ] **Step 1: Implement `types.ts` and the user atom**

```ts
export type AppUser = {
  id: string;
  name: string;
  email: string;
  roles: string[];
};
```

`src/shared/stores/user.ts`:

```ts
import { atom } from 'jotai';
import type { AppUser } from '@/providers/auth/types';

export const userAtom = atom<AppUser | undefined>(undefined);
```

Note: `shared/` importing a type from `providers/` would violate the boundary rule from Task 1. Move `AppUser` to `src/shared/types/user.ts` and have `providers/auth` import it from there instead. Update the `Produces` path accordingly: `@/shared/types`.

- [ ] **Step 2: Implement `dev-auth-provider.ts`**

A Refine `AuthProvider` whose every method resolves successfully:

- `login`: writes a fake token to `localStorage[TOKEN_KEY]`, returns `{ success: true, redirectTo: '/' }`.
- `logout`: removes the token, returns `{ success: true, redirectTo: '/login' }`.
- `check`: returns `{ authenticated: true }` unconditionally. A one-line comment marks this as the stub that a real IdP replaces.
- `getIdentity`: returns the fixed `AppUser` `{ id: 'dev-user', name: 'Dev User', email: 'dev@example.com', roles: ['admin'] }`.
- `getPermissions`: returns `['admin']`.
- `onError`: returns `{}`.

At the top of the file, a comment block states plainly: this is a development stub, it authenticates everyone, and it must be replaced before any deployment.

- [ ] **Step 3: Implement `allow-all.ts`**

An `AccessControlProvider` whose `can({ resource, action })` always resolves `{ can: true }`, with `options.buttons = { enableAccessControl: true, hideIfUnauthorized: false }`. The signature keeps the real `{ resource, action, params }` shape so swapping in a permissions API is a body change only. Include the dealWEB `permissions/check` version commented out directly beneath, as the reference implementation.

- [ ] **Step 4: Write `docs/AUTH.md`**

Documents: which two files to replace, what `check` must return, where the token is read (`TOKEN_KEY` in `shared/config/constants.ts`), where the axios interceptor attaches it (`shared/config/http.ts`), and which env vars an MSAL or in-house-IdP integration would add.

- [ ] **Step 5: Verify and commit**

```bash
pnpm verify
git add -A && git commit -m "feat(providers): add stubbed auth and access-control seams with swap instructions"
```

---

### Task 6: Shared UI kit

**Files:**
- Create: `src/shared/components/error/error-boundary.tsx`, `error-page.tsx`, `index.ts`
- Create: `src/shared/components/layout/content-layout.tsx`, `header.tsx`, `sider.tsx`, `title.tsx`, `index.ts`
- Create: `src/shared/components/ui/full-screen-loading.tsx`, `list-skeleton.tsx`, `logo.tsx`, `can-access-route.tsx`, `index.ts`
- Create: `src/shared/components/table/table-toolbar.tsx`, `filter-dropdown-text.tsx`, `filter-dropdown-select.tsx`, `pagination-total.tsx`, `index.ts`
- Create: `src/shared/hooks/use-responsive-table.ts`, `index.ts`
- Create: `src/shared/lib/formatters.ts`, `formatters.test.ts`, `index.ts`
- Create: `src/shared/components/index.ts`

**Interfaces:**
- Consumes: `themeConfig` from Task 2.
- Produces (all re-exported from `@/shared/components`):
  - `<ContentLayout>{children}</ContentLayout>` — antd `Layout` with a collapsible sider driven by Refine's `useMenu()`, a header showing the identity from `useGetIdentity`, and a content area.
  - `<ErrorBoundary>{children}</ErrorBoundary>` — class component with `getDerivedStateFromError`, rendering `<ErrorPage />`.
  - `<ErrorPage status="404" | "403" | "500" />`
  - `<FullScreenLoading />`, `<ListSkeleton rows={number} />`
  - `<CanAccessRoute resource={string} action={string}>{children}</CanAccessRoute>` — wraps Refine's `<CanAccess>` with a `fallback={<ErrorPage status="403" />}`.
  - `<TableToolbar title={string} extra?={ReactNode} onSearch={(value: string) => void} />`
  - `<FilterDropdownText />`, `<FilterDropdownSelect options={{label,value}[]} />` — antd `filterDropdown` render props.
  - `paginationTotal(total: number, range: [number, number]): string`
  - `useResponsiveTable(): { scrollX: number; size: 'small' | 'middle' }`
  - `formatDate(value: string | Date): string`, `formatNumber(value: number): string`, `formatCurrency(value: number, currency?: string): string`

- [ ] **Step 1: Write the failing test for the formatters**

`src/shared/lib/formatters.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { formatCurrency, formatDate, formatNumber } from './formatters';

describe('formatters', () => {
  it('formats an ISO date as DD MMM YYYY', () => {
    expect(formatDate('2026-09-07T00:00:00.000Z')).toBe('07 Sep 2026');
  });

  it('returns an em dash for an empty date', () => {
    expect(formatDate('')).toBe('—');
  });

  it('groups thousands', () => {
    expect(formatNumber(1234567)).toBe('1,234,567');
  });

  it('formats currency with the given code', () => {
    expect(formatCurrency(1500, 'IDR')).toContain('1,500');
  });
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `pnpm vitest run src/shared/lib/formatters.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `formatters.ts`**

`formatDate` uses `dayjs(value).format('DD MMM YYYY')`, returning `'—'` for falsy or invalid input. `formatNumber` uses `Intl.NumberFormat('en-US')`. `formatCurrency` uses `Intl.NumberFormat('en-US', { style: 'currency', currency })` with `currency` defaulting to `'IDR'`.

- [ ] **Step 4: Run the test**

Run: `pnpm vitest run src/shared/lib/formatters.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Implement the layout components**

`content-layout.tsx` composes antd `Layout` / `Layout.Sider` / `Layout.Header` / `Layout.Content`. The sider renders menu items from Refine's `useMenu()` `menuItems` tree, marking the active item with `selectedKey`, and collapses below the `lg` breakpoint. The header renders `<Logo />` on small screens and the user's name from `useGetIdentity<AppUser>()`, with a dropdown containing a Logout item calling `useLogout()`.

Keep each file under ~120 lines. If `content-layout.tsx` grows past that, the sider menu construction moves into `use-sider-menu.ts` — a hook, not more JSX.

- [ ] **Step 6: Implement the error, ui, and table components**

`ErrorBoundary` is the one legitimate class component in the codebase; add a comment saying so, since the house rule is function components. `ErrorPage` uses antd's `Result` with a "Back to dashboard" `<Link>`.

`CanAccessRoute` wraps `<CanAccess resource action fallback={<ErrorPage status="403" />}>`.

`TableToolbar` renders a title, a debounced search `Input.Search` (300 ms, using a local `useDebouncedValue` hook in `shared/hooks/` — not lodash; drop the `lodash.debounce` dependency dealWEB carried), and an `extra` slot for action buttons.

`FilterDropdownText` and `FilterDropdownSelect` implement antd's `filterDropdown` contract: they receive `{ setSelectedKeys, selectedKeys, confirm, clearFilters }` and render an input plus Apply/Reset buttons.

- [ ] **Step 7: Implement `useResponsiveTable`**

Uses antd's `Grid.useBreakpoint()` to return `{ scrollX: 1200, size: 'small' }` on small screens and `{ scrollX: 0, size: 'middle' }` from `lg` up.

- [ ] **Step 8: Verify and commit**

```bash
pnpm verify
git add -A && git commit -m "feat(shared): add layout, error, ui, and table component kit"
```

---

### Task 7: App composition root

After this task the app boots and renders a dashboard.

**Files:**
- Create: `src/app/providers.tsx`
- Create: `src/app/resources.tsx`
- Create: `src/app/router.tsx`
- Create: `src/app/app.tsx`
- Create: `src/features/dashboard/pages/dashboard-page.tsx`, `src/features/dashboard/routes.tsx`, `src/features/dashboard/index.ts`
- Create: `src/features/auth/pages/login-page.tsx`, `src/features/auth/routes.tsx`, `src/features/auth/index.ts`
- Modify: `src/main.tsx` (replace the Task 1 placeholder)
- Create: `src/test/render.tsx`

**Interfaces:**
- Consumes: `dataProvider` (Task 4), `devAuthProvider` + `allowAllAccessControlProvider` (Task 5), `ContentLayout` / `ErrorBoundary` / `CanAccessRoute` (Task 6), `queryClient` + `themeConfig` (Task 2).
- Produces:
  - `<AppProviders>{children}</AppProviders>`
  - `resources: IResourceItem[]`
  - `router: RouteObject[]`
  - `renderWithProviders(ui: ReactElement): RenderResult` — the test helper every feature test uses.

- [ ] **Step 1: Implement `providers.tsx`**

Nesting order, outermost first: `<QueryClientProvider client={queryClient}>` → `<ConfigProvider theme={themeConfig}>` → `<AntdApp>` (antd's `App`, for message/notification context) → `<Refine ...>`. The `<Refine>` props are `dataProvider`, `authProvider={devAuthProvider}`, `accessControlProvider={allowAllAccessControlProvider}`, `routerProvider` from `@refinedev/react-router`, `resources`, `notificationProvider={useNotificationProvider}` from `@refinedev/antd`, and `options={{ syncWithLocation: true, warnWhenUnsavedChanges: true, disableTelemetry: true, projectId: undefined }}`.

- [ ] **Step 2: Implement `resources.tsx`**

An `IResourceItem[]` with a `dashboard` entry (`list: '/'`) and a `vendor` entry (`list`, `create`, `edit: '/vendor/:id'`, `show` omitted), each with `meta.label` and `meta.icon` from `lucide-react`. A commented example shows how to nest a resource under a parent group, mirroring dealWEB's Master Data grouping.

- [ ] **Step 3: Implement `router.tsx`**

Two arrays composed into one:

- `publicRoutes`: `/login` → the login page, wrapped in Refine's `<Authenticated fallback={<Outlet />}><NavigateToResource /></Authenticated>` so an authenticated visitor is bounced to the dashboard.
- `protectedRoutes`: a layout route whose `element` is `<Authenticated key="protected" fallback={<CatchAllNavigate to="/login" />}><ContentLayout><ErrorBoundary><Outlet /></ErrorBoundary></ContentLayout></Authenticated>`, with children spread from each feature's exported routes: `...dashboardRoutes`, `...vendorRoutes`.
- A trailing `{ path: '*', element: <ErrorPage status="404" /> }`.

Every feature route is imported from `@/features/<name>` only — never a deep path.

- [ ] **Step 4: Implement the dashboard and login features**

`dashboard-page.tsx` renders a `Typography.Title` and three antd `Card`s in a `Row`/`Col` grid — placeholder stat cards labelled as such. `login-page.tsx` renders a centred card with the app name and a single "Sign in" button calling `useLogin()`, plus a visible note that authentication is stubbed. Each feature exports `dashboardRoutes` / `authRoutes` from its `index.ts` and nothing else.

- [ ] **Step 5: Implement `main.tsx` and `app.tsx`**

`app.tsx` builds the router with `createBrowserRouter(router)` and renders `<AppProviders><RouterProvider router={...} /></AppProviders>`. Refine's `routerProvider` requires `<Refine>` to sit inside the router context, so instead use the documented layout: `createBrowserRouter` with a root route whose element is `<AppProviders><Outlet /><UnsavedChangesNotifier /><DocumentTitleHandler /></AppProviders>` and whose `children` are `router`. `main.tsx` renders `<StrictMode><App /></StrictMode>` into `#root`.

- [ ] **Step 6: Implement `src/test/render.tsx`**

```tsx
import type { ReactElement } from 'react';
import { render, type RenderResult } from '@testing-library/react';
import { AppProviders } from '@/app/providers';
import { MemoryRouter } from 'react-router';

export function renderWithProviders(ui: ReactElement): RenderResult {
  return render(<MemoryRouter>{ui}</MemoryRouter>, { wrapper: AppProviders });
}
```

If the boundary lint rule rejects `src/test/` importing `@/app`, add `src/test` to the `no-restricted-paths` zone exceptions in `eslint.config.js` — test helpers are allowed to reach the composition root, and that exception should be commented as deliberate.

- [ ] **Step 7: Run the app**

Run: `pnpm dev`
Expected: `http://localhost:3000` renders the dashboard inside the layout, the sider lists Dashboard and Vendor, and `/login` renders the stub login. Confirm the browser console is free of React or antd warnings before continuing.

- [ ] **Step 8: Verify and commit**

```bash
pnpm verify
git add -A && git commit -m "feat(app): wire providers, resources, router, and the dashboard shell"
```

---

### Task 8: Vendor feature — the worked example

**Files:**
- Create: `src/features/vendor/types.ts`
- Create: `src/features/vendor/api/vendor-api.ts`
- Create: `src/features/vendor/hooks/use-vendor-table.ts`
- Create: `src/features/vendor/hooks/use-vendor-form.ts`
- Create: `src/features/vendor/components/vendor-table.tsx`
- Create: `src/features/vendor/components/vendor-form.tsx`
- Create: `src/features/vendor/pages/vendor-list-page.tsx`, `vendor-create-page.tsx`, `vendor-edit-page.tsx`
- Create: `src/features/vendor/routes.tsx`
- Create: `src/features/vendor/index.ts`
- Create: `src/features/vendor/components/vendor-table.test.tsx`
- Create: `src/features/vendor/hooks/use-vendor-form.test.ts`

**Interfaces:**
- Consumes: `renderWithProviders` (Task 7), the shared table kit (Task 6), `dataProvider` (Task 4).
- Produces: `vendorRoutes: RouteObject[]`, `type Vendor`, `type VendorFormValues`.

This task is the reference every future feature copies, so its internal separation matters more than its features. **No component in this task may call `useTable`, `useForm`, or `axios` directly** — those live in the two hooks.

- [ ] **Step 1: Write `types.ts`**

```ts
export type Vendor = {
  id: number;
  code: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  active: boolean;
  createdAt: string;
};

export type VendorFormValues = Omit<Vendor, 'id' | 'createdAt'>;
```

- [ ] **Step 2: Write the failing test for the table component**

`src/features/vendor/components/vendor-table.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/render';
import { VendorTable } from './vendor-table';

const rows = [
  {
    id: 1,
    code: 'V-001',
    name: 'Acme Supplies',
    email: 'hi@acme.test',
    phone: '021-000',
    city: 'Jakarta',
    active: true,
    createdAt: '2026-01-15T00:00:00.000Z',
  },
];

describe('VendorTable', () => {
  it('renders a row per vendor', () => {
    renderWithProviders(
      <VendorTable dataSource={rows} loading={false} pagination={false} onEdit={() => {}} />,
    );
    expect(screen.getByText('Acme Supplies')).toBeInTheDocument();
    expect(screen.getByText('V-001')).toBeInTheDocument();
  });

  it('formats the created date', () => {
    renderWithProviders(
      <VendorTable dataSource={rows} loading={false} pagination={false} onEdit={() => {}} />,
    );
    expect(screen.getByText('15 Jan 2026')).toBeInTheDocument();
  });
});
```

This test is only possible because `VendorTable` is presentational — it takes rows as props. That is the point of the separation, and the test is the proof.

- [ ] **Step 3: Run it and confirm it fails**

Run: `pnpm vitest run src/features/vendor`
Expected: FAIL — `VendorTable` not found.

- [ ] **Step 4: Implement `vendor-table.tsx`**

A presentational component with the props exercised above: `dataSource: Vendor[]`, `loading: boolean`, `pagination: TablePaginationConfig | false`, `onEdit: (id: number) => void`, and optional `onChange` forwarded to antd's `Table`. Columns: Code, Name (with `FilterDropdownText`), City (with `FilterDropdownSelect`), Email, Active (rendered as an antd `Tag`), Created (via `formatDate`), and an Actions column with an Edit button. It holds no state and performs no data access.

- [ ] **Step 5: Run the test**

Run: `pnpm vitest run src/features/vendor`
Expected: PASS (2 tests).

- [ ] **Step 6: Implement `use-vendor-table.ts`**

Wraps Refine's `useTable<Vendor>({ resource: 'vendor', syncWithLocation: true, pagination: { pageSize: 10 } })` plus `useResponsiveTable()` and a `setSearch` callback that pushes a `{ field: 'q', operator: 'contains', value }` filter. Returns exactly what the page needs: `{ tableProps, search, setSearch, responsive }`. All state and all data access for the list screen live here.

- [ ] **Step 7: Implement `use-vendor-form.ts` and its test**

Wraps Refine's `useForm<Vendor, HttpError, VendorFormValues>({ resource: 'vendor', action })` where `action` is `'create' | 'edit'`. Returns `{ formProps, saveButtonProps, formLoading }`. Export a pure `vendorFormRules` object holding the antd validation rules (required on `code`, `name`; `type: 'email'` on `email`) so the rules can be unit-tested without rendering:

```ts
import { describe, expect, it } from 'vitest';
import { vendorFormRules } from './use-vendor-form';

describe('vendorFormRules', () => {
  it('requires a code and a name', () => {
    expect(vendorFormRules.code[0]).toMatchObject({ required: true });
    expect(vendorFormRules.name[0]).toMatchObject({ required: true });
  });

  it('validates the email format', () => {
    expect(vendorFormRules.email).toContainEqual(expect.objectContaining({ type: 'email' }));
  });
});
```

- [ ] **Step 8: Implement `vendor-form.tsx` and the three pages**

`vendor-form.tsx` is presentational: it takes `formProps` and renders antd `Form.Item`s using `vendorFormRules`. The pages are thin — each calls its hook, then renders the shared Refine wrapper (`<List>`, `<Create>`, `<Edit>`) around the presentational component. A page should be under 40 lines; if it is longer, logic leaked out of the hook.

- [ ] **Step 9: Implement `routes.tsx` and `index.ts`**

`routes.tsx` lazy-loads each page with `React.lazy` and wraps each element in `<CanAccessRoute resource="vendor" action="list|create|edit">` and a `<Suspense fallback={<ListSkeleton rows={8} />}>`. `index.ts` exports **only** `vendorRoutes` and the `Vendor` type — nothing else leaves the feature.

- [ ] **Step 10: Wire it into the router and run the app**

Add `...vendorRoutes` to `protectedRoutes` in `src/app/router.tsx`.

Run: `pnpm dev`, then exercise `/vendor`: page through the list, sort by Name, filter by City, search, create a vendor, edit it. All of it works against the mock provider.

- [ ] **Step 11: Verify and commit**

```bash
pnpm verify
git add -A && git commit -m "feat(vendor): add the reference CRUD feature module with tests"
```

---

### Task 9: Agent guidance

**Files:**
- Create: `AGENTS.md`, `CLAUDE.md`
- Create: `.claude/settings.json`
- Create: `.claude/rules/architecture-boundaries.md`
- Create: `.claude/rules/components-and-logic.md`
- Create: `.claude/rules/data-fetching.md`
- Create: `.claude/rules/state-management.md`
- Create: `.claude/rules/forms.md`
- Create: `.claude/rules/typescript.md`
- Create: `.claude/rules/naming.md`
- Create: `.claude/rules/testing.md`
- Create: `.claude/skills/add-feature/SKILL.md`

**Interfaces:**
- Consumes: the conventions established by Tasks 1–8. Every rule must describe code that actually exists in the repo, with a real file path as its example.
- Produces: documentation only.

- [ ] **Step 1: Write `AGENTS.md`**

Structure, in this order: what the project is; the stack table; the layer diagram and the three import rules; a numbered list of the non-negotiable rules, each one sentence linking to its `.claude/rules/` file; the commands (`pnpm dev`, `pnpm verify`, and the instruction to run `pnpm verify` before claiming work is done); and a "before you add a dependency, ask" line.

Keep it under 120 lines. It is loaded into every agent's context; length costs attention.

- [ ] **Step 2: Write `CLAUDE.md`**

One line only, so there is a single source of truth:

```markdown
@AGENTS.md
```

- [ ] **Step 3: Write `.claude/rules/components-and-logic.md`**

This is the rule the user asked for by name ("pisahkan antara komponen dan logika"). It must be concrete, not a slogan:

- A `.tsx` component renders. It may hold trivial UI-only state (an open/closed drawer). It must not fetch data, orchestrate `useEffect` chains, or contain business rules.
- State, effects, and data access live in a `use-*` hook in the feature's `hooks/`. The hook returns exactly what the component needs, not raw library objects where a narrower shape will do.
- The test is mechanical: if a component cannot be rendered in a test by passing props alone, its logic has not been extracted yet.
- Show the good and bad versions side by side, citing the real files: `src/features/vendor/components/vendor-table.tsx` (presentational) against `src/features/vendor/hooks/use-vendor-table.ts` (logic), and name `src/features/vendor/components/vendor-table.test.tsx` as the payoff.
- A file over ~200 lines is a signal it is doing too much.

- [ ] **Step 4: Write the remaining rule files**

Each is 20–60 lines, each cites a real file in this repo:

- `architecture-boundaries.md` — the diagram, the three zones, what `import/no-restricted-paths` and `no-restricted-imports` reject, and how to fix a violation (usually: move the shared thing to `shared/`, or export it from the feature root).
- `data-fetching.md` — Refine hooks or `features/*/api/`; never `axios` in a component; the `{ data, totalData }` envelope; how the mock provider is selected.
- `state-management.md` — server state is Refine/TanStack Query's; client state is Jotai's; never copy server data into an atom; `userAtom` as the example of legitimate client state.
- `forms.md` — Refine `useForm` + antd, rules exported separately so they are testable, `vendorFormRules` as the example.
- `typescript.md` — no `any`, no `!`, `type` over `interface` for object shapes, types colocated in the feature's `types.ts`, and why there is no global `interfaces/index.ts`.
- `naming.md` — kebab-case files, PascalCase components, `use-` hooks, one `index.ts` per feature, relative imports inside a feature and `@/features/<name>` across features.
- `testing.md` — Vitest only, Testing Library queries by role and text rather than test ids, test behaviour not implementation, `renderWithProviders` as the entry point, and that pure logic (formatters, filter generation, the mock provider) is tested directly without rendering.

- [ ] **Step 5: Write `.claude/settings.json`**

```json
{
  "permissions": {
    "allow": [
      "Bash(pnpm install)",
      "Bash(pnpm dev)",
      "Bash(pnpm build)",
      "Bash(pnpm lint)",
      "Bash(pnpm lint:fix)",
      "Bash(pnpm typecheck)",
      "Bash(pnpm test:run)",
      "Bash(pnpm test:run:*)",
      "Bash(pnpm format)",
      "Bash(pnpm format:check)",
      "Bash(pnpm verify)",
      "Bash(pnpm vitest run:*)",
      "Bash(git status)",
      "Bash(git diff:*)",
      "Bash(git log:*)"
    ]
  }
}
```

- [ ] **Step 6: Write `.claude/skills/add-feature/SKILL.md`**

Frontmatter `name: add-feature`, `description: Use when adding a new domain feature (a CRUD screen or similar) to this project — scaffolds the conventional feature module structure and wires it into the router and resources.`

Body: the ordered checklist an agent follows — create `src/features/<name>/` with `types.ts`, `api/`, `hooks/`, `components/`, `pages/`, `routes.tsx`, `index.ts`; write the presentational component test first; keep logic in hooks; export only routes and public types; register the routes in `src/app/router.tsx` and the resource in `src/app/resources.tsx`; run `pnpm verify`. It names `src/features/vendor/` as the file-by-file template to copy.

- [ ] **Step 7: Verify and commit**

```bash
pnpm verify
git add -A && git commit -m "docs: add AGENTS.md, coding rules, and the add-feature skill"
```

---

### Task 10: Human documentation and final verification

**Files:**
- Create: `README.md`
- Create: `docs/ARCHITECTURE.md`, `docs/ADDING_A_FEATURE.md`, `docs/DEMO.md`
- Modify: `.env.example` (final review of documented variables)

**Interfaces:**
- Consumes: everything.
- Produces: documentation only.

- [ ] **Step 1: Write `README.md`**

Quickstart (`pnpm install`, `cp .env.example .env.development`, `pnpm dev` — noting it runs with no backend), the script table, the env var table, a one-paragraph structure overview linking to `docs/ARCHITECTURE.md`, and a "what to do first in a new project" list: rename in `package.json`, set the theme colour, replace the auth stub per `docs/AUTH.md`, delete the demo per `docs/DEMO.md`.

- [ ] **Step 2: Write `docs/ARCHITECTURE.md`**

The layer diagram, what belongs in each layer, the import rules and the lint rules that enforce them, the data-provider contract with a worked example request URL, and the auth seam. Explain the reasoning, not just the rules — this is the file that survives when the conventions are questioned.

- [ ] **Step 3: Write `docs/ADDING_A_FEATURE.md`**

The same recipe as the `add-feature` skill, written for a human: the folder to create, the order to build in (types → api → hooks → presentational components → pages → routes → register), with real snippets lifted from `features/vendor/`.

- [ ] **Step 4: Write `docs/DEMO.md`**

Exactly three steps to remove the example: delete `src/features/vendor/`, remove the `vendorRoutes` import and spread from `src/app/router.tsx`, remove the `vendor` entry from `src/app/resources.tsx`. Add a fourth line noting `src/providers/data/mock-db.ts` seeds vendor data that can go too.

- [ ] **Step 5: Full clean verification**

```bash
rm -rf node_modules
pnpm install
pnpm verify
pnpm build
```

Expected: install without peer warnings on antd or react-router, all four gates pass, production build succeeds.

- [ ] **Step 6: Confirm the boundary rules actually fire**

Temporarily add `import { VendorTable } from '@/features/vendor/components/vendor-table';` to `src/shared/lib/formatters.ts`.

Run: `pnpm lint`
Expected: TWO errors — `import/no-restricted-paths` (shared importing features) and `no-restricted-imports` (deep feature import).

Remove the line and re-run `pnpm lint`. Expected: clean. This step verifies the architecture is enforced rather than merely documented; do not skip it.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "docs: add README and architecture, feature, and demo guides"
```

---

## Self-Review

**Spec coverage:** Purpose/success criteria → Tasks 1, 8, 10. Stack table → Task 1 Step 2. Layers and boundaries → Task 1 Step 5, verified in Task 10 Step 6. Directory layout → Tasks 2–8. Data layer → Tasks 3, 4. Auth and access control → Task 5. Shared kit → Task 6. Demo resource → Task 8. Quality gates → Task 1, run at the end of every task. Agent guidance → Task 9. Documentation → Tasks 5, 9, 10. No spec section is unimplemented.

**Known corrections applied:** Task 5 Step 1 initially placed `AppUser` in `providers/auth/types.ts` while `shared/stores/user.ts` imported it — a boundary violation. The step now instructs moving `AppUser` to `src/shared/types/user.ts`. Task 7 Step 6 flags that `src/test/` needs an explicit, commented exception to the boundary zones.

**Type consistency:** `Vendor` (Task 8) matches the seed fields in `mock-db.ts` (Task 4 Step 4). `AppUser` is used identically in Task 5 and Task 6's header. `dataProvider`, `devAuthProvider`, and `allowAllAccessControlProvider` are named the same where produced (Tasks 4, 5) and consumed (Task 7). `generateFilter` / `generateSort` / `mapOperator` keep one name each throughout.
