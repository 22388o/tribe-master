'use client';

import CreateProposalForm from '@/components/create-proposal/create-proposal-form';
import useBitpac from '@/hooks/useBitpac';
import useWallet from '@/hooks/useWallet';
import { useWithBitpac } from '@/hooks/useWithBitpac';
import { useEffect } from 'react';
import routes from '@/config/routes';
import { useRouter } from 'next/navigation';

const CreateProposal = () => {
  useWithBitpac();

  const { bitpac, pubkeys } = useBitpac();
  const { pubkey } = useWallet();
  const router = useRouter();

  // useEffect(() => {
  //   if (!pubkey || !pubkeys.length || !pubkeys.includes(pubkey)) {
  //     console
  //     router.push(routes.home);
  //   }
  // }, [pubkey, pubkeys]);

  return (
    <section className="mx-auto w-full max-w-[1160px] text-sm">
      <h2 className="mb-5 text-lg font-medium dark:text-gray-100 sm:mb-6 lg:mb-7 xl:text-xl">
        Create a new proposal
      </h2>

      {bitpac && <CreateProposalForm bitpac={bitpac} />}
    </section>
  );
};

export default CreateProposal;
