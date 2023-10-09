'use client';

import cn from 'classnames';
import AuthorCard from '@/components/ui/author-card';
import Logo from '@/components/ui/logo';
import { MenuItem } from '@/components/ui/collapsible-menu';
// import Scrollbar from '@/components/ui/scrollbar';
import Button from '@/components/ui/button';
import { useDrawer } from '@/components/drawer-views/context';
import { Close } from '@/components/icons/close';
import {
  defaultMenuItems,
  otherPagesMenuItems,
} from '@/layouts/sidebar/_menu-items';

//images
import BitcoinImage from '@/assets/images/currency/bitcoin.svg';
import React, { useEffect } from 'react';
import useBitpac from '@/hooks/useBitpac';
import useWallet from '@/hooks/useWallet';
import { DropdownItem } from '@/types';
import { shortenStr } from '@/utils/utils';

interface SidebarProps {
  className?: string;
  layoutOption?: string;
  menuItems?: any[];
}

export default function Sidebar({
  className,
  layoutOption = '',
  menuItems = defaultMenuItems,
}: SidebarProps) {
  const { pubkeys, name, id } = useBitpac();
  const { pubkey } = useWallet();

  useEffect(() => {
    if (!pubkey || !pubkeys.length || !pubkeys.includes(pubkey)) {
      menuItems = menuItems.map((item) => {
        if (item.name === 'Vote') {
          return {
            ...item,
            dropdownItems: item.dropdownItems?.filter(
              (dropdownItem: DropdownItem) =>
                dropdownItem.name !== 'Create proposal'
            ),
          };
        }
        return item;
      });
    }
  }, [pubkey, pubkeys])
 

  const { closeDrawer } = useDrawer();
  const sideBarMenus = menuItems?.map((item) => ({
    name: item.name,
    icon: item.icon,
    href: layoutOption + item.href,
    ...(item.dropdownItems && {
      dropdownItems: item?.dropdownItems?.map((dropdownItem: any) => ({
        name: dropdownItem.name,
        ...(dropdownItem?.icon && { icon: dropdownItem.icon }),
        href: layoutOption + dropdownItem.href,
      })),
    }),
  }));

  return (
    <aside
      className={cn(
        'top-0 z-40 h-full w-full max-w-full border-dashed border-gray-200 bg-body ltr:left-0 ltr:border-r rtl:right-0 rtl:border-l dark:border-gray-700 dark:bg-dark xs:w-80 xl:fixed  xl:w-72 2xl:w-80',
        className
      )}
    >
      <div className="relative flex h-24 items-center justify-between overflow-hidden px-6 py-4 2xl:px-8">
        <Logo />
        <div className="md:hidden">
          <Button
            title="Close"
            color="white"
            shape="circle"
            variant="transparent"
            size="small"
            onClick={closeDrawer}
          >
            <Close className="h-auto w-2.5" />
          </Button>
        </div>
      </div>

      <div className="custom-scrollbar h-[calc(100%-98px)] overflow-hidden overflow-y-auto">
        <div className="px-6 pb-5 2xl:px-8">
          <AuthorCard
            image={BitcoinImage}
            name={name || 'Bitcoin'}
            role={id ? shortenStr(id) : 'Cooperatives'}
          />

          <div className="mt-12">
            {sideBarMenus?.map((item, index) => (
              <MenuItem
                key={'default' + item.name + index}
                name={item.name}
                href={item.href}
                icon={item.icon}
                dropdownItems={item.dropdownItems}
              />
            ))}
            {otherPagesMenuItems?.map((item, index) => (
              <MenuItem
                key={'default' + item.name + index}
                name={item.name}
                href={item.href}
                icon={item.icon}
                dropdownItems={item.dropdownItems}
              />
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
