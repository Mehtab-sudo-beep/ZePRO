import API from './api';

export interface Notification {
  notificationId: number;
  title: string;
  message: string;
  targetScreen?: string;
  targetId?: string;
  isRead: boolean;
  createdAt: string;
}

export const getNotifications = async () => {
  return await API.get('/notifications');
};

export const markAsRead = async (id: number) => {
  return await API.put(`/notifications/${id}/read`);
};

export const markAllAsRead = async () => {
  return await API.put('/notifications/read-all');
};

export const getUnreadCount = async () => {
  return await API.get('/notifications/unread-count');
};
