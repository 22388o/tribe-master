import { RELAYS } from '@/config/config';
import {
  SimplePool,
  getEventHash,
  Sub,
  validateEvent,
  verifySignature,
} from 'nostr-tools';
import { bytesToHex, toXOnly, testnet } from '@/utils/utils';
import * as nobleSecp256k1 from 'noble-secp256k1';
const signerModule = import('@scure/btc-signer');
import { hex } from '@scure/base';
import * as bitcoin from 'bitcoinjs-lib';
import ecc from '@bitcoinerlab/secp256k1';
import BIP32Factory from 'bip32';

export enum Tags {
  WALLET_PROVIDER = 'w',
  BITPAC_TYPE = 'b',
  NAME = 't',
  ADDRESS = 'a', // we should construct the address each time for easier testnet/signet/mainnet switch
  NETWORK = 'n',
  PARENT_EVENT_ID = 'e',
  PUBKEY = 'p',
  WALLET_SIG = 's',
}

function cleanEvent(event: any) {
  return {
    id: event.id,
    pubkey: event.pubkey,
    created_at: event.created_at,
    kind: event.kind,
    tags: event.tags,
    content: event.content,
    sig: event.sig,
  };
}

class NostrRelay {
  pool = new SimplePool();
  subs: Array<Sub> = [];
  relays: Array<string> = [];
  events = [];

  constructor() {
    if (!RELAYS) {
      throw new Error('Config is required in order to initialize Nostr.');
    }

    this.relays = [...RELAYS];
  }

  getEvent(event: any, pubkey: string) {
    const eventBase = {
      ...event,
      pubkey,
    };
    const newEvent = {
      ...eventBase,
      id: getEventHash(eventBase),
    };

    return newEvent;
  }

  async sign(event: any, privKey?: string, pubKey?: string) {
    let pk = privKey;
    let pbk = pubKey;
    // Prob using an extension in which we do not have a private key.
    if (privKey === 'SECRET') {
      pk = '';
      pbk = '';
    }

    const privkey = pk || bytesToHex(nobleSecp256k1.utils.randomPrivateKey());
    // @ts-ignore
    const pubkey =
      pbk || nobleSecp256k1.getPublicKey(privkey, true).substring(2);

    if (privkey.startsWith('xprv') || privKey?.startsWith('tprv')) {
      const bip32 = BIP32Factory(ecc);
      const node = bip32.fromBase58(privkey, testnet);
      const sm = await signerModule;
      const pb = toXOnly(node.publicKey);
      const p2trAddress = sm.p2tr(pb, undefined, testnet);
      const result = {
        ...p2trAddress,
        tapInternalKey: Buffer.from(p2trAddress.tapInternalKey),
        output: hex.encode(p2trAddress.script),
        script: Buffer.from(p2trAddress.script),
        pubkey: Buffer.from(pb, 'hex'),
      };
      const newEvent = this.getEvent(event, result.pubkey.toString('hex'));
      const sig = await nobleSecp256k1.schnorr.sign(
        newEvent.id,
        // @ts-ignore
        node.privateKey
      );
      newEvent.sig = sig;
      return newEvent;
    }

    const newEvent = this.getEvent(event, pubkey);
    const sig = await nobleSecp256k1.schnorr.sign(newEvent.id, privkey);
    newEvent.sig = sig;

    return newEvent;
  }

  async publish(_event: any): Promise<void> {
    const event = cleanEvent(_event);

    const ok = validateEvent(event);
    if (!ok) {
      throw new Error('Invalid event');
    }

    const veryOk = verifySignature(event);
    if (!veryOk) {
      throw new Error('Invalid event signatures');
    }

    const pubs = this.pool.publish(this.relays, event);
    await Promise.allSettled(pubs);
  }

  async list(filter: any) {
    const events = await this.pool.list([...this.relays], filter);
    return events;
  }
}

const nostrPool = new NostrRelay();
export { nostrPool };
