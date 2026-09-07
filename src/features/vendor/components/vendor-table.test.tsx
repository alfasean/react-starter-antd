import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '@/test/render';
import { VendorTable } from './vendor-table';
import type { Vendor } from '../types';

const rows: Vendor[] = [
  {
    id: 1,
    code: 'V-001',
    name: 'Acme Supplies',
    email: 'hi@acme.test',
    phone: '021-5500000',
    city: 'Jakarta',
    active: true,
    createdAt: '2026-01-15T00:00:00.000Z',
  },
];

/**
 * These tests are possible only because VendorTable is presentational — it
 * takes its rows as props. That is the payoff of keeping data access in
 * use-vendor-table.ts. See .claude/rules/components-and-logic.md.
 */
describe('VendorTable', () => {
  it('renders a row per vendor', () => {
    renderWithProviders(<VendorTable dataSource={rows} loading={false} onEdit={() => {}} />);

    expect(screen.getByText('Acme Supplies')).toBeInTheDocument();
    expect(screen.getByText('V-001')).toBeInTheDocument();
    expect(screen.getByText('Jakarta')).toBeInTheDocument();
  });

  it('formats the created date', () => {
    renderWithProviders(<VendorTable dataSource={rows} loading={false} onEdit={() => {}} />);

    expect(screen.getByText('15 Jan 2026')).toBeInTheDocument();
  });

  it('calls onEdit with the row id', async () => {
    const onEdit = vi.fn();
    renderWithProviders(<VendorTable dataSource={rows} loading={false} onEdit={onEdit} />);

    await userEvent.click(screen.getByRole('button', { name: /edit/i }));

    expect(onEdit).toHaveBeenCalledWith(1);
  });
});
