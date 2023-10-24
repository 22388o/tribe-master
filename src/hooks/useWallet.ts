import SessionStorage, {
  SessionsStorageKeys,
} from '@/services/session-storage';
import { getXverseKeys } from '@/utils/xverse/getXVerseKeys';
import { atom, useAtom } from 'jotai';

// Create an atom to store the private key
const privateKeyAtom = atom(
  SessionStorage.get(SessionsStorageKeys.WALLET_PRIV) || ''
);
const pubKeyAtom = atom(
  SessionStorage.get(SessionsStorageKeys.WALLET_PUB) || ''
);
const nsecAtom = atom(
  SessionStorage.get(SessionsStorageKeys.WALLET_NSEC) || ''
);

const walletProviderAtom = atom(
  SessionStorage.get(SessionsStorageKeys.WALLET_PROVIDER) || ''
);

const addressAtom = atom(
  SessionStorage.get(SessionsStorageKeys.WALLET_ADDRESS) || ''
);

export enum Provider {
  XVERSE = 'XVerse',
  NOSTR = 'Nostr',
  XPRV = 'xpriv',
}

// Create a custom hook to use the atom
const useWallet = () => {
  const [privateKey, setPrivateKey] = useAtom(privateKeyAtom);
  const [nsec, setNsec] = useAtom(nsecAtom);
  const [pubkey, setPubkey] = useAtom(pubKeyAtom);
  const [provider, setProvider] = useAtom(walletProviderAtom);
  const [address, setAddress] = useAtom(addressAtom);

  const storePrivateKey = ({
    priv,
    nsec,
    pub,
    address,
    provider = Provider.NOSTR,
  }: {
    priv: string;
    nsec: string;
    pub: string;
    provider: Provider;
    address?: string;
  }) => {
    setPrivateKey(`${priv}`);
    setNsec(nsec);
    setPubkey(pub);
    setAddress(address);
    setProvider(provider);

    // Store the values in SessionStorage
    SessionStorage.set(SessionsStorageKeys.WALLET_PRIV, priv);
    SessionStorage.set(SessionsStorageKeys.WALLET_NSEC, nsec);
    SessionStorage.set(SessionsStorageKeys.WALLET_PUB, pub);
    SessionStorage.set(SessionsStorageKeys.WALLET_PROVIDER, provider);

    address && SessionStorage.set(SessionsStorageKeys.WALLET_ADDRESS, address);
  };

  const connect = async ({
    provider = Provider.NOSTR,
    callback,
  }: {
    provider: Provider;
    callback: Function;
  }) => {
    if (provider === Provider.XVERSE) {
      const xverse = await getXverseKeys();

      const { ordinalsPublicKey, ordinalsAddress } = xverse;
      storePrivateKey({
        priv: 'SECRET',
        pub: ordinalsPublicKey,
        nsec: 'SECRET',
        provider,
        address: ordinalsAddress,
      });

      callback();
    }
  };

  return {
    privateKey,
    nsec,
    pubkey,
    address,
    provider,
    storePrivateKey,
    connect,
  };
};

export default useWallet;
