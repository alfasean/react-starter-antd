import { List } from '@refinedev/antd';
import { Button } from 'antd';
import { Plus } from 'lucide-react';

import { TableToolbar } from '@/shared/components';
import { VendorTable } from '../components/vendor-table';
import { useVendorTable } from '../hooks/use-vendor-table';

export default function VendorListPage() {
  const { tableProps, setSearch, goToEdit, goToCreate } = useVendorTable();

  return (
    <List title="Vendors" headerButtons={() => null}>
      <TableToolbar
        onSearch={setSearch}
        searchPlaceholder="Search vendors…"
        extra={
          <Button type="primary" icon={<Plus size={16} />} onClick={goToCreate}>
            New vendor
          </Button>
        }
      />

      <VendorTable
        dataSource={tableProps.dataSource ?? []}
        loading={Boolean(tableProps.loading)}
        pagination={tableProps.pagination}
        onChange={tableProps.onChange}
        onEdit={goToEdit}
      />
    </List>
  );
}
