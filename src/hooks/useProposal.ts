import { useQuery } from 'react-query';
import { nostrPool } from '@/services/nostr';
import { Bitpac, NostrEvent, Proposal } from '@/types';
import { Event } from 'nostr-tools';
import { Address, Tx, Script, Tap, Signer } from '@cmdcode/tapscript';
import { NETWORK } from '@/config/config';
import { uuid } from 'uuidv4';
import { API_ENDPOINTS } from '@/data/utils/endpoints';
import { bytesToHex, checkIfTxHappened, pushTx } from '@/utils/utils';
import * as nobleSecp256k1 from 'noble-secp256k1';

interface EventWithVotes extends Event<number> {
  votes?: Event<number>[];
}

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

const fetchVotes = async (proposalEventId: string): Promise<Event[]> => {
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
  );

  return filteredVotes;
};

const getProposal = async (
  proposal: any,
  utxos: any[],
  pubkeys: string[],
  threshold: number = 1,
  bitpac: Bitpac
) => {
  const proposalContent = JSON.parse(proposal.content);
  const votes = proposal.votes;

  const { id, pubkey } = proposal;
  const title = proposalContent[0];
  const inputs = proposalContent[1];
  const outputs = proposalContent[2];
  const description = proposalContent[3];

  let approvedVotes = 0;
  let rejectedVotes = 0;

  votes?.forEach(async (vote: any) => {
    const content = vote.content ? JSON.parse(vote.content) : 0;

    if (content) {
      approvedVotes += 1;
    } else {
      rejectedVotes += 1;
    }
  });

  const totalVotes = approvedVotes + rejectedVotes;
  const acceptedPercentage = totalVotes
    ? (approvedVotes / totalVotes) * 100
    : 0;
  const rejectedPercentage = totalVotes
    ? (rejectedVotes / totalVotes) * 100
    : 0;

  let status: 'active' | 'past' = 'active';

  // if inputs are spend, they should go to past proposals
  const inputUtxosAreOurs = checkInputUtxos(inputs, utxos);
  // if transaction exists, it should go into past proposals
  let txId = await checkTx(inputs, outputs);
  if (
    approvedVotes >= threshold ||
    rejectedVotes >= threshold ||
    !inputUtxosAreOurs ||
    txId
  ) {
    status = 'past';
  } else {
    status = 'active';
  }

  // Let's try to send the transaction

  if (
    inputUtxosAreOurs &&
    !txId &&
    inputs.length &&
    outputs.length &&
    approvedVotes >= threshold
  ) {
    const votesWithSignatures = votes?.filter(
      (vote: any) => vote.content && vote.content !== '1'
    );
    // All votes with signatures
    const allSignatures: { sigs: any[]; pubkey: string }[] = [];
    votesWithSignatures?.forEach((vote: any) => {
      const voteSignatures = JSON.parse(vote.content);
      allSignatures.push({ sigs: voteSignatures, pubkey: vote.pubkey });
    });

    // We are ready to send, since we have all the signatures ready
    if (allSignatures.length >= threshold) {
      const script = [0];
      pubkeys.forEach((item: any) => {
        script.push(item, 'OP_CHECKSIGADD');
      });
      script.push(threshold, 'OP_EQUAL');

      const placeholderPubkey = 'ab'.repeat(32);
      const sbytes = Script.encode(script);
      const tapleaf = Tap.tree.getLeaf(sbytes);
      const [tpubkey, cblock] = Tap.getPubKey(placeholderPubkey, {
        target: tapleaf,
      });
      const txdata = Tx.create({
        vin: inputs,
        vout: outputs,
      });

      const validSigs = [];
      for (let i = 0; i < inputs.length; i++) {
        const sighash = Signer.taproot.hash(txdata, i, { extension: tapleaf });
        try {
          const isValid = await nobleSecp256k1.schnorr.verify(
            // @ts-ignore
            allSignatures[i].sigs[i],
            bytesToHex(sighash),
            allSignatures[i].pubkey
          );
          if (!isValid) {
            return false;
          }
        } catch (e) {
          return false;
        }

        validSigs.push(allSignatures[i]);
      }

      // So far everything looks good. Let's continue broadcasting the transaction
      if (validSigs.length >= threshold) {
        // loop through event content
        for (let i = 0; i < allSignatures[0].sigs.length; i++) {
          pubkeys.reverse();

          const sigsArray: any[] = [];
          pubkeys.forEach((item) => {
            if (votes.some((vote: any) => vote.pubkey === item)) {
              sigsArray.push(allSignatures[0].sigs[i]);
            } else {
              sigsArray.push('');
            }
          });

          let sigCounter = 0;
          sigsArray.forEach((item, index) => {
            if (sigCounter == threshold) sigsArray[index] = '';
            if (sigsArray[index]) {
              sigCounter = sigCounter + 1;
            }
          });

          pubkeys.reverse();
          if (txdata) txdata.vin[i].witness = [...sigsArray, script, cblock];
        }

        if (txdata) {
          txId = await pushTx(Tx.encode(txdata).hex);

          console.log('pushing ', Tx.encode(txdata).hex, txId);
        }
      }
    }
  }

  let totalAmount = 0;

  const outputActions =
    outputs?.slice(0, -1).map((output: any) => {
      totalAmount += output.value;
      const address = Address.fromScriptPubKey(output.scriptPubKey, NETWORK);
      const action = {
        id: uuid(),
        contract: {
          id: address,
          link: `${API_ENDPOINTS.MEMPOOL_API}/address/${address}`,
        },
        amount: output.value,
      };

      return action;
    }) || [];

  const voters = votes?.map((vote: any) => {
    const content = vote.content ? JSON.parse(vote.content) : 0;

    return {
      voter: { id: vote.pubkey, link: '#' },
      voting_weight: new Date(vote.created_at * 1000).toLocaleDateString(
        'en-US',
        { month: 'short', day: '2-digit', year: 'numeric' }
      ),
      status: content ? 'accepted' : 'rejected',
      pubkey: vote.pubkey,
    };
  });

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

const fetchProposalsAndVotes = async (
  pubkeys: string[],
  bitpacId: string,
  utxos: any[],
  threshold: number,
  bitpac: Bitpac
): Promise<{ proposals: any[] }> => {
  console.log('GETTING PROPOSALS AND VOTES');
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
    proposals.map((proposal) =>
      getProposal(proposal, utxos, pubkeys, threshold, bitpac)
    )
  );

  return { proposals: proposalsData };
};

// Move away from here
const checkInputUtxos = (inputs: any, utxos: any) => {
  if (!inputs || !utxos) return true;
  const stringifiedUtxos: string[] = [];
  utxos?.forEach((item: any) => {
    stringifiedUtxos.push(JSON.stringify(item));
  });

  return inputs.some((input: any) => {
    const txid = input['txid'];
    const vout = input['vout'];
    const amt = input['prevout']['value'];
    const stringifiedInput = JSON.stringify([txid, vout, amt]);
    return !stringifiedUtxos.includes(stringifiedInput);
  });
};

// Move away from here
const getChange = (outputs: any[], address?: string) => {
  if (!address || !outputs.length) return 0;

  const lastOutput = outputs[outputs.length - 1];
  var hasChange =
    Address.fromScriptPubKey(lastOutput['scriptPubKey']) ==
    Address.fromScriptPubKey(Address.toScriptPubKey(address));
  if (hasChange) {
    return lastOutput['value'];
  } else {
    return 0;
  }
};

const checkTx = async (inputs: any[], outputs: any[]) => {
  if (!inputs.length || !outputs.length) {
    return false;
  }
  try {
    var txdata = Tx.create({
      vin: inputs,
      vout: outputs,
    });
    var txid = Tx.util.getTxid(txdata);
    await checkIfTxHappened(txid);
    return txid;
  } catch (e) {}

  return false;
};

// TODO: BITPAC IS REQUIRED, I SET IT UP AS OPTIONAL TO HACK THE LINTING.
const useProposals = (bitpac: Bitpac, utxos?: any) => {
  const { pubkeys = [], id = '', threshold = 1 } = bitpac || {};
  const { data, isLoading, error } = useQuery(['proposals', pubkeys, id], () =>
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
  };
};

export default useProposals;
