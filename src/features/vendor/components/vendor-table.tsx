import { Button, Space, Table, Tag } from 'antd';
import type { TableProps } from 'antd';
import { Pencil } from 'lucide-react';

import {
  FilterDropdownSelect,
  FilterDropdownText,
  paginationTotal,
} from '@/shared/components/table';
import { useResponsiveTable } from '@/shared/hooks';
import { formatDate } from '@/shared/lib';
import type { Vendor } from '../types';

type VendorTableProps = {
  dataSource: readonly Vendor[];
  loading: boolean;
  pagination?: TableProps<Vendor>['pagination'];
  onChange?: TableProps<Vendor>['onChange'];
  onEdit: (id: number) => void;
};

const CITY_OPTIONS = [
  { label: 'Jakarta', value: 'Jakarta' },
  { label: 'Bandung', value: 'Bandung' },
  { label: 'Surabaya', value: 'Surabaya' },
  { label: 'Medan', value: 'Medan' },
  { label: 'Semarang', value: 'Semarang' },
];

/**
 * Presentational. It receives rows and callbacks — it does not fetch, sort, or
 * paginate anything itself. All of that lives in `use-vendor-table.ts`.
 */
export function VendorTable({
  dataSource,
  loading,
  pagination,
  onChange,
  onEdit,
}: VendorTableProps) {
  const responsive = useResponsiveTable();

  return (
    <Table<Vendor>
      rowKey="id"
      dataSource={dataSource}
      loading={loading}
      onChange={onChange}
      size={responsive.size}
      scroll={responsive.scroll}
      pagination={
        pagination === false
          ? false
          : { ...pagination, showSizeChanger: true, showTotal: paginationTotal }
      }
    >
      <Table.Column<Vendor> dataIndex="code" title="Code" sorter width={110} />

      <Table.Column<Vendor>
        dataIndex="name"
        title="Name"
        sorter
        filterDropdown={(props) => <FilterDropdownText {...props} placeholder="Vendor name" />}
      />

      <Table.Column<Vendor>
        dataIndex="city"
        title="City"
        filterDropdown={(props) => <FilterDropdownSelect {...props} options={CITY_OPTIONS} />}
      />

      <Table.Column<Vendor> dataIndex="email" title="Email" />

      <Table.Column<Vendor> dataIndex="phone" title="Phone" width={140} />

      <Table.Column<Vendor>
        dataIndex="active"
        title="Status"
        width={110}
        render={(active: boolean) => (
          <Tag color={active ? 'green' : 'default'}>{active ? 'Active' : 'Inactive'}</Tag>
        )}
      />

      <Table.Column<Vendor>
        dataIndex="createdAt"
        title="Created"
        sorter
        width={140}
        render={(value: string) => formatDate(value)}
      />

      <Table.Column<Vendor>
        title="Actions"
        dataIndex="actions"
        width={100}
        fixed={responsive.isMobile ? 'right' : undefined}
        render={(_, record) => (
          <Space>
            <Button
              size="small"
              icon={<Pencil size={14} />}
              aria-label={`Edit ${record.name}`}
              onClick={() => onEdit(record.id)}
            >
              Edit
            </Button>
          </Space>
        )}
      />
    </Table>
  );
}
