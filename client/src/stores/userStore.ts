import { create } from "zustand";
import loginService from "@/services/user";
import persistentUserService from "@/services/persistentUser";
import type {
  Credentials,
  PersistentUser,
  RegisterUser,
  UpdatedUser,
} from "@/types/userTypes";

interface UserAction {
  create: (credentials: RegisterUser) => Promise<void>;
  login: (credentials: Credentials) => Promise<void>;
  logout: () => void;
  update: (updated_credentials: UpdatedUser) => Promise<void>;
  delete: () => Promise<void>;
  init: () => void;
}

interface UserState {
  username: string | null;
  email: string | null;
  best_score: number | null;
  token: string | null;
  actions: UserAction;
}

const useUserStore = create<UserState>((set) => ({
  username: null,
  email: null,
  best_score: null,
  token: null,
  actions: {
    create: async (credentials: RegisterUser): Promise<void> => {
      await loginService.createAccount(credentials);
    },

    login: async (credentials: Credentials): Promise<void> => {
      const response = await loginService.login(credentials);

      const user: PersistentUser = {
        username: response.user.username,
        email: response.user.email,
        token: response.access_token,
      };

      persistentUserService.saveUser(user);

      set(() => ({
        username: user.username,
        email: user.email,
        best_score: response.user.best_score,
        token: user.token,
      }));
    },

    logout: (): void => {
      persistentUserService.removeUser();
      set(() => ({
        username: null,
        email: null,
        best_score: null,
        token: null,
      }));
    },

    update: async (updated_credentials: UpdatedUser): Promise<void> => {
      const user = await loginService.update(updated_credentials);
      persistentUserService.updateUser(user.username, user.email);
      set(() => ({
        username: user.username,
        email: user.email,
      }));
    },

    delete: async (): Promise<void> => {
      await loginService.deleteUser();
      persistentUserService.removeUser();
      set(() => ({
        username: null,
        email: null,
        best_score: null,
        token: null,
      }));
    },

    init: (): void => {
      const user: PersistentUser | null = persistentUserService.getUser();
      if (user) {
        set(() => user);
      }
    },
  },
}));

export default useUserStore;

export const useUsername = (): string | null =>
  useUserStore((state) => state.username);

export const useEmail = (): string | null =>
  useUserStore((state) => state.email);

export const useToken = (): string | null =>
  useUserStore((state) => state.token);

export const useBestScore = (): number | null =>
  useUserStore((state) => state.best_score);

export const useUserActions = (): UserAction =>
  useUserStore((state) => state.actions);
