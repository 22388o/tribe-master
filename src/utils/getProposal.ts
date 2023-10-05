import { Bitpac, Proposal } from '@/types';
import { API_ENDPOINTS } from '@/data/utils/endpoints';
import checkInputUtxos from './checkUtxosInputs';
import checkTx from './checkTx';
import { getVoteCounts } from './getVoteCounts';
import { getProposalStatus } from './getProposalStatus';
import { getProposalContent } from './getProposalContent';
import { calculateVotePercentages } from './calculateVotePercentages';
import { getSignatures } from './getSignatures';
import { getOutputActions } from './getOutputActions';
import { getVoters } from './getVoters';
import { createTransaction } from './createTransaction';

const getProposal = async (
  proposal: any,
  utxos: any[],
  pubkeys: string[],
  threshold: number = 1,
  bitpac: Bitpac
) => {
  const votes = proposal.votes;
  const { id, pubkey, title, inputs, outputs, description } =
    getProposalContent(proposal);
  const { approvedVotes, rejectedVotes } = getVoteCounts(votes);
  const { acceptedPercentage, rejectedPercentage } = calculateVotePercentages(
    approvedVotes,
    rejectedVotes
  );

  let txId = await checkTx(inputs, outputs);

  const inputUtxosAreOurs = checkInputUtxos(inputs, utxos);
  const status = await getProposalStatus(
    approvedVotes,
    rejectedVotes,
    threshold,
    inputs,
    utxos,
    outputs
  );

  // Let's try to send the transaction
  if (
    inputUtxosAreOurs &&
    !txId &&
    inputs.length &&
    outputs.length &&
    approvedVotes >= threshold
  ) {
    // All votes with signatures
    const allSignatures = getSignatures(votes);
    // We are ready to send, since we have all the signatures ready
    if (allSignatures.length >= threshold) {
      txId = await createTransaction(
        inputs,
        outputs,
        pubkeys,
        allSignatures,
        threshold,
        votes
      );
    }
  }

  const outputActions = getOutputActions(outputs);
  const voters = getVoters(votes);

  const txid = !txId ? undefined : `${txId}`;
  const vote: Proposal = {
    id,
    title,
    description,
    pubkey,
    inputs,
    outputs,
    tx: {
      txid: txid,
      link: txid ? `${API_ENDPOINTS.MEMPOOL}/tx/${txid}` : undefined,
    },
    accepted: {
      vote: approvedVotes,
      percentage: acceptedPercentage,
    },
    rejected: {
      vote: rejectedVotes,
      percentage: rejectedPercentage,
    },
    proposed_by: {
      id: pubkey,
      link: '#',
    },
    requiredVotesToPass: threshold,
    requiredVotesToDeny: pubkeys.length - threshold + 1,
    status,
    votes: voters || [],
    action: outputActions || [],
    // @ts-ignore
    bitpac,
  };

  return vote;
};

export default getProposal;
