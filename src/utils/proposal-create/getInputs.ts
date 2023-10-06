export const getInputs = (utxos: any[], tpubkey: string) => {
  let from_amount = 0;
  const inputs: any = [];
  utxos.forEach((utxo) => {
    const txid = utxo.txid;
    const vout = utxo.vout;
    const amt = utxo.value;

    from_amount = from_amount + amt;

    inputs.push({
      txid: txid,
      vout: vout,
      prevout: {
        value: amt,
        scriptPubKey: ['OP_1', tpubkey],
      },
    });
  });

  return { from_amount, inputs };
};
