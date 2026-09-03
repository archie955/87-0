import { create } from "zustand";
import emailService from "@/services/email";
import loginService from "@/services/user";
import persistentUserService from "@/services/persistentUser";
import userService from "@/services/user";
import type {
  Credentials,
  PersistentUser,
  RegisterUser,
  UpdatedUser,
} from "@/types/userTypes";

interface UserAction {
  fetch_user: () => Promise<void>;
  create_email: (credentials: RegisterUser) => Promise<void>;
  login_email: (credentials: Credentials) => Promise<void>;
  logout: () => void;
  update_email: (updated_credentials: UpdatedUser) => Promise<void>;
  delete: () => Promise<void>;
  init: () => void;
}

interface UserState {
  username: string | null;
  authname: string | null;
  best_score: number | null;
  actions: UserAction;
}

const useUserStore = create<UserState>((set) => ({
  username: null,
  authname: null,
  best_score: null,
  actions: {
    fetch_user: async (): Promise<void> => {
      const response = await userService.getUser();
      
      let username = "?";
      if (response.email_login) {
        username = response.email_login.email;
      } else if (response.steam_login) {
        username = response.steam_login.profile_name;
      }
      
      const user: PersistentUser = {
        username: response.username,
        authname: username
      }

      persistentUserService.saveUser(user)
      set(() => ({
        username: user.username,
        authname: user.authname,
        best_score: response.best_score
      }))

    },
    create_email: async (credentials: RegisterUser): Promise<void> => {
      await emailService.createAccount(credentials);
    },

    login_email: async (credentials: Credentials): Promise<void> => {
      await emailService.login(credentials);
    },

    logout: (): void => {
      persistentUserService.removeUser();
      set(() => ({
        username: null,
        display: null,
        best_score: null,
      }));
    },

    update_email: async (updated_credentials: UpdatedUser): Promise<void> => {
      const user = await loginService.updateUser(updated_credentials);
      persistentUserService.updateUser(user.username);
      set(() => ({
        username: user.username,
      }));
    },

    delete: async (): Promise<void> => {
      await loginService.deleteUser();
      persistentUserService.removeUser();
      set(() => ({
        username: null,
        authname: null,
        best_score: null,
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

export const useAuthName = (): string | null =>
  useUserStore((state) => state.authname);

export const useBestScore = (): number | null =>
  useUserStore((state) => state.best_score);

export const useUserActions = (): UserAction =>
  useUserStore((state) => state.actions);
