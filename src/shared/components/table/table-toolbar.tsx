import { useEffect, useState, type ReactNode } from 'react';
import { Input, Space, Typography } from 'antd';
import { useDebouncedValue } from '@/shared/hooks';

type TableToolbarProps = {
  title?: string;
  /** Action buttons rendered on the right. */
  extra?: ReactNode;
  /** Called with the debounced search term. Omit to hide the search box. */
  onSearch?: (value: string) => void;
  searchPlaceholder?: string;
};

/**
 * The bar above a list table: title, debounced search, and actions.
 *
 * Search is debounced here so every list screen gets the same behaviour
 * without repeating the timer logic.
 */
export function TableToolbar({
  title,
  extra,
  onSearch,
  searchPlaceholder = 'Search…',
}: TableToolbarProps) {
  const [term, setTerm] = useState('');
  const debouncedTerm = useDebouncedValue(term, 300);

  useEffect(() => {
    onSearch?.(debouncedTerm);
    // `onSearch` is usually an inline arrow; depending on it would re-fire on
    // every parent render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedTerm]);

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: 16,
      }}
    >
      {title ? (
        <Typography.Title level={4} style={{ margin: 0 }}>
          {title}
        </Typography.Title>
      ) : (
        <span />
      )}

      <Space wrap>
        {onSearch && (
          <Input.Search
            allowClear
            placeholder={searchPlaceholder}
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            style={{ width: 240 }}
          />
        )}
        {extra}
      </Space>
    </div>
  );
}
