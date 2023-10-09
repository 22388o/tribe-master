import { NETWORK } from '@/config/config';

export const API_ENDPOINTS = {
  MEMPOOL_API: `https://mempool.space/${NETWORK}/api`,
  MEMPOOL: `https://mempool.space/${NETWORK}`,
  BITCOIN_PRICE_API_URL: 'https://blockchain.info/ticker?cors=true',
  // PRICING: 'https://api.coingecko.com/api/v3/coins',
  // MARKETS: 'https://api.coingecko.com/api/v3/coins/markets',
};
