'use client';

import { atom, useAtom } from 'jotai';

export type DRAWER_VIEW =
  | 'DEFAULT_SIDEBAR'
  | 'RETRO_SIDEBAR'
  | 'CLASSIC_SIDEBAR'
  | 'CLASSIC_SIDEBAR'
  | 'DRAWER_MENU'
  | 'DRAWER_SEARCH'
  | 'DRAWER_FILTER';
const drawerAtom = atom({ isOpen: false, view: 'DEFAULT_SIDEBAR' });

export function useDrawer() {
  const [state, setState] = useAtom(drawerAtom);
  const openDrawer = (view: DRAWER_VIEW) => {
    setState({ ...state, isOpen: true, view });
  };
  const closeDrawer = () => setState({ ...state, isOpen: false });
  return {
    ...state,
    openDrawer,
    closeDrawer,
  };
}
