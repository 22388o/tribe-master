import { atom, useAtom } from 'jotai';

// Create an atom to store the private key
const privateKeyAtom = atom(null);
const pubKeyAtom = atom(null);

// Create a custom hook to use the atom
const usePrivateKey = () => {
  const [privateKey, setPrivateKey] = useAtom(privateKeyAtom);
  const [pubKey, setPubkey] = useAtom(pubKeyAtom);

  const storePrivateKey = ({ priv, pub }: { priv: string; pub: string }) => {
    // @ts-ignore
    setPrivateKey(priv);
    // @ts-ignore
    setPubkey(pub);
  };

  return { privateKey, storePrivateKey };
};

export default usePrivateKey;
