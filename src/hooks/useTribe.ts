import { useState, useEffect } from 'react';
import { generateMultisigAddress } from '@/services/tribe';

export function useMultisigAddress(pubkeys: Array<string>, threshold = 1) {
  const [multisigAddress, setMultisigAddress] = useState('');

  useEffect(() => {
    if (pubkeys.length && threshold) {
      const address = generateMultisigAddress(pubkeys, threshold);

      setMultisigAddress(address);
    }
  }, [pubkeys, threshold]);

  return multisigAddress;
}
