import { Address } from '@cmdcode/tapscript';
import { NETWORK } from '@/config/config';
import { uuid } from 'uuidv4';
import { API_ENDPOINTS } from '@/data/utils/endpoints';

export const getOutputActions = (outputs: any[]) => {
  let totalAmount = 0;

  return (
    outputs?.slice(0, -1).map((output: any) => {
      totalAmount += output.value;
      const address = Address.fromScriptPubKey(output.scriptPubKey, NETWORK);
      const action = {
        id: uuid(),
        contract: {
          id: address,
          link: `${API_ENDPOINTS.MEMPOOL_API}/address/${address}`,
        },
        amount: output.value,
      };

      return action;
    }) || []
  );
};
