import { atom, useAtom } from 'jotai';

// Create an atom to store the private key
const privateKeyAtom = atom('');
const pubKeyAtom = atom('');
const nsecAtom = atom('');

// Create a custom hook to use the atom
const useWallet = () => {
  const [privateKey, setPrivateKey] = useAtom(privateKeyAtom);
  const [nsec, setNsec] = useAtom(nsecAtom);
  const [pubkey, setPubkey] = useAtom(pubKeyAtom);

  const storePrivateKey = ({
    priv,
    nsec,
    pub,
  }: {
    priv: string;
    nsec: string;
    pub: string;
  }) => {
    // @ts-ignore
    setPrivateKey(`${priv}`);
    // @ts-ignore
    setNsec(nsec);
    // @ts-ignore
    setPubkey(pub);
  };

  return { privateKey, nsec, pubkey, storePrivateKey };
};

export default useWallet;
