import { Layout, Menu } from 'antd';
import { useNavigate } from 'react-router';

import { Logo } from '../ui/logo';
import { useSiderMenu } from './use-sider-menu';

type LayoutSiderProps = {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
};

export function LayoutSider({ collapsed, onCollapse }: LayoutSiderProps) {
  const navigate = useNavigate();
  const { items, selectedKey, defaultOpenKeys } = useSiderMenu();

  return (
    <Layout.Sider
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      breakpoint="lg"
      width={240}
      style={{ borderRight: '1px solid rgba(0,0,0,0.06)' }}
    >
      <div style={{ padding: collapsed ? '16px 12px' : '16px 20px' }}>
        <Logo compact={collapsed} />
      </div>

      <Menu
        mode="inline"
        items={items}
        selectedKeys={selectedKey ? [selectedKey] : []}
        defaultOpenKeys={defaultOpenKeys}
        style={{ borderInlineEnd: 'none', paddingInline: 8 }}
        onClick={({ key }) => {
          if (key.startsWith('/')) {
            void navigate(key);
          }
        }}
      />
    </Layout.Sider>
  );
}
