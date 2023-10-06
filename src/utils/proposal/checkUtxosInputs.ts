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

export default checkInputUtxos;
