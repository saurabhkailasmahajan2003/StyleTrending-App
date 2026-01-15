/**
 * Notifications Screen - React Native Version
 * Shows all in-app notifications
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useNotifications } from '../context/NotificationContext';
import HomeHeader from '../components/HomeHeader';
import BottomNavBar from '../components/BottomNavBar';

const NotificationsScreen = () => {
  const navigation = useNavigation();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    loadNotifications,
  } = useNotifications();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return 'checkmark-circle';
      case 'warning':
        return 'warning';
      case 'error':
        return 'close-circle';
      case 'info':
      default:
        return 'information-circle';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'success':
        return '#10b981';
      case 'warning':
        return '#f59e0b';
      case 'error':
        return '#ef4444';
      case 'info':
      default:
        return '#3b82f6';
    }
  };

  const handleNotificationPress = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }

    // Navigate based on notification data
    if (notification.data?.orderId) {
      navigation.navigate('TrackOrder', { orderId: notification.data.orderId });
    } else if (notification.data?.productId) {
      navigation.navigate('ProductDetail', { productId: notification.data.productId });
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <SafeAreaView className="bg-white" edges={['top']}>
        <HomeHeader />
      </SafeAreaView>

      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-3 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-10 h-10 justify-center items-center mr-2"
          >
            <Ionicons name="chevron-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-gray-900">Notifications</Text>
          {unreadCount > 0 && (
            <View className="ml-2 bg-red-500 rounded-full min-w-[20px] h-5 items-center justify-center px-1.5">
              <Text className="text-white text-xs font-bold">{unreadCount}</Text>
            </View>
          )}
        </View>
        {notifications.length > 0 && (
          <TouchableOpacity
            onPress={markAllAsRead}
            className="px-3 py-1.5"
          >
            <Text className="text-sm font-semibold text-gray-900">Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {notifications.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20 px-6">
            <Ionicons name="notifications-off-outline" size={64} color="#9ca3af" />
            <Text className="text-gray-500 text-lg font-semibold mt-4">No notifications</Text>
            <Text className="text-gray-400 text-sm mt-2 text-center">
              You're all caught up! New notifications will appear here.
            </Text>
          </View>
        ) : (
          <View className="py-4">
            {notifications.map((notification, index) => (
              <TouchableOpacity
                key={notification.id}
                onPress={() => handleNotificationPress(notification)}
                className={`bg-white mx-4 mb-3 rounded-xl p-4 border ${
                  notification.read ? 'border-gray-100' : 'border-blue-200 bg-blue-50'
                }`}
                activeOpacity={0.7}
              >
                <View className="flex-row items-start">
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: `${getNotificationColor(notification.type)}20` }}
                  >
                    <Ionicons
                      name={getNotificationIcon(notification.type)}
                      size={20}
                      color={getNotificationColor(notification.type)}
                    />
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-start justify-between mb-1">
                      <Text className="text-base font-bold text-gray-900 flex-1">
                        {notification.title}
                      </Text>
                      {!notification.read && (
                        <View className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1" />
                      )}
                    </View>
                    <Text className="text-sm text-gray-600 mb-2">
                      {notification.message}
                    </Text>
                    <View className="flex-row items-center justify-between">
                      <Text className="text-xs text-gray-400">
                        {formatTime(notification.createdAt)}
                      </Text>
                      <TouchableOpacity
                        onPress={() => deleteNotification(notification.id)}
                        className="p-1"
                      >
                        <Ionicons name="close" size={16} color="#9ca3af" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {notifications.length > 0 && (
        <View className="absolute bottom-20 left-0 right-0 px-4 pb-4">
          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                'Clear All Notifications',
                'Are you sure you want to clear all notifications?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Clear',
                    style: 'destructive',
                    onPress: clearAllNotifications,
                  },
                ]
              );
            }}
            className="bg-gray-900 rounded-lg py-3 items-center"
          >
            <Text className="text-white font-semibold">Clear All</Text>
          </TouchableOpacity>
        </View>
      )}

      <BottomNavBar />
    </View>
  );
};

export default NotificationsScreen;
