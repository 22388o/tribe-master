import { atom, useAtom } from 'jotai';

// Create an atom to store the private key
const privateKeyAtom = atom(null);
const pubKeyAtom = atom(null);
const nsecAtom = atom(null);

// Create a custom hook to use the atom
const usePrivateKey = () => {
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
    console.log({ priv, nsec, pub });
    // @ts-ignore
    setPrivateKey(`${priv}`);
    // @ts-ignore
    setNsec(nsec);
    // @ts-ignore
    setPubkey(pub);
  };

  return { privateKey, nsec, pubkey, storePrivateKey };
};

export default usePrivateKey;
