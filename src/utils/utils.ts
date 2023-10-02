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
  
  return sats / 100000000;
}

export { bytesToHex, getNostrTagValue, shortenStr, satsToBtc };
