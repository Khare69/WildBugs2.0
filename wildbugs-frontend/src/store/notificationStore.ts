import { create } from 'zustand';

interface NotificationState {
  unreadCount: number;
  isOpen: boolean;
  setUnreadCount: (count: number) => void;
  decrementUnread: () => void;
  setIsOpen: (open: boolean) => void;
  toggleOpen: () => void;
  reset: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  unreadCount: 0,
  isOpen: false,
  setUnreadCount: (count: number) => set({ unreadCount: Math.max(0, count) }),
  decrementUnread: () => set((state) => ({ unreadCount: Math.max(0, state.unreadCount - 1) })),
  setIsOpen: (isOpen: boolean) => set({ isOpen }),
  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
  reset: () => set({ unreadCount: 0, isOpen: false }),
}));

export default useNotificationStore;
