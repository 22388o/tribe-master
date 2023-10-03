'use client';

import CreateTribe from '@/components/create-tribe';
// Make this dynamic, if user has wallet connected, we must display another view.
export default function CreateTribeScreen() {
  return (
    <>
      <h2 className="mb-12 text-lg font-medium uppercase tracking-wider text-gray-900 dark:text-white sm:text-2xl">
        Create New Bitpac
      </h2>
      <CreateTribe />
    </>
  );
}
