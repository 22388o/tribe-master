import { Bitpac } from '@/types';
import fetchProposals from './fetchProposals';
import fetchVotes from './fetchVotes';
import getProposal from './getProposal';

const fetchProposalsAndVotes = async (
  pubkeys: string[],
  bitpacId: string,
  utxos: any[],
  bitpac: Bitpac
): Promise<{ proposals: any[] }> => {
  const proposals = await fetchProposals(pubkeys, bitpacId);
  const proposalVotes = await Promise.all(
    proposals.map((proposal) => fetchVotes(proposal.id))
  );

  proposals.forEach((proposal, index) => {
    const matchingVotes = proposalVotes[index].filter((vote) =>
      vote.tags.some((tag) => tag[0] === 'e' && tag[1] === proposal.id)
    );
    proposal.votes = matchingVotes;
  });

  const proposalsData = await Promise.all(
    proposals.map((proposal) => getProposal(proposal, utxos, pubkeys, bitpac))
  );

  return { proposals: proposalsData };
};

export default fetchProposalsAndVotes;
