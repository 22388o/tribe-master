import { useState, useEffect } from 'react';
import SessionStorage, {
  SessionsStorageKeys,
} from '@/services/session-storage';
import { Bitpac, NostrTribe } from '@/types';
import { nostrPool } from '@/services/nostr';

const useBitpac = () => {

  const [tribe, setTribe] = useState<NostrTribe | undefined>();
  const [name, setName] = useState('');
  const [threshold, setTreshold] = useState(1);
  const [pubkeys, setPubkeys] = useState([]);
  const [id, setId] = useState('')
  const [bitpac, setBitpac] = useState<Bitpac>()

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
    const [_threshold, ..._pubkeys ] = content[1];

    const pac = {
      id: bitpac.id,
      name: _name,
      pubkeys: _pubkeys,
      threshold: _threshold
    }

    setTribe(bitpac);
    setId(bitpac.id);
    setName(_name)
    setTreshold(_threshold);
    setPubkeys(_pubkeys);
    setBitpac(pac);
    
    // Allow for faster query instead of going to nostr.
    SessionStorage.set(SessionsStorageKeys.TRIBE, bitpac);
  };

  useEffect(() => {
    const fetchData = async () => {

      const sessionTribe: NostrTribe | undefined = SessionStorage.get(
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

  return { tribe, name, threshold, pubkeys, id, bitpac };
};

export default useBitpac;
