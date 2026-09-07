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
