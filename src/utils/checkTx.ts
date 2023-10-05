import { checkIfTxHappened } from '@/utils/utils';
import { Tx } from '@cmdcode/tapscript';

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

export default checkTx;
