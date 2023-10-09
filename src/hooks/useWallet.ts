import SessionStorage, {SessionsStorageKeys} from '@/services/session-storage';
import { atom, useAtom } from 'jotai';

// Create an atom to store the private key
const privateKeyAtom = atom(SessionStorage.get(SessionsStorageKeys.WALLET_PRIV) || '');
const pubKeyAtom = atom(SessionStorage.get(SessionsStorageKeys.WALLET_PUB) || '');
const nsecAtom = atom(SessionStorage.get(SessionsStorageKeys.WALLET_NSEC) || '');

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

    // Store the values in SessionStorage
    SessionStorage.set(SessionsStorageKeys.WALLET_PRIV, priv);
    SessionStorage.set(SessionsStorageKeys.WALLET_PUB, nsec);
    SessionStorage.set(SessionsStorageKeys.WALLET_NSEC, pub);
  };

  return { privateKey, nsec, pubkey, storePrivateKey };
};

export default useWallet;