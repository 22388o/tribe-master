import { bech32 } from 'bech32';

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

function privkeyFromNsec(nsec: string) {
  return Buffer.from(bech32.fromWords(bech32.decode(nsec).words)).toString(
    'hex'
  );
}

export {
  bytesToHex,
  getNostrTagValue,
  shortenStr,
  satsToBtc,
  satsToFormattedDollarString,
  pubkeyFromNpub,
  privkeyFromNsec,
};
