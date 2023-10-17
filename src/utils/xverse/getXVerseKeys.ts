import {
  AddressPurposes,
  BitcoinNetwork,
  GetAddressOptions,
  getAddress,
} from 'sats-connect';
import { NETWORK } from '@/config/config';
import { toXOnly } from '../utils';

type WalletKeys = {
  ordinalsPublicKey: string;
  paymentPublicKey: string;
  ordinalsAddress: string;
  paymentAddress: string;
  internalPubKey: string;
};

export async function getXverseKeys(): Promise<WalletKeys> {
  const getAddressOptions: GetAddressOptions = {
    onCancel: () => {},
    onFinish: () => {},
    payload: {
      purposes: ['ordinals', 'payment'] as AddressPurposes[],
      message: 'Address for receiving Ordinals',
      network: {
        type: NETWORK === 'testnet' ? 'Testnet' : 'Mainnet',
      } as BitcoinNetwork,
    },
  };

  const wallet = await new Promise<WalletKeys>((resolve, reject) => {
    getAddressOptions.onFinish = (response) => {
      const { publicKey: xOrdinalPublicKey, address: xOrdinalAddress } =
        response.addresses.find(
          (address) => address.purpose === 'ordinals'
        ) || { publicKey: '', address: '' };
      
        const { publicKey: xPaymentPublicKey, address: xPaymentAddress } =
        response.addresses.find((address) => address.purpose === 'payment') || {
          publicKey: '',
          address: '',
        };

      const pubkeyBuffer = Buffer.from(xPaymentPublicKey, 'hex');
      const internalPubKey = toXOnly(pubkeyBuffer);

      resolve({
        ordinalsPublicKey: xOrdinalPublicKey,
        paymentPublicKey: xPaymentPublicKey,
        ordinalsAddress: xOrdinalAddress,
        paymentAddress: xPaymentAddress,
        internalPubKey: internalPubKey.toString('hex'),
      });
    };

    getAddressOptions.onCancel = () => {
      reject(new Error('Request canceled.'));
    };

    getAddress(getAddressOptions);
  });

  return wallet;
}
