const SessionsStorageKeys = {
  TRIBE: 'TRIBE',
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

    return JSON.parse(value);
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
