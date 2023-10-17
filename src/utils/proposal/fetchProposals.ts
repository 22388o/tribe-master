import { nostrPool } from '@/services/nostr';
import { Bitpac, EventWithVotes } from '@/types';
import validateEvent from '../xverse/validateEvent';

// TODO: WARNING - WE ARE DOING MANUAL SIG VALIDATION FOR PROPOSALS THAT ARE NOT NOSTR.
// FOR EXAMPLE XVERSE, WE NEED TO MANUALLY VERIFY THAT THE PROPOSAL WAS ACTUALLY MADE BY A MEMBER OF THE PAC.
const fetchProposals = async (
  pubkeys: string[],
  bitpac: Bitpac,
  provider?: string
): Promise<EventWithVotes[]> => {
  if (!bitpac?.id) return [];

  // For nostr pacs, we should get with author, since the author signed the event.
  // but with xverse for example, the keys that signed the event, were not part of the event.
  const filter = provider
    ? [
        {
          kinds: [2859],
          '#e': [bitpac.id],
          since: Math.floor(Date.now() / 1000) - 60 * 60 * 24 * 30, // a month ago
        },
      ]
    : [
        {
          authors: pubkeys,
          kinds: [2859],
          '#e': [bitpac.id],
          since: Math.floor(Date.now() / 1000) - 60 * 60 * 24 * 30, // a month ago
        },
      ];

  let proposals = (await nostrPool.list(filter)) || [];
  
  // We must filter out invalid events and events that the pubkey doesn't belong to the pac.
  return  proposals.filter((proposal) => {
    return validateEvent(proposal, bitpac);
  }).sort((a, b) => b.created_at - a.created_at);
};

export default fetchProposals;
