import { nostrPool } from '@/services/nostr';
import { EventWithVotes } from '@/types';

const fetchProposals = async (
  pubkeys: string[],
  bitpacId: string
): Promise<EventWithVotes[]> => {
  if (!bitpacId) return [];

  const filter = [
    {
      authors: pubkeys,
      kinds: [2859],
      '#e': [bitpacId],
      since: Math.floor(Date.now() / 1000) - 60 * 60 * 24 * 30, // a month ago
    },
  ];

  const proposals = await nostrPool.list(filter);
  return proposals;
};

export default fetchProposals;
