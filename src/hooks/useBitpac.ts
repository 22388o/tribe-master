import { useEffect } from 'react';
import SessionStorage, {
  SessionsStorageKeys,
} from '@/services/session-storage';
import { Bitpac, NostrEvent } from '@/types';
import { Tags, nostrPool } from '@/services/nostr';
import { generateMultisigAddress } from '@/services/tribe';
import { useAtom, atom } from 'jotai';
import { getNostrTagValue } from '@/utils/utils';

const tribeAtom = atom<NostrEvent | undefined>(undefined);
const nameAtom = atom('');
const thresholdAtom = atom(1);
const pubkeysAtom = atom<string[]>([]);
const idAtom = atom('');
const providerAtom = atom('');
const addressAtom = atom('');
const bitpacAtom = atom<Bitpac | undefined>(undefined);

export enum BitpacType {
  NOSTR = 'nostr',
  BTC = 'btc',
}

const useBitpac = () => {
  const [tribe, setTribe] = useAtom(tribeAtom);
  const [name, setName] = useAtom(nameAtom);
  const [threshold, setThreshold] = useAtom(thresholdAtom);
  const [pubkeys, setPubkeys] = useAtom(pubkeysAtom);
  const [id, setId] = useAtom(idAtom);
  const [address, setAddress] = useAtom(addressAtom);
  const [bitpac, setBitpac] = useAtom(bitpacAtom);
  const [provider, setProvider] = useAtom(providerAtom);

  const fetchPac = async (bitpacId: string) => {
    const filter = [
      {
        ids: [bitpacId],
      },
    ];

    const bitpack = await nostrPool.list(filter);
    return bitpack;
  };

  const handleMessage = (bitpac: any): void => {
    const content = JSON.parse(bitpac.content);

    const _name = content[0];
    const [_threshold, ..._pubkeys] = content[1];
    const _address = generateMultisigAddress(_pubkeys, _threshold);
    const _provider = getNostrTagValue(Tags.BITPAC_TYPE, bitpac.tags) || '';

    const pac: Bitpac = {
      id: bitpac.id,
      name: _name,
      pubkeys: _pubkeys,
      threshold: _threshold,
      address: _address,
      provider: _provider,
    };

    setTribe(bitpac);
    setAddress(_address);
    setId(bitpac.id);
    setName(_name);
    setThreshold(_threshold);
    setPubkeys(_pubkeys);
    setBitpac(pac);
    setProvider(_provider);

    // Allow for faster query instead of going to nostr.
    SessionStorage.set(SessionsStorageKeys.TRIBE, bitpac);
  };

  useEffect(() => {
    const fetchData = async () => {
      const sessionTribe: NostrEvent | undefined = SessionStorage.get(
        SessionsStorageKeys.TRIBE
      );

      if (sessionTribe) {
        handleMessage(sessionTribe);
        return;
      }

      const sessionTribeId: string | undefined = SessionStorage.get(
        SessionsStorageKeys.TRIBE_ID
      );

      if (sessionTribeId) {
        const bitpacs = await fetchPac(sessionTribeId);

        if (bitpacs && bitpacs.length > 0) {
          const bitpac = bitpacs[0];
          handleMessage(bitpac);

          return;
        }
      }
    };

    fetchData();
  }, []);

  return { tribe, name, threshold, pubkeys, id, bitpac, address, provider };
};

export default useBitpac;
