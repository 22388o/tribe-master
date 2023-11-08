// All required business logic for tribe.
import { Script, Tap, Address, Tx, Signer } from '@cmdcode/tapscript';
import { NETWORK } from '@/config/config';
import { getPrivkeyBufferFromXprv } from '@/utils/utils';
import {BOLT11, sendPayment, receivePayment } from '@/utils/utils';

// This function is used to generate a multisig address.
export function generateMultisigAddress(
  pubkeys: Array<string | number>,
  threshold: number
): string {
  // Initialize the script with the first opcode as 0.
  const script: (string | number)[] = [0];

  // For each public key, add it to the script along with the OP_CHECKSIGADD opcode.
  pubkeys.forEach((item) => {
    script.push(item, 'OP_CHECKSIGADD');
  });

  // Add the threshold and the OP_EQUAL opcode to the script.
  script.push(threshold, 'OP_EQUAL');

  // Generate a public key.
  const pubkey = 'ab'.repeat(32);

  // Encode the script.
  const sbytes = Script.encode(script);

  // Get the leaf of the Taproot tree for the encoded script.
  const tapleaf = Tap.tree.getLeaf(sbytes);

  // Get the public key for the Taproot address.
  const [tpubkey] = Tap.getPubKey(pubkey, { target: tapleaf });

  // Generate the P2TR (Pay-to-Taproot) address from the public key.
  const address = Address.p2tr.fromPubKey(tpubkey, NETWORK);

  // Return the generated address.
  return address;
}

// Function to get all signatures for a transaction
const getAllSigs = ({ inputs, outputs, seckey, pubkeys, threshold }: any) => {
  // Create a transaction with the provided inputs and outputs
  const txdata = Tx.create({
    vin: inputs,
    vout: outputs,
  });

  // Initialize the script with the first opcode as 0
  const script = [0];
  // For each item in the multisig array, add it to the script along with the OP_CHECKSIGADD opcode
  pubkeys.forEach((item) => {
    script.push(item, 'OP_CHECKSIGADD');
  });
  // Generate a placeholder public key
  const placeholderPubkey = 'ab'.repeat(32);
  // Add the threshold and the OP_EQUAL opcode to the script
  script.push(threshold, 'OP_EQUAL');
  // Encode the script
  const sbytes = Script.encode(script);
  // Get the leaf of the Taproot tree for the encoded script
  const tapleaf = Tap.tree.getLeaf(sbytes);
  // Get the public key and control block for the Taproot address
  const [tpubkey, cblock] = Tap.getPubKey(placeholderPubkey, {
    target: tapleaf,
  });
  // Initialize an empty array for the signatures
  const all_sigs = [];
  // For each input, generate a signature and add it to the array
  let pk = seckey;
  if (seckey.startsWith('xprv') || seckey.startsWith('tprv')) {
    pk = getPrivkeyBufferFromXprv(seckey);
  }

  for (let i = 0; i < inputs.length; i++) {
    var sig = Signer.taproot.sign(pk, txdata, i, { extension: tapleaf });
    all_sigs.push(sig.hex);
  }

  // Return the array of signatures
  return all_sigs;
};

export function getApprovalSigs({
  inputs,
  outputs,
  seckey,
  pubkeys,
  threshold,
}: any) {
  return inputs.length && outputs.length
    ? getAllSigs({ inputs, outputs, seckey, pubkeys, threshold })
    : 1;
}
