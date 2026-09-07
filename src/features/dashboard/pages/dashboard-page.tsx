import { Card, Col, Row, Statistic, Typography } from 'antd';
import { Boxes, ClipboardList, Store } from 'lucide-react';

const PLACEHOLDER_STATS = [
  { title: 'Vendors', value: 25, icon: <Store size={20} /> },
  { title: 'Open orders', value: 8, icon: <ClipboardList size={20} /> },
  { title: 'Items in stock', value: 1432, icon: <Boxes size={20} /> },
];

export default function DashboardPage() {
  return (
    <>
      <Typography.Title level={3} style={{ marginTop: 0 }}>
        Dashboard
      </Typography.Title>
      <Typography.Paragraph type="secondary">
        Placeholder tiles. Replace them with real figures from your own resources.
      </Typography.Paragraph>

      <Row gutter={[16, 16]}>
        {PLACEHOLDER_STATS.map((stat) => (
          <Col key={stat.title} xs={24} sm={12} lg={8}>
            <Card>
              <Statistic title={stat.title} value={stat.value} prefix={stat.icon} />
            </Card>
          </Col>
        ))}
      </Row>
    </>
  );
}
