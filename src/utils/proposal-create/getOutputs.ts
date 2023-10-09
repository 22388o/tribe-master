import { Address } from '@cmdcode/tapscript';

export const getOutputs = (outputs: { address: string; amount: number }[]) => {
  var to_amount = 0;
  var there_be_dust = false;
  const txOutputs: any[] = [];
  outputs.forEach((item) => {
    txOutputs.push({
      value: Number(item.amount),
      scriptPubKey: Address.toScriptPubKey(item.address),
    });
    to_amount = to_amount + item.amount;
    if (item.amount < 546) there_be_dust = true;
  });

  return { to_amount, there_be_dust, outputs: txOutputs };
};
