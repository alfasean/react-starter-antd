import { Boxes } from 'lucide-react';
import { Typography } from 'antd';

type LogoProps = {
  /** Hide the wordmark when the sider is collapsed. */
  compact?: boolean;
};

export function Logo({ compact = false }: LogoProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
      <Boxes size={24} strokeWidth={1.75} aria-hidden />
      {!compact && (
        <Typography.Text strong style={{ fontSize: 16, whiteSpace: 'nowrap' }}>
          React Starter
        </Typography.Text>
      )}
    </div>
  );
}
