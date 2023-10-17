const SessionsStorageKeys = {
  TRIBE: 'TRIBE',
  TRIBE_ID: 'TRIBE_ID',
  PROPOSALS: 'PROPOSAL',
  WALLET_PRIV: 'WALLET_PRIV',
  WALLET_PUB: 'WALLET_PUB',
  WALLET_NSEC: 'WALLET_NSEC',
  WALLET_PROVIDER: 'WALLET_PROVIDER',
  WALLET_ADDRESS: 'WALLET_ADDRESS',
};

const SessionStorage = {
  set: (id: string, data: Object) => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    window.sessionStorage.setItem(id, JSON.stringify(data));
    return undefined;
  },
  get: (id: string) => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const value = window.sessionStorage.getItem(id);

    if (!value || value === 'undefined') {
      return undefined;
    }

    try {
      return JSON.parse(value);
    } catch (error) {
      // console.error('Failed to parse session storage item:', error);
      return value;
    }
  },
  remove: (id: string) => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    return window.sessionStorage.removeItem(id);
  },
  clear: () => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    return window.sessionStorage.clear();
  },
};

export default SessionStorage;
export { SessionsStorageKeys };
