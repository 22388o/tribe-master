import { Script, Tap, Address } from '@cmdcode/tapscript';
import { getInputs } from './getInputs';
import { getOutputs } from './getOutputs';
import { getTxSize } from './getTxSize';
import { getThreeFeeRates } from './getThreeFeeRates';

const spendCoins = async (
  pubkeys: string[],
  threshold: number,
  utxos: any[],
  walletOutputs: any[],
  walletAddress: string
) => {
  var script = [0];
  pubkeys.forEach((item) => {
    if (item.startsWith('xpub') || item.startsWith('tpub')) {
    }
    // @ts-ignore
    script.push(item, 'OP_CHECKSIGADD');
  });
  script.push(threshold, 'OP_EQUAL');

  const pubkey = 'ab'.repeat(32);
  var sbytes = Script.encode(script);
  var tapleaf = Tap.tree.getLeaf(sbytes);
  var [tpubkey, cblock] = Tap.getPubKey(pubkey, { target: tapleaf });

  const { from_amount, inputs } = getInputs(utxos, tpubkey);
  // validate if !from_amount which means it doesn't have money :S
  const { to_amount, there_be_dust, outputs } = getOutputs(walletOutputs);
  if (there_be_dust) {
    throw new Error(
      "You cannot send less than 546 sats because that is bitcoin's dust limit. Please try again"
    );
  }

  if (from_amount - to_amount < 1) {
    throw new Error(
      'You must leave enough to pay a mining fee, please try again'
    );
  }
  const txsize = getTxSize(inputs, outputs, pubkeys);

  const fee_options = await getThreeFeeRates();
  const sats_per_byte = Number(fee_options[1]);
  let mining_fee = txsize * sats_per_byte;
  if (mining_fee < 172) mining_fee = 172;

  if (from_amount - to_amount < mining_fee) {
    throw new Error(
      `With your chosen fee rate you must leave at least ${mining_fee} sats to pay for mining fees, which means the max you can spend is ${
        from_amount - mining_fee
      } sats. Please try again`
    );
  }

  if (from_amount - (to_amount + mining_fee) >= 546) {
    outputs.push({
      value: from_amount - (to_amount + mining_fee),
      scriptPubKey: Address.toScriptPubKey(walletAddress),
    });
  }

  return { inputs, outputs };
};

export default spendCoins;
