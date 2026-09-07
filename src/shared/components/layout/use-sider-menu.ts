import { useMemo } from 'react';
import { useMenu } from '@refinedev/core';
import type { TreeMenuItem } from '@refinedev/core';
import type { MenuProps } from 'antd';

type AntdMenuItem = NonNullable<MenuProps['items']>[number];

/**
 * Translates Refine's resource tree into antd `Menu` items.
 *
 * The `to` on each item becomes the menu key, so `selectedKeys` can be driven
 * straight from Refine's `selectedKey`.
 */
function toMenuItem(item: TreeMenuItem, render: (item: TreeMenuItem) => AntdMenuItem) {
  return render(item);
}

export function useSiderMenu() {
  const { menuItems, selectedKey, defaultOpenKeys } = useMenu();

  const items = useMemo<AntdMenuItem[]>(() => {
    const build = (nodes: TreeMenuItem[]): AntdMenuItem[] =>
      nodes.map((node) =>
        toMenuItem(node, (item) => {
          const label = (item.meta?.label ?? item.label ?? item.name) as string;
          const icon = item.meta?.icon as React.ReactNode;

          if (item.children.length > 0) {
            return {
              key: item.key ?? item.name,
              icon,
              label,
              children: build(item.children),
            };
          }

          return {
            key: item.key ?? item.route ?? item.name,
            icon,
            label,
          };
        }),
      );

    return build(menuItems);
  }, [menuItems]);

  return { items, selectedKey, defaultOpenKeys, menuItems };
}
