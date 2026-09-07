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
    expect(generateFilter([{ field: 'name', operator: 'contains', value: 'Ac' }])).toBe(
      'name-=-Ac',
    );
  });

  it('joins array values with a semicolon', () => {
    expect(generateFilter([{ field: 'id', operator: 'in', value: [1, 2, 3] }])).toBe('id#In1;2;3');
  });

  it('renders the global search field as q==*value', () => {
    expect(generateFilter([{ field: 'q', operator: 'contains', value: 'abc' }])).toBe('q==*abc');
  });

  it('renders a boolean value without the trailing star', () => {
    expect(generateFilter([{ field: 'active', operator: 'eq', value: true }])).toBe('active=true');
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

  it('wraps an and group in parentheses joined by a comma', () => {
    const result = generateFilter([
      {
        operator: 'and',
        value: [
          { field: 'name', operator: 'eq', value: 'A' },
          { field: 'city', operator: 'eq', value: 'Jakarta' },
        ],
      },
    ]);
    expect(result).toBe('(name=A,city=Jakarta)');
  });

  it('drops a logical group with no usable children', () => {
    expect(generateFilter([{ operator: 'or', value: [] }])).toBe('');
  });

  it('joins multiple top-level filters with ", "', () => {
    const result = generateFilter([
      { field: 'name', operator: 'eq', value: 'A' },
      { field: 'active', operator: 'eq', value: true },
    ]);
    expect(result).toBe('name=A, active=true');
  });
});
