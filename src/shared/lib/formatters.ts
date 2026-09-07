import dayjs from 'dayjs';

/** Rendered wherever a value is missing, so empty cells look deliberate. */
export const EMPTY = '—';

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return EMPTY;

  const date = dayjs(value);
  return date.isValid() ? date.format('DD MMM YYYY') : EMPTY;
}

export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return EMPTY;

  const date = dayjs(value);
  return date.isValid() ? date.format('DD MMM YYYY HH:mm') : EMPTY;
}

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return EMPTY;

  return new Intl.NumberFormat('en-US').format(value);
}

export function formatCurrency(value: number | null | undefined, currency = 'IDR'): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return EMPTY;

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}
