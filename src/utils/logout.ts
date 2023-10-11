import SessionStorage, { SessionsStorageKeys } from "@/services/session-storage";

function logout() {
    SessionStorage.remove(SessionsStorageKeys.WALLET_PRIV);
    SessionStorage.remove(SessionsStorageKeys.WALLET_PUB);
    SessionStorage.remove(SessionsStorageKeys.WALLET_NSEC);
  }

  export default logout;