import { beforeEach, describe, expect, it } from 'vitest';
import type { DataProvider } from '@refinedev/core';
import { createMockDataProvider } from './mock-data-provider';

const seed = () => ({
  vendor: [
    { id: 1, name: 'Charlie', city: 'Bandung', active: true },
    { id: 2, name: 'Alpha', city: 'Jakarta', active: false },
    { id: 3, name: 'Bravo', city: 'Jakarta', active: true },
  ],
});

describe('createMockDataProvider', () => {
  let provider: DataProvider;

  beforeEach(() => {
    provider = createMockDataProvider(seed());
  });

  it('paginates and reports the unpaginated total', async () => {
    const result = await provider.getList({
      resource: 'vendor',
      pagination: { currentPage: 1, pageSize: 2, mode: 'server' },
    });
    expect(result.data).toHaveLength(2);
    expect(result.total).toBe(3);
  });

  it('sorts ascending by field', async () => {
    const result = await provider.getList({
      resource: 'vendor',
      sorters: [{ field: 'name', order: 'asc' }],
    });
    expect(result.data.map((r) => r.name)).toEqual(['Alpha', 'Bravo', 'Charlie']);
  });

  it('sorts descending by field', async () => {
    const result = await provider.getList({
      resource: 'vendor',
      sorters: [{ field: 'name', order: 'desc' }],
    });
    expect(result.data.map((r) => r.name)).toEqual(['Charlie', 'Bravo', 'Alpha']);
  });

  it('filters with contains, case-insensitively', async () => {
    const result = await provider.getList({
      resource: 'vendor',
      filters: [{ field: 'name', operator: 'contains', value: 'R' }],
    });
    expect(result.data.map((r) => r.name)).toEqual(['Charlie', 'Bravo']);
  });

  it('filters with eq on a boolean', async () => {
    const result = await provider.getList({
      resource: 'vendor',
      filters: [{ field: 'active', operator: 'eq', value: true }],
    });
    expect(result.total).toBe(2);
  });

  it('searches every string field via the q filter', async () => {
    const result = await provider.getList({
      resource: 'vendor',
      filters: [{ field: 'q', operator: 'contains', value: 'jakarta' }],
    });
    expect(result.data.map((r) => r.name)).toEqual(['Alpha', 'Bravo']);
  });

  it('creates, reads, updates and deletes', async () => {
    const created = await provider.create({ resource: 'vendor', variables: { name: 'Delta' } });
    expect(created.data.id).toBe(4);

    const read = await provider.getOne({ resource: 'vendor', id: 4 });
    expect(read.data.name).toBe('Delta');

    await provider.update({ resource: 'vendor', id: 4, variables: { name: 'Echo' } });
    const updated = await provider.getOne({ resource: 'vendor', id: 4 });
    expect(updated.data.name).toBe('Echo');

    await provider.deleteOne({ resource: 'vendor', id: 4, variables: {} });
    const after = await provider.getList({ resource: 'vendor' });
    expect(after.total).toBe(3);
  });

  it('rejects an unknown id', async () => {
    await expect(provider.getOne({ resource: 'vendor', id: 999 })).rejects.toThrow(/not found/i);
  });

  it('returns an empty list for an unknown resource', async () => {
    const result = await provider.getList({ resource: 'nope' });
    expect(result).toEqual({ data: [], total: 0 });
  });
});
