import { useCallback } from 'react';
import { useTable } from '@refinedev/antd';
import { useNavigation } from '@refinedev/core';

import { DEFAULT_PAGE_SIZE } from '@/shared/config';
import type { Vendor } from '../types';

/**
 * Everything the vendor list screen needs: data, paging, sorting, filtering,
 * search, and navigation.
 *
 * The page component below this hook renders and nothing else — see
 * .claude/rules/components-and-logic.md.
 */
export function useVendorTable() {
  const { tableProps, setFilters } = useTable<Vendor>({
    resource: 'vendor',
    syncWithLocation: true,
    pagination: { pageSize: DEFAULT_PAGE_SIZE },
  });

  const { edit, create } = useNavigation();

  // `q` is the global search term; the data provider lifts it into its own
  // `search` query parameter.
  const setSearch = useCallback(
    (value: string) => {
      setFilters(
        value
          ? [{ field: 'q', operator: 'contains', value }]
          : [{ field: 'q', operator: 'contains', value: undefined }],
        'merge',
      );
    },
    [setFilters],
  );

  const goToEdit = useCallback((id: number) => edit('vendor', id), [edit]);
  const goToCreate = useCallback(() => create('vendor'), [create]);

  return { tableProps, setSearch, goToEdit, goToCreate };
}
