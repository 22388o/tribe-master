import { AddressTx } from '@/types';
import {
  getAddressTxs,
  satsToBtc,
  satsToFormattedDollarString,
  shortenStr,
} from '@/utils/utils';
import { useQuery } from 'react-query';

const useAddressTxs = (address: string, price: number) => {
  const { data, isLoading, error } = useQuery(['addresstxs', address], () =>
    getAddressTxs(address)
  );

  const txs: AddressTx[] = data?.map((tx: any) => {
    let type = 'receive';
    let amount = 0;

    if (
      tx.vin.some(
        (input: any) =>
          input.prevout.addr === address ||
          input.prevout.scriptpubkey_address === address
      )
    ) {
      type = 'send';
      // Sum up the values of all outputs that are not change back to the sender
      const outputValues = tx.vout.map((output: any) => output.value);
      const changeValue =
        outputValues.length > 1 ? Math.min(...outputValues) : 0;
      amount =
        outputValues.reduce(
          (total: number, value: number) => total + value,
          0
        ) - changeValue;
    } else {
      // If the address is not in the inputs, it's a receiving transaction
      // Sum up the values of all outputs that go to the address
      amount = tx.vout
        .filter(
          (output: any) =>
            output.addr === address || output.scriptpubkey_address === address
        )
        .reduce((total: number, output: any) => total + output.value, 0);
    }

    const { block_time: date, confirmed: status } = tx.status;
    return {
      id: tx.txid,
      txid: shortenStr(tx.txid),
      transactionType: type,
      createdAt: new Date(date * 1000).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      status: status ? 'Confirmed' : 'Pending',
      amount: {
        balance: satsToBtc(amount),
        usdBalance: satsToFormattedDollarString(amount, price),
      },
    };
  });

  return { txs, isLoading, error };
};

export default useAddressTxs;
