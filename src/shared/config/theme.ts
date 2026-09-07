import type { ThemeConfig } from 'antd';

/**
 * Brand configuration lives here. Changing `colorPrimary` is usually the only
 * edit a new project needs — antd derives the rest of the palette from it.
 */
export const themeConfig: ThemeConfig = {
  token: {
    colorPrimary: '#2563eb',
    colorLink: '#2563eb',
    borderRadius: 6,
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  },
  components: {
    Layout: {
      headerBg: '#ffffff',
      siderBg: '#ffffff',
      bodyBg: '#f5f6f8',
      headerHeight: 56,
    },
    Menu: {
      itemBorderRadius: 6,
    },
    Table: {
      headerBg: '#fafafa',
    },
  },
};
