'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import routes from '@/config/routes';
import Button from '@/components/ui/button/button';
import Input from '@/components/ui/forms/input';
import InputLabel from '@/components/ui/input-label';
import LabelBar from '../ui/label-bar';
import { Warning } from '../icons/warning';
import { Plus } from '../icons/plus';
import { Minus } from '../icons/minus';
import { generateMultisigAddress } from '@/services/tribe';
import { nostrPool } from '@/services/nostr';
import { NETWORK } from '@/config/config';
import SessionStorage, {
  SessionsStorageKeys,
} from '@/services/session-storage';
import { pubkeyFromNpub } from '@/utils/utils';

export default function CreateTribeTRForm() {
  const router = useRouter();
  const [inputs, setInputs] = useState(['']);
  const [npubkeys, setNPubKeys] = useState(['']);
  const [threshold, setTreshold] = useState(1);
  const [name, setName] = useState('');

  function goToViewProposalPage() {
    setTimeout(() => {
      router.push(routes.home);
    }, 800);
  }

  const handleAddInput = (e: any) => {
    e.preventDefault();
    setInputs([...inputs, '']);
  };

  const handleRemoveInput = () => {
    if (inputs.length > 1) {
      setInputs(inputs.slice(0, -1));
    }
  };

  const handleInputChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    // Todo, validate that it is a valid pubkey
    const newInputs = [...inputs];
    newInputs[index] = e.target.value;
    setInputs(newInputs);
    setNPubKeys(newInputs);
  };

  const handleOnChangeName = (e: React.ChangeEvent<HTMLInputElement>): void => {
    e.preventDefault();
    setName(e.target.value);
  };

  const handleOnChangeThreshold = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    e.preventDefault();
    setTreshold(Number(e.target.value));
  };

  async function handleSubmit(e: any) {
    e.preventDefault();

    const address = generateMultisigAddress(npubkeys, threshold);
    const pubkeys = npubkeys.map((p) => pubkeyFromNpub(p));
    const event = {
      content: JSON.stringify([name, pubkeys]),
      created_at: Math.floor(Date.now() / 1000),
      kind: 2858,
      tags: [
        ['n', NETWORK], // Network name (e.g. "mainnet", "signet")
        ['a', address], // Address of the tribe
        ['t', name], // name of the tribe
      ],
    };

    const signedEvent = await nostrPool.sign(event);

    SessionStorage.set(SessionsStorageKeys.TRIBE, signedEvent);
    await nostrPool.publish(signedEvent);
    goToViewProposalPage();
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
      <div className="mb-4">
        <InputLabel title="Name" />
        <Input
          type="text"
          placeholder="Enter your tribe name"
          onChange={handleOnChangeName}
        />
      </div>

      <div className="mb-4 flex">
        <div className="flex-grow">
          <InputLabel
            title="Pubs"
            subTitle="Enter an npub for everyone in your bitpac"
          />
          {inputs.map((input, index) => (
            <Input
              key={index}
              value={input}
              type="text"
              placeholder="Enter member npub"
              onChange={(e) => handleInputChange(index, e)}
            />
          ))}
        </div>

        <div className="ml-4 mt-14 flex items-center">
          <Button
            size="mini"
            color="gray"
            shape="circle"
            variant="transparent"
            onClick={handleAddInput}
          >
            <Plus className="h-auto w-3" />
          </Button>
          {inputs.length > 1 && (
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

      <div className="mb-4">
        <InputLabel
          title="Voters"
          subTitle="Pick how many votes are needed to approve policies"
        />
        <Input
          type="number"
          min={1}
          max={66}
          placeholder="How many voters?"
          onChange={handleOnChangeThreshold}
        />
      </div>

      <LabelBar
        title="Your policy"
        subTitle={`1 out of 1 are required`}
        icon={<Warning />}
      ></LabelBar>

      <Button
        type="submit"
        className="mt-5 rounded-lg !text-sm uppercase tracking-[0.04em]"
      >
        Create Bitpac
      </Button>
    </form>
  );
}