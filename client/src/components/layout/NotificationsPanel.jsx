import { useState, useEffect } from 'react';
import { Bell, CheckCircle, Info, TrendingUp, Target, X } from 'lucide-react';
import api from '../../services/api';

export default function NotificationsPanel({ isOpen, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-16 right-4 lg:right-8 w-80 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl shadow-xl z-50 flex flex-col overflow-hidden max-h-[80vh]">
      <div className="flex justify-between items-center p-4 border-b border-[var(--border-color)]">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <Bell className="w-5 h-5" /> Notifications
        </h3>
        <button onClick={onClose} className="p-1 hover:bg-[var(--bg-main)] rounded-full transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <div className="p-4 text-center text-[var(--text-muted)] text-sm">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-[var(--text-muted)] text-sm">No new notifications</div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => {
              let Icon = Info;
              let iconColor = 'text-blue-500';
              if (notification.type === 'TRADE_CONFIRMATION') {
                Icon = TrendingUp;
                iconColor = 'text-[var(--color-profit)]';
              } else if (notification.type === 'GOAL_MILESTONE') {
                Icon = Target;
                iconColor = 'text-purple-500';
              }

              return (
                <div 
                  key={notification._id} 
                  className={`p-3 rounded-lg border ${notification.isRead ? 'border-transparent bg-transparent opacity-70' : 'border-pink-500/30 bg-pink-500/5 cursor-pointer hover:bg-[var(--bg-main)] transition-colors'}`}
                  onClick={() => !notification.isRead && markAsRead(notification._id)}
                >
                  <div className="flex gap-3 items-start">
                    <div className={`mt-1 ${iconColor}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className={`text-sm ${notification.isRead ? 'font-medium' : 'font-bold'}`}>{notification.title}</h4>
                      <p className="text-xs text-[var(--text-muted)] mt-1">{notification.message}</p>
                      <p className="text-[10px] text-[var(--text-muted)] mt-2">
                        {new Date(notification.createdAt).toLocaleDateString()} at {new Date(notification.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <div className="w-2 h-2 rounded-full bg-[var(--color-brand-primary)] mt-1.5 ml-auto"></div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
