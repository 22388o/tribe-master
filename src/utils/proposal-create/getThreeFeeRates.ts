import { API_ENDPOINTS } from '@/data/utils/endpoints';

export async function getThreeFeeRates() {
  const response = await fetch(
    `${API_ENDPOINTS.MEMPOOL_API}/v1/fees/recommended`
  );
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  const fees = await response.json();

  // @ts-ignore
  const array = [fees['minimumFee'], fees['hourFee'], fees['fastestFee']];
  return array;
}
