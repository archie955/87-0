import { create } from "zustand";

type ThemeMode = "light" | "dark";

interface ThemeStoreActions {
  toggleMode: () => void;
}

interface ThemeStore {
  mode: ThemeMode;
  actions: ThemeStoreActions;
}

const useThemeStore = create<ThemeStore>((set) => ({
  mode: "light",
  actions: {
    toggleMode: () =>
      set((state) => ({
        ...state,
        mode: state.mode === "light" ? "dark" : "light",
      })),
  },
}));

export const useThemeMode = (): ThemeMode =>
  useThemeStore((state) => state.mode);

export const useThemeActions = (): ThemeStoreActions =>
  useThemeStore((state) => state.actions);
