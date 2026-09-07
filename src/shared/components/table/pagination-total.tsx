import { formatNumber } from '@/shared/lib';

/**
 * antd's `pagination.showTotal` renderer.
 *
 * @example
 *   pagination={{ showTotal: paginationTotal }}
 */
export function paginationTotal(total: number, range: [number, number]): string {
  if (total === 0) return 'No records';

  return `${formatNumber(range[0])}–${formatNumber(range[1])} of ${formatNumber(total)}`;
}
