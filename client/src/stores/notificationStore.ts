import { create } from "zustand";

export type Severity = "success" | "info" | "warning" | "error";

interface NotificationAction {
  setNotification: (message: string, severity: Severity) => void;
  manualClose: () => void;
}

interface NotificationState {
  notification: string | null;
  open: boolean;
  severity: Severity;
  actions: NotificationAction;
}

const useNotificationStore = create<NotificationState>((set) => ({
  notification: null,
  open: false,
  severity: "success",

  actions: {
    setNotification: (message: string, severity: Severity): void => {
      set(() => ({ notification: message, open: true, severity: severity }));
      setTimeout(() => {
        set(() => ({ notification: null, open: false, severity: "success" }));
      }, 5000);
    },

    manualClose: (): void => {
      set(() => ({ notification: null, open: false, severity: "success" }));
    },
  },
}));

export const useNotificationActions = (): NotificationAction =>
  useNotificationStore((state) => state.actions);

export const useNotificationMessage = (): string | null =>
  useNotificationStore((state) => state.notification);

export const useNotificationOpen = (): boolean =>
  useNotificationStore((state) => state.open);

export const useNotificationSeverity = (): Severity =>
  useNotificationStore((state) => state.severity);
