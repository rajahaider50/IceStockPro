import { create } from 'zustand';
import type { AppSettings } from '../types';

interface ToastMsg {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppState {
  settings: AppSettings | null;
  setSettings: (s: AppSettings) => void;
  toasts: ToastMsg[];
  showToast: (message: string, type?: ToastMsg['type']) => void;
  removeToast: (id: number) => void;
  refreshKey: number;
  triggerRefresh: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  settings: null,
  setSettings: (s) => set({ settings: s }),
  toasts: [],
  showToast: (message, type = 'success') => {
    const id = Date.now() + Math.random();
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
    // Auto-dismiss quickly — just enough to catch the eye, then gone
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 1500);
  },
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
  refreshKey: 0,
  triggerRefresh: () => set((state) => ({ refreshKey: state.refreshKey + 1 })),
}));
