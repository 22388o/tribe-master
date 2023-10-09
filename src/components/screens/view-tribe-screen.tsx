'use client';
import ViewTribe from '@/components/view-tribe/view-tribe';
import useBitpac from '@/hooks/useBitpac';
import { useWithBitpac } from '@/hooks/useWithBitpac';
// Make this dynamic, if user has wallet connected, we must display another view.
export default function ViewTribeScreen() {
  const { bitpac, name } = useBitpac();
  useWithBitpac();

  return (
    <>
      <div className="mb-12">
        <h2 className="text-lg font-medium uppercase tracking-wider text-gray-900 dark:text-white sm:text-2xl">
          Bitpac: {name}
        </h2>
        <span className="mt-8 text-xs font-medium tracking-wider text-gray-600 2xl:text-sm">
          {bitpac?.id}
        </span>
      </div>

      {bitpac && <ViewTribe bitpac={bitpac} />}
    </>
  );
}
