import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Notification } from './types';

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  getUnreadCount: (userId?: string) => number;
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      addNotification: (notification) => {
        const newNotification = {
          ...notification,
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          read: false,
        };

        set((state) => ({
          notifications: [newNotification, ...state.notifications],
          unreadCount: state.unreadCount + 1,
        }));
      },
      
      markAsRead: (id) => {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        set((state) => {
          const notification = state.notifications.find(n => n.id === id);
          if (!notification) return state;

          const isRelevantNotification = 
            (currentUser.role === 'admin' && !notification.targetUserId) ||
            (notification.targetUserId === currentUser.id);

          if (!isRelevantNotification) return state;

          return {
            notifications: state.notifications.map(n =>
              n.id === id ? { ...n, read: true } : n
            ),
            unreadCount: Math.max(0, state.unreadCount - 1),
          };
        });
      },
      
      markAllAsRead: () => {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        set((state) => {
          let unreadCountReduction = 0;
          const updatedNotifications = state.notifications.map(n => {
            const isRelevantNotification = 
              (currentUser.role === 'admin' && !n.targetUserId) ||
              (n.targetUserId === currentUser.id);

            if (isRelevantNotification && !n.read) {
              unreadCountReduction++;
              return { ...n, read: true };
            }
            return n;
          });

          return {
            notifications: updatedNotifications,
            unreadCount: Math.max(0, state.unreadCount - unreadCountReduction),
          };
        });
      },
      
      getUnreadCount: (userId) => {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        return get().notifications.filter(n => 
          !n.read && (
            (currentUser.role === 'admin' && !n.targetUserId) ||
            (n.targetUserId === currentUser.id)
          )
        ).length;
      },
    }),
    {
      name: 'notification-storage',
    }
  )
);