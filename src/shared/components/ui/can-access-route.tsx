import type { ReactNode } from 'react';
import { CanAccess } from '@refinedev/core';
import { ErrorPage } from '../error/error-page';

type CanAccessRouteProps = {
  resource: string;
  action: string;
  children: ReactNode;
};

/**
 * Route-level permission gate. Every feature route is wrapped in one, so
 * turning on real access control is a change to the provider, not to routes.
 */
export function CanAccessRoute({ resource, action, children }: CanAccessRouteProps) {
  return (
    <CanAccess resource={resource} action={action} fallback={<ErrorPage status="403" />}>
      {children}
    </CanAccess>
  );
}
