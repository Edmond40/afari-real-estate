import { Bell, Check, X, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import api from '../../../../src/lib/api';
import { formatDistanceToNow } from 'date-fns';

// Type definition for notification
const NotificationType = {
  APPOINTMENT: 'APPOINTMENT',
  INQUIRY: 'INQUIRY',
  SYSTEM: 'SYSTEM'
};

const NotificationStatus = {
  UNREAD: 'unread',
  READ: 'read'
};

const Notification = ({
  id,
  type,
  title,
  message,
  status,
  createdAt,
  metadata = {}
}) => ({
  id,
  type,
  title: title || 'New Notification',
  message,
  status: status || NotificationStatus.UNREAD,
  createdAt: createdAt ? new Date(createdAt) : new Date(),
  metadata
});

function NotificationPopover({ setShowNotification }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotifications = async () => {
    try {
      setError(null);
      const response = await api.get('/notifications', {
        params: {
          limit: 5,
          sort: 'createdAt:desc'
        }
      });
      
      if (response.data && Array.isArray(response.data.data)) {
        setNotifications(response.data.data.map(Notification));
      } else {
        console.warn('Unexpected API response format:', response.data);
        setNotifications([]);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications. Please try again.');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    // Set up polling every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    
    // Auto-close after 5 seconds if no interaction
    const timer = setTimeout(() => {
      setShowNotification(false);
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [setShowNotification]);

  const markAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    
    try {
      await api.patch(`/notifications/${id}`, {
        status: NotificationStatus.READ
      });
      
      setNotifications(prev => 
        prev.map(n => 
          n.id === id 
            ? { ...n, status: NotificationStatus.READ } 
            : n
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
      setError('Failed to update notification status');
    }
  };
  
  const markAllAsRead = async (e) => {
    if (e) e.stopPropagation();
    
    try {
      await api.patch('/notifications/mark-all-read');
      setNotifications(prev => 
        prev.map(n => ({
          ...n, 
          status: NotificationStatus.READ 
        }))
      );
    } catch (err) {
      console.error('Error marking all as read:', err);
      setError('Failed to mark all as read');
    }
  };

  const renderLoading = () => (
    <div className="p-4 flex items-center justify-center">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
      <span className="ml-2 text-gray-600">Loading...</span>
    </div>
  );

  const renderError = () => (
    <div className="p-4 text-center">
      <div className="flex items-center justify-center text-red-500 mb-2">
        <AlertCircle className="w-5 h-5 mr-2" />
        <span>{error}</span>
      </div>
      <button
        onClick={fetchNotifications}
        className="text-sm text-blue-600 hover:text-blue-800"
      >
        Retry
      </button>
    </div>
  );

  const renderEmptyState = () => (
    <div className="p-6 text-center">
      <Bell className="w-8 h-8 mx-auto text-gray-400 mb-2" />
      <p className="text-gray-500">No new notifications</p>
    </div>
  );

  const renderNotificationItem = (notification) => (
    <div 
      key={notification.id} 
      className={`p-4 hover:bg-gray-50 cursor-pointer ${
        notification.status === NotificationStatus.UNREAD ? 'bg-blue-50' : ''
      }`}
      onClick={() => {
        markAsRead(notification.id);
        // TODO: Handle notification click navigation
      }}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-yellow-500">
              {notification.type === NotificationType.APPOINTMENT ? '📅' : '🔔'}
            </span>
            <h4 className="font-medium text-sm">
              {notification.title}
            </h4>
          </div>
          <p className="text-sm text-gray-600">
            {notification.message}
          </p>
          <div className="text-xs text-gray-400 mt-1">
            {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
          </div>
        </div>
        {notification.status === NotificationStatus.UNREAD && (
          <button 
            onClick={(e) => markAsRead(notification.id, e)}
            className="text-gray-400 hover:text-blue-500 p-1"
            title="Mark as read"
          >
            <Check size={16} />
          </button>
        )}
      </div>
    </div>
  );

  if (loading) return renderLoading();

  return (
    <div
      className="absolute top-16 right-4 sm:right-6 bg-white w-80 shadow-lg rounded-md z-50 max-h-[calc(100vh-8rem)] overflow-y-auto"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-blue-500" />
            <h3 className="font-medium">Notifications</h3>
            {notifications.some(n => n.status === NotificationStatus.UNREAD) && (
              <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {notifications.filter(n => n.status === NotificationStatus.UNREAD).length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {notifications.some(n => n.status === NotificationStatus.UNREAD) && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-800 mr-2"
              >
                Mark all as read
              </button>
            )}
            <button 
              onClick={() => setShowNotification(false)}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Close notifications"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      </div>

      {error ? (
        renderError()
      ) : notifications.length === 0 ? (
        renderEmptyState()
      ) : (
        <div className="divide-y divide-gray-100">
          {notifications.map(renderNotificationItem)}
        </div>
      )}
    </div>
  );
}

export default NotificationPopover;