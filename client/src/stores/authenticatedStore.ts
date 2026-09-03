import { create } from "zustand";

interface AuthenticatedActions {
  setAuthentication: () => void;
  removeAuthentication: () => void;
}

interface AuthenticatedStore {
  authenticated: boolean;
  actions: AuthenticatedActions;
}

const useAuthenticatedStore = create<AuthenticatedStore>((set) => ({
  authenticated: false,
  actions: {
    setAuthentication: (): void => {
      set(() => ({
        authenticated: true,
      }));
    },
    removeAuthentication: (): void => {
      set(() => ({
        authenticated: false,
      }));
    },
  },
}));

export default useAuthenticatedStore;

export const useAuthenticated = (): boolean =>
  useAuthenticatedStore((state) => state.authenticated);

export const useAuthenticatedActions = (): AuthenticatedActions =>
  useAuthenticatedStore((state) => state.actions);
