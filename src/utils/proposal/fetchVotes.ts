import { nostrPool } from '@/services/nostr';
import { Bitpac } from '@/types';
import { Event } from 'nostr-tools';
import validateEvent from '../xverse/validateEvent';

const fetchVotes = async (proposalEventId: string, bitpac: Bitpac): Promise<Event[]> => {
  if (!proposalEventId) return [];

  const filter = [
    {
      kinds: [2860],
      '#e': [proposalEventId],
    },
  ];

  const votes = await nostrPool.list(filter);

  // Order votes by created_at and filter out votes of the same pubkey, keeping only the first vote
  const orderedVotes = votes.sort((a, b) => a.created_at - b.created_at);
  const filteredVotes = orderedVotes.filter(
    (vote, index, self) =>
      index === self.findIndex((v) => v.pubkey === vote.pubkey)
  ).filter((proposal) => {
    return validateEvent(proposal, bitpac);
  });

  return filteredVotes;
};

export default fetchVotes;
