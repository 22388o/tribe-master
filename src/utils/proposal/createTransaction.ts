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
  for (let i = 0; i < allSignatures.length; i++) {
    const signature = allSignatures[i];

    for (let j = 0; j < signature.sigs.length; j++) {
      const sighash = Signer.taproot.hash(txdata, j, { extension: tapleaf });
      try {
        const msgHash = bytesToHex(sighash);
        const isValid = await nobleSecp256k1.schnorr.verify(
          signature.sigs[j],
          msgHash,
          signature.pubkey
        );

        if (!isValid) {
          continue;
        }
      } catch (e) {
        console.error(e);
        continue;
      }

      validSigs.push(signature.sigs[j]);
    }
  }

  // So far everything looks good. Let's continue broadcasting the transaction
  if (validSigs.length >= threshold) {
    // loop through event content
    for (let i = 0; i < allSignatures[0].sigs.length; i++) {
      pubkeys.reverse();

      const sigsArray: any[] = [];
      pubkeys.forEach((item) => {
        const pubkeySig = allSignatures.find((a) => a.pubkey === item);
        if (!sigsArray.includes(pubkeySig.sigs[i])) {
          sigsArray.push(pubkeySig.sigs[i]);
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
      return txId;
    }
  }

  return null;
};
