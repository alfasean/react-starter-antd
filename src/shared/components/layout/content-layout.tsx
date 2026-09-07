import { useState, type ReactNode } from 'react';
import { Layout } from 'antd';

import { LayoutHeader } from './header';
import { LayoutSider } from './sider';

type ContentLayoutProps = {
  children: ReactNode;
};

/**
 * The application shell: sider, header, and the routed content area.
 *
 * It holds only UI state (whether the sider is collapsed). Menu construction
 * lives in `use-sider-menu.ts`.
 */
export function ContentLayout({ children }: ContentLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <LayoutSider collapsed={collapsed} onCollapse={setCollapsed} />

      <Layout>
        <LayoutHeader collapsed={collapsed} onToggle={() => setCollapsed((prev) => !prev)} />

        <Layout.Content style={{ padding: 24 }}>{children}</Layout.Content>
      </Layout>
    </Layout>
  );
}
