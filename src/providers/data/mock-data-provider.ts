import type {
  BaseKey,
  CreateManyParams,
  CreateParams,
  CrudFilter,
  CrudFilters,
  CrudSorting,
  DataProvider,
  DeleteManyParams,
  DeleteOneParams,
  GetListParams,
  GetManyParams,
  GetOneParams,
  LogicalFilter,
  UpdateManyParams,
  UpdateParams,
} from '@refinedev/core';

export type MockRecord = { id: BaseKey } & Record<string, unknown>;
export type MockSeed = Record<string, MockRecord[]>;

/** Loading states are invisible without one; tests skip it. */
const LIST_DELAY_MS = import.meta.env.MODE === 'test' ? 0 : 150;

const delay = (ms: number) => (ms > 0 ? new Promise((resolve) => setTimeout(resolve, ms)) : null);

const isLogicalFilter = (filter: CrudFilter): filter is LogicalFilter => 'field' in filter;

function matchesQ(record: MockRecord, value: unknown): boolean {
  const needle = String(value).toLowerCase();

  return Object.values(record).some(
    (field) => typeof field === 'string' && field.toLowerCase().includes(needle),
  );
}

function matchesFilter(record: MockRecord, filter: CrudFilter): boolean {
  // Conditional (and/or) groups nest; recurse into them.
  if (!isLogicalFilter(filter)) {
    if (!Array.isArray(filter.value)) return true;

    return filter.operator === 'or'
      ? filter.value.some((child) => matchesFilter(record, child))
      : filter.value.every((child) => matchesFilter(record, child));
  }

  const { field, operator, value } = filter;

  if (field === 'q') {
    return matchesQ(record, value);
  }

  const actual = record[field];

  switch (operator) {
    case 'eq':
      return actual === value;
    case 'ne':
      return actual !== value;
    case 'contains':
      return String(actual).toLowerCase().includes(String(value).toLowerCase());
    case 'ncontains':
      return !String(actual).toLowerCase().includes(String(value).toLowerCase());
    case 'startswith':
      return String(actual).toLowerCase().startsWith(String(value).toLowerCase());
    case 'endswith':
      return String(actual).toLowerCase().endsWith(String(value).toLowerCase());
    case 'in':
      return Array.isArray(value) && value.includes(actual);
    case 'nin':
      return Array.isArray(value) && !value.includes(actual);
    case 'gt':
      return Number(actual) > Number(value);
    case 'gte':
      return Number(actual) >= Number(value);
    case 'lt':
      return Number(actual) < Number(value);
    case 'lte':
      return Number(actual) <= Number(value);
    default:
      // Unknown operators are ignored rather than throwing, so a screen using
      // an operator the mock has not learned still renders.
      return true;
  }
}

function compareValues(a: unknown, b: unknown): number {
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  if (typeof a === 'boolean' && typeof b === 'boolean') return Number(a) - Number(b);
  return String(a ?? '').localeCompare(String(b ?? ''));
}

function applySorters(records: MockRecord[], sorters?: CrudSorting): MockRecord[] {
  if (!sorters || sorters.length === 0) return records;

  return [...records].sort((left, right) => {
    for (const sorter of sorters) {
      const result = compareValues(left[sorter.field], right[sorter.field]);
      if (result !== 0) {
        return sorter.order === 'desc' ? -result : result;
      }
    }
    return 0;
  });
}

function applyFilters(records: MockRecord[], filters?: CrudFilters): MockRecord[] {
  if (!filters || filters.length === 0) return records;

  return records.filter((record) => filters.every((filter) => matchesFilter(record, filter)));
}

function nextId(records: MockRecord[]): number {
  const numericIds = records.map((record) => Number(record.id)).filter((id) => Number.isFinite(id));

  return numericIds.length === 0 ? 1 : Math.max(...numericIds) + 1;
}

/**
 * An in-memory data provider so the app runs with no backend.
 *
 * Selected by `VITE_API_MOCK=true`. It is a development aid, not a fixture
 * framework: state lives for the lifetime of the page and resets on reload.
 */
export function createMockDataProvider(seed: MockSeed): Required<DataProvider> {
  const tables = new Map<string, MockRecord[]>(
    Object.entries(seed).map(([resource, records]) => [
      resource,
      records.map((record) => ({ ...record })),
    ]),
  );

  const tableOf = (resource: string): MockRecord[] => {
    const existing = tables.get(resource);
    if (existing) return existing;

    const created: MockRecord[] = [];
    tables.set(resource, created);
    return created;
  };

  const findIndex = (resource: string, id: BaseKey): number => {
    const index = tableOf(resource).findIndex((record) => String(record.id) === String(id));

    if (index === -1) {
      throw new Error(`Record ${String(id)} not found in ${resource}`);
    }

    return index;
  };

  const requireRecord = (resource: string, id: BaseKey): MockRecord => {
    const record = tableOf(resource)[findIndex(resource, id)];

    if (!record) {
      throw new Error(`Record ${String(id)} not found in ${resource}`);
    }

    return record;
  };

  const provider = {
    getList: async ({ resource, pagination, filters, sorters }: GetListParams) => {
      await delay(LIST_DELAY_MS);

      const { currentPage = 1, pageSize = 10, mode = 'server' } = pagination ?? {};

      const filtered = applyFilters(tableOf(resource), filters);
      const sorted = applySorters(filtered, sorters);

      if (mode === 'off') {
        return { data: sorted, total: sorted.length };
      }

      const start = (currentPage - 1) * pageSize;

      return {
        data: sorted.slice(start, start + pageSize),
        total: filtered.length,
      };
    },

    // These must be async: requireRecord/findIndex throw, and Refine callers
    // expect a rejected promise rather than a synchronous exception.
    getOne: async ({ resource, id }: GetOneParams) => ({
      data: { ...requireRecord(resource, id) },
    }),

    getMany: async ({ resource, ids }: GetManyParams) => {
      const wanted = new Set(ids.map(String));

      return {
        data: tableOf(resource).filter((record) => wanted.has(String(record.id))),
      };
    },

    create: async ({ resource, variables }: CreateParams<Record<string, unknown>>) => {
      const table = tableOf(resource);
      const record: MockRecord = {
        ...variables,
        id: nextId(table),
      };

      table.push(record);
      return { data: { ...record } };
    },

    createMany: async ({ resource, variables }: CreateManyParams<Record<string, unknown>>) => {
      const table = tableOf(resource);

      const created = variables.map((item) => {
        const record: MockRecord = { ...item, id: nextId(table) };
        table.push(record);
        return { ...record };
      });

      return { data: created };
    },

    update: async ({ resource, id, variables }: UpdateParams<Record<string, unknown>>) => {
      const record = requireRecord(resource, id);
      Object.assign(record, variables);

      return { data: { ...record } };
    },

    updateMany: async ({ resource, ids, variables }: UpdateManyParams<Record<string, unknown>>) => {
      const updated = ids.map((id) => {
        const record = requireRecord(resource, id);
        Object.assign(record, variables);
        return { ...record };
      });

      return { data: updated };
    },

    deleteOne: async ({ resource, id }: DeleteOneParams) => {
      const table = tableOf(resource);
      const [removed] = table.splice(findIndex(resource, id), 1);

      return { data: removed as MockRecord };
    },

    deleteMany: async ({ resource, ids }: DeleteManyParams) => {
      const removed = ids.map((id) => {
        const table = tableOf(resource);
        const [record] = table.splice(findIndex(resource, id), 1);
        return record as MockRecord;
      });

      return { data: removed };
    },

    getApiUrl: () => 'mock://in-memory',

    custom: () =>
      Promise.reject(
        new Error(
          'The mock data provider has no custom() implementation. ' +
            'Set VITE_API_MOCK=false to use the real API, or extend createMockDataProvider.',
        ),
      ),
  };

  // Refine types every data method as generic over TData, which a concrete
  // in-memory store cannot satisfy. One cast at the boundary is clearer than
  // casting every return value.
  return provider as unknown as Required<DataProvider>;
}
