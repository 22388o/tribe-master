import { RELAYS } from '@/config/config';
import { SimplePool, getEventHash, Sub } from 'nostr-tools';
import { bytesToHex } from '@/utils/utils';
import * as nobleSecp256k1 from 'noble-secp256k1';

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

  async sign(event: any, privKey?: string, pubKey?: string) {
    const privkey =
      privKey || bytesToHex(nobleSecp256k1.utils.randomPrivateKey());
    // @ts-ignore
    const pubkey =
      pubKey || nobleSecp256k1.getPublicKey(privkey, true).substring(2);

    const eventBase = {
      ...event,
      created_at: Math.floor(Date.now() / 1000),
      pubkey,
    };
    const newEvent = {
      ...eventBase,
      id: getEventHash(eventBase),
    };

    const sig = await nobleSecp256k1.schnorr.sign(newEvent.id, privkey);
    newEvent.sig = sig;

    return newEvent;
  }

  async publish(_event: any): Promise<unknown> {
    const event = cleanEvent(_event);

    const pubs = this.pool.publish(this.relays, event);
    return Promise.all(pubs);
  }

  async list(filter: any) {
    const events = await this.pool.list([...this.relays], filter);
    return events;
  }
}

const nostrPool = new NostrRelay();
export { nostrPool };
