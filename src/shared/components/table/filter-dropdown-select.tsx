import { Button, Select, Space } from 'antd';
import type { FilterDropdownProps } from 'antd/es/table/interface';

type SelectOption = {
  label: string;
  value: string | number;
};

type FilterDropdownSelectProps = FilterDropdownProps & {
  options: SelectOption[];
  placeholder?: string;
  mode?: 'multiple';
};

/**
 * antd `column.filterDropdown` renderer for a fixed set of values.
 *
 * @example
 *   filterDropdown: (props) => <FilterDropdownSelect {...props} options={cityOptions} />
 */
export function FilterDropdownSelect({
  setSelectedKeys,
  selectedKeys,
  confirm,
  clearFilters,
  options,
  placeholder = 'Select',
  mode,
}: FilterDropdownSelectProps) {
  return (
    <div style={{ padding: 8 }} onKeyDown={(event) => event.stopPropagation()}>
      <Select
        autoFocus
        allowClear
        mode={mode}
        placeholder={placeholder}
        options={options}
        // antd's Key union includes bigint, which Select does not accept.
        value={
          mode === 'multiple'
            ? selectedKeys.map(String)
            : (selectedKeys.map(String)[0] ?? undefined)
        }
        onChange={(value: string | number | (string | number)[] | undefined) => {
          if (value === undefined || value === null) {
            setSelectedKeys([]);
            return;
          }

          setSelectedKeys(Array.isArray(value) ? value.map(String) : [String(value)]);
        }}
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
