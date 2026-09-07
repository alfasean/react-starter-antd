import type { DataProvider, LogicalFilter } from '@refinedev/core';
import type { AxiosInstance } from 'axios';
import queryString from 'query-string';

import { generateFilter } from './generate-filter';
import { generateSort } from './generate-sort';

type ReadMethod = 'get' | 'delete' | 'head' | 'options';
type WriteMethod = 'post' | 'put' | 'patch';

/** List endpoints wrap their payload; single-record endpoints do not. */
type ListEnvelope<T> = {
  data?: T[];
  totalData?: number;
};

/**
 * Data provider for the application API.
 *
 * Request shape:
 *   GET /vendor?page=1&size=10&filters=name-=-ac&orderBy=name,createdAt%20desc&search=ac
 *
 * The Authorization header is attached by the axios interceptor in
 * `shared/config/http.ts` — never set it here.
 */
export function createApiDataProvider(httpClient: AxiosInstance): Required<DataProvider> {
  return {
    getList: async ({ resource, pagination, filters, sorters, meta }) => {
      // Refine 5 renamed `current` to `currentPage`.
      const { currentPage = 1, pageSize = 10, mode = 'server' } = pagination ?? {};
      const { headers, method, queries } = meta ?? {};
      const requestMethod = (method as ReadMethod | undefined) ?? 'get';

      // The global search box arrives as a `q` filter but travels as its own
      // `search` parameter, so lift it out before building the filter string.
      const searchFilter = filters?.find((filter) => (filter as LogicalFilter).field === 'q') as
        LogicalFilter | undefined;

      const remainingFilters = filters?.filter((filter) => (filter as LogicalFilter).field !== 'q');

      const query: Record<string, unknown> = {};

      if (mode === 'server') {
        query.page = currentPage;
        query.size = pageSize;
      }

      const generatedFilter = generateFilter(remainingFilters);
      if (generatedFilter) {
        query.filters = generatedFilter;
      }

      const generatedSort = generateSort(sorters);
      if (generatedSort) {
        const { _sort, _order } = generatedSort;
        query.orderBy = _sort
          .map((field, index) => (_order[index] === 'desc' ? `${field} desc` : field))
          .join(',');
      }

      if (searchFilter) {
        query.search = searchFilter.value;
      }

      const combined = { ...query, ...(queries as Record<string, unknown> | undefined) };
      const url = Object.keys(combined).length
        ? `${resource}?${queryString.stringify(combined)}`
        : `${resource}`;

      const { data } = await httpClient[requestMethod]<ListEnvelope<never> | never[]>(url, {
        headers,
      });

      if (Array.isArray(data)) {
        return { data, total: data.length };
      }

      return {
        data: data.data ?? [],
        total: data.totalData ?? data.data?.length ?? 0,
      };
    },

    getOne: async ({ resource, id, meta }) => {
      const { headers, method } = meta ?? {};
      const requestMethod = (method as ReadMethod | undefined) ?? 'get';

      const { data } = await httpClient[requestMethod](`${resource}/${id}`, { headers });

      return { data };
    },

    getMany: async ({ resource, ids, meta }) => {
      const { headers, method } = meta ?? {};
      const requestMethod = (method as ReadMethod | undefined) ?? 'get';

      const { data } = await httpClient[requestMethod](
        `${resource}?${queryString.stringify({ id: ids })}`,
        { headers },
      );

      return { data };
    },

    create: async ({ resource, variables, meta }) => {
      const { headers, method } = meta ?? {};
      const requestMethod = (method as WriteMethod | undefined) ?? 'post';

      const { data } = await httpClient[requestMethod](`${resource}`, variables, { headers });

      return { data };
    },

    createMany: async ({ resource, variables, meta }) => {
      const { headers, method } = meta ?? {};
      const requestMethod = (method as WriteMethod | undefined) ?? 'post';

      const { data } = await httpClient[requestMethod](`${resource}/bulk`, variables, { headers });

      return { data };
    },

    update: async ({ resource, id, variables, meta }) => {
      const { headers, method } = meta ?? {};
      const requestMethod = (method as WriteMethod | undefined) ?? 'patch';

      const { data } = await httpClient[requestMethod](`${resource}/${id}`, variables, { headers });

      return { data };
    },

    updateMany: async ({ resource, ids, variables, meta }) => {
      const { headers, method } = meta ?? {};
      const requestMethod = (method as WriteMethod | undefined) ?? 'patch';

      const { data } = await httpClient[requestMethod](
        `${resource}/bulk?${queryString.stringify({ id: ids })}`,
        variables,
        { headers },
      );

      return { data };
    },

    deleteOne: async ({ resource, id, variables, meta }) => {
      const { headers } = meta ?? {};

      const { data } = await httpClient.delete(`${resource}/${id}`, {
        data: variables,
        headers,
      });

      return { data };
    },

    deleteMany: async ({ resource, ids, variables, meta }) => {
      const { headers } = meta ?? {};

      const { data } = await httpClient.delete(
        `${resource}/bulk?${queryString.stringify({ id: ids })}`,
        { data: variables, headers },
      );

      return { data };
    },

    getApiUrl: () => httpClient.getUri(),

    custom: async ({ url, method, filters, sorters, payload, query, headers, meta }) => {
      const params: Record<string, unknown> = { ...(query as Record<string, unknown> | undefined) };

      const generatedFilter = generateFilter(filters);
      if (generatedFilter) {
        params.filters = generatedFilter;
      }

      const generatedSort = generateSort(sorters);
      if (generatedSort) {
        const { _sort, _order } = generatedSort;
        params.orderBy = _sort
          .map((field, index) => (_order[index] === 'desc' ? `${field} desc` : field))
          .join(',');
      }

      if (meta?.queries) {
        Object.assign(params, meta.queries);
      }

      const requestUrl = Object.keys(params).length
        ? `${url}?${queryString.stringify(params)}`
        : url;

      switch (method) {
        case 'post':
        case 'put':
        case 'patch': {
          const { data } = await httpClient[method](requestUrl, payload, { headers });
          return { data };
        }
        case 'delete': {
          const { data } = await httpClient.delete(requestUrl, { data: payload, headers });
          return { data };
        }
        default: {
          const { data } = await httpClient.get(requestUrl, { headers });
          return { data };
        }
      }
    },
  };
}
