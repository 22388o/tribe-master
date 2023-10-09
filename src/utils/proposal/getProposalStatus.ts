import checkTx from './checkTx';
import checkInputUtxos from './checkUtxosInputs';

export const getProposalStatus = async (
  approvedVotes: number,
  rejectedVotes: number,
  threshold: number,
  inputs: any[],
  utxos: any[],
  outputs: any[]
): Promise<'active' | 'past'> => {
  const inputUtxosAreOurs = inputs?.length
    ? checkInputUtxos(inputs, utxos)
    : true;
  const txExists = await checkTx(inputs, outputs);
  if (
    approvedVotes >= threshold ||
    rejectedVotes >= threshold ||
    !inputUtxosAreOurs ||
    txExists
  ) {
    return 'past';
  }
  return 'active';
};
