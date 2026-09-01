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

const useLoginStore = create<LoginState>((set, get) => ({
  show: false,
  login: true,
  actions: {
    changeLogin: () => set(() => ({ login: !get().login })),
    changeShow: () => set(() => ({ show: !get().show })),
  },
}));

export const useLogin = (): boolean => useLoginStore((state) => state.login);
export const useShow = (): boolean => useLoginStore((state) => state.show);

export const useChangeActions = (): LoginActions =>
  useLoginStore((state) => state.actions);
