import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../lib/api';
import { useNavigate } from 'react-router-dom';

const getTypeIcon = (type) => {
  switch (type) {
    case 'INQUIRY_REPLY': return '💬';
    case 'REVIEW_REPLY': return '⭐';
    case 'APPOINTMENT': return '📅';
    case 'APPOINTMENT_UPDATE': return '✏️';
    case 'APPOINTMENT_CANCELLED': return '❌';
    default: return '🔔';
  }
};

const Notification = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotifications = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.get('/notifications');
      setNotifications(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    // Set up polling every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    
    return () => clearInterval(interval);
  }, [user]);

  const updateNotification = async (notificationId, updates) => {
    try {
      await api.patch(`/notifications/${notificationId}`, updates);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, ...updates } : notif
        )
      );
    } catch (err) {
      console.error('Error updating notification:', err);
    }
  };

  const markAsRead = async (notificationId) => {
    await updateNotification(notificationId, { read: true });
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/mark-all-read');
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    // Handle navigation based on notification type
    switch (notification.type) {
      case 'APPOINTMENT':
      case 'APPOINTMENT_UPDATE':
        navigate('/appointments');
        break;
      case 'INQUIRY_REPLY':
        navigate('/inquiries');
        break;
      case 'REVIEW_REPLY':
        if (notification.metadata?.listingId) {
          navigate(`/listings/${notification.metadata.listingId}`);
        }
        break;
      default:
        break;
    }
  };

  const getNotificationAction = (notification) => {
    if (notification.type === 'APPOINTMENT_CANCELLED') {
      return <span className="text-xs font-medium text-red-600">Cancelled</span>;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-2 text-gray-600">Loading notifications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-500">
        <p>{error}</p>
        <button 
          onClick={fetchNotifications}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">My Notifications</h1>
          <button 
            onClick={markAllAsRead}
            className="text-sm text-blue-600 hover:text-blue-800"
            disabled={notifications.every(n => n.read) || notifications.length === 0}
          >
            Mark all as read
          </button>
        </div>

        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-400 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">No notifications yet</h3>
            <p className="mt-1 text-sm text-gray-500">We'll notify you when there's something new.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {notifications.map(notification => (
              <div 
                key={notification.id}
                className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${!notification.read ? 'bg-blue-50' : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start">
                  <div className={`flex-shrink-0 pt-1 ${!notification.read ? 'text-blue-500' : 'text-gray-400'}`}>
                    <span className="text-2xl">{getTypeIcon(notification.type)}</span>
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                        {notification.message}
                      </p>
                      {!notification.read && (
                        <span className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0 ml-2"></span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(notification.createdAt).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    {getNotificationAction(notification)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notification;
