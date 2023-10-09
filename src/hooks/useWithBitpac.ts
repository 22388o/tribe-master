// hooks/useWithBitpac.js
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SessionStorage, { SessionsStorageKeys } from '@/services/session-storage';
import { NostrEvent } from '@/types';
import routes from '@/config/routes';

// TODO: THIS IS JUST A HACK TO REDIRECT, WE MUST USE
// A MIDDLEWARE OR SOME PROPS TO DO THE CHECK AND THE REDIRECT
export function useWithBitpac() {
  const router = useRouter();

  useEffect(() => {
    const sessionTribe: NostrEvent | undefined = SessionStorage.get(
      SessionsStorageKeys.TRIBE
    );

    if (!sessionTribe) {
      console.log("redirecting")
      router.push(routes.createTribe);
    }
  }, []);
}