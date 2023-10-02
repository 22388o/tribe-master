'use client';

/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import cn from 'classnames';
import { ChevronDown } from '@/components/icons/chevron-down';
import { Tab, TabItem, TabPanels, TabPanel } from '@/components/ui/tab';
import { useBreakpoint } from '@/lib/hooks/use-breakpoint';
// import { useLayout } from '@/lib/hooks/use-layout';
import { useIsMounted } from '@/lib/hooks/use-is-mounted';
import { useClickAway } from '@/lib/hooks/use-click-away';
// import { LAYOUT_OPTIONS } from '@/lib/constants';

interface TabMenuItem {
  title: React.ReactNode;
  path: string;
  disabled: boolean;
}

interface ParamTabTypes {
  tabMenu: TabMenuItem[];
  children: React.ReactChild[];
}

export { TabPanel };

export default function ParamTab({ tabMenu, children }: ParamTabTypes) {
  const router = useRouter();
  // const { layout } = useLayout();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.get('view');
  const isMounted = useIsMounted();
  const breakpoint = useBreakpoint();
  const dropdownEl = useRef<HTMLDivElement>(null);
  let [selectedTabIndex, setSelectedTabIndex] = useState(0);
  let [visibleMobileMenu, setVisibleMobileMenu] = useState(false);

  const createQueryString = useCallback(
    (name: string, value: string) => {
      // @ts-ignore
      const params = new URLSearchParams(searchParams);
      params.set(name, value);

      return params.toString();
    },
    [searchParams]
  );

  function handleTabChange(index: number) {
    router.push(
      pathname + '?' + createQueryString('view', tabMenu[index].path)
    );
  }

  useEffect(() => {
    if (query) {
      setSelectedTabIndex(tabMenu.findIndex((item) => query === item.path));
    }
    console.log('query updated');
  }, [query]);

  useClickAway(dropdownEl, () => {
    setVisibleMobileMenu(false);
  });

  return (
    <Tab.Group
      selectedIndex={selectedTabIndex}
      onChange={(index: any) => handleTabChange(index)}
    >
      <Tab.List className="relative mb-6 bg-body text-sm uppercase before:absolute before:bottom-0 before:left-0 before:w-full before:rounded-sm before:bg-gray-200 dark:bg-dark dark:before:bg-gray-800 sm:gap-8 sm:rounded-none md:before:h-0.5">
        {isMounted && ['xs', 'sm'].indexOf(breakpoint) !== -1 ? (
          <div
            ref={dropdownEl}
            className="rounded-lg border-2 border-gray-200 dark:border-gray-700"
          >
            <button
              onClick={() => setVisibleMobileMenu(!visibleMobileMenu)}
              className="flex w-full items-center justify-between px-4 py-2.5 uppercase text-gray-400 dark:text-gray-300 sm:px-5 sm:py-3.5"
            >
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {tabMenu[selectedTabIndex].title}
              </span>
              <ChevronDown className="h-auto w-3.5" />
            </button>
            <div
              className={cn(
                'absolute left-0 top-full z-10 mt-1 grid w-full gap-0.5 rounded-lg border border-gray-200 bg-white p-2 text-left shadow-large dark:border-gray-700 dark:bg-gray-800 xs:gap-1',
                visibleMobileMenu
                  ? 'visible opacity-100'
                  : 'invisible opacity-0'
              )}
            >
              {tabMenu.map((item) => (
                <div
                  key={item.path}
                  onClick={() => setVisibleMobileMenu(false)}
                  className="w-full"
                >
                  <TabItem
                    tabItemLayoutId="activeTabIndicator-one"
                    className="w-full"
                    disabled={item.disabled}
                  >
                    {item.title}
                  </TabItem>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex gap-6 md:gap-8 xl:gap-10 3xl:gap-12">
            {tabMenu.map((item) => (
              <TabItem
                tabItemLayoutId="activeTabIndicator-two"
                disabled={item.disabled}
                key={item.path}
              >
                {item.title}
              </TabItem>
            ))}
          </div>
        )}
      </Tab.List>
      <TabPanels>{children}</TabPanels>
    </Tab.Group>
  );
}
