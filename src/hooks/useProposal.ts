import { useQuery } from 'react-query';
import { nostrPool } from '@/services/nostr';
import { Bitpac, NostrEvent, Proposal } from '@/types';
import { Event } from 'nostr-tools';
import { Address, Tx, Script, Tap, Signer } from '@cmdcode/tapscript';
import { NETWORK } from '@/config/config';
import { uuid } from 'uuidv4';
import { API_ENDPOINTS } from '@/data/utils/endpoints';
import { bytesToHex, checkIfTxHappened } from '@/utils/utils';
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

const validateAllSignatures = async (
  pubkeys: string[],
  inputs: any[],
  outputs: any[],
  threshold: number,
  allSigs: any[],
  vote: any
) => {
  const script = [0];
  pubkeys.forEach((item: any) => {
    script.push(item, 'OP_CHECKSIGADD');
  });
  var pubkey = 'ab'.repeat(32);
  script.push(threshold, 'OP_EQUAL');
  var sbytes = Script.encode(script);
  var tapleaf = Tap.tree.getLeaf(sbytes);
  var [tpubkey, cblock] = Tap.getPubKey(pubkey, { target: tapleaf });
  var txdata = Tx.create({
    vin: inputs,
    vout: outputs,
  });

  var i;
  for (i = 0; i < inputs.length; i++) {
    var sighash = Signer.taproot.hash(txdata, i, { extension: tapleaf });
    try {
      const isValid = await nobleSecp256k1.schnorr.verify(
        allSigs[i],
        bytesToHex(sighash),
        vote.pubkey
      );
      if (!isValid) {
        return false;
      }
    } catch (e) {
      return false;
    }
    return true;
  }
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
    debugger;
    const content = vote.content ? JSON.parse(vote.content) : 0;

    if (content) {
      approvedVotes += 1;
    } else {
      rejectedVotes += 1;
    }

    // User approved the spend (content will be the signature)
    if (content && content != '1') {
      const areSigsValid = await validateAllSignatures(
        pubkeys,
        inputs,
        outputs,
        threshold,
        content,
        vote
      );
      console.log(areSigsValid);
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
  const txExists = await checkTx(inputs, outputs);
  if (
    approvedVotes >= threshold ||
    rejectedVotes >= threshold ||
    !inputUtxosAreOurs ||
    txExists
  ) {
    status = 'past';
  } else {
    status = 'active';
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

  const vote: Proposal = {
    id,
    title,
    description,
    pubkey,
    inputs,
    outputs,
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
    return true;
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
