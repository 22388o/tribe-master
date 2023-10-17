import { Bitpac } from '@/types';
import { getEventHash } from './getEventHash';
import { signMessageXVerse } from './signMessage';
import { Tags } from '@/services/nostr';
import validateEvent from './validateEvent';

const signXverseEvent = async (
  event: any,
  xverseAddress: string,
  bitpac: Bitpac
) => {
  const eventHash = getEventHash(event);
  const xverseSignature = await signMessageXVerse(eventHash, xverseAddress);

  const xverseSignatureHex = Buffer.from(
    // @ts-ignore
    xverseSignature,
    'base64'
  ).toString('hex');

  // We can't sign using XVERSE, since XVERSE does not support schnorr signatures.
  // We are then going to use separate fields to do so.
  event.tags.push([Tags.WALLET_SIG, xverseSignatureHex]);
  event.tags.push([Tags.ADDRESS, xverseAddress]); // address used to create the signature, it will later on be required to do the sig validation

  const isValid = validateEvent(event, bitpac);

  if (!isValid) {
    throw new Error('invalid signature');
  }

  return event;
};

export default signXverseEvent;
