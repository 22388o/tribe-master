'use client';

import { atom, useAtom } from 'jotai';
import { LAYOUT_OPTIONS } from '@/lib/constants';

// 1. set initial atom for tribe layout
const tribeLayoutAtom = atom(LAYOUT_OPTIONS.MODERN);

const tribeLayoutAtomWithPersistence = atom(
  (get) => get(tribeLayoutAtom),
  (get, set, newStorage: any) => {
    set(tribeLayoutAtom, newStorage);
    localStorage.setItem('tribe-layout', newStorage);
  }
);

// 2. useLayout hook to check which layout is available
export function useLayout() {
  const [layout, setLayout] = useAtom(tribeLayoutAtomWithPersistence);
  return {
    layout: LAYOUT_OPTIONS.MODERN,
    setLayout,
  };
}
