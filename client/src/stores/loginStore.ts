import { create } from "zustand";

interface LoginActions {
  changeLogin: () => void;
  changeShow: () => void;
}

interface LoginState {
  show: boolean;
  login: boolean;
  actions: LoginActions;
}

const useLoginStore = create<LoginState>((set) => ({
  show: false,
  login: true,
  actions: {
    changeLogin: () =>
      set((state) => ({ login: !state.login, show: state.show })),
    changeShow: () =>
      set((state) => ({ show: !state.show, login: state.login })),
  },
}));

export const useLogin = (): boolean => useLoginStore((state) => state.login);
export const useShow = (): boolean => useLoginStore((state) => state.show);

export const useChangeActions = (): LoginActions =>
  useLoginStore((state) => state.actions);
