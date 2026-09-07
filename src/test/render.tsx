import type { ReactElement, ReactNode } from 'react';
import { render, type RenderResult } from '@testing-library/react';
import { MemoryRouter } from 'react-router';

import { AppProviders } from '@/app/providers';

type WrapperProps = {
  children: ReactNode;
};

function AllProviders({ children }: WrapperProps) {
  // MemoryRouter must be outside AppProviders: Refine's router bindings read
  // react-router's context.
  return (
    <MemoryRouter>
      <AppProviders>{children}</AppProviders>
    </MemoryRouter>
  );
}

/**
 * Render a component with every provider the real app has.
 *
 * This is the entry point for every component test — see
 * .claude/rules/testing.md.
 */
export function renderWithProviders(ui: ReactElement): RenderResult {
  return render(ui, { wrapper: AllProviders });
}
