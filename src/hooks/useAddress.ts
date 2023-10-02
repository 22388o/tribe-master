import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '@/data/utils/endpoints'
import { satsToBtc} from '@/utils/utils'
import { useQuery } from 'react-query';
const useAddress = (address: string) => {
  const [sats, setSats] = useState(0)
  const [balance, setBalance] = useState(0);


  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(`${API_ENDPOINTS.MEMPOOL_API}/address/${address}/utxo`);
      const utxos = await response.json();

      const _sats = utxos.reduce((acc: number, utxo: any) => acc + utxo.value, 0);
      
      setSats(_sats);
      setBalance(satsToBtc(_sats));
    };

    if (address) {
        fetchData();
    }
  }, [address]);

  return { sats, balance };
};

export default useAddress;