import { API_ENDPOINTS } from '@/data/utils/endpoints';
import { useQuery } from 'react-query';

const fetchBitcoinPrice = async () => {
  const response = await fetch(API_ENDPOINTS.BITCOIN_PRICE_API_URL);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  const data = await response.json();
  return data.USD.last;
};

const useBitcoinPrice = () => {
  const { data, isLoading, error } = useQuery(
    'bitcoinPrice',
    fetchBitcoinPrice
  );

  return { price: data, isLoading, error };
};

export default useBitcoinPrice;
