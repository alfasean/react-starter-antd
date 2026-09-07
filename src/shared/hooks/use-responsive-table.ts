import { Grid } from 'antd';
import type { TableProps } from 'antd';

type ResponsiveTable = {
  /** Horizontal scroll width; 0 (undefined) once the viewport is wide enough. */
  scroll: TableProps['scroll'];
  size: 'small' | 'middle';
  isMobile: boolean;
};

/**
 * Tables need horizontal scrolling and tighter rows on narrow screens.
 * Spread the result onto antd's `<Table>` rather than hard-coding breakpoints
 * in each feature.
 */
export function useResponsiveTable(minWidth = 1200): ResponsiveTable {
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.lg;

  return {
    scroll: isMobile ? { x: minWidth } : undefined,
    size: isMobile ? 'small' : 'middle',
    isMobile,
  };
}
