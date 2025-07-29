import React, { useState, useEffect, useCallback } from 'react';
import { NotificationContext } from '../context/NotificationContext';
import Notification from './Notification';

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      ...notification,
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove notification after duration (default 4 seconds)
    const duration = notification.duration || 4000;
    setTimeout(() => {
      removeNotification(id);
    }, duration);

    return id;
  }, [removeNotification]);

  const showSuccess = useCallback((message, options = {}) => {
    return addNotification({ ...options, message, type: 'success' });
  }, [addNotification]);

  const showError = useCallback((message, options = {}) => {
    return addNotification({ ...options, message, type: 'error' });
  }, [addNotification]);

  const showWarning = useCallback((message, options = {}) => {
    return addNotification({ ...options, message, type: 'warning' });
  }, [addNotification]);

  const showInfo = useCallback((message, options = {}) => {
    return addNotification({ ...options, message, type: 'info' });
  }, [addNotification]);

  const showMobile = useCallback((mobileData, options = {}) => {
    return addNotification({ 
      ...options, 
      type: 'mobile',
      mobileData,
      duration: options.duration || 6000 // Longer duration for mobile notifications
    });
  }, [addNotification]);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Helper function to get app icon based on package name
  const getAppIcon = (packageName) => {
    const appIcons = {
      'com.android.systemui': '🔋',
      'com.whatsapp': '💬',
      'com.instagram.android': '📷',
      'com.twitter.android': '🐦',
      'com.facebook.katana': '📘',
      'com.spotify.music': '🎵',
      'com.google.android.gm': '📧',
      'com.android.phone': '📞',
      'com.android.mms': '💬',
      'com.google.android.apps.messaging': '💬',
      'com.android.calendar': '📅',
      // Add more as needed
    };
    
    return appIcons[packageName] || '📱';
  };

  // Helper function to get app name from package
  const getAppName = (packageName) => {
    const appNames = {
      'com.android.systemui': 'System',
      'com.whatsapp': 'WhatsApp',
      'com.instagram.android': 'Instagram',
      'com.twitter.android': 'Twitter',
      'com.facebook.katana': 'Facebook',
      'com.spotify.music': 'Spotify',
      'com.google.android.gm': 'Gmail',
      'com.android.phone': 'Phone',
      'com.android.mms': 'Messages',
      'com.google.android.apps.messaging': 'Messages',
      'com.android.calendar': 'Calendar',
      // Add more as needed
    };
    
    return appNames[packageName] || 'Mobile App';
  };

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:5000');

    ws.onopen = () => {
      console.log('Connected to WebSocket server');
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'notification') {
          const notificationData = message.data;

          // Enhanced mobile notification processing
          if (notificationData.package && notificationData.title && notificationData.text) {
            // This is a mobile notification with full structure
            const mobileNotification = {
              type: 'mobile',
              mobileData: {
                package: notificationData.package,
                title: notificationData.title,
                text: notificationData.text,
                timestamp: notificationData.timestamp,
                appIcon: getAppIcon(notificationData.package),
                appName: getAppName(notificationData.package)
              },
              duration: 6000, // Longer duration for mobile notifications
            };

            addNotification(mobileNotification);
          } else {
            // Fallback to simple notification format
            const notification = {
              message: notificationData.text || notificationData.message || 'New notification',
              type: 'info',
              title: notificationData.title || undefined,
              duration: notificationData.duration || 4000,
            };

            addNotification(notification);
          }
        } else if (message.status === 'success' || message.status === 'error') {
          console.log('Server response:', message.message);
        }
      } catch (err) {
        console.error('Error parsing WebSocket message:', err.message);
        showError('Failed to process notification', { duration: 5000 });
      }
    };

    ws.onerror = (err) => {
      console.error('WebSocket error:', err);
      showError('WebSocket connection error', { duration: 5000 });
    };

    ws.onclose = () => {
      console.log('Disconnected from WebSocket server');
      setTimeout(() => {
        console.log('Attempting to reconnect to WebSocket...');
        // Reconnection logic could be implemented here if needed
      }, 3000);
    };

    return () => {
      ws.close();
    };
  }, [addNotification, showError]);

  const value = {
    notifications,
    addNotification,
    removeNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showMobile,
    clearAll,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <div className="notification-container z-100 font-custom2 fixed top-0 right-0 p-4 space-y-2 pointer-events-none">
        {notifications.map((notification, index) => (
          <div
            key={notification.id}
            style={{
              zIndex: 1000 + index,
            }}
            className="pointer-events-auto transform transition-all duration-300 ease-in-out"
          >
            <Notification
              {...notification}
              onClose={() => removeNotification(notification.id)}
            />
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;