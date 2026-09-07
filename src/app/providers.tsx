import type { ReactNode } from 'react';
import { Refine } from '@refinedev/core';
import { useNotificationProvider } from '@refinedev/antd';
import routerProvider from '@refinedev/react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { App as AntdApp, ConfigProvider } from 'antd';

import '@refinedev/antd/dist/reset.css';

import { queryClient, themeConfig } from '@/shared/config';
import { allowAllAccessControlProvider, dataProvider, devAuthProvider } from '@/providers';
import { resources } from './resources';

type AppProvidersProps = {
  children: ReactNode;
};

/**
 * Every provider the app needs, in one place.
 *
 * Order matters: antd's `<App>` must sit inside `<ConfigProvider>` so message
 * and notification pick up the theme, and `<Refine>` must sit inside `<App>`
 * so its notification provider has a host.
 *
 * This component must be rendered inside a router — `routerProvider` reads
 * react-router's context.
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider theme={themeConfig}>
        <AntdApp>
          <Refine
            dataProvider={dataProvider}
            authProvider={devAuthProvider}
            accessControlProvider={allowAllAccessControlProvider}
            routerProvider={routerProvider}
            notificationProvider={useNotificationProvider}
            resources={resources}
            options={{
              syncWithLocation: true,
              warnWhenUnsavedChanges: true,
              disableTelemetry: true,
            }}
          >
            {children}
          </Refine>
        </AntdApp>
      </ConfigProvider>
    </QueryClientProvider>
  );
}
