import { create } from "zustand";
import emailService from "@/services/email";
import loginService from "@/services/user";
import steamService from "@/services/steam";
import persistentUserService from "@/services/persistentUser";
import type {
  Credentials,
  PersistentUser,
  RegisterUser,
  UpdatedUser,
  Username,
} from "@/types/userTypes";

interface UserAction {
  create_email: (credentials: RegisterUser) => Promise<void>;
  create_steam: (username: Username) => Promise<void>;
  login_email: (credentials: Credentials) => Promise<void>;
  login_steam: () => Promise<void>;
  logout: () => void;
  update_email: (updated_credentials: UpdatedUser) => Promise<void>;
  delete: () => Promise<void>;
  init: () => void;
}

interface UserState {
  display: string | null;
  username: string | null;
  best_score: number | null;
  token: string | null;
  actions: UserAction;
}

const useUserStore = create<UserState>((set) => ({
  display: null,
  username: null,
  best_score: null,
  token: null,
  actions: {
    create_email: async (credentials: RegisterUser): Promise<void> => {
      await emailService.createAccount(credentials);
    },

    create_steam: async (username: Username): Promise<void> => {
      const response = await steamService.createAccount(username);

      const user: PersistentUser = {
        display: response.user.username,
        username: response.user.steam_login.profile_name,
        token: response.access_token,
      };

      persistentUserService.saveUser(user);

      set(() => ({
        display: user.display,
        username: user.username,
        best_score: response.user.best_score,
        token: user.token,
      }));
    },

    login_email: async (credentials: Credentials): Promise<void> => {
      const response = await emailService.login(credentials);

      const user: PersistentUser = {
        username: response.user.email_login.email,
        display: response.user.username,
        token: response.access_token,
      };

      persistentUserService.saveUser(user);

      set(() => ({
        username: user.username,
        display: user.display,
        best_score: response.user.best_score,
        token: user.token,
      }));
    },

    login_steam: async (): Promise<void> => {
      const response = await steamService.login();

      const user: PersistentUser = {
        username: response.user.steam_login.profile_name,
        display: response.user.username,
        token: response.access_token,
      };

      persistentUserService.saveUser(user);

      set(() => ({
        username: user.username,
        display: user.display,
        best_score: response.user.best_score,
        token: user.token,
      }));
    },

    logout: (): void => {
      persistentUserService.removeUser();
      set(() => ({
        username: null,
        display: null,
        best_score: null,
        token: null,
      }));
    },

    update_email: async (updated_credentials: UpdatedUser): Promise<void> => {
      const user = await loginService.updateUser(updated_credentials);
      persistentUserService.updateUser(user.username);
      set(() => ({
        display: user.username,
      }));
    },

    delete: async (): Promise<void> => {
      await loginService.deleteUser();
      persistentUserService.removeUser();
      set(() => ({
        username: null,
        display: null,
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

export const useDisplay = (): string | null =>
  useUserStore((state) => state.display);

export const useBestScore = (): number | null =>
  useUserStore((state) => state.best_score);

export const useToken = (): string | null =>
  useUserStore((state) => state.token);

export const useUserActions = (): UserAction =>
  useUserStore((state) => state.actions);
