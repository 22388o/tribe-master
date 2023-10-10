import { Script, Tap, Tx, Signer } from '@cmdcode/tapscript';
import { bytesToHex, pushTx } from '@/utils/utils';
import * as nobleSecp256k1 from 'noble-secp256k1';

export const createTransaction = async (
  inputs: any[],
  outputs: any[],
  pubkeys: string[],
  allSignatures: any[],
  threshold: number,
  votes: any[]
) => {
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
  for (let i = 0; i < allSignatures[0].sigs.length; i++) {
    const sighash = Signer.taproot.hash(txdata, i, { extension: tapleaf });
    try {
      const isValid = await nobleSecp256k1.schnorr.verify(
        // @ts-ignore
        allSignatures[0].sigs[i],
        bytesToHex(sighash),
        allSignatures[0].pubkey
      );
      if (!isValid) {
        continue;
      }
    } catch (e) {
      continue;
    }

    validSigs.push(allSignatures[0].sigs[i]);
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
      const txId = await pushTx(Tx.encode(txdata).hex);
      console.log('pushing ', Tx.encode(txdata).hex, txId);
      return txId;
    }
  }

  return null;
};
