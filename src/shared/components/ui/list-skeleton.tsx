import { Card, Skeleton, Space } from 'antd';

type ListSkeletonProps = {
  rows?: number;
};

/** Route-level fallback for lazily loaded list pages. */
export function ListSkeleton({ rows = 6 }: ListSkeletonProps) {
  return (
    <Card>
      <Skeleton active paragraph={{ rows: 1 }} title={{ width: 200 }} />
      <Space direction="vertical" size="middle" style={{ width: '100%', marginTop: 16 }}>
        {Array.from({ length: rows }, (_, index) => (
          <Skeleton key={index} active paragraph={{ rows: 1, width: '100%' }} title={false} />
        ))}
      </Space>
    </Card>
  );
}
