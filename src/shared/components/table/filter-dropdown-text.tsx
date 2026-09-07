import { Button, Input, Space } from 'antd';
import type { FilterDropdownProps } from 'antd/es/table/interface';

type FilterDropdownTextProps = FilterDropdownProps & {
  placeholder?: string;
};

/**
 * antd `column.filterDropdown` renderer for free-text filtering.
 *
 * @example
 *   filterDropdown: (props) => <FilterDropdownText {...props} placeholder="Name" />
 */
export function FilterDropdownText({
  setSelectedKeys,
  selectedKeys,
  confirm,
  clearFilters,
  placeholder = 'Search',
}: FilterDropdownTextProps) {
  return (
    <div style={{ padding: 8 }} onKeyDown={(event) => event.stopPropagation()}>
      <Input
        autoFocus
        placeholder={placeholder}
        value={selectedKeys[0]}
        onChange={(event) => setSelectedKeys(event.target.value ? [event.target.value] : [])}
        onPressEnter={() => confirm()}
        style={{ marginBottom: 8, display: 'block', width: 200 }}
      />
      <Space>
        <Button type="primary" size="small" onClick={() => confirm()} style={{ width: 90 }}>
          Apply
        </Button>
        <Button
          size="small"
          style={{ width: 90 }}
          onClick={() => {
            clearFilters?.();
            confirm();
          }}
        >
          Reset
        </Button>
      </Space>
    </div>
  );
}
