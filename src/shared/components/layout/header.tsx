import { Avatar, Button, Dropdown, Layout, Space, Typography } from 'antd';
import { useGetIdentity, useLogout } from '@refinedev/core';
import { LogOut, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

import type { AppUser } from '@/shared/types';

type LayoutHeaderProps = {
  collapsed: boolean;
  onToggle: () => void;
};

export function LayoutHeader({ collapsed, onToggle }: LayoutHeaderProps) {
  const { data: user } = useGetIdentity<AppUser>();
  const { mutate: logout } = useLogout();

  return (
    <Layout.Header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingInline: 16,
        borderBottom: '1px solid rgba(0,0,0,0.06)',
      }}
    >
      <Button
        type="text"
        aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
        icon={collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        onClick={onToggle}
      />

      <Dropdown
        trigger={['click']}
        menu={{
          items: [
            {
              key: 'logout',
              icon: <LogOut size={16} />,
              label: 'Sign out',
              onClick: () => logout(),
            },
          ],
        }}
      >
        <Space style={{ cursor: 'pointer' }}>
          <Typography.Text>{user?.name ?? 'Not signed in'}</Typography.Text>
          <Avatar size="small">{user?.name?.charAt(0) ?? '?'}</Avatar>
        </Space>
      </Dropdown>
    </Layout.Header>
  );
}
