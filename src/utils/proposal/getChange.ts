import { Address } from '@cmdcode/tapscript';

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

export default getChange;
