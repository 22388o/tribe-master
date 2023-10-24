import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex } from '@noble/hashes/utils';
export const utf8Encoder = new TextEncoder();

const serializeEvent = (evt: any) => {
  return JSON.stringify([0, evt.created_at, evt.kind, evt.tags, evt.content]);
};

export const getEventHash = (event: any) => {
  let eventHash = sha256(utf8Encoder.encode(serializeEvent(event)));
  return bytesToHex(eventHash);
};
