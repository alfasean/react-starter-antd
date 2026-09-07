import type { CrudFilter, CrudFilters, LogicalFilter } from '@refinedev/core';
import { mapOperator } from './map-operator';

const isLogicalFilter = (filter: CrudFilter): filter is LogicalFilter => 'field' in filter;

function renderValue(field: string, mapped: string, value: unknown): string {
  if (Array.isArray(value)) {
    const values: unknown[] = value;
    const allBooleanStrings = values.every((v) => v === 'true' || v === 'false');
    const joined = values.map((v) => String(v)).join(';');

    // Boolean sets are sent with the plain operator and spaces around it.
    if (allBooleanStrings) {
      return `${field} ${mapped.replace('*', '')} ${joined}`;
    }

    return `${field}${mapped}${joined}`;
  }

  if (typeof value === 'boolean') {
    return `${field}${mapped.replace('*', '')}${String(value)}`;
  }

  return `${field}${mapped}${String(value)}`;
}

function processFilter(filter: CrudFilter): string {
  // Conditional filters ({ operator: 'or' | 'and', value: CrudFilter[] })
  // nest, so recurse before treating anything as a leaf.
  if (!isLogicalFilter(filter)) {
    if (!Array.isArray(filter.value)) {
      return '';
    }

    const joiner = filter.operator === 'or' ? '|' : ',';
    const nested = filter.value.map(processFilter).filter(Boolean);

    return nested.length === 0 ? '' : `(${nested.join(joiner)})`;
  }

  const { field, operator, value } = filter;

  // `q` is the global search box; the backend spells it differently.
  if (field === 'q') {
    return `${field}==*${String(value)}`;
  }

  return renderValue(field, mapOperator(operator), value);
}

/**
 * Builds the `filters` query-string value from Refine's filter list.
 *
 * @example
 *   generateFilter([{ field: 'name', operator: 'contains', value: 'ac' }])
 *   // => 'name-=-ac'
 */
export function generateFilter(filters?: CrudFilters): string {
  if (!filters || filters.length === 0) {
    return '';
  }

  return filters.map(processFilter).filter(Boolean).join(', ');
}
