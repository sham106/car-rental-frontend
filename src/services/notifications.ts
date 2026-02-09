// Notification API Service

export interface Notification {
  id: number;
  title: string;
  message: string;
  notification_type: string;
  priority: string;
  link: string;
  is_read: boolean;
  created_at: string;
  time_ago: string;
}

export interface NotificationResponse {
  notifications: Notification[];
  unread_count: number;
  total_count: number;
}

class NotificationService {
  private static baseUrl = `${import.meta.env.VITE_API_BASE_URL || '/api'}/notifications`;

  private static getHeaders() {
    const token = localStorage.getItem('luxe_token') || localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };
  }

  static async getNotifications(): Promise<NotificationResponse> {
    const response = await fetch(`${this.baseUrl}/`, {
      headers: this.getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch notifications');
    return response.json();
  }

  static async getUnreadCount(): Promise<{ unread_count: number }> {
    const response = await fetch(`${this.baseUrl}/unread-count/`, {
      headers: this.getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch unread count');
    return response.json();
  }

  static async markAsRead(notificationIds: number[]): Promise<void> {
    const response = await fetch(`${this.baseUrl}/mark-read/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ notification_ids: notificationIds }),
    });
    if (!response.ok) throw new Error('Failed to mark as read');
  }

  static async markAllAsRead(): Promise<void> {
    const response = await fetch(`${this.baseUrl}/mark-all-read/`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to mark all as read');
  }

  static async markSingleAsRead(notificationId: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${notificationId}/read/`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to mark as read');
  }
}

export default NotificationService;
