import { create } from "zustand";

interface LoginActions {
  changeLogin: () => void;
}

interface LoginState {
  login: boolean;
  actions: LoginActions;
}

const useLoginStore = create<LoginState>((set) => ({
  login: true,
  actions: {
    changeLogin: () => set((state) => ({ login: !state.login })),
  },
}));

export const useLogin = (): boolean => useLoginStore((state) => state.login);

export const useChangeActions = (): LoginActions =>
  useLoginStore((state) => state.actions);
