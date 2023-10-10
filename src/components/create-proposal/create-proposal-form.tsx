'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import routes from '@/config/routes';
import Button from '@/components/ui/button/button';
import Input from '@/components/ui/forms/input';
import { Plus } from '../icons/plus';
import { Minus } from '../icons/minus';
import Textarea from '@/components/ui/forms/textarea';
import spendCoins from '@/utils/proposal-create/spendCoints';
import { Bitpac } from '@/types';
import useAddress from '@/hooks/useAddress';
import { nostrPool } from '@/services/nostr';
import { toast } from 'react-toastify';
import useWallet from '@/hooks/useWallet';
import useProposals from '@/hooks/useProposal';

export default function CreateProposalForm({ bitpac }: { bitpac: Bitpac }) {
  const router = useRouter();
  const [outputs, setOutputs] = useState<
    { address?: string; amount?: number }[]
  >([{}]);
  const { privateKey, pubkey } = useWallet();
  const { utxos } = useAddress(bitpac.address);
  const { refetch } = useProposals(bitpac, utxos);
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    console.log("keys set");
  }, [privateKey, pubkey])

  const [description, setDescription] = useState('');
  const [title, setTitle] = useState('');

  function goToProposalsPage() {
    setTimeout(() => {
      router.push(routes.proposals);
    }, 800);
  }

  const handleAddInput = (e: any) => {
    e.preventDefault();
    setOutputs([...outputs, {}]);
  };

  const handleRemoveInput = () => {
    if (outputs.length > 1) {
      setOutputs(outputs.slice(0, -1));
    }
  };

  const handleAddressChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    // Todo, validate that it is a valid pubkey
    const formInputs = [...outputs];
    if (formInputs[index]) {
      formInputs[index].address = e.target.value;
    } else {
      formInputs[index] = { address: e.target.value };
    }
    setOutputs(formInputs);
  };

  const handleAmountChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    // Todo, validate that it is a valid pubkey
    const formInputs = [...outputs];
    const amount = Number(e.target.value);
    if (formInputs[index]) {
      formInputs[index].amount = amount;
    } else {
      formInputs[index] = { amount };
    }
    setOutputs(formInputs);
  };

  const handleOnChangeTitle = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    e.preventDefault();
    setTitle(e.target.value);
  };

  const handleOnChangeDescription = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ): void => {
    e.preventDefault();
    setDescription(e.target.value);
  };

  async function handleSubmit(e: any) {
    e.preventDefault();
    setIsLoading(true);

    let proposalInputs = [];
    let proposalOutputs = [];

    // if user is spending funds
    if (outputs.length && outputs[0].address && outputs[0].amount) {
      const { inputs: txInputs, outputs: txOutputs } = await spendCoins(
        bitpac.pubkeys,
        bitpac.threshold,
        utxos,
        outputs,
        bitpac.address
      );
      proposalInputs = txInputs;
      proposalOutputs = txOutputs;
    }

    const proposal = [
      title,
      proposalInputs,
      proposalOutputs,
      description || 'No description',
    ];

    const event = {
      content: JSON.stringify(proposal),
      created_at: Math.floor(Date.now() / 1000),
      kind: 2859,
      tags: [['e', bitpac.id]],
    };

    const signedEvent = await nostrPool.sign(event, privateKey, pubkey);
    nostrPool.publish(signedEvent);
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast.info('Proposal created');
    refetch();
    goToProposalsPage();
    setIsLoading(false);
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
      <div className="mb-6 rounded-lg bg-white p-5 shadow-card transition-shadow duration-200 hover:shadow-large dark:bg-light-dark xs:p-6 xs:pb-8">
        <h3 className="mb-2 text-base font-medium dark:text-gray-100 xl:text-lg">
          Title
        </h3>
        <p className="mb-5 leading-[1.8] dark:text-gray-300">
          Your title introduces your proposal to the voters. Make sure it is
          clear and to the point.
        </p>
        <Input
          type="text"
          placeholder="Enter title of your proposal"
          value={title}
          onChange={handleOnChangeTitle}
        />
      </div>

      <div className="mb-6 rounded-lg bg-white p-5 shadow-card transition-shadow duration-200 hover:shadow-large dark:bg-light-dark xs:p-6 xs:pb-8">
        <h3 className="mb-2 text-base font-medium dark:text-gray-100 xl:text-lg">
          Description
        </h3>
        <p className="mb-5 leading-[1.8] dark:text-gray-300">
          Your description should present in full detail what the actions of the
          proposal will do. This is where voters will educate themselves on what
          they are voting on.
        </p>
        <Textarea
          placeholder="Add the proposal details here"
          inputClassName="md:h-32 xl:h-36"
          value={description}
          onChange={handleOnChangeDescription}
        />
      </div>

      <div className="mb-6 rounded-lg bg-white p-5 shadow-card transition-shadow duration-200 hover:shadow-large dark:bg-light-dark xs:p-6 xs:pb-8">
        <h3 className="mb-2 text-base font-medium dark:text-gray-100 xl:text-lg">
          Spend some money
        </h3>
        <p className="mb-5 leading-[1.8] dark:text-gray-300">
          This section is for crafting a proposal that involves spending some
          funds. Please specify the amount to be spent and provide a detailed
          explanation of how the funds will be used. Remember, voters will be
          considering the value and impact of your proposal based on this
          information.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-3">
          <div className="mb-4 flex">
            <div className="flex-grow">
              {outputs.map((_, index) => (
                <div
                  className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-3"
                  key={index}
                >
                  <Input
                    type="text"
                    placeholder="Address"
                    inputClassName="focus:!ring-0 placeholder:text-[#6B7280]"
                    onChange={(e) => handleAddressChange(index, e)}
                  />
                  <Input
                    type="number"
                    placeholder="Amount in sats"
                    inputClassName="focus:!ring-0 placeholder:text-[#6B7280]"
                    onChange={(e) => handleAmountChange(index, e)}
                  />
                </div>
              ))}
            </div>
            <div className="ml-4 flex items-center">
              <Button
                size="mini"
                color="gray"
                shape="circle"
                variant="transparent"
                onClick={handleAddInput}
              >
                <Plus className="h-auto w-3" />
              </Button>
              {outputs.length > 1 && (
                <Button
                  size="mini"
                  color="gray"
                  shape="circle"
                  variant="transparent"
                  onClick={handleRemoveInput}
                  className="ml-2"
                >
                  <Minus className="h-auto w-3" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <Button
          type="submit"
          className="mt-5 rounded-lg !text-sm uppercase tracking-[0.04em]"
          disabled={isLoading || !title || !description || !privateKey || !pubkey}
        >
          Create Proposal
        </Button>
      </div>
    </form>
  );
}
