'use client';

/* eslint-disable react-hooks/exhaustive-deps */
// import Image from '@/components/ui/image';
// import metamaskLogo from '@/assets/images/metamask.svg';
import Button from '@/components/ui/button/button';
import Input from '@/components/ui/forms/input';
import InputLabel from '@/components/ui/input-label';
import usePrivateKey from '@/hooks/useWallet';
import { privkeyFromNsec } from '@/utils/utils';
import { useState } from 'react';
import { useModal } from '../modal-views/context';

export default function SelectWallet({ ...props }) {
  const [name, setName] = useState('');
  const { closeModal } = useModal();
  const { storePrivateKey } = usePrivateKey();
  const [hasError, setHasError] = useState(false);

  async function handleSubmit(e: any) {
    e.preventDefault();
    setHasError(false);
    try {
      const npub = privkeyFromNsec(name);
      storePrivateKey({ priv: name, pub: npub });
      closeModal();
    } catch (e) {
      console.error('Invalid nsec');
      setHasError(true);
    }
  }

  const handleOnChangeName = (e: React.ChangeEvent<HTMLInputElement>): void => {
    e.preventDefault();
    setHasError(false);
    setName(e.target.value);
  };

  return (
    <div
      className="relative z-50 mx-auto w-[440px] max-w-full rounded-lg bg-white px-9 py-16 dark:bg-light-dark"
      {...props}
    >
      <h2 className="mb-4 text-center text-2xl font-medium uppercase text-gray-900 dark:text-white">
        Connect Wallet
      </h2>
      <p className="text-center text-sm leading-loose tracking-tight text-gray-600 dark:text-gray-400">
        By connecting your wallet, you agree to our Terms of Service and our
        Privacy Policy.
      </p>

      <form
        noValidate
        onSubmit={handleSubmit}
        className="grid grid-cols-1 gap-4"
      >
        <div className="mb-4 mt-4">
          <Input
            type="text"
            placeholder="Enter your nsec"
            onChange={handleOnChangeName}
            className="error"
          />
          {hasError && (
            <span role="alert" className="mt-2 block text-red-500 sm:mt-2.5">
              Invalid nsec
            </span>
          )}
        </div>

        <Button
          type="submit"
          className="mt-5 rounded-lg !text-sm uppercase tracking-[0.04em]"
        >
          Connect with private key
        </Button>
      </form>

      {/* <div
        className="mt-12 flex h-14 w-full cursor-pointer items-center justify-between rounded-lg bg-gradient-to-l from-[#ffdc24] to-[#ff5c00] px-4 text-base text-white transition-all hover:-translate-y-0.5"
        onClick={() => {}}
      >
        <span>MetaMask</span>
        <span className="h-auto w-9">
          <Image src={metamaskLogo} alt="metamask" width={36} />
        </span>
      </div> */}
    </div>
  );
}
