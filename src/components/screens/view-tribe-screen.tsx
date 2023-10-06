'use client';
import { useEffect, useState } from 'react';
import ViewTribe from '@/components/view-tribe/view-tribe';
import { useRouter } from 'next/navigation';
import routes from '@/config/routes';
import SessionStorage, {
  SessionsStorageKeys,
} from '@/services/session-storage';
import { NostrEvent } from '@/types';
import useBitpac from '@/hooks/useBitpac';
// Make this dynamic, if user has wallet connected, we must display another view.
export default function ViewTribeScreen() {
  const router = useRouter();
  const { bitpac, name } = useBitpac();

  function goToCreateTribePage() {
    setTimeout(() => {
      router.push(routes.home);
    }, 800);
  }

  useEffect(() => {
    // Check if TRIBE key is available in session storage
    const sessionTribe: NostrEvent | undefined = SessionStorage.get(
      SessionsStorageKeys.TRIBE
    );
    if (!sessionTribe) {
      // If not, redirect to create tribe page
      goToCreateTribePage();
    }
  }, []);

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
