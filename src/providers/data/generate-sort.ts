import type { CrudSorting } from '@refinedev/core';

export type GeneratedSort = {
  _sort: string[];
  _order: string[];
};

/**
 * Splits Refine's sorter list into parallel field and direction arrays, which
 * the data provider then renders as `orderBy=name,createdAt desc`.
 */
export function generateSort(sorters?: CrudSorting): GeneratedSort | undefined {
  if (!sorters || sorters.length === 0) {
    return undefined;
  }

  return sorters.reduce<GeneratedSort>(
    (acc, item) => {
      acc._sort.push(item.field);
      acc._order.push(item.order);
      return acc;
    },
    { _sort: [], _order: [] },
  );
}
