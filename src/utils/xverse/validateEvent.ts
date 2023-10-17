import { Tags } from '@/services/nostr';
import { getNostrTagValue, verifyBIP322Signature } from '../utils';
import { getEventHash } from './getEventHash';
import { Bitpac } from '@/types';

const validateEvent = (event: any, bitpac: Bitpac) => {
  const pubkey = getNostrTagValue(Tags.PUBKEY, event.tags);
  // If the event was published by the same pubkey. there is no need to validate the event.
  // nostr already did that for us
  if (event.pubkey === pubkey) {
    return true;
  }

  if (bitpac.pubkeys.includes(event.pubkey)) {
    return true;
  }

  if (!pubkey || !bitpac.pubkeys.includes(pubkey)) {
    return false;
  }



  const address = getNostrTagValue(Tags.ADDRESS, event.tags);
  const sig = getNostrTagValue(Tags.WALLET_SIG, event.tags);
  const parentEventId = getNostrTagValue(Tags.PARENT_EVENT_ID, event.tags);
  
  if (!sig) {
    return false;
  }
  
  const sigBase64 = Buffer.from(sig, 'hex').toString('base64');

  const hashedEvent = {
    content: event.content,
    created_at: event.created_at,
    kind: event.kind,
    tags: [
      [Tags.PARENT_EVENT_ID, parentEventId],
      [Tags.PUBKEY, pubkey],
    ],
  };

  const eventHash = getEventHash(hashedEvent);

  // verify BIP-322 signature
  try {
    const isValid =
      address && sig ? verifyBIP322Signature(address, eventHash, sigBase64) : false;
    return isValid;
  } catch (e) {
    console.error(e);
    return false;
  }
};

export default validateEvent;
