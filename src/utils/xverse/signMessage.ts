import { signMessage, BitcoinNetwork } from 'sats-connect';
import { NETWORK } from '@/config/config';
export const signMessageXVerse = (message: string, address: string) => {
  return new Promise((resolve, reject) => {
    debugger;
    const signMessageOptions = {
      payload: {
        network: {
          type: NETWORK === 'testnet' ? 'Testnet' : 'Mainnet',
        } as BitcoinNetwork,
        address,
        message,
      },
      onFinish: (response: any) => {
        // Resolve the promise with the response
        resolve(response);
      },
      onCancel: () => {
        // Reject the promise with an error
        reject(new Error('Canceled'));
      },
    };
    // @ts-ignore
    signMessage(signMessageOptions);
  });
};
