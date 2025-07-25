import React, { useState, useCallback } from 'react';
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

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const value = {
    notifications,
    addNotification,
    removeNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
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
