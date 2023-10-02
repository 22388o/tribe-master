import { API_ENDPOINTS } from '@/data/utils/endpoints'
import { satsToBtc} from '@/utils/utils'

import { useQuery } from 'react-query';


const fetchAddress = async (address: string) => {
  const response = await fetch(`${API_ENDPOINTS.MEMPOOL_API}/address/${address}/utxo`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

const useAddress = (address: string)=> {
  const { data, isLoading, error } = useQuery(['address', address], () => fetchAddress(address));

  // Calculate the total balance
  const sats = data?.reduce((acc: number, utxo: any) => acc + utxo.value, 0) || 0;

  return { sats, balance: satsToBtc(sats) , isLoading, error };
};

export default useAddress;
