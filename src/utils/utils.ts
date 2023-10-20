import { API_ENDPOINTS } from '@/data/utils/endpoints';
import { bech32 } from 'bech32';
import * as nobleSecp256k1 from 'noble-secp256k1';
const { Verifier } = require('bip322-js');

import * as bitcoin from 'bitcoinjs-lib';
import ecc from '@bitcoinerlab/secp256k1';
import BIP32Factory from 'bip32';

bitcoin.initEccLib(ecc);

const testnet = {
  messagePrefix: '\x18Bitcoin Signed Message:\n',
  bech32: 'tb',
  bip32: {
    public: 0x043587cf,
    private: 0x04358394,
  },
  pubKeyHash: 0x6f,
  scriptHash: 0xc4,
  wif: 0xef,
};

const getPrivkeyBufferFromXprv = (xprv: string) => {
  const bip32 = BIP32Factory(ecc);
  const node = bip32.fromBase58(xprv, bitcoin.networks.testnet);
  return node.privateKey;
};

const getPubKeyFromXPrv = (xprv: string) => {
  const bip32 = BIP32Factory(ecc);
  const node = bip32.fromBase58(xprv, bitcoin.networks.testnet);

  return bip32
    .fromPublicKey(node.publicKey, node.chainCode, bitcoin.networks.testnet)
    .toBase58();
};

const bytesToHex = (bytes: any) => {
  return bytes.reduce(
    (str: any, byte: any) => str + byte.toString(16).padStart(2, '0'),
    ''
  );
};

const getNostrTagValue = (
  tag: string,
  tags: Array<[string, string]>
): string | undefined => {
  return tags.find((x) => x?.[0] === tag)?.[1];
};

const shortenStr = (str: string, size: number = 8): string => {
  if (!str) return '';
  return `${str.substring(0, size)}...${str.substring(
    str.length - size,
    str.length
  )}`;
};

function satsToBtc(sats: number) {
  if (!sats) {
    return 0;
  }

  return Number(sats) / 10 ** 8;
}

const satsToFormattedDollarString = (sats: number, bitcoinPrice: number) => {
  if (!sats || !bitcoinPrice) {
    return 0;
  }

  return (satsToBtc(sats) * bitcoinPrice).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

function pubkeyFromNpub(npub: string) {
  return Buffer.from(bech32.fromWords(bech32.decode(npub).words)).toString(
    'hex'
  );
}

function pubkeyFromXpub(xpub: string) {
  const bip32 = BIP32Factory(ecc);
  const pb = bip32.fromBase58(xpub, testnet);
  return toXOnly(pb.publicKey).toString('hex');
}

function privkeyFromNsec(nsec: string) {
  return Buffer.from(bech32.fromWords(bech32.decode(nsec).words)).toString(
    'hex'
  );
}
function pubFromPriv(seckey: string): string {
  return nobleSecp256k1.getPublicKey(seckey, true).substring(2);
}

async function checkIfTxHappened(txid: string) {
  const response = await fetch(`${API_ENDPOINTS.MEMPOOL_API}/tx/${txid}`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  const responseData = await response.json();
  return responseData;
}

async function pushTx(rawtx: string) {
  try {
    const response = await fetch(`${API_ENDPOINTS.MEMPOOL_API}/tx`, {
      method: 'POST',
      body: rawtx,
    });

    const responseData = await response.text();
    return responseData;
  } catch (error) {
    console.error(error);
    // throw new Error('Network response was not ok');
  }

  return null;
}

async function getAddressTxs(address: string) {
  try {
    const response = await fetch(
      `${API_ENDPOINTS.MEMPOOL_API}/address/${address}/txs`,
      {
        method: 'GET',
      }
    );

    const responseData = await response.json();

    return responseData;
  } catch (error) {
    console.error(error);
    throw new Error('Network response was not ok');
  }

  return null;
}

function toXOnly(key: any) {
  return key.length === 33 ? key.slice(1, 33) : key;
}

function verifyBIP322Signature(address: string, message: string, sig: string) {
  return Verifier.verifySignature(address, message, sig);
}

export {
  bytesToHex,
  getNostrTagValue,
  shortenStr,
  satsToBtc,
  satsToFormattedDollarString,
  pubkeyFromNpub,
  privkeyFromNsec,
  pubFromPriv,
  checkIfTxHappened,
  pushTx,
  getAddressTxs,
  toXOnly,
  verifyBIP322Signature,
  getPubKeyFromXPrv,
  pubkeyFromXpub,
  getPrivkeyBufferFromXprv,
  testnet,
};
