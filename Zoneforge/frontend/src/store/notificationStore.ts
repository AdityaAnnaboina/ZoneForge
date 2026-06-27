import { create } from "zustand";

export interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
  duration?: number;
}

interface NotificationState {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, "id">) => string;
  removeNotification: (id: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],

  addNotification: (notification) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({
      notifications: [...state.notifications, { ...notification, id }],
    }));
    return id;
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },

  success: (title, message) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({
      notifications: [
        ...state.notifications,
        { id, type: "success", title, message, duration: 5000 },
      ],
    }));
  },

  error: (title, message) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({
      notifications: [
        ...state.notifications,
        { id, type: "error", title, message, duration: 5000 },
      ],
    }));
  },

  warning: (title, message) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({
      notifications: [
        ...state.notifications,
        { id, type: "warning", title, message, duration: 5000 },
      ],
    }));
  },
}));
