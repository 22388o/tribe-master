import { useState, useEffect } from 'react';
import SessionStorage, {
  SessionsStorageKeys,
} from '@/services/session-storage';
import { Bitpac, NostrEvent } from '@/types';
import { nostrPool } from '@/services/nostr';
import { generateMultisigAddress } from '@/services/tribe';

const useBitpac = () => {
  const [tribe, setTribe] = useState<NostrEvent | undefined>();
  const [name, setName] = useState('');
  const [threshold, setTreshold] = useState(1);
  const [pubkeys, setPubkeys] = useState([]);
  const [id, setId] = useState('');
  const [address, setAddress] = useState('');
  const [bitpac, setBitpac] = useState<Bitpac>({});

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

    const pac = {
      id: bitpac.id,
      name: _name,
      pubkeys: _pubkeys,
      threshold: _threshold,
      address: _address,
    };

    setTribe(bitpac);
    setAddress(_address);
    setId(bitpac.id);
    setName(_name);
    setTreshold(_threshold);
    setPubkeys(_pubkeys);
    setBitpac(pac);

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

  return { tribe, name, threshold, pubkeys, id, bitpac, address };
};

export default useBitpac;
