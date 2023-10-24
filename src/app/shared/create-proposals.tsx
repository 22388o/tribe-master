'use client';

import CreateProposalForm from '@/components/create-proposal/create-proposal-form';
import useBitpac from '@/hooks/useBitpac';
import { useWithBitpac } from '@/hooks/useWithBitpac';

const CreateProposal = () => {
  useWithBitpac();

  const { bitpac } = useBitpac();

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
