import { Alert, Button, Card, Space, Typography } from 'antd';
import { useLogin } from '@refinedev/core';

import { Logo } from '@/shared/components';
import { env } from '@/shared/config';

export default function LoginPage() {
  const { mutate: login, isPending } = useLogin();

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <Card style={{ width: '100%', maxWidth: 400 }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Logo />

          <div>
            <Typography.Title level={4} style={{ marginBottom: 4 }}>
              Sign in to {env.appName}
            </Typography.Title>
            <Typography.Text type="secondary">Continue to your workspace.</Typography.Text>
          </div>

          <Alert
            type="warning"
            showIcon
            message="Authentication is stubbed"
            description="Signing in always succeeds. Replace the auth provider before deploying — see docs/AUTH.md."
          />

          <Button type="primary" block loading={isPending} onClick={() => login({})}>
            Sign in
          </Button>
        </Space>
      </Card>
    </div>
  );
}
