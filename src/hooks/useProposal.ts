import { useQuery } from 'react-query';
import { Bitpac, Proposal } from '@/types';
import fetchProposalsAndVotes from '@/utils/fetchProposalsAndVotes';

const useProposals = (bitpac: Bitpac, utxos?: any) => {
  const { pubkeys = [], id = '', threshold = 1 } = bitpac || {};
  const { data, isLoading, error, refetch } = useQuery(['proposals', pubkeys, id], () =>
    fetchProposalsAndVotes(pubkeys, id, utxos, threshold, bitpac)
  );

  const { proposals } = data || {};

  return {
    current: proposals,
    totalActiveVote:
      proposals?.filter((proposal: Proposal) => proposal.status === 'active')
        .length || 0,
    totalPastVote:
      proposals?.filter((proposal: Proposal) => proposal.status === 'active')
        .length || 0,
    isLoading,
    error,
    refetch, // Expose the refetch function
  };
};

export default useProposals;