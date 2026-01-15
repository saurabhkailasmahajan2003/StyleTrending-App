import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { storage } from '../utils/storage';

const NOTIFICATIONS_STORAGE_KEY = 'app_notifications';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load notifications from storage on mount
  useEffect(() => {
    loadNotifications();
  }, []);

  // Clear notifications when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
    }
  }, [isAuthenticated]);

  const loadNotifications = async () => {
    try {
      const stored = await storage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (stored && Array.isArray(stored)) {
        setNotifications(stored);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const saveNotifications = async (newNotifications) => {
    try {
      await storage.setItem(NOTIFICATIONS_STORAGE_KEY, newNotifications);
      setNotifications(newNotifications);
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  };

  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      type: notification.type || 'info',
      title: notification.title,
      message: notification.message,
      data: notification.data || {},
      read: false,
      createdAt: new Date().toISOString(),
      ...notification,
    };

    const updated = [newNotification, ...notifications];
    saveNotifications(updated);
    return newNotification;
  };

  const markAsRead = (notificationId) => {
    const updated = notifications.map((notif) =>
      notif.id === notificationId ? { ...notif, read: true } : notif
    );
    saveNotifications(updated);
  };

  const markAllAsRead = () => {
    const updated = notifications.map((notif) => ({ ...notif, read: true }));
    saveNotifications(updated);
  };

  const deleteNotification = (notificationId) => {
    const updated = notifications.filter((notif) => notif.id !== notificationId);
    saveNotifications(updated);
  };

  const clearAllNotifications = () => {
    saveNotifications([]);
  };

  // Helper functions for common notification types
  const notifyOrderPlaced = (orderData) => {
    return addNotification({
      type: 'success',
      title: 'Order Placed Successfully!',
      message: `Your order #${orderData.orderNumber || orderData._id?.slice(-8) || 'N/A'} has been placed successfully.`,
      data: { orderId: orderData._id, orderNumber: orderData.orderNumber },
    });
  };

  const notifyOrderShipped = (orderData) => {
    return addNotification({
      type: 'info',
      title: 'Order Shipped!',
      message: `Your order #${orderData.orderNumber || orderData._id?.slice(-8) || 'N/A'} has been shipped.`,
      data: { orderId: orderData._id, orderNumber: orderData.orderNumber },
    });
  };

  const notifyOrderDelivered = (orderData) => {
    return addNotification({
      type: 'success',
      title: 'Order Delivered!',
      message: `Your order #${orderData.orderNumber || orderData._id?.slice(-8) || 'N/A'} has been delivered.`,
      data: { orderId: orderData._id, orderNumber: orderData.orderNumber },
    });
  };

  const notifyOrderCancelled = (orderData) => {
    return addNotification({
      type: 'warning',
      title: 'Order Cancelled',
      message: `Your order #${orderData.orderNumber || orderData._id?.slice(-8) || 'N/A'} has been cancelled.`,
      data: { orderId: orderData._id, orderNumber: orderData.orderNumber },
    });
  };

  const notifyPriceDrop = (product) => {
    return addNotification({
      type: 'info',
      title: 'Price Drop Alert!',
      message: `${product.name} is now available at a lower price.`,
      data: { productId: product._id || product.id },
    });
  };

  const notifySale = (message) => {
    return addNotification({
      type: 'info',
      title: 'Special Sale!',
      message: message || 'Check out our special sale items.',
    });
  };

  const unreadCount = notifications.filter((notif) => !notif.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAllNotifications,
        notifyOrderPlaced,
        notifyOrderShipped,
        notifyOrderDelivered,
        notifyOrderCancelled,
        notifyPriceDrop,
        notifySale,
        loadNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
