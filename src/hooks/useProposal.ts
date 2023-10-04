import { useQuery } from 'react-query';
import { nostrPool } from '@/services/nostr';
import { Bitpac, Proposal } from '@/types';

const fetchProposals = async (pubkeys: string[], bitpacId: string) => {
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

const useProposals = (bitpac?: Bitpac) => {
  const { pubkeys = [], id = '', threshold = 1 } = bitpac || {};
  const {
    data: proposals,
    isLoading,
    error,
  } = useQuery(['proposals', pubkeys, id], () => fetchProposals(pubkeys, id));

  const votes = proposals?.map((proposal) => {
    const proposalContent = JSON.parse(proposal.content);

    const { id, pubkey } = proposal;
    const title = proposalContent[0];
    const description = proposalContent[3];

    const vote: Proposal = {
      id,
      title,
      description,
      pubkey,
      accepted: {
        vote: 0,
        percentage: 0,
      },
      rejected: {
        vote: 0,
        percentage: 0,
      },
      proposed_by: {
        id: pubkey,
        link: '#',
      },
      requiredVotesToPass: threshold,
      requiredVotesToDeny: pubkeys.length - threshold + 1,
      status: 'active',
      votes: [],
      action: [],
    };

    return vote;
  });

  return {
    current: votes,
    totalActiveVote: 1,
    totalPastVote: 0,
    isLoading,
    error,
  };
};

export default useProposals;
