import { describe, expect, it } from 'vitest';
import { formatCurrency, formatDate, formatDateTime, formatNumber } from './formatters';

describe('formatters', () => {
  it('formats an ISO date as DD MMM YYYY', () => {
    expect(formatDate('2026-09-07T00:00:00.000Z')).toBe('07 Sep 2026');
  });

  it('returns an em dash for an empty date', () => {
    expect(formatDate('')).toBe('—');
  });

  it('returns an em dash for an unparseable date', () => {
    expect(formatDate('not-a-date')).toBe('—');
  });

  it('includes the time in formatDateTime', () => {
    expect(formatDateTime('2026-09-07T13:45:00.000Z')).toMatch(/^07 Sep 2026 \d{2}:\d{2}$/);
  });

  it('groups thousands', () => {
    expect(formatNumber(1234567)).toBe('1,234,567');
  });

  it('returns an em dash for a non-finite number', () => {
    expect(formatNumber(Number.NaN)).toBe('—');
  });

  it('formats currency with the given code', () => {
    expect(formatCurrency(1500, 'IDR')).toContain('1,500');
  });
});
